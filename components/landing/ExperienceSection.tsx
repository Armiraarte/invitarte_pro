import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, m as motion } from 'motion/react';
import { BRAND_SWATCHES } from './palette';
import type { AccentBadgeRenderer, LandingProcessItem, MotionVariants } from './shared';

type ExperienceSectionProps = {
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  processItems: LandingProcessItem[];
  renderAccentBadge: AccentBadgeRenderer;
  staggerGroup: MotionVariants;
};

const stepColor = (index: number) => BRAND_SWATCHES[index % BRAND_SWATCHES.length];

const Check: React.FC<{ className?: string }> = ({ className = 'h-[3.4cqw] w-[3.4cqw]' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/* ---------- Pantallas del telefono, una por paso (unidades cqw = escalan con el telefono) ---------- */

const PriceScreen: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex h-full flex-col">
    <p className="text-[3.6cqw] font-semibold uppercase tracking-[0.24em] text-zinc-500">Pago único</p>
    <p className="mt-[3cqw] text-[19cqw] font-bold leading-none tracking-[-0.05em] text-white">
      $389
      <span className="ml-[2cqw] text-[4cqw] font-semibold tracking-normal text-zinc-500">MXN</span>
    </p>
    <div className="mt-[3cqw] h-[0.6cqw] w-[22cqw] rounded-full" style={{ backgroundColor: color }} />
    <div className="mt-[8cqw] grid gap-[3cqw]">
      {['Invitación digital', 'Lista de invitados', 'Confirmaciones en vivo', 'Acceso con QR'].map((item) => (
        <div key={item} className="flex items-center gap-[3cqw] rounded-[3.5cqw] bg-white/[0.05] px-[4cqw] py-[3.2cqw] text-[4.2cqw] text-zinc-200">
          <span className="flex h-[6cqw] w-[6cqw] items-center justify-center rounded-full" style={{ backgroundColor: `${color}26`, color }}>
            <Check />
          </span>
          {item}
        </div>
      ))}
    </div>
    <div className="mt-auto rounded-full py-[3.6cqw] text-center text-[4.4cqw] font-bold text-[#0a0a0f]" style={{ backgroundColor: color }}>
      Activar mi evento
    </div>
  </div>
);

const DataScreen: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex h-full flex-col">
    <p className="text-[3.6cqw] font-semibold uppercase tracking-[0.24em] text-zinc-500">Datos del evento</p>
    <div className="mt-[5cqw] grid gap-[3.2cqw]">
      {[
        ['Evento', 'Boda Sofía & Mateo'],
        ['Fecha', '14 Nov 2026 · 19:00'],
        ['Lugar', 'Hacienda Los Olivos'],
        ['Vestimenta', 'Formal']
      ].map(([label, value], index, list) => (
        <div
          key={label}
          className="rounded-[3.5cqw] border px-[4cqw] py-[2.6cqw]"
          style={{ borderColor: index === list.length - 1 ? color : 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <p className="text-[3cqw] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
          <p className="mt-[1cqw] text-[4.4cqw] text-white">
            {value}
            {index === list.length - 1 ? (
              <span className="ml-[0.6cqw] inline-block h-[4.4cqw] w-[0.6cqw] animate-pulse align-middle" style={{ backgroundColor: color }} />
            ) : null}
          </p>
        </div>
      ))}
    </div>
    <div className="mt-auto flex gap-[2.5cqw]">
      {['Mapa', 'Música', 'RSVP'].map((chip) => (
        <span key={chip} className="flex flex-1 items-center justify-center gap-[1.5cqw] rounded-full py-[2.4cqw] text-[3.6cqw] font-semibold" style={{ backgroundColor: `${color}1f`, color }}>
          <Check className="h-[3cqw] w-[3cqw]" />
          {chip}
        </span>
      ))}
    </div>
  </div>
);

const ShareScreen: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex h-full flex-col">
    <p className="text-[3.6cqw] font-semibold uppercase tracking-[0.24em] text-zinc-500">Compartir</p>
    <div className="mt-[5cqw] overflow-hidden rounded-[4cqw] border border-white/10 bg-white/[0.04]">
      <div className="h-[22cqw]" style={{ background: `linear-gradient(135deg, ${color} 0%, #f472b6 100%)` }} />
      <div className="px-[4cqw] py-[3cqw]">
        <p className="text-[4.4cqw] font-semibold text-white">Sofía & Mateo · 14 Nov</p>
        <p className="text-[3.4cqw] text-zinc-500">invitarte.mx/sofia-y-mateo</p>
      </div>
    </div>
    <div className="mt-[7cqw] grid grid-cols-4 gap-[3cqw]">
      {[
        { label: 'WhatsApp', bg: '#25d366' },
        { label: 'Instagram', bg: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)' },
        { label: 'Facebook', bg: '#1877f2' },
        { label: 'Copiar', bg: 'rgba(255,255,255,0.12)' }
      ].map((app) => (
        <div key={app.label} className="flex flex-col items-center gap-[1.6cqw]">
          <span className="h-[12cqw] w-[12cqw] rounded-[3.6cqw]" style={{ background: app.bg }} />
          <span className="text-[2.8cqw] text-zinc-400">{app.label}</span>
        </div>
      ))}
    </div>
    <div className="mt-auto flex items-center justify-center gap-[2cqw] rounded-full bg-white/[0.07] py-[3cqw] text-[3.8cqw] text-zinc-200">
      <span className="flex h-[5cqw] w-[5cqw] items-center justify-center rounded-full" style={{ backgroundColor: color, color: '#0a0a0f' }}>
        <Check className="h-[3cqw] w-[3cqw]" />
      </span>
      Enviado a 120 invitados
    </div>
  </div>
);

const ControlScreen: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex h-full flex-col">
    <p className="text-[3.6cqw] font-semibold uppercase tracking-[0.24em] text-zinc-500">Panel del evento</p>
    <div className="mt-[5cqw] grid grid-cols-3 gap-[2.4cqw]">
      {[
        ['86', 'Asisten', color],
        ['22', 'Pendientes', '#a1a1aa'],
        ['12', 'No asisten', '#71717a']
      ].map(([value, label, tone]) => (
        <div key={label} className="rounded-[3.5cqw] bg-white/[0.05] px-[2cqw] py-[3cqw] text-center">
          <p className="text-[7.5cqw] font-bold leading-none" style={{ color: tone }}>
            {value}
          </p>
          <p className="mt-[1.4cqw] text-[2.8cqw] text-zinc-500">{label}</p>
        </div>
      ))}
    </div>
    <div className="mt-[4cqw] flex h-[2cqw] overflow-hidden rounded-full bg-white/10">
      <div className="h-full w-[72%]" style={{ backgroundColor: color }} />
      <div className="h-full w-[18%] bg-zinc-500" />
    </div>
    <div className="mt-[5cqw] grid gap-[2.4cqw]">
      {[
        ['Familia Torres', 'confirmó · 4 personas'],
        ['Daniela y Luis', 'confirmó · mesa 8'],
        ['Martha Salazar', 'abrió la invitación']
      ].map(([name, detail]) => (
        <div key={name} className="flex items-center gap-[3cqw] rounded-[3.5cqw] bg-white/[0.04] px-[3cqw] py-[2.4cqw]">
          <span className="h-[2.4cqw] w-[2.4cqw] shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[3.8cqw] text-zinc-200">
            {name} <span className="text-zinc-500">{detail}</span>
          </p>
        </div>
      ))}
    </div>
    <div className="mt-auto flex items-center justify-center gap-[2.4cqw] rounded-full py-[3.6cqw] text-[4.2cqw] font-bold text-[#0a0a0f]" style={{ backgroundColor: color }}>
      <svg viewBox="0 0 24 24" className="h-[4.6cqw] w-[4.6cqw]" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" strokeLinecap="round" />
      </svg>
      Escanear QR
    </div>
  </div>
);

