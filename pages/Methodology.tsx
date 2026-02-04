
import React from 'react';

const Methodology: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Assessment",
      desc: "Deep-dive audit of current IT infrastructure and financial reporting structures to identify vulnerabilities and inefficiencies."
    },
    {
      number: "02",
      title: "Strategy",
      desc: "Architecting a bespoke roadmap that aligns technological capability with long-term fiscal objectives and compliance needs."
    },
    {
      number: "03",
      title: "Implementation",
      desc: "Overseeing the technical execution and operational integration, ensuring zero downtime and immediate value realization."
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">Workflow</span>
              <h1 className="font-serif text-5xl text-navy mb-6">Built for Transparency</h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                We believe in evidence-based consultancy. Every engagement follows a rigorous three-phase methodology designed to provide banks, auditors, and stakeholders with complete confidence in our operations.
              </p>
            </div>
            <div className="bg-navy p-12 text-white rounded-sm">
              <h3 className="font-serif text-2xl mb-4 italic">"Methodology is the soul of governance."</h3>
              <p className="text-slate-400 text-sm italic">— Corporate Ethos</p>
            </div>
          </div>
        </header>

        <div className="relative">
          {/* Horizontal Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white p-8 border border-slate-100 shadow-sm relative">
                <span className="absolute -top-6 left-8 text-6xl font-serif text-slate-100 z-0">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-navy mb-4 tracking-tight uppercase">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-12 bg-slate-50 border border-slate-200 text-center">
          <h3 className="text-navy font-bold mb-4 uppercase tracking-widest text-sm">Compliance Note</h3>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto italic">
            All methodologies are documented under strictly confidential frameworks. We provide full visibility to designated compliance officers at WorldFirst, HMRC, and partner banking institutions upon verified request.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
