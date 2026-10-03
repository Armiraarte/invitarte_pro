import React from 'react';
import { MotionConfig, motion } from 'motion/react';
import { PACKAGES } from '../constants';
import dispositivosImage960 from './images/interviews/dispositivos-960.webp';
import dispositivosImage from './images/interviews/dispositivos.webp';
import qrImage from './images/interviews/qr.webp';
import templateImage960 from './images/interviews/template-960.webp';
import templateImage from './images/interviews/template.webp';

interface LandingPageProps {
  onOpenAuth: () => void;
  onStartDesign: () => void;
}

const deferredSectionStyle: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '960px',
};

const capabilities = [
  {
    tag: 'Plantillas',
    title: 'Empieza con una base lista',
    description: 'Elige una propuesta visual pensada para bodas, XV años y celebraciones especiales.',
    details: ['Bodas', 'XV años', 'Eventos especiales'],
  },
  {
    tag: 'Secciones',
    title: 'Arma el contenido a tu medida',
    description: 'Agrega portada, horario, ubicación, galería, RSVP y los bloques que quieres mostrar.',
    details: ['Ubicación', 'Galería', 'RSVP'],
  },
  {
    tag: 'Estilo',
    title: 'Ajusta diseño y movimiento',
    description: 'Edita textos, colores, imágenes y animaciones para que la invitación se sienta tuya.',
    details: ['Colores', 'Animaciones', 'Imágenes'],
  },
  {
    tag: 'Entrega',
    title: 'Guarda y comparte sin perder avances',
    description: 'Retoma tu proyecto cuando quieras, revisa el resultado final y comparte el enlace listo.',
    details: ['Guardado', 'Vista final', 'Enlace listo'],
  },
];

const priceDetails = [
  'Plantillas premium listas para editar.',
  'Editor visual con vista previa de tu invitación.',
  'Guardado de tu proyecto para retomarlo después.',
];

const qrDetails = [
  'Sin apps ni lectores extra instalados.',
  'Número exacto de invitados por acceso.',
  'Mesa asignada y referencia del grupo.',
  'Confirmación y datos precisos al momento de escanear.',
];

interface PlaceholderShellProps {
  tone?: 'light' | 'dark';
  type?: 'panel' | 'phone' | 'card';
  className?: string;
}

const PlaceholderShell: React.FC<PlaceholderShellProps> = ({
  tone = 'light',
  type = 'panel',
  className = '',
}) => {
  const baseClasses =
    tone === 'dark'
      ? 'border-white/10 bg-white/[0.04] shadow-[0_22px_60px_rgba(15,23,42,0.22)]'
      : 'border-black/8 bg-white/90 shadow-[0_22px_60px_rgba(15,23,42,0.10)]';

  if (type === 'phone') {
    return (
      <div className={`rounded-[38px] border-[10px] border-slate-950 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)] ${className}`}>
        <div className="overflow-hidden rounded-[28px] bg-slate-50">
          <div className="mx-auto h-5 w-24 rounded-b-2xl bg-slate-950" />
          <div className="h-[260px] bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fb_100%)]" />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div
        className={`rounded-[28px] border ${baseClasses} ${className}`}
      >
        <div className={tone === 'dark' ? 'h-full rounded-[28px] bg-white/[0.03]' : 'h-full rounded-[28px] bg-slate-50/80'} />
      </div>
    );
  }

  return (
    <div className={`rounded-[34px] border ${baseClasses} p-3 ${className}`}>
      <div className={tone === 'dark' ? 'rounded-[26px] bg-white/[0.03]' : 'rounded-[26px] bg-slate-50'} style={{ minHeight: '100%' }} />
    </div>
  );
};

const HeroPlaceholderScene: React.FC = () => (
  <div className="relative mx-auto flex h-[440px] w-full max-w-[680px] items-center justify-center lg:justify-end">
    <div className="absolute left-8 top-10 h-40 w-40 rounded-full bg-orange-200/55 blur-3xl" />
    <div className="absolute right-8 top-24 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl" />

    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className="relative z-10 w-full"
    >
        <img
          src={dispositivosImage}
          srcSet={`${dispositivosImage960} 960w, ${dispositivosImage} 1536w`}
          sizes="(min-width: 1024px) 680px, (min-width: 768px) 50vw, calc(100vw - 3rem)"
          width={1536}
          height={1024}
          fetchPriority="high"
        decoding="async"
        alt="Vista de invitación digital en laptop, tablet y celular"
        className="h-auto w-full object-contain drop-shadow-[0_32px_70px_rgba(15,23,42,0.28)]"
      />
    </motion.div>
  </div>
);

