
import React from 'react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      title: "Enterprise Advisory (B2B)",
      scope: "Institutional Scale",
      description: "High-level strategic consulting for established corporations seeking infrastructure modernization.",
      items: [
        "Cloud Architecture Design (AWS/Azure)",
        "Security & Compliance Auditing",
        "Legacy Systems Modernization",
        "Disaster Recovery Planning"
      ]
    },
    {
      title: "Professional Services (B2C/Sole Traders)",
      scope: "Specialized Mentorship",
      description: "Bespoke technical support and management guidance for high-value individual professionals.",
      items: [
        "Strategic Management Mentorship",
        "Tech Stack Optimization for Individuals",
        "Fiscal Compliance Guidance",
        "Operational Efficiency Planning"
      ]
    },
    {
      title: "Operational Excellence",
      scope: "Internal Optimization",
      description: "In-depth auditing and optimization of resources to ensure seamless corporate operations.",
      items: [
        "Resource Allocation Audits",
        "Workflow Automation & Tooling",
        "HMRC Compliance Readiness",
        "Cost-Benefit Analysis for R&D"
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">Strategic Pillars</span>
          <h1 className="font-serif text-5xl text-navy mb-6">Our Consultancy Framework</h1>
          <p className="text-slate-500 text-lg">
            Focused on the intersection of technological robustness and fiscal integrity, we provide clear paths to operational superiority.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full cursor-default">
              <div className="mb-6">
                <span className="text-xs font-bold text-navy bg-slate-100 px-3 py-1 uppercase tracking-wider">{service.scope}</span>
              </div>
              <h3 className="font-serif text-2xl text-navy mb-4 group-hover:text-gold transition-colors duration-300">{service.title}</h3>
              <p className="text-slate-500 text-sm mb-8 flex-grow leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-3 mb-8">
                {service.items.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-700">
                    <span className="text-gold mr-3">■</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link 
                to="/contact" 
                className="block w-full py-4 border border-navy text-navy text-xs font-bold tracking-widest group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-all duration-300 uppercase text-center"
              >
                REQUEST DETAILS
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
