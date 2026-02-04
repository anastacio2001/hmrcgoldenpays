import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-navy text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">About GOLDENPAYS LTD</span>
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Where Economic Rigour Meets Technological Excellence</h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
            We bridge the gap between engineering precision and fiscal accountability, transforming IT infrastructure from cost centres into strategic financial assets.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl text-navy mb-8">Our Story</h2>
          <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
            <p>
              GOLDENPAYS LTD was founded in Manchester with a singular conviction: that technology investment should be governed by the same financial discipline as capital allocation in traditional asset classes. The prevailing disconnect between IT expenditure and economic accountability represented not merely an inefficiency, but a fundamental misalignment in corporate strategy.
            </p>
            <p>
              Our genesis lies in the recognition that enterprises consistently overspend on technology infrastructure without rigorous cost-benefit analysis, treating IT as an operational expense rather than a quantifiable asset with measurable returns. This phenomenon persists because technical consultancies lack economic literacy, whilst financial advisory firms lack the technical depth to audit infrastructure decisions.
            </p>
            <p>
              GOLDENPAYS was established to eliminate this structural gap. We are not a conventional IT consultancy that retrofits financial justification onto predetermined solutions. We are an <strong>economically-driven technology practice</strong> where every architectural recommendation is stress-tested against ROI projections, opportunity cost analysis, and long-term fiscal sustainability.
            </p>
            <p>
              Our methodology is rooted in the principle that <strong>infrastructure is investment</strong>. Cloud migrations, security frameworks, and system modernisations are not discretionary expenditures—they are capital deployment decisions that demand the same analytical rigour as M&A transactions, real estate acquisitions, or equity portfolio construction.
            </p>
            <p>
              Based in Manchester—a city with a storied legacy in both industrial engineering and financial innovation—GOLDENPAYS operates at the intersection of these disciplines. We serve clients who understand that competitive advantage in the digital economy is predicated not on technology adoption alone, but on <strong>optimised resource allocation and strategic fiscal management of technological assets</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl text-navy mb-8">Our Core Philosophy</h2>
          <div className="space-y-8">
            <div className="border-l-4 border-navy pl-6">
              <h3 className="text-xl font-bold text-navy mb-3">Technical Integrity as Financial Discipline</h3>
              <p className="text-slate-700 leading-relaxed">
                Every system we architect, every cloud migration we design, and every compliance framework we implement is evaluated through a dual lens: <strong>technical robustness and economic viability</strong>. We reject solutions that are technically elegant but financially unsustainable, just as we reject cost-cutting measures that compromise systemic resilience.
              </p>
            </div>

            <div className="border-l-4 border-gold pl-6">
              <h3 className="text-xl font-bold text-navy mb-3">Infrastructure as Strategic Asset Class</h3>
              <p className="text-slate-700 leading-relaxed">
                We treat IT infrastructure with the same analytical rigour applied to fixed assets on corporate balance sheets. Our consultancy engagements include <strong>depreciation modelling, total cost of ownership (TCO) analysis, and scenario-based ROI forecasting</strong>. Clients receive not only technical deliverables but comprehensive financial impact assessments.
              </p>
            </div>

            <div className="border-l-4 border-navy pl-6">
              <h3 className="text-xl font-bold text-navy mb-3">Compliance as Competitive Advantage</h3>
              <p className="text-slate-700 leading-relaxed">
                Regulatory adherence—whether to HMRC frameworks, GDPR mandates, or FCA-adjacent operational standards—is not a bureaucratic burden. It is a <strong>risk mitigation strategy with quantifiable economic value</strong>. Our compliance audits identify vulnerabilities that translate into financial exposure, reputational liability, and operational inefficiency.
              </p>
            </div>

            <div className="border-l-4 border-gold pl-6">
              <h3 className="text-xl font-bold text-navy mb-3">Confidentiality as Fiduciary Duty</h3>
              <p className="text-slate-700 leading-relaxed">
                We operate under high-confidentiality frameworks because our clients' strategic decisions—cloud vendor selection, security postures, fiscal restructuring—constitute proprietary intelligence. Our discretion is not a courtesy; it is a contractual obligation enforced through NDA protocols and restricted-access project documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Director Profile */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="bg-navy p-8 text-white sticky top-32">
                <div className="w-32 h-32 bg-gold rounded-sm flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-5xl">LA</span>
                </div>
                <h3 className="font-serif text-2xl text-center mb-2">Ladislau S Anastacio</h3>
                <p className="text-slate-400 text-sm text-center mb-6 uppercase tracking-wider">Founder & Director</p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                    <span className="text-slate-300">Economics & Business Administration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                    </svg>
                    <span className="text-slate-300">Strategic Technology Advisor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-slate-300">Manchester, United Kingdom</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-serif text-4xl text-navy mb-6">Executive Profile</h2>
                <div className="space-y-6 text-slate-700 leading-relaxed">
                  <p>
                    Ladislau S Anastacio is the Founder and Director of GOLDENPAYS LTD, a management and IT consultancy distinguished by its integration of economic analysis with technological architecture. His professional foundation in <strong>Economics and Business Administration</strong> informs a consultancy methodology that evaluates infrastructure decisions not as isolated technical problems, but as <strong>capital allocation exercises with measurable fiscal consequences</strong>.
                  </p>
                  <p>
                    Mr Anastacio's transition from economic analysis to digital infrastructure management was driven by a systemic observation: enterprises routinely deploy technology without applying the financial due diligence standard in traditional investment appraisal. This disciplinary gap—where IT projects proceed without rigorous ROI modelling, sensitivity analysis, or opportunity cost evaluation—creates structural inefficiency and value destruction.
                  </p>
                  <p>
                    His academic background equips him to assess technology deployments through frameworks typically reserved for M&A due diligence or capital budgeting: <strong>discounted cash flow analysis, total cost of ownership calculations, and risk-adjusted return modelling</strong>. This approach distinguishes GOLDENPAYS from consultancies that provide technical expertise without economic accountability.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-navy p-6">
                <h3 className="font-bold text-navy mb-3 text-lg">Core Competencies</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start">
                    <span className="text-gold mr-3 font-bold">■</span>
                    <span><strong>Strategic Resource Allocation:</strong> Optimising IT budgets through econometric modelling and scenario-based forecasting to maximise return on technology investment.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold mr-3 font-bold">■</span>
                    <span><strong>ROI-Centric Infrastructure Design:</strong> Architecting cloud migrations, security frameworks, and system modernisations with explicit linkage to financial performance metrics and shareholder value creation.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold mr-3 font-bold">■</span>
                    <span><strong>Compliance Framework Engineering:</strong> Designing HMRC-aligned reporting structures, GDPR-compliant data architectures, and audit-ready operational workflows that mitigate regulatory risk and financial exposure.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold mr-3 font-bold">■</span>
                    <span><strong>Fiscal-Technical Integration:</strong> Synthesising economic theory with systems engineering to deliver advisory services that address both P&L impact and technical feasibility.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-serif text-navy mb-4">Professional Advisory Services (B2C)</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Beyond institutional consultancy, Mr Anastacio provides <strong>high-level private advisory services</strong> to entrepreneurs, sole traders, and high-net-worth individuals navigating the intersection of personal financial management and technology infrastructure. This practice addresses a market inefficiency: individuals operating technology-dependent businesses require sophisticated fiscal planning but lack access to advisors who understand both economic strategy and technical architecture.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  These engagements focus on:
                </p>
                <ul className="space-y-2 text-slate-700 ml-6 mb-4">
                  <li className="flex items-start">
                    <span className="text-navy mr-2">•</span>
                    <span><strong>Personal Financial-Technology Alignment:</strong> Structuring personal finances to support technology investments (e.g., SaaS subscriptions, cloud infrastructure, dev tooling) whilst maintaining tax efficiency and liquidity management.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-navy mr-2">•</span>
                    <span><strong>Operational Efficiency for Sole Traders:</strong> Advising on cost-effective technology stacks, automation workflows, and compliance readiness for HMRC self-assessment and VAT obligations.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-navy mr-2">•</span>
                    <span><strong>Strategic Mentorship:</strong> Providing economic and managerial guidance to founders scaling technology ventures, with emphasis on sustainable growth, capital preservation, and risk mitigation.</span>
                  </li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  This B2C practice is not mass-market consultancy; it is <strong>selective, referral-based, and structured as private mentorship for clients who require discretion and bespoke strategic advice</strong>. It operates under the same confidentiality protocols and analytical rigour as institutional engagements.
                </p>
              </div>

              <div className="bg-slate-50 p-6 border border-slate-200">
                <h3 className="font-bold text-navy mb-3">Guiding Principles</h3>
                <blockquote className="italic text-slate-700 leading-relaxed">
                  "Technology is not an end in itself. It is a lever for economic efficiency, competitive positioning, and long-term value creation. Our role is to ensure that every pound allocated to IT infrastructure generates measurable returns—whether in cost reduction, revenue enablement, risk mitigation, or strategic optionality. This requires not only technical expertise, but economic literacy and fiscal accountability."
                </blockquote>
                <p className="text-right text-sm text-slate-500 mt-4">— Ladislau S Anastacio, Founder & Director</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-24 px-6 bg-navy text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-8">Why This Matters</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            In an era where technology expenditure represents one of the largest line items in corporate budgets, the absence of rigorous economic evaluation is not merely inefficient—it is fiduciarily irresponsible.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed">
            GOLDENPAYS exists to impose the same standards of financial discipline on IT investment that boards of directors demand for capital projects, acquisitions, and treasury management. We serve clients who recognise that <strong>optimised technology is optimised capital</strong>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-navy mb-4">Engage with Strategic Precision</h3>
          <p className="text-slate-600 mb-8">
            For inquiries regarding enterprise advisory or private consultancy services, submit a formal request through our confidential contact channel.
          </p>
          <Link to="/contact" className="inline-block bg-navy text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-slate-800 transition-all">
            REQUEST CONSULTATION
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
