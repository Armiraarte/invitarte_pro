import React from 'react';

type PageSectionFallbackProps = {
  tone?: 'dark' | 'light';
};

/* El sitio publico es negro: el esqueleto de carga debe ser oscuro para no destellar */
export const PageSectionFallback: React.FC<PageSectionFallbackProps> = ({ tone = 'dark' }) => {
  const line = tone === 'dark' ? 'bg-white/[0.06]' : 'bg-slate-300/70';
  const block = tone === 'dark' ? 'bg-white/[0.03]' : 'bg-white/70 shadow-[0_16px_32px_rgba(15,23,42,0.06)]';

  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-3 py-10 sm:px-4 md:px-6" aria-hidden="true">
      <div className={`h-4 w-28 rounded-full ${line}`} />
      <div className={`mt-5 h-12 max-w-xl rounded-[20px] ${line}`} />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className={`h-56 rounded-[28px] ${block}`} />
        <div className={`h-56 rounded-[28px] ${block}`} />
      </div>
    </div>
  );
};
