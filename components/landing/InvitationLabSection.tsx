import React from 'react';
import { m as motion } from 'motion/react';
import type { MotionVariants } from './shared';

type InvitationLabSectionProps = {
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  isDark: boolean;
  mutedTextClasses: string;
  shadowClasses: string;
  staggerGroup: MotionVariants;
  surfaceClasses: string;
  surfaceStrongClasses: string;
  tertiaryTextClasses: string;
};

const deferredSectionStyle: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '620px'
};

const labCards = [
  {
    label: 'Precio fijo',
    color: '#2563eb',
    text: 'Una sola modalidad de $359 para que el cliente entienda rápido cuánto cuesta.'
  },
  {
    label: 'Edicion libre',
    color: '#14b8a6',
    text: 'Portada, secciones, textos y orden visual se ajustan dentro del laboratorio.'
  },
  {
    label: 'Soporte real',
    color: '#f97316',
    text: 'Tú vendes una experiencia más simple y nosotros ayudamos a que todo funcione.'
  }
] as const;

const labChecklist = [
  'Alta del evento con código listo',
  'Diseño desde móvil, tablet y web',
  'Invitados, QR y confirmaciones',
  'Panel claro para cliente y operación'
] as const;

export const InvitationLabSection: React.FC<InvitationLabSectionProps> = ({
  displayFont,
  fadeInUp,
  mutedTextClasses,
  shadowClasses,
  staggerGroup,
  surfaceClasses,
  surfaceStrongClasses,
  tertiaryTextClasses
}) => {
  return (
    <section
      id="laboratorio-invitaciones"
      className="w-full px-3 py-6 sm:px-4 md:px-6 md:py-7"
      style={deferredSectionStyle}
    >
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={staggerGroup} className="mx-auto w-full max-w-[1440px]">
        <div className={`app-shell-card relative overflow-hidden rounded-[34px] p-6 sm:p-7 xl:p-8 ${surfaceClasses} ${shadowClasses}`}>
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(14,165,233,0.12) 0%, transparent 24%), radial-gradient(circle at left center, rgba(37,99,235,0.08) 0%, transparent 28%)'
            }}
          />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] xl:items-start">
            <motion.div variants={fadeInUp}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#2563eb' }}>
                Laboratorio integrado
              </p>
              <h2 className="mt-4 max-w-[14ch] text-[2rem] leading-[0.92] tracking-[-0.05em] sm:text-[2.7rem] lg:text-[3rem]" style={displayFont}>
                Vende una experiencia que sí se entiende.
              </h2>
              <p className={`mt-4 max-w-3xl text-[0.98rem] leading-7 sm:text-[1rem] sm:leading-8 ${mutedTextClasses}`}>
                Este flujo ya no depende de abrir editores raros ni mini proyectos por separado. El evento se crea, se diseña y se organiza desde una misma base para que el proceso sea más estable y más fácil de explicar al cliente.
              </p>
              <p className={`mt-3 max-w-3xl text-[0.94rem] leading-7 sm:text-[0.98rem] sm:leading-8 ${tertiaryTextClasses}`}>
                Menos vueltas, menos confusión y una interfaz más intuitiva para que puedas enfocarte en cerrar ventas y operar eventos.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {labChecklist.map((item) => (
                  <div key={item} className={`flex items-center gap-3 rounded-[22px] border px-4 py-3.5 ${surfaceStrongClasses}`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12.5l4 4 10-10" />
                      </svg>
                    </span>
                    <p className="text-sm font-semibold leading-6 text-slate-800">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className={`flex h-full flex-col rounded-[28px] border p-5 sm:p-6 ${surfaceStrongClasses}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: '#0ea5e9' }}>
                Lo que recibe el negocio
              </p>

              <div className="mt-4 grid gap-3">
                {labCards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-[22px] border px-4 py-4 ${surfaceClasses}`}
                    style={{ borderColor: `${card.color}26` }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: card.color }}>
                      {card.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{card.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-slate-200/80 bg-slate-950 px-5 py-5 text-white shadow-[0_20px_42px_rgba(15,23,42,0.18)]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Listo para producir</p>
                <h3 className="mt-3 max-w-[12ch] text-[1.8rem] leading-[0.94] tracking-[-0.04em]" style={displayFont}>
                  Un sistema más fácil de vender y operar.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Cuando el flujo es claro, el cliente avanza más rápido y tú tienes menos puntos donde algo se rompa.
                </p>
                <motion.a
                  variants={fadeInUp}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  href="#mi-evento"
                  className="app-cta-primary mt-5 inline-flex min-h-14 items-center justify-center rounded-[18px] px-6 py-3 text-center text-[11px] font-black uppercase tracking-[0.22em]"
                >
                  Probar acceso del evento
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
