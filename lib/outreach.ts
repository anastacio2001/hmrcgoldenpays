import { COMPANY } from '../data/site';
import type { Lead, LeadSearch } from './supabase';

const LEGAL_SUFFIX = /\s+(limited|ltd\.?|plc|llp|l\.l\.p\.)$/i;

/** "MIDBURY LTD" → "Midbury"; keeps short all-caps acronyms such as "TPM". */
export const displayCompanyName = (name: string) =>
  name
    .replace(LEGAL_SUFFIX, '')
    .split(/\s+/)
    .map((w) => (w.length <= 3 && /^[A-Z0-9&]+$/.test(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(' ');

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());

export const unsubscribeUrl = (token: string) => `https://goldenpays.uk/unsubscribe?t=${token}`;

export const signature = (fromName: string, token: string) =>
  [
    fromName,
    `Director, ${COMPANY.name} · Manchester`,
    `goldenpays.uk · Company No. ${COMPANY.number}`,
    COMPANY.office,
    '',
    `Not relevant? Opt out here and we won't email again: ${unsubscribeUrl(token)}`,
  ].join('\n');

export function templateVars(lead: Lead, search: LeadSearch | undefined, fromName: string, token: string) {
  const director = lead.directors[0];
  return {
    first_name: director ? director.split(' ')[0] : 'there',
    company: displayCompanyName(lead.company_name),
    locality: lead.locality ? titleCase(lead.locality) : 'the UK',
    segment_lc: (search?.segment ?? 'UK').toLowerCase(),
    pain: search?.pain_point ?? 'too much of the week goes on manual admin between disconnected tools.',
    pitch: search?.pitch ?? 'We automate the repetitive parts with a fixed-price build.',
    pain_topic: search?.pain_topic ?? 'manual admin',
    signature: signature(fromName, token),
    unsubscribe_url: unsubscribeUrl(token),
  };
}

export const VARIABLES = ['first_name', 'company', 'locality', 'segment_lc', 'pain', 'pitch', 'pain_topic', 'signature', 'unsubscribe_url'];

export function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? '');
}

/** Renders a step and guarantees the legally required identification and opt-out are present. */
export function renderEmail(subject: string, body: string, vars: Record<string, string>) {
  let text = render(body, vars);
  if (!text.includes(vars.unsubscribe_url)) text += `\n\n${vars.signature}`;
  return { subject: render(subject, vars), body: text };
}

export const mailtoLink = (to: string, subject: string, body: string) =>
  `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
