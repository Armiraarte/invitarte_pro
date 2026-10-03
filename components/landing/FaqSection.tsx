import React from 'react';
import { m as motion } from 'motion/react';
import type { MotionVariants } from './shared';

type FaqSectionProps = {
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  staggerGroup: MotionVariants;
  price: string;
};

export const FaqSection: React.FC<FaqSectionProps> = ({ displayFont, fadeInUp, staggerGroup, price }) => {
  // Deben coincidir con las preguntas del JSON-LD (FAQPage) de index.html.
  const faqs = [
    { q: '¿Cuánto cuesta INViTARTE?', a: `Un pago único de ${price} MXN por evento, sin mensualidades.` },
    {
      q: '¿Qué incluye el sistema?',
      a: 'Invitación digital, confirmación de asistencia, lista de invitados con pases y mesa, panel en tiempo real y escáner QR para la entrada.'
    },
    { q: '¿Necesito instalar alguna aplicación para escanear los QR?', a: 'No. El escaneo se hace desde el navegador del celular, sin apps ni lectores extra.' },
    {
      q: '¿Cómo reciben la invitación mis invitados?',
      a: 'Cada invitado recibe un enlace personal que puedes enviar por WhatsApp o redes. Desde ahí ve los datos del evento y confirma su asistencia.'
    },
    {
      q: '¿Puedo cambiar datos del evento después de enviar la invitación?',
      a: 'Sí. Editas la información una sola vez y todos tus invitados ven la versión actualizada en el mismo enlace.'
    }
  ];

  return (
    <section id="preguntas" className="cv-auto scroll-mt-24 w-full py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerGroup}
        className="mx-auto grid w-full max-w-[120rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 2xl:px-24"
      >
        <motion.div variants={fadeInUp}>
          <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">Preguntas frecuentes</p>
          <h2 className="mt-4 max-w-[12ch] text-[2.5rem] leading-[0.98] tracking-[-0.045em] text-white sm:text-[3.4rem]" style={displayFont}>
            Todo claro <span className="brand-gradient-text">antes de empezar.</span>
          </h2>
        </motion.div>

        <div className="grid gap-3">
          {faqs.map((faq) => (
            <motion.details key={faq.q} variants={fadeInUp} className="faq-item group rounded-[22px] border border-white/[0.08] bg-[#0c0c11]/80 px-6 py-5 open:border-white/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.05rem] font-semibold text-white">
                {faq.q}
                <span className="faq-chevron flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-[48rem] text-[0.98rem] leading-7 text-zinc-400">{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
