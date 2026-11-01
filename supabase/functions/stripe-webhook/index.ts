/// <reference lib="deno.ns" />
// Stripe webhook → public.payments
//
// Records Payment Link / Checkout payments in the admin Payments ledger.
// Needs only the webhook signing secret (no Stripe API key):
//   STRIPE_WEBHOOK_SECRET   whsec_… from the Stripe webhook endpoint
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
//
// Events: checkout.session.completed, checkout.session.async_payment_succeeded,
//         checkout.session.async_payment_failed, charge.refunded
//
// Each Payment Link should carry metadata `package` = licence | sprint | integration | cloud.

import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const SIGNATURE_TOLERANCE_SECONDS = 300;

const PACKAGES: Record<string, { description: string; kind: string }> = {
  licence: { description: 'Platform Licences & Digital Tooling', kind: 'licence' },
  sprint: { description: 'Full-Stack Development Sprint', kind: 'deposit' },
  integration: { description: 'Technical Systems & API Integration', kind: 'invoice' },
  cloud: { description: 'Cloud Infrastructure & Data Hosting', kind: 'subscription' },
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/** Verifies the Stripe-Signature header (https://docs.stripe.com/webhooks#verify-manually). */
async function verifySignature(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(',').map((p) => p.split('=') as [string, string]);
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((sig) => timingSafeEqual(sig, expected));
}

const randomInvoiceNumber = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `INV-${new Date().getUTCFullYear()}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
};

const isoDate = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString().slice(0, 10);

/** Finds a client by email, creating an active client if none exists. */
async function resolveClient(email: string | null, name: string | null): Promise<string | null> {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const { data: existing } = await supabase.from('clients').select('id').ilike('email', normalized).limit(1);
  if (existing && existing.length > 0) return existing[0].id;
  const { data, error } = await supabase
    .from('clients')
    .insert({ name: name || normalized, email: normalized, status: 'active', notes: 'Created from a Stripe payment.' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

// deno-lint-ignore no-explicit-any
async function recordCheckoutSession(session: any, paid: boolean) {
  if ((session.currency ?? 'gbp').toLowerCase() !== 'gbp') {
    console.warn(`Skipping non-GBP session ${session.id}`);
    return;
  }

  // Subscriptions have no payment_intent on the session; fall back to the invoice/session id.
  const stripeId: string = session.payment_intent ?? session.invoice ?? session.id;
  const pkg = PACKAGES[session.metadata?.package ?? ''];
  const total = (session.amount_total ?? 0) / 100;
  const tax = (session.total_details?.amount_tax ?? 0) / 100;
  const status = paid ? 'paid' : 'pending';

  const { data: existing } = await supabase.from('payments').select('id').eq('stripe_payment_id', stripeId).limit(1);
  if (existing && existing.length > 0) {
    // Retry or async completion of a payment we already recorded.
    await supabase
      .from('payments')
      .update({ status, paid_on: paid ? isoDate(session.created) : null })
      .eq('id', existing[0].id);
    return;
  }

  const clientId = await resolveClient(session.customer_details?.email ?? null, session.customer_details?.name ?? null);
  const { error } = await supabase.from('payments').insert({
    invoice_number: randomInvoiceNumber(),
    client_id: clientId,
    description: pkg?.description ?? 'Stripe payment',
    kind: session.mode === 'subscription' ? 'subscription' : pkg?.kind ?? 'invoice',
    method: 'stripe',
    amount_gbp: Math.max(total - tax, 0.01),
    vat_gbp: tax,
    status,
    issued_on: isoDate(session.created),
    paid_on: paid ? isoDate(session.created) : null,
    stripe_payment_id: stripeId,
    notes: `Stripe Checkout ${session.id}${session.payment_link ? ` · Payment Link ${session.payment_link}` : ''}`,
  });
  // 23505: a concurrent delivery of the same event already inserted it.
  if (error && error.code !== '23505') throw error;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) return new Response('Webhook not configured', { status: 500 });

  const payload = await req.text();
  if (!(await verifySignature(payload, req.headers.get('stripe-signature'), secret))) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);
  const object = event.data?.object ?? {};

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await recordCheckoutSession(object, object.payment_status === 'paid' || object.payment_status === 'no_payment_required');
        break;
      case 'checkout.session.async_payment_succeeded':
        await recordCheckoutSession(object, true);
        break;
      case 'checkout.session.async_payment_failed':
        await supabase.from('payments').update({ status: 'cancelled' })
          .eq('stripe_payment_id', object.payment_intent ?? object.id).eq('status', 'pending');
        break;
      case 'charge.refunded':
        // Only full refunds change the status; partial refunds are left for manual review.
        if (object.refunded && object.payment_intent) {
          await supabase.from('payments').update({ status: 'refunded' }).eq('stripe_payment_id', object.payment_intent);
        }
        break;
      default:
        break; // Acknowledge events we don't handle so Stripe doesn't retry them.
    }
  } catch (err) {
    console.error(`Failed to process ${event.type} ${event.id}:`, err);
    return new Response('Processing error', { status: 500 }); // Stripe will retry.
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
});
