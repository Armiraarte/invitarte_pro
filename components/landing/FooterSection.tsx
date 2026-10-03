import React, { useRef } from 'react';
import { OptimizedImage } from '../ui/OptimizedImage';
import type { FooterSocialItem, IconRenderer } from './shared';

type FooterNavItem = {
  id: string;
  label: string;
  sectionId?: string;
};

type FooterSectionProps = {
  displayFont: React.CSSProperties;
  footerBrandLogo: string;
  footerCreatorLogo: string;
  footerSocials: readonly FooterSocialItem[];
  navItems: readonly FooterNavItem[];
  price: string;
  renderIcon: IconRenderer;
  onNavigate: (item: FooterNavItem) => void;
  onStart: () => void;
  onOpenEvents: () => void;
};

const BRAND_GRADIENT = 'linear-gradient(90deg, #22d3ee 0%, #a78bfa 35%, #f472b6 68%, #fbbf24 100%)';

/* Palabra gigante: apagada por defecto y se ilumina con los colores de marca donde pasa el cursor */
const SpotlightWordmark: React.FC<{ displayFont: React.CSSProperties }> = ({ displayFont }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    el.style.setProperty('--spot-size', '260px');
  };

  const handleLeave = () => ref.current?.style.setProperty('--spot-size', '0px');

  const textClasses = 'block select-none text-center text-[20.5vw] font-bold leading-[0.8] tracking-[-0.06em]';

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative overflow-hidden pt-4"
      style={{ '--spot-x': '50%', '--spot-y': '50%', '--spot-size': '0px' } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className={`${textClasses} text-white/[0.05]`} style={displayFont}>
        INViTARTE
      </span>
      <span
        className={`${textClasses} spotlight-layer absolute inset-x-0 top-4 bg-clip-text text-transparent`}
        style={{
          ...displayFont,
          backgroundImage: BRAND_GRADIENT,
          maskImage: 'radial-gradient(circle var(--spot-size) at var(--spot-x) var(--spot-y), #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle var(--spot-size) at var(--spot-x) var(--spot-y), #000 0%, transparent 100%)'
        }}
      >
        INViTARTE
      </span>
      {/* Linea de brillo en la base de la palabra */}
      <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
    </div>
  );
};

const FooterSectionComponent: React.FC<FooterSectionProps> = ({
  displayFont,
  footerBrandLogo,
  footerCreatorLogo,
  footerSocials,
  navItems,
  price,
  renderIcon,
  onNavigate,
  onStart,
  onOpenEvents
}) => {
  const year = new Date().getFullYear();

  return (
    <footer className="cv-auto relative w-full overflow-hidden border-t border-white/[0.06] bg-gradient-to-b from-transparent to-black/40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.16),transparent)]" aria-hidden="true" />

      <div className="relative w-full px-5 pt-20 sm:px-8 lg:px-16 2xl:px-24">
        {/* Llamado final */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/[0.07] pb-14 lg:flex-row lg:items-end">
          <h2 className="max-w-[14ch] text-[2.4rem] leading-[1] tracking-[-0.045em] text-white sm:text-[3.4rem]" style={displayFont}>
            Tu próximo evento, <span className="brand-gradient-text">sin filas ni listas de papel.</span>
          </h2>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-[1rem] font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              Empezar por {price}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onOpenEvents}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-4 text-[1rem] font-semibold text-white transition hover:bg-white/[0.06]"
            >
              Entrar a mi evento
            </button>
          </div>
        </div>

        {/* Columnas */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
          <div>
            <OptimizedImage src={footerBrandLogo} alt="Logo Invitarte" className="-ml-3 h-32 w-auto object-contain" loading="lazy" sizes="208px" />
            <p className="mt-4 max-w-[20rem] text-sm leading-6 text-zinc-400">
              Control de invitados con invitación digital incluida, del primer mensaje hasta la entrada.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Explora</p>
            <ul className="mt-4 grid gap-2.5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onNavigate(item)} className="text-[15px] text-zinc-300 transition-colors hover:text-white">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Síguenos</p>
            <div className="mt-4 flex gap-2">
              {footerSocials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-white/25"
                  style={{ color: item.color }}
                >
                  {renderIcon(item.icon, 'h-4 w-4')}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Creado por</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <OptimizedImage src={footerCreatorLogo} alt="Logo ARMiRARTE" className="h-7 w-7 object-contain" loading="lazy" sizes="48px" />
              </span>
              <div>
                <p className="text-[1.15rem] font-semibold text-white">ARMiRARTE</p>
                <p className="text-sm text-zinc-400">Diseño, soporte y desarrollo del sistema.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SpotlightWordmark displayFont={displayFont} />

      <div className="relative flex w-full flex-col items-center justify-between gap-2 px-5 py-6 text-[13px] text-zinc-500 sm:flex-row sm:px-8 lg:px-16 2xl:px-24">
        <p>© {year} INViTARTE. Todos los derechos reservados.</p>
        <p>Hecho en Guadalajara, México</p>
      </div>
    </footer>
  );
};

export const FooterSection = React.memo(FooterSectionComponent);