const ScanScreen: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex h-full flex-col">
    <p className="text-[3.6cqw] font-semibold uppercase tracking-[0.24em] text-zinc-500">Acceso en la entrada</p>
    <div className="relative mx-auto mt-[6cqw] h-[40cqw] w-[40cqw]">
      {['left-0 top-0 border-l-[1cqw] border-t-[1cqw] rounded-tl-[4cqw]', 'right-0 top-0 border-r-[1cqw] border-t-[1cqw] rounded-tr-[4cqw]', 'bottom-0 left-0 border-b-[1cqw] border-l-[1cqw] rounded-bl-[4cqw]', 'bottom-0 right-0 border-b-[1cqw] border-r-[1cqw] rounded-br-[4cqw]'].map((corner) => (
        <span key={corner} className={`absolute h-[10cqw] w-[10cqw] ${corner}`} style={{ borderColor: color }} />
      ))}
      <div className="absolute inset-[6cqw] grid grid-cols-5 gap-[1cqw]">
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className="rounded-[0.6cqw]" style={{ backgroundColor: [0, 2, 4, 6, 8, 10, 12, 14, 16, 17, 18, 20, 22, 24].includes(i) ? '#e4e4e7' : 'transparent' }} />
        ))}
      </div>
      <span className="hero-scan-line absolute inset-x-[2cqw] h-[0.8cqw] rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4cqw ${color}` }} />
    </div>
    <div className="mt-[7cqw] rounded-[4cqw] border px-[4cqw] py-[3.6cqw]" style={{ borderColor: `${color}66`, backgroundColor: `${color}14` }}>
      <p className="flex items-center gap-[2cqw] text-[4.4cqw] font-bold" style={{ color }}>
        <Check className="h-[4.4cqw] w-[4.4cqw]" />
        Acceso válido
      </p>
      <p className="mt-[2cqw] text-[4.6cqw] font-semibold text-white">María Fernanda López</p>
      <div className="mt-[2.4cqw] grid grid-cols-3 gap-[2cqw] text-center">
        {[
          ['4', 'Pases'],
          ['12', 'Mesa'],
          ['VIP', 'Grupo']
        ].map(([value, label]) => (
          <div key={label} className="rounded-[2.6cqw] bg-black/30 py-[2cqw]">
            <p className="text-[5cqw] font-bold leading-none text-white">{value}</p>
            <p className="mt-[1cqw] text-[2.8cqw] text-zinc-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
    <p className="mt-auto text-center text-[3.6cqw] text-zinc-500">
      <span className="font-bold text-white">98</span> de 120 invitados ya llegaron
    </p>
  </div>
);

const STEP_SCREENS = [PriceScreen, DataScreen, ShareScreen, ControlScreen, ScanScreen];

const PhoneFrame: React.FC<{ index: number; className?: string }> = ({ index, className = '' }) => {
  const Screen = STEP_SCREENS[index % STEP_SCREENS.length];
  const color = stepColor(index);

  return (
    <div className={`[container-type:inline-size] ${className}`}>
      <div className="relative aspect-[9/15.5] w-full rounded-[13cqw] bg-[#0b0b10] p-[3cqw] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.12)]">
        <div className="relative h-full w-full overflow-hidden rounded-[10.5cqw] bg-[#101017] [container-type:inline-size]">
          <div className="absolute left-1/2 top-[3cqw] z-10 h-[6.5cqw] w-[28cqw] -translate-x-1/2 rounded-full bg-[#0b0b10]" />
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={index}
              className="absolute inset-0 px-[7cqw] pb-[8cqw] pt-[16cqw]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Screen color={color} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* Distancia de scroll por paso (en alturas de pantalla). Mas bajo = pagina mas corta. */
const SCROLL_PER_STEP = 0.55;

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  displayFont,
  processItems,
  renderAccentBadge
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const mobileBarRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const stepCount = processItems.length;
  const activeItem = processItems[activeStep] ?? processItems[0];
  const activeColor = stepColor(activeStep);

  /*
    GSAP ScrollTrigger: el escenario queda fijo (sticky) y el avance del scroll
    dentro de la seccion decide que paso se muestra. La pagina solo crece
    SCROLL_PER_STEP pantallas por paso en lugar de un bloque alto por cada uno.
  */
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || stepCount === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = track.closest('[data-scroll-root]') ?? undefined;

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: track,
        scroller,
        start: 'top top',
        end: 'bottom bottom'
      };

      ScrollTrigger.create({
        ...trigger,
        onUpdate: (self) => {
          const next = Math.min(stepCount - 1, Math.round(self.progress * (stepCount - 1)));
          setActiveStep((prev) => (prev === next ? prev : next));
        }
      });

      [railRef.current, mobileBarRef.current].forEach((bar, index) => {
        if (!bar) return;
        gsap.fromTo(
          bar,
          index === 0 ? { scaleY: 0 } : { scaleX: 0 },
          { ...(index === 0 ? { scaleY: 1 } : { scaleX: 1 }), ease: 'none', scrollTrigger: { ...trigger, scrub: 0.4 } }
        );
      });
    }, track);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [stepCount]);

  if (!activeItem) return null;

  return (
    <section id="proceso" className="relative w-full overflow-x-clip">
      <div ref={trackRef} className="relative" style={{ height: `calc(100dvh + ${(stepCount - 1) * SCROLL_PER_STEP * 100}dvh)` }}>
        <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
          {/* Cuadricula luminosa de fondo */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)'
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background] duration-700 lg:left-[72%]"
            style={{ background: `radial-gradient(circle, ${activeColor}33 0%, transparent 65%)` }}
            aria-hidden="true"
          />

          <div className="relative mx-auto grid w-full max-w-[120rem] items-center gap-6 px-5 pt-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-16 2xl:px-24 lg:pt-16">
            {/* Texto */}
            <div className="text-center lg:text-left">
              <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">Cómo funciona</p>
              <h2 className="mx-auto mt-3 max-w-[16ch] text-[2.1rem] leading-[1] tracking-[-0.045em] text-white sm:text-[2.8rem] lg:mx-0 lg:text-[3.4rem] xl:text-[3.8rem]" style={displayFont}>
                De la lista al acceso, <span className="brand-gradient-text">en 5 pasos.</span>
              </h2>

              {/* Escritorio: lista de pasos con riel de progreso */}
              <div className="relative mt-10 hidden pl-8 lg:block">
                <div className="absolute bottom-2 left-0 top-2 w-px bg-white/10" aria-hidden="true">
                  <div
                    ref={railRef}
                    className="absolute inset-0 origin-top"
                    style={{ background: 'linear-gradient(180deg, #f472b6, #22d3ee, #a78bfa, #fbbf24, #34d399)' }}
                  />
                </div>
                <ol className="grid gap-1">
                  {processItems.map((item, index) => {
                    const isActive = index === activeStep;
                    const color = stepColor(index);
                    return (
                      <li key={item.step} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="flex items-center gap-4 py-2">
                          <span className="w-7 text-[13px] font-bold tabular-nums" style={{ color: isActive ? color : undefined }}>
                            {item.step}
                          </span>
                          <span className="text-[1.3rem] font-semibold tracking-[-0.01em] text-white">{item.title}</span>
                        </div>
                        <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <p className="overflow-hidden pl-11 text-[1rem] leading-7 text-zinc-400">
                            <span className="block pb-3">{item.description}</span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* Telefono */}
            <div className="flex flex-col items-center">
              <PhoneFrame index={activeStep} className="w-[12rem] sm:w-[13rem] lg:w-[16.5rem] xl:w-[17.5rem]" />

              {/* Celular: paso activo debajo del telefono */}
              <div className="mt-5 w-full max-w-[22rem] text-center lg:hidden">
                <div className="mx-auto h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    ref={mobileBarRef}
                    className="h-full origin-left"
                    style={{ background: 'linear-gradient(90deg, #f472b6, #22d3ee, #a78bfa, #fbbf24, #34d399)' }}
                  />
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeItem.step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      {renderAccentBadge(activeItem.icon, activeColor, 'h-4 w-4')}
                      <span className="text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: activeColor }}>
                        Paso {activeItem.step}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[1.45rem] leading-[1.1] tracking-[-0.02em] text-white" style={displayFont}>
                      {activeItem.title}
                    </h3>
                    <p className="mt-1.5 text-[0.95rem] leading-6 text-zinc-400">{activeItem.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
