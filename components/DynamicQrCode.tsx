import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  data: string;
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Standard ISO/IEC 18004 compliant QR Code generator.
 * Generates genuine scannable QR codes readable by any smartphone camera.
 */
export const DynamicQrCode: React.FC<Props> = ({
  data,
  size = 110,
  className = '',
  label,
}) => {
  const [svgMarkup, setSvgMarkup] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    QRCode.toString(data, {
      type: 'svg',
      margin: 1,
      width: size,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0a0f1d',
        light: '#ffffff',
      },
    })
      .then((svg) => {
        if (isMounted) {
          setSvgMarkup(svg);
        }
      })
      .catch((err) => {
        console.error('Failed to generate real QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [data, size]);

  return (
    <a
      href={data}
      target="_blank"
      rel="noopener noreferrer"
      title={`Verify: ${data}`}
      className={`inline-flex flex-col items-center justify-center group ${className}`}
    >
      <div
        className="rounded border border-slate-300 bg-white p-1.5 shadow-2xs group-hover:border-emerald-500 transition print:border-slate-400 flex items-center justify-center overflow-hidden"
        style={{ width: size + 12, height: size + 12 }}
      >
        {svgMarkup ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-slate-100 rounded" />
        )}
      </div>
      {label && (
        <span className="mt-1 font-mono text-[8px] uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 transition">
          {label}
        </span>
      )}
    </a>
  );
};
