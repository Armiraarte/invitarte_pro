import React from 'react';
import { m as motion } from 'motion/react';
import qrImage from '../../laboratorio/components/images/interviews/qr.webp';
import { BRAND_COLORS } from './palette';
import type { MotionVariants } from './shared';

type SectionMotionProps = {
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  staggerGroup: MotionVariants;
};

const CheckIcon: React.FC<{ className?: string }> = ({ className = 'h-3 w-3' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">{children}</p>
);

/* ---------------- Control con QR ---------------- */

const qrDetails = [
  { title: 'Sin apps ni lectores extra', text: 'Escaneas desde el navegador del celular.' },
  { title: 'Pases exactos por invitado', text: 'Sabes cuántas personas entran con cada acceso.' },
  { title: 'Mesa y grupo al instante', text: 'Tu equipo ubica a cada invitado sin buscar en listas.' },
  { title: 'Confirmación en tiempo real', text: 'Cada escaneo actualiza tu panel del evento.' }
];

export const QrControlSection: React.FC<SectionMotionProps> = ({ displayFont, fadeInUp, staggerGroup }) => (
  <section id="control-qr" className="cv-auto scroll-mt-24 w-full px-4 py-20 sm:px-6 md:py-28 lg:px-16 2xl:px-24">
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerGroup}
      className="mx-auto grid max-w-[120rem] items-center gap-12 lg:grid-cols-[1fr_0.9fr]"
    >
      <div>
        <motion.div variants={fadeInUp}>
          <SectionEyebrow>Control con QR</SectionEyebrow>
          <h2 className="mt-4 max-w-[14ch] text-[2.5rem] leading-[0.98] tracking-[-0.045em] text-white sm:text-[3.4rem] lg:text-[4rem]" style={displayFont}>
            Tu entrada, <span className="brand-gradient-text">bajo control.</span>
          </h2>
          <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-7 text-zinc-400">
            Desde el mismo panel escaneas a tus invitados, validas su acceso y consultas número de pases, mesa asignada, grupo y confirmación. Sin nada que instalar.
          </p>
        </motion.div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          {qrDetails.map((detail, index) => {
            const color = [BRAND_COLORS.violet, BRAND_COLORS.cyan, BRAND_COLORS.fuchsia, BRAND_COLORS.emerald][index];
            return (
              <motion.div key={detail.title} variants={fadeInUp} className="rounded-[22px] border border-white/[0.07] bg-[#0c0c11] p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}26`, color }}>
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <p className="mt-4 font-semibold text-white">{detail.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{detail.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.figure variants={fadeInUp} className="relative mx-auto w-full max-w-[30rem]">
        <div
          className="pointer-events-none absolute -inset-8 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.28) 0%, rgba(244,114,182,0.12) 45%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="glow-card relative overflow-hidden rounded-[32px] p-2.5">
          <img
            src={qrImage}
            width={1086}
            height={1448}
            loading="lazy"
            decoding="async"
            alt="Invitado mostrando su código QR para entrar al evento"
            className="block h-auto w-full rounded-[24px] object-cover"
          />
          <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${BRAND_COLORS.emerald}33`, color: BRAND_COLORS.emerald }}>
              <CheckIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Acceso válido · Mesa 12</p>
              <p className="truncate text-xs text-zinc-400">María Fernanda López · 4 pases · VIP</p>
            </div>
          </div>
        </div>
      </motion.figure>
    </motion.div>
  </section>
);

/* ---------------- Que es realmente INViTARTE ---------------- */

const pipeline = [
  {
    label: 'Envías',
    title: 'La invitación digital',
    text: 'Cada invitado recibe su enlace personal por WhatsApp, con todos los datos del evento.',
    chip: 'Enlace personal enviado',
    color: BRAND_COLORS.fuchsia,
    icon: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z'
  },
  {
    label: 'Confirman',
    title: 'Respuesta en un toque',
    text: 'Tus invitados confirman desde la misma invitación, sin llamarte ni escribirte.',
    chip: 'Confirmó · 4 personas',
    color: BRAND_COLORS.cyan,
    icon: 'M20 6 9 17l-5-5'
  },
  {
    label: 'Se organiza',
    title: 'Tu lista, siempre al día',
    text: 'Pases, mesa y grupo se actualizan solos en tu panel, en tiempo real.',
    chip: 'Mesa 12 · Grupo VIP',
    color: BRAND_COLORS.violet,
    icon: 'M4 6h16M4 12h16M4 18h10'
  },
  {
    label: 'Entran',
    title: 'Acceso con QR',
    text: 'En la puerta escaneas su código y ves al instante quién es y cuántos pases trae.',
    chip: 'Acceso válido',
    color: BRAND_COLORS.emerald,
    icon: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16'
  }
];

const withoutSystem = [
  'Llamadas y mensajes uno por uno para confirmar',
  'Listas en Excel que nadie actualiza',
  'Filas y dudas en la entrada',
  'Imprimir, repartir y volver a imprimir'
];

const withSystem = [
  'Las confirmaciones llegan solas desde la invitación',
  'Tu lista se actualiza en tiempo real',
  'Tu equipo valida cada acceso con QR',
  'Un solo enlace por invitado, cero papel'
];

export const PlatformSection: React.FC<SectionMotionProps> = ({ displayFont, fadeInUp, staggerGroup }) => (
  <section id="sistema" className="cv-auto scroll-mt-24 w-full px-4 py-20 sm:px-6 md:py-28 lg:px-16 2xl:px-24">
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={staggerGroup}
      className="mx-auto max-w-[120rem]"
    >
      <motion.div variants={fadeInUp} className="mx-auto max-w-[50rem] text-center">
        <SectionEyebrow>Lo que realmente hace INViTARTE</SectionEyebrow>
        <h2 className="mt-4 text-[2.5rem] leading-[0.98] tracking-[-0.045em] text-white sm:text-[3.4rem] lg:text-[4rem]" style={displayFont}>
          La invitación es el comienzo. <span className="brand-gradient-text">El control es el objetivo.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[40rem] text-[1.05rem] leading-7 text-zinc-400">
          INViTARTE existe para agilizar todo el proceso de tus invitados. La invitación digital es el vehículo: desde ahí confirman, tu lista se organiza sola y el día del evento entran con su QR.
        </p>
      </motion.div>

      {/* Flujo: de la invitacion a la entrada */}
      <div className="relative mt-16">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-white/10 lg:block" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #f472b6, #22d3ee, #a78bfa, #34d399)', opacity: 0.55 }} />
          <span className="pipeline-pulse-x absolute inset-0">
            <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_6px_rgba(255,255,255,0.45)]" />
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-10 left-7 top-7 w-px bg-white/10 lg:hidden" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #f472b6, #22d3ee, #a78bfa, #34d399)', opacity: 0.55 }} />
          <span className="pipeline-pulse-y absolute inset-0">
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_6px_rgba(255,255,255,0.45)]" />
          </span>
        </div>

        <ol className="relative grid gap-6 lg:grid-cols-4 lg:gap-5">
          {pipeline.map((stage, index) => (
            <motion.li key={stage.label} variants={fadeInUp} className="flex gap-5 lg:flex-col lg:items-center lg:text-center">
              <span
                className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-[#0c0c11]"
                style={{ borderColor: `${stage.color}66`, color: stage.color, boxShadow: `0 0 30px ${stage.color}33` }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={stage.icon} />
                </svg>
              </span>
              <div className="flex-1 rounded-[24px] border border-white/[0.07] bg-[#0c0c11] p-5 lg:mt-5 lg:w-full">
                <p className="text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: stage.color }}>
                  0{index + 1} · {stage.label}
                </p>
                <h3 className="mt-2 text-[1.2rem] font-semibold text-white">{stage.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-6 text-zinc-400">{stage.text}</p>
                <span
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ backgroundColor: `${stage.color}1f`, color: stage.color }}
                >
                  <CheckIcon />
                  {stage.chip}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Antes y despues */}
      <div className="mt-16 grid gap-4 lg:grid-cols-2">
        <motion.div variants={fadeInUp} className="rounded-[28px] border border-white/[0.07] bg-[#0a0a0e] p-7 sm:p-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Sin un sistema</p>
          <ul className="mt-5 grid gap-3.5">
            {withoutSystem.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[1rem] leading-6 text-zinc-500">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </span>
                <span className="line-through decoration-white/20">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeInUp} className="glow-card rounded-[28px] p-7 sm:p-8">
          <p className="brand-gradient-text text-[12px] font-bold uppercase tracking-[0.22em]">Con INViTARTE</p>
          <ul className="mt-5 grid gap-3.5">
            {withSystem.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[1rem] leading-6 text-white">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${BRAND_COLORS.emerald}26`, color: BRAND_COLORS.emerald }}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

/* ---------------- Precio ---------------- */

type PriceSectionProps = SectionMotionProps & {
  price: string;
  invitationFeatures: readonly string[];
  onStart: () => void;
};

const controlFeatures = [
  'Lista de invitados con pases',
  'Importa tu lista desde Excel',
  'Confirmación de asistencia',
  'Panel del evento en tiempo real',
  'Escáner QR en la entrada',
  'Mesa y grupo por invitado',
  'Enlace personal por invitado',
  'Exporta tu lista cuando quieras'
];

export const PriceSection: React.FC<PriceSectionProps> = ({ displayFont, fadeInUp, staggerGroup, price, invitationFeatures, onStart }) => (
  <section id="precio" className="cv-auto scroll-mt-24 w-full px-4 py-20 sm:px-6 md:py-28 lg:px-16 2xl:px-24">
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerGroup}
      className="mx-auto max-w-[120rem]"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <SectionEyebrow>Precio</SectionEyebrow>
        <h2 className="mx-auto mt-4 max-w-[18ch] text-[2.5rem] leading-[0.98] tracking-[-0.045em] text-white sm:text-[3.4rem] lg:text-[4rem]" style={displayFont}>
          Un solo precio. <span className="brand-gradient-text">Todo el control.</span>
        </h2>
      </motion.div>

      <motion.div variants={fadeInUp} className="glow-card mt-12 grid overflow-hidden rounded-[32px] lg:grid-cols-[0.8fr_1.2fr]">
        <div
          className="relative flex flex-col justify-between gap-10 p-8 sm:p-10"
          style={{ background: 'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.2) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(34,211,238,0.14) 0%, transparent 55%)' }}
        >
          <div>
            <p className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-semibold text-zinc-300">Pago único por evento</p>
            <p className="mt-6 flex items-end gap-3">
              <span className="brand-gradient-text text-[5.5rem] font-bold leading-[0.85] tracking-[-0.06em] sm:text-[7rem]" style={displayFont}>
                {price}
              </span>
              <span className="pb-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MXN</span>
            </p>
            <p className="mt-5 max-w-[24rem] text-[1.02rem] leading-7 text-zinc-400">
              Sistema completo de control de invitados con invitación digital incluida. Pagas una vez por evento, sin mensualidades.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-[1rem] font-semibold text-zinc-950 shadow-[0_20px_50px_-12px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
            >
              Crear mi evento
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
              {['Pago único', 'Sin mensualidades', 'Soporte en el proceso'].map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/[0.07] bg-[#0a0a0e] p-8 sm:p-10 lg:border-l lg:border-t-0">
          {[
            { title: 'Control de invitados', items: controlFeatures, color: BRAND_COLORS.cyan },
            { title: 'Invitación digital incluida', items: invitationFeatures, color: BRAND_COLORS.fuchsia }
          ].map((group) => (
            <div key={group.title}>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: group.color }}>
                {group.title}
              </p>
              <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 2xl:grid-cols-3">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.95rem] leading-6 text-zinc-300">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${group.color}26`, color: group.color }}>
                      <CheckIcon className="h-2.5 w-2.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  </section>
);
