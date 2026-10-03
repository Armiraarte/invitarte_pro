import React from 'react';
import { m as motion } from 'motion/react';
import { BRAND_SWATCHES } from './palette';
import type { IconRenderer, MotionVariants } from './shared';

const FEATURE_COLORS = BRAND_SWATCHES;

type PricingSectionProps = {
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  features: readonly string[];
  isDark: boolean;
  mutedTextClasses: string;
  price: string;
  priceNote: string;
  renderIcon: IconRenderer;
  softBorderClasses: string;
  staggerGroup: MotionVariants;
  supportPoints: readonly string[];
  surfaceClasses: string;
  surfaceStrongClasses: string;
  tertiaryTextClasses: string;
};

const PricingSectionComponent: React.FC<PricingSectionProps> = ({
  displayFont,
  fadeInUp,
  features,
  isDark,
  mutedTextClasses,
  price,
  priceNote,
  renderIcon,
  softBorderClasses,
  staggerGroup,
  supportPoints,
  surfaceClasses,
  surfaceStrongClasses,
  tertiaryTextClasses
}) => {
  const priceTextColor = isDark ? '#f8fafc' : '#0f172a';

  return (
    <section id="precios" className="scroll-mt-24 w-full px-3 pt-4 pb-6 sm:px-4 md:px-6 md:pb-8">
      <motion.div initial="hidden" animate="visible" variants={staggerGroup} className="w-full">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
          <motion.article variants={fadeInUp} className={`overflow-hidden p-6 sm:p-7 xl:sticky xl:top-28 ${surfaceClasses}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: '#22d3ee' }}>
              Precio unico
            </p>
            <h1 className="mt-4 max-w-[10ch] text-[2.3rem] leading-[0.92] tracking-[-0.05em] sm:text-[3rem] lg:text-[3.5rem]" style={displayFont}>
              Sin planes raros ni letras chiquitas.
            </h1>
            <p className={`mt-4 max-w-xl text-sm leading-7 sm:text-[1rem] ${mutedTextClasses}`}>
              Una sola modalidad para vender más fácil: el cliente entiende el costo rápido y tú no pierdes tiempo explicando diferencias entre paquetes.
            </p>

            <div className={`mt-6 rounded-[28px] border p-5 sm:p-6 ${surfaceStrongClasses}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: '#fb923c' }}>
                Inversion por evento
              </p>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-[4.2rem] leading-none tracking-[-0.09em] sm:text-[5rem]" style={{ ...displayFont, color: priceTextColor }}>
                  {price}
                </p>
                <span className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] ${tertiaryTextClasses}`}>MXN</span>
              </div>
              <p className={`mt-4 text-[1rem] leading-7 ${mutedTextClasses}`}>{priceNote}</p>
            </div>

            <div className="mt-5 grid gap-3">
              {supportPoints.map((point) => (
                <div key={point} className={`flex items-center gap-3 rounded-[22px] border px-4 py-3.5 ${surfaceStrongClasses}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    {renderIcon('check', 'h-4 w-4')}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-zinc-200">{point}</span>
                </div>
              ))}
            </div>

            <div className={`mt-6 flex items-center justify-between rounded-[24px] border px-4 py-4 ${surfaceStrongClasses}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Mas simple para vender</p>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClasses}`}>Solo explicas el valor y pasas al evento.</p>
              </div>
              <a
                href="#mi-evento"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-white/85"
              >
                Empezar
              </a>
            </div>
          </motion.article>

          <motion.article variants={fadeInUp} className={`overflow-hidden ${surfaceClasses}`}>
            <div className={`border-b px-6 py-6 sm:px-7 sm:py-7 ${softBorderClasses}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: '#a78bfa' }}>
                Todo incluido
              </p>
              <h2 className="mt-4 max-w-[14ch] text-[2rem] leading-[0.92] tracking-[-0.05em] sm:text-[2.7rem]" style={displayFont}>
                Una interfaz más clara también vende mejor.
              </h2>
              <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-[1rem] ${mutedTextClasses}`}>
                El cliente ve una sola oferta completa, entiende qué recibe y puede avanzar al código del evento sin confundirse con comparativas innecesarias.
              </p>
            </div>

            <div className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-7 sm:py-7 xl:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className={`flex items-start gap-3 rounded-[22px] border px-4 py-3.5 ${surfaceStrongClasses}`}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${FEATURE_COLORS[index % FEATURE_COLORS.length]}26`,
                      color: FEATURE_COLORS[index % FEATURE_COLORS.length]
                    }}
                  >
                    {renderIcon(index % 2 === 0 ? 'spark' : 'check', 'h-4 w-4')}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-zinc-200">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.08] px-6 py-5 sm:px-7">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  'Más claro para el cliente final',
                  'Más rápido para cerrar la venta',
                  'Más fácil de explicar por WhatsApp'
                ].map((item) => (
                  <div key={item} className={`rounded-[20px] border px-4 py-3 text-sm font-semibold leading-6 ${surfaceStrongClasses}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </motion.div>
    </section>
  );
};

export const PricingSection = React.memo(PricingSectionComponent);
