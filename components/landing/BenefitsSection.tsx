import React from 'react';
import { m as motion } from 'motion/react';
import type { AccentBadgeRenderer, IconName, MotionVariants } from './shared';

export type BenefitVisual = 'update' | 'rsvp' | 'paper' | 'share' | 'modern';

export type LandingBenefit = {
  icon: IconName;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  visual: BenefitVisual;
  color: string;
  points: string[];
};

type BenefitsSectionProps = {
  benefits: LandingBenefit[];
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  renderAccentBadge: AccentBadgeRenderer;
  staggerGroup: MotionVariants;
};

/* Solo opacidad: sin desplazamiento ni filtros, para que los bordes no parpadeen al hacer scroll */
const cardFade: MotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
};

/* Primera fila: dos tarjetas anchas; segunda fila: tres tarjetas */
const cardSpanClasses = [
  'md:col-span-1 lg:col-span-3',
  'md:col-span-1 lg:col-span-3',
  'md:col-span-1 lg:col-span-2',
  'md:col-span-1 lg:col-span-2',
  'md:col-span-2 lg:col-span-2'
];

const CheckIcon: React.FC<{ className?: string }> = ({ className = 'h-3 w-3' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/* ---------- Visuales dibujados en codigo, uno por beneficio ---------- */

const UpdateVisual: React.FC<{ color: string }> = ({ color }) => (
  <div className="w-full max-w-[20rem] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
      <span>Editar evento</span>
      <span className="flex items-center gap-1.5" style={{ color }}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ backgroundColor: color }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        </span>
        En vivo
      </span>
    </div>
    <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">
      <span className="text-sm text-zinc-400">Hora</span>
      <span className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500 line-through">19:00</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold" style={{ color }}>
          20:00
        </span>
      </span>
    </div>
    <div className="mt-3 flex items-center gap-3">
      <div className="flex -space-x-2">
        {['#f472b6', '#a78bfa', '#fbbf24', '#34d399'].map((avatar) => (
          <span key={avatar} className="h-6 w-6 rounded-full border-2 border-[#0c0c11]" style={{ backgroundColor: avatar }} />
        ))}
      </div>
      <p className="text-xs text-zinc-400">
        <span className="font-bold text-white">150 invitados</span> ya ven el cambio
      </p>
    </div>
  </div>
);

const RsvpVisual: React.FC<{ color: string }> = ({ color }) => {
  const guests = [
    { name: 'Familia Torres', initials: 'FT', tone: '#f472b6', confirmed: true },
    { name: 'Daniela y Luis', initials: 'DL', tone: '#22d3ee', confirmed: true },
    { name: 'Martha Salazar', initials: 'MS', tone: '#a78bfa', confirmed: false }
  ];

  return (
    <div className="w-full max-w-[20rem] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-end justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Confirmados</p>
        <p className="text-lg font-bold leading-none text-white">
          86 <span className="text-xs font-medium text-zinc-500">/ 120</span>
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-[72%] rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="mt-3 grid gap-2">
        {guests.map((guest) => (
          <div key={guest.name} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-2.5 py-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-[#0c0c11]"
              style={{ backgroundColor: guest.tone }}
            >
              {guest.initials}
            </span>
            <span className="flex-1 truncate text-sm text-zinc-300">{guest.name}</span>
            {guest.confirmed ? (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color, backgroundColor: `${color}1f` }}>
                <CheckIcon />
                Asiste
              </span>
            ) : (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-zinc-500">Pendiente</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PaperVisual: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex items-center gap-5">
    <div className="relative h-24 w-20">
      <div className="absolute inset-0 translate-x-3 -rotate-6 rounded-lg border border-white/10 bg-white/[0.03]" />
      <div className="absolute inset-0 rounded-lg border border-white/15 bg-white/[0.05] p-2.5">
        <div className="h-1.5 w-10 rounded-full bg-white/15" />
        <div className="mt-1.5 h-1.5 w-12 rounded-full bg-white/10" />
        <div className="mt-1.5 h-1.5 w-8 rounded-full bg-white/10" />
      </div>
      <svg viewBox="0 0 80 96" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1="6" y1="90" x2="74" y2="6" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
    <div>
      <p className="text-5xl font-bold leading-none tracking-[-0.04em]" style={{ color }}>
        0
      </p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">hojas impresas</p>
    </div>
  </div>
);

const ShareVisual: React.FC<{ color: string }> = ({ color }) => (
  <div className="w-full max-w-[16rem]">
    <div className="ml-auto w-[92%] overflow-hidden rounded-2xl rounded-tr-sm border border-white/10 bg-white/[0.05]">
      <div className="h-14" style={{ background: `linear-gradient(135deg, ${color} 0%, #f472b6 100%)` }} />
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-white">Sofía & Mateo · 14 Nov</p>
        <p className="text-[11px] text-zinc-500">invitarte.mx/sofia-y-mateo</p>
        <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-zinc-500">
          12:04
          <span className="flex -space-x-1.5" style={{ color }}>
            <CheckIcon className="h-3.5 w-3.5" />
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
    <div className="mt-2 w-fit rounded-2xl rounded-tl-sm bg-white/[0.07] px-3 py-2 text-sm text-zinc-200">¡Ahí estaremos! 🎉</div>
  </div>
);

const ModernVisual: React.FC<{ color: string }> = ({ color }) => (
  <div className="relative h-32 w-full max-w-[16rem]">
    {[
      { text: '¡Qué bonita quedó!', className: 'left-0 top-0', delay: 0 },
      { text: 'Se ve increíble ✨', className: 'right-0 top-11', delay: 0.6 },
      { text: 'Ya confirmé 🙌', className: 'left-4 bottom-0', delay: 1.2 }
    ].map((bubble) => (
      <div
        key={bubble.text}
        className={`bubble-float absolute rounded-full border px-3.5 py-1.5 text-sm text-white ${bubble.className}`}
        style={{ borderColor: `${color}55`, backgroundColor: `${color}1a`, animationDelay: `${bubble.delay}s` }}
      >
        {bubble.text}
      </div>
    ))}
  </div>
);

const renderVisual = (visual: BenefitVisual, color: string) => {
  switch (visual) {
    case 'update':
      return <UpdateVisual color={color} />;
    case 'rsvp':
      return <RsvpVisual color={color} />;
    case 'paper':
      return <PaperVisual color={color} />;
    case 'share':
      return <ShareVisual color={color} />;
    case 'modern':
      return <ModernVisual color={color} />;
  }
};

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ benefits, displayFont, fadeInUp, renderAccentBadge, staggerGroup }) => {
  if (benefits.length === 0) return null;

  return (
    <section id="beneficios" className="cv-auto scroll-mt-28 w-full px-4 py-20 sm:px-6 md:py-28 lg:px-16 2xl:px-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={staggerGroup}
        className="mx-auto w-full max-w-[120rem]"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <motion.div variants={fadeInUp}>
            <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">Beneficios</p>
            <h2 className="mt-4 text-[2.6rem] leading-[0.95] tracking-[-0.045em] text-white sm:text-[3.6rem] lg:text-[4.4rem]" style={displayFont}>
              Se ve increíble.
              <span className="brand-gradient-text block pb-1">Y te organiza todo.</span>
            </h2>
          </motion.div>
          <motion.p variants={fadeInUp} className="max-w-[30rem] text-[1.05rem] leading-7 text-zinc-400 lg:justify-self-end lg:pb-3">
            No se trata solo de que se vea bonita. Centraliza cambios, ordena la información y hace mucho más simple compartir todo desde el celular.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {benefits.map((benefit, index) => (
            <motion.article
              key={benefit.title}
              variants={cardFade}
              className={`group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0c0c11] p-6 transition-colors duration-300 hover:border-white/15 sm:p-7 ${cardSpanClasses[index] ?? 'lg:col-span-2'}`}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 100% 0%, ${benefit.color}33 0%, transparent 45%)` }}
                aria-hidden="true"
              />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderAccentBadge(benefit.icon, benefit.color, 'h-5 w-5')}
                  <p className="text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: benefit.color }}>
                    {benefit.eyebrow}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-zinc-400">{benefit.accent}</span>
              </div>

              <div className="relative my-7 flex min-h-[10rem] items-center justify-center">{renderVisual(benefit.visual, benefit.color)}</div>

              <div className="relative mt-auto">
                <h3 className="text-[1.6rem] leading-[1.05] tracking-[-0.03em] text-white sm:text-[1.8rem]" style={displayFont}>
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[0.97rem] leading-7 text-zinc-400">{benefit.description}</p>
                <ul className="mt-5 grid gap-2 border-t border-white/[0.07] pt-5">
                  {benefit.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-zinc-300">
                      <span
                        className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${benefit.color}26`, color: benefit.color }}
                      >
                        <CheckIcon className="h-2.5 w-2.5" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
