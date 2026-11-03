import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SIC_CODES, SicCode } from '../../data/site';
import {
  AuditDossier,
  ClientInfo,
  CurrencyType,
  PaymentMethodType,
  TransactionDetails,
} from '../../types/generator';
import {
  calculateTier,
  createAuditDossier,
  deleteDossierFromStorage,
  generateInvoiceNumber,
  generateMockPaymentRef,
  getSavedDossiers,
  saveDossierToStorage,
  toGbpEquivalent,
} from '../../lib/generatorEngine';
import { DossierContainer } from './generator/DossierContainer';
import { PageTitle, inputClass, labelClass } from './ui';

export const OpsGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Form State
  const [clientType, setClientType] = useState<'individual' | 'corporate'>('corporate');
  const [name, setName] = useState(searchParams.get('client') || 'Alexander Vance');
  const [companyName, setCompanyName] = useState(searchParams.get('client') || 'Vance Analytics Ltd');
  const [email, setEmail] = useState('a.vance@vanceanalytics.co.uk');
  const [country, setCountry] = useState('United Kingdom');
  const [billingAddress, setBillingAddress] = useState('74 King Street, Manchester, M2 4WQ');
  const [vatTaxId, setVatTaxId] = useState('GB982145890');
  const [companyNumber, setCompanyNumber] = useState('11928341');

  // Transaction State
  const initialMethod = searchParams.get('method') === 'bank-transfer' ? 'bank_taptap' : 'stripe';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(initialMethod);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentDatetime, setPaymentDatetime] = useState(() => {
    const paramDate = searchParams.get('date');
    if (paramDate) {
      return paramDate.includes('T') ? paramDate : `${paramDate}T12:00`;
    }
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [currency, setCurrency] = useState<CurrencyType>('GBP');
  const [amount, setAmount] = useState<number>(() => {
    const paramAmount = searchParams.get('amount');
    return paramAmount ? parseFloat(paramAmount) || 450 : 450.0;
  });

  // Service & Scope Customization
  const [selectedSic, setSelectedSic] = useState<SicCode>('62012');
  const [customTitle, setCustomTitle] = useState(searchParams.get('desc') || '');
  const [customScope, setCustomScope] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(searchParams.get('ref') || '');

  // Generated Dossier View
  const [activeDossier, setActiveDossier] = useState<AuditDossier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // History Drawer State
  const [savedDossiers, setSavedDossiers] = useState<AuditDossier[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Dynamic Tier Calculation
  const gbpEquiv = toGbpEquivalent(amount || 0, currency);
  const currentTier = calculateTier(gbpEquiv);

  // Sync default SIC code recommendation when amount changes (if user hasn't explicitly locked it)
  useEffect(() => {
    if (currentTier === 'A' && selectedSic !== '58290' && selectedSic !== '63110') {
      setSelectedSic('58290');
    } else if (currentTier === 'B' && selectedSic !== '62012' && selectedSic !== '63110') {
      setSelectedSic('62012');
    } else if (currentTier === 'C' && selectedSic !== '62012' && selectedSic !== '62020') {
      setSelectedSic('62012');
    }
  }, [currentTier]);

  // Load saved history
  const reloadHistory = () => {
    setSavedDossiers(getSavedDossiers());
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  const handleGenerateMockRef = () => {
    setPaymentRef(generateMockPaymentRef(paymentMethod));
  };

  const handleGenerateInvoiceNum = () => {
    setInvoiceNumber(generateInvoiceNumber(paymentDatetime));
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'micro' | 'sprint' | 'enterprise') => {
    if (preset === 'micro') {
      setClientType('individual');
      setName('James Thornton');
      setCompanyName('');
      setEmail('j.thornton@gmail.com');
      setCountry('United Kingdom');
      setBillingAddress('14 Oxford Crescent, Bristol, BS1 5RR');
      setVatTaxId('');
      setCompanyNumber('');
      setPaymentMethod('stripe');
      setPaymentRef('ch_3N8x72kLm91Zopq0');
      setCurrency('GBP');
      setAmount(49.0);
      setSelectedSic('58290');
      setCustomTitle('Proprietary Automation Script License & API Token Access');
      setCustomScope('');
    } else if (preset === 'sprint') {
      setClientType('corporate');
      setName('Elena Rostova');
      setCompanyName('FinTech Integrations BV');
      setEmail('elena@fintech-integrations.nl');
      setCountry('Netherlands');
      setBillingAddress('Keizersgracht 421, 1016 EK Amsterdam');
      setVatTaxId('NL859201492B01');
      setCompanyNumber('KVK-78192031');
      setPaymentMethod('stripe');
      setPaymentRef('pi_3P99201aKx018274');
      setCurrency('EUR');
      setAmount(500.0);
      setSelectedSic('62012');
      setCustomTitle('Cloud Database Architecture & Webhook Integration Sprint');
      setCustomScope('');
    } else if (preset === 'enterprise') {
      setClientType('corporate');
      setName('Arthur Pendelton');
      setCompanyName('Apex Logistics Group Ltd');
      setEmail('a.pendelton@apexlogistics.co.uk');
      setCountry('United Kingdom');
      setBillingAddress('Apex House, 12 Bishopsgate, London, EC2N 4BQ');
      setVatTaxId('GB348910283');
      setCompanyNumber('09823145');
      setPaymentMethod('bank_taptap');
      setPaymentRef('FPS-202611-84910');
      setCurrency('GBP');
      setAmount(1500.0);
      setSelectedSic('62012');
      setCustomTitle('Bespoke Enterprise Web Architecture, Cloud Migration & Core Modules');
      setCustomScope('');
    }
  };

  const handleGenerateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const ref = paymentRef.trim() || generateMockPaymentRef(paymentMethod);
    const inv = invoiceNumber.trim() || generateInvoiceNumber(paymentDatetime);

    const client: ClientInfo = {
      type: clientType,
      name: name.trim() || 'Client Representative',
      companyName: clientType === 'corporate' ? companyName.trim() : undefined,
      email: email.trim() || 'client@example.com',
      country: country.trim() || 'United Kingdom',
      billingAddress: billingAddress.trim() || 'Standard Commercial Premises, UK',
      vatTaxId: vatTaxId.trim() || undefined,
      companyNumber: companyNumber.trim() || undefined,
    };

    const transaction: TransactionDetails = {
      method: paymentMethod,
      reference: ref,
      datetime: paymentDatetime,
      currency,
      amount: Number(amount) || 0,
    };

    try {
      const dossier = await createAuditDossier(
        client,
        transaction,
        selectedSic,
        customTitle.trim() || undefined,
        customScope.trim() || undefined,
        inv
      );

      saveDossierToStorage(dossier);
      setActiveDossier(dossier);
      reloadHistory();
    } catch (err) {
      console.error('Failed to generate audit dossier', err);
      alert('Error generating dossier. Please check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSavedDossier = (dossier: AuditDossier) => {
    setActiveDossier(dossier);
    setShowHistory(false);
  };

  const handleDeleteSavedDossier = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this dossier from storage?')) return;
    deleteDossierFromStorage(id);
    if (activeDossier?.id === id) setActiveDossier(null);
    reloadHistory();
  };

  const filteredHistory = savedDossiers.filter((d) => {
    const q = historySearch.toLowerCase();
    return (
      d.invoiceNumber.toLowerCase().includes(q) ||
      d.client.name.toLowerCase().includes(q) ||
      (d.client.companyName && d.client.companyName.toLowerCase().includes(q)) ||
      d.sicCode.includes(q)
    );
  });

  return (
    <div className="pb-16 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="no-print mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <PageTitle
            title="Ops & Compliance Generator"
            subtitle="Generate instant 5-piece Audit Dossiers for UK compliance, banking desks, Stripe Radar & HMRC."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            📁 Past Dossiers ({savedDossiers.length})
          </button>
          {activeDossier && (
            <button
              type="button"
              onClick={() => setActiveDossier(null)}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs"
            >
              + New Dossier
            </button>
          )}
        </div>
      </div>

      {/* Main View: Either Form or Active Dossier Viewer */}
      {activeDossier ? (
        <DossierContainer
          dossier={activeDossier}
          onEdit={() => setActiveDossier(null)}
          onSaved={reloadHistory}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick Presets Banner */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Load Presets
                </span>
                <p className="text-xs text-slate-600">Populate the generator with typical client transaction structures:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('micro')}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  ⚡ Micro SaaS License (£49)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('sprint')}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  ⚡ Webhook Sprint (€500)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('enterprise')}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  ⚡ Enterprise Architecture (£1,500)
                </button>
              </div>
            </div>
          </div>

          {/* Generator Input Form */}
          <form onSubmit={handleGenerateDossier} className="space-y-6">
            {/* Section 1: Client Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">1. Client Profile</h2>
                  <p className="text-xs text-slate-500">Classification of the purchasing individual or corporate entity.</p>
                </div>
                {/* Client Type Toggle */}
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setClientType('individual')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                      clientType === 'individual'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Individual / B2C
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientType('corporate')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                      clientType === 'corporate'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Corporate / B2B
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className={inputClass}
                  />
                </div>

                {clientType === 'corporate' && (
                  <div>
                    <label className={labelClass}>Company Registered Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Vance Analytics Ltd"
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Client Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. client@company.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Country / Jurisdiction *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United Kingdom"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Billing Address *</label>
                  <input
                    type="text"
                    required
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="e.g. 74 King Street, Manchester, M2 4WQ"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>VAT / Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={vatTaxId}
                    onChange={(e) => setVatTaxId(e.target.value)}
                    placeholder="e.g. GB123456789 or Tax Exempt"
                    className={inputClass}
                  />
                </div>

                {clientType === 'corporate' && (
                  <div>
                    <label className={labelClass}>Company Number / Reg (Optional)</label>
                    <input
                      type="text"
                      value={companyNumber}
                      onChange={(e) => setCompanyNumber(e.target.value)}
                      placeholder="e.g. 11928341"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Transaction Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-base font-bold text-slate-900">2. Transaction Details</h2>
                <p className="text-xs text-slate-500">Exact payment parameters as recorded in bank statement or payment gateway.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                    className={inputClass}
                  >
                    <option value="stripe">Stripe Payment Link / Checkout</option>
                    <option value="bank_taptap">Taptap Send / UK Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Currency *</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                    className={inputClass}
                  >
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="USD">USD ($) - US Dollar</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Amount Paid *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelClass}>Payment Reference / Transaction ID</label>
                    <button
                      type="button"
                      onClick={handleGenerateMockRef}
                      className="text-[11px] text-emerald-700 hover:underline font-mono"
                    >
                      🎲 Generate Sample ID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder={paymentMethod === 'stripe' ? 'e.g. pi_3P8a91bc782910' : 'e.g. TTS-GB-9842104 or FPS-202611-09418'}
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Date & Time of Payment *</label>
                  <input
                    type="datetime-local"
                    required
                    value={paymentDatetime}
                    onChange={(e) => setPaymentDatetime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Dynamic Tier Indicator */}
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                      Calculated Tier:
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        currentTier === 'A'
                          ? 'bg-sky-100 text-sky-800'
                          : currentTier === 'B'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Tier {currentTier} ({currentTier === 'A' ? 'Micro / Low: £25 - £199' : currentTier === 'B' ? 'Medium: £200 - £799' : 'High Value: £800+'})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    GBP Equivalent: ~£{gbpEquiv.toFixed(2)}
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {currentTier === 'A' && 'Digital API access, proprietary script license, or software seat subscription (SIC 58290 / 63110).'}
                  {currentTier === 'B' && 'Cloud database setup, workflow webhook automation, integration sprint (SIC 62012 / 63110).'}
                  {currentTier === 'C' && 'Full bespoke software architecture, enterprise migration, custom module build, or dedicated retainer (SIC 62012 / 62020).'}
                </p>
              </div>
            </div>

            {/* Section 3: Service Categorization & Scope */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-base font-bold text-slate-900">3. Service Categorization & Scope</h2>
                <p className="text-xs text-slate-500">Official UK SIC Codes mapping for ironclad compliance justification.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {SIC_CODES.map((s) => {
                  const isSelected = selectedSic === s.code;
                  return (
                    <button
                      type="button"
                      key={s.code}
                      onClick={() => setSelectedSic(s.code)}
                      className={`text-left p-3.5 rounded-lg border transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          SIC {s.code}
                        </span>
                        {isSelected && <span className="text-emerald-600 font-bold text-xs">✔ Selected</span>}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{s.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.area}</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelClass}>Invoice Number</label>
                    <button
                      type="button"
                      onClick={handleGenerateInvoiceNum}
                      className="text-[11px] text-emerald-700 hover:underline font-mono"
                    >
                      🔄 Re-roll Sequential
                    </button>
                  </div>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Auto-generated: GPY-YYYYMM-XXXX"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Deliverable Title / Headline (Optional Override)</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Leave empty to auto-adapt from Tier & SIC code"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Custom Technical Scope / Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={customScope}
                    onChange={(e) => setCustomScope(e.target.value)}
                    placeholder="Leave empty to use official engineering scope description"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-xs text-slate-500">
                UK Registered Entity: <strong>GOLDENPAYS LTD (#16227513)</strong> · Managing Director: <strong>Ladislau S. Anastácio</strong>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <span>🚀</span>
                <span>{isGenerating ? 'Generating Dossier...' : 'Generate 5-Piece Audit Dossier'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Drawer / Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-fade-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Saved Audit Dossiers</h3>
                <p className="text-xs text-slate-500">Select any past record to inspect, reprint, or share.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by Invoice, Client name, or SIC code..."
                className={inputClass}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No dossiers match your search. Generate one to see it saved here.
                </div>
              ) : (
                filteredHistory.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectSavedDossier(d)}
                    className="p-3.5 border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{d.invoiceNumber}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                          Tier {d.tier} · SIC {d.sicCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold mt-1">
                        {d.client.companyName ? `${d.client.companyName} (${d.client.name})` : d.client.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md">{d.deliverableTitle}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-slate-900">
                        {d.transaction.amount.toFixed(2)} {d.transaction.currency}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {d.transaction.datetime.slice(0, 10)}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedDossier(e, d.id)}
                        className="text-[10px] text-red-500 hover:underline mt-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpsGenerator;
