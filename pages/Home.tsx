
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://picsum.photos/id/122/1920/1080")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-navy/80 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            Architecting Scalable <span className="text-gold italic">IT Infrastructure</span> & Strategic Financial Management.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Corporate advisory focused on engineering robust technological foundations and optimizing financial operations for growth-oriented enterprises.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/services" className="bg-white text-navy px-8 py-4 text-sm font-bold tracking-widest hover:bg-gold hover:text-white transition-all duration-300 hover:shadow-xl hover:scale-105">
              EXPLORE ADVISORY
            </Link>
            <Link to="/contact" className="border border-white/30 text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-white/10 transition-all duration-300 hover:scale-105">
              REQUEST CONSULTATION
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </section>

      {/* Corporate Philosophy */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">Core Principles</span>
          <h2 className="font-serif text-4xl text-navy mb-8">Trust. Precision. Scalability.</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-12">
            At GOLDENPAYS LTD, we bridge the gap between complex IT environments and strategic fiscal responsibility. Our senior-led approach ensures that every infrastructure decision is backed by solid financial reasoning and every financial strategy is supported by technological efficiency.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-50 rounded-sm border-t-2 border-transparent hover:border-navy transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
              <h3 className="text-navy font-bold mb-3">Enterprise Grade</h3>
              <p className="text-sm text-slate-500">Solutions built for the rigorous demands of institutional B2B operations.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-sm border-t-2 border-transparent hover:border-navy transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
              <h3 className="text-navy font-bold mb-3">Compliance First</h3>
              <p className="text-sm text-slate-500">Deep alignment with UK regulatory frameworks and international standards.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-sm border-t-2 border-transparent hover:border-navy transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
              <h3 className="text-navy font-bold mb-3">Private Equity Mindset</h3>
              <p className="text-sm text-slate-500">Strategic resource allocation designed to maximize ROI on tech spend.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