const TemplateShowcaseScene: React.FC = () => (
  <div className="relative mx-auto mt-10 w-full max-w-6xl">
    <div className="absolute left-12 top-12 h-40 w-40 rounded-full bg-orange-200/45 blur-3xl" />
    <div className="absolute right-12 top-10 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />

    <motion.figure
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className="relative z-10"
    >
        <img
          src={templateImage}
          srcSet={`${templateImage960} 960w, ${templateImage} 1536w`}
          sizes="(min-width: 1280px) 1152px, calc(100vw - 3rem)"
          width={1536}
          height={1024}
          loading="lazy"
        decoding="async"
        alt="Muestra de plantillas para XV años, bodas, eventos corporativos, baby shower y graduación"
        className="h-auto w-full object-contain drop-shadow-[0_30px_90px_rgba(15,23,42,0.22)]"
      />
    </motion.figure>

    <p className="mt-5 text-center text-sm font-semibold text-slate-500">
      Imagen de ejemplo, no representa el resultado final.
    </p>
  </div>
);

const QrFeatureScene: React.FC = () => (
  <>
    <style>{`
      @keyframes qr-scan-beam {
        0% { transform: translateY(-18%); opacity: 0; }
        14% { opacity: 1; }
        70% { opacity: 0.92; }
        100% { transform: translateY(118%); opacity: 0; }
      }

      @keyframes qr-holo-pulse {
        0%, 100% { opacity: 0.28; box-shadow: 0 0 0 rgba(168, 85, 247, 0); }
        50% { opacity: 0.85; box-shadow: 0 0 32px rgba(168, 85, 247, 0.38); }
      }
    `}</style>

    <div className="relative mx-auto w-full max-w-[560px]" style={{ perspective: '1800px' }}>
      <div className="absolute left-4 top-10 h-40 w-40 rounded-full bg-violet-200/60 blur-3xl" />
      <div className="absolute right-4 top-24 h-44 w-44 rounded-full bg-fuchsia-200/45 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, x: -22, y: 18, rotate: -3 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: -3 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="absolute -left-8 top-8 bottom-6 right-12 z-0 rounded-[42px] border border-violet-200/70 bg-[linear-gradient(135deg,rgba(221,214,254,0.95)_0%,rgba(192,132,252,0.88)_100%)] shadow-[0_28px_70px_rgba(139,92,246,0.20)]"
      />

      <motion.figure
        initial={{ opacity: 0, y: 24, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        whileHover={{ rotateX: 8, rotateY: -12, y: -10, scale: 1.02 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="group/qr relative z-10 mx-auto w-fit overflow-visible rounded-[42px] border border-white/60 bg-white/30 p-3 shadow-[0_34px_90px_rgba(15,23,42,0.18)] backdrop-blur-sm"
      >
        <div className="relative">
          <img
            src={qrImage}
            width={1086}
            height={1448}
            loading="lazy"
            decoding="async"
            alt="Escaneo QR de invitados desde el celular con datos de acceso y mesa"
            className="block h-auto w-full max-w-[420px] rounded-[30px] object-cover"
          />

        <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-[39.9%] top-[20.2%] h-[35.4%] w-[25.8%] opacity-0 transition-all duration-300 group-hover/qr:opacity-100"
              style={{ animation: 'qr-holo-pulse 2.1s ease-in-out infinite' }}
            >
              <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_center,rgba(216,180,254,0.12)_0%,rgba(255,255,255,0)_72%)]" />
              <div className="absolute left-0 top-0 h-9 w-9 rounded-tl-[24px] border-l-2 border-t-2 border-violet-100/85" />
              <div className="absolute right-0 top-0 h-9 w-9 rounded-tr-[24px] border-r-2 border-t-2 border-violet-100/85" />
              <div className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-[24px] border-b-2 border-l-2 border-violet-100/85" />
              <div className="absolute bottom-0 right-0 h-9 w-9 rounded-br-[24px] border-b-2 border-r-2 border-violet-100/85" />
            </div>

            <div className="absolute left-[47%] top-[35.8%] h-[8.5%] w-[11.1%] rounded-[12px] border border-violet-100/80 opacity-0 transition-all duration-300 group-hover/qr:opacity-100" />

            <div className="absolute left-[45.6%] top-[32.8%] h-[15.8%] w-[14.8%] overflow-hidden rounded-[16px] opacity-0 transition-opacity duration-300 group-hover/qr:opacity-100">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(216,180,254,0.9)_46%,rgba(255,255,255,0)_100%)]" style={{ animation: 'qr-scan-beam 1.7s linear infinite' }} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,180,254,0.18)_0%,rgba(255,255,255,0)_72%)]" />
            </div>

            <div
              className="absolute left-[39.8%] top-[9.8%] rounded-2xl border border-violet-200/60 bg-[linear-gradient(135deg,rgba(245,243,255,0.96)_0%,rgba(233,213,255,0.78)_100%)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-violet-700 opacity-0 shadow-[0_18px_44px_rgba(139,92,246,0.18)] transition-all duration-300 group-hover/qr:translate-y-0 group-hover/qr:opacity-100 translate-y-4"
              style={{ transform: 'translateZ(48px)' }}
            >
              Escáner QR
              <p className="mt-2 text-[11px] font-semibold normal-case tracking-normal text-violet-900/80">
                Acceso, mesa e invitados.
              </p>
            </div>
          </div>
        </div>
      </motion.figure>
    </div>
  </>
);

