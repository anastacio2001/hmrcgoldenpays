import React from 'react';
import { COMPANY } from '../../../data/site';

interface StampProps {
  timestamp: string;
  hash?: string;
  directorName?: string;
}

export const DirectorStamp: React.FC<StampProps> = ({
  timestamp,
  hash,
  directorName = 'Ladislau Segunda Anastácio',
}) => {
  const shortHash = hash ? hash.slice(0, 16).toUpperCase() : 'VERIFIED-SIG-OK';
  const displayDate = new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative inline-flex flex-col items-center justify-center p-3">
      {/* Official Circular Digital Stamp */}
      <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-emerald-700/80 bg-emerald-50/40 p-2 shadow-xs print:border-emerald-800">
        <div className="absolute inset-1 rounded-full border border-emerald-600/40" />

        {/* Circular text simulation */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-emerald-900">
            <span>★</span>
            <span>GOLDENPAYS LTD</span>
            <span>★</span>
          </div>
          <div className="mt-0.5 text-[7px] font-mono uppercase tracking-tight text-emerald-800">
            CO. NO. {COMPANY.number}
          </div>

          {/* Center Seal Core */}
          <div className="my-1 border-y border-emerald-700/60 py-0.5">
            <span className="block text-[8px] font-black uppercase tracking-wider text-emerald-900">
              AUDIT VERIFIED
            </span>
            <span className="block font-mono text-[6.5px] font-semibold text-emerald-700">
              DIGITAL SEAL
            </span>
          </div>

          <div className="text-[7px] font-medium text-emerald-900">ENGLAND & WALES</div>
          <div className="font-mono text-[6px] tracking-tight text-emerald-700">{displayDate}</div>
        </div>
      </div>

      {/* Signature & Monospace Verification line */}
      <div className="mt-2 text-center">
        <div className="font-serif italic text-base font-bold text-slate-800 tracking-wide">
          {directorName}
        </div>
        <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
          Managing Director · Digital Authority
        </p>
        {hash && (
          <p className="mt-0.5 font-mono text-[8px] text-emerald-700 tracking-wider">
            SIG: {shortHash}
          </p>
        )}
      </div>
    </div>
  );
};