const PricePlaceholderScene: React.FC = () => (
  <div className="relative mx-auto h-[240px] w-full max-w-[360px]">
    <motion.div
      initial={{ opacity: 0, x: -16, y: 14, rotate: -4 }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: -4 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55 }}
      className="absolute bottom-0 left-0 h-[150px] w-[58%]"
    >
      <PlaceholderShell type="card" className="h-full w-full" />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 12, y: -12, rotate: 4 }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 4 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      className="absolute right-0 top-0 h-[140px] w-[48%]"
    >
      <PlaceholderShell type="card" className="h-full w-full" />
    </motion.div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onStartDesign }) => {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2e8_0%,#fffaf5_38%,#f8fafc_100%)] text-slate-950">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l8.25 5.25a1.5 1.5 0 001.5 0L21 8m-16.5 11h15A1.5 1.5 0 0021 17.5v-11A1.5 1.5 0 0019.5 5h-15A1.5 1.5 0 003 6.5v11A1.5 1.5 0 004.5 19z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">LABORATORIO</p>
              <h1 className="text-sm font-black uppercase tracking-[0.12em] text-slate-950">DE INVITACIONES</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#como-funciona" className="transition hover:text-slate-950">Funciones</a>
            <a href="#precio" className="transition hover:text-slate-950">Precio</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onStartDesign}
              className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 sm:px-5 sm:text-sm"
            >
              Empieza a diseñar!
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

        <main>
          <section className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.28em] text-orange-700">
              Invitaciones digitales desde 599 MXN
            </span>
            <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-[-0.06em] text-slate-950 md:text-7xl">
              La invitación digital de tu evento, lista para compartir.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Diseña una invitación elegante, clara y moderna con todo lo importante en un solo lugar, como fecha, ubicación, cuenta regresiva, música, confirmación y mucho más.
            </p>
          </div>

          <HeroPlaceholderScene />
        </section>

          <section className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8" style={deferredSectionStyle}>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600">Plantillas para cada ocasión</p>
            <h3 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">
              Tenemos gran variedad de herramientas y diseños para todo tipo de ocasión.
            </h3>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Desde celebraciones familiares hasta eventos formales, puedes partir de diferentes estilos visuales y aprovechar herramientas listas para personalizar cada detalle dentro de la misma plataforma.
            </p>
          </div>

          <TemplateShowcaseScene />
        </section>

          <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-16 lg:px-8" style={deferredSectionStyle}>
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600">Lo que puedes hacer</p>
              <h3 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
                Una sola plataforma para construir, ajustar y publicar tu invitación.
              </h3>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Antes del recorrido guiado, aquí tienes una vista clara de lo que el panel resuelve por ti dentro del editor.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {capabilities.map((item) => (
              <article key={item.title} className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-700">{item.tag}</p>
                <h4 className="mt-4 text-xl font-black text-slate-950">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.details.map((detail) => (
                    <span
                      key={detail}
                      className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

          <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8" style={deferredSectionStyle}>
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600">Control con QR</p>
              <h3 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
                Sin nada instalado, en la misma plataforma podrás escanear los QR y ver información precisa al instante.
              </h3>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Desde el mismo panel podrás acceder a todo esto: escanear invitados, validar su acceso y consultar datos claros como número de invitados, mesa asignada, grupo, confirmación y otros detalles útiles para el control del evento.
              </p>

              <div className="mt-8 grid gap-3">
                {qrDetails.map((detail) => (
                  <div key={detail} className="flex items-center gap-3 rounded-[22px] border border-black/5 bg-white px-4 py-4 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[11px] font-black uppercase tracking-[0.16em] text-orange-700">
                      QR
                    </span>
                    <p className="text-sm font-semibold leading-7 text-slate-700">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <QrFeatureScene />
          </div>
        </section>

          <section id="precio" className="mx-auto max-w-6xl px-6 py-16 lg:px-8" style={deferredSectionStyle}>
          <div className="rounded-[40px] border border-orange-200 bg-[linear-gradient(135deg,#fff8f2_0%,#ffffff_48%,#eef6ff_100%)] p-8 shadow-[0_25px_80px_rgba(199,106,61,0.10)] lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600">Precio único</p>
                <h3 className="mt-3 text-5xl font-black tracking-[-0.06em] text-slate-950">$599 pesos</h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Obtienes una plataforma lista para construir tu invitación, personalizarla a tu estilo y conservar tu proyecto para seguir editando cuando lo necesites.
                </p>
                <div className="mt-6 grid gap-3">
                  {priceDetails.map((detail) => (
                    <div key={detail} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                      <p className="text-sm font-semibold text-slate-700">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <PricePlaceholderScene />
            </div>
          </div>
        </section>

          <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8" style={deferredSectionStyle}>
          <div className="rounded-[34px] border border-black/5 bg-white/85 px-6 py-5 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Eventos que se ven bien desde el primer clic</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Ideal para quienes quieren una invitación digital elegante, funcional y fácil de compartir.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {PACKAGES.map((pkg) => (
                  <div key={pkg.id} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                    {pkg.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </MotionConfig>
  );
};
