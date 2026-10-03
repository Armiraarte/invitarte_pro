import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m as motion } from 'motion/react';
import { InviteScreen, PhoneShell } from './partyDesign';
import { categoryLabel, INVITATION_TEMPLATES, TEMPLATE_CATEGORIES, type InvitationTemplate, type TemplateCategory } from './templatesData';
import type { MotionVariants } from './shared';

type TemplatesCatalogProps = {
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  staggerGroup: MotionVariants;
  onUseTemplate: (templateId: string) => void;
};

const INCLUDED_SECTIONS = ['Portada y cuenta regresiva', 'Ubicación con mapa', 'Confirmación de asistencia', 'Galería de fotos', 'Música de fondo', 'Acceso con QR por invitado'];

/* Tarjeta con inclinacion 3D y reflejo que sigue al cursor (solo con mouse; en pantallas tactiles queda fija) */
const TemplateCard: React.FC<{
  template: InvitationTemplate;
  onPreview: () => void;
  onUse: () => void;
}> = ({ template, onPreview, onUse }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);
  const accent = template.design.accent;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 10}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 12}deg`);
      card.style.setProperty('--glare-x', `${x * 100}%`);
      card.style.setProperty('--glare-y', `${y * 100}%`);
      card.style.setProperty('--glare-o', '1');
    });
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(frame.current);
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glare-o', '0');
  };

  return (
    <div className="[perspective:1200px]">
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="template-card group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0c0c11] p-4 transition-[transform,border-color] duration-300 ease-out hover:border-white/20"
        style={{ backgroundImage: `radial-gradient(circle at 50% 18%, ${accent}33 0%, transparent 62%)` }}
      >
        {template.badge ? (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-950">{template.badge}</span>
        ) : null}

        <button type="button" onClick={onPreview} className="relative block w-full pt-6" aria-label={`Ver plantilla ${template.name}`}>
          <PhoneShell className="mx-auto w-[62%] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]">
            <InviteScreen invite={template.design} />
          </PhoneShell>
        </button>

        <div className="relative mt-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              {categoryLabel(template.category)}
            </p>
            <h3 className="mt-1 truncate text-[1.25rem] font-semibold text-white">{template.name}</h3>
          </div>
          <div className="mt-1 flex -space-x-1.5">
            {template.palette.map((color) => (
              <span key={color} className="h-5 w-5 rounded-full border-2 border-[#0c0c11]" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-full border border-white/12 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/[0.07]"
          >
            Vista previa
          </button>
          <button type="button" onClick={onUse} className="rounded-full bg-white py-2.5 text-[14px] font-semibold text-zinc-950 transition hover:bg-white/85">
            Usar
          </button>
        </div>

        {/* Reflejo */}
        <span
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: 'var(--glare-o, 0)',
            background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.14) 0%, transparent 45%)'
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

/* Vista previa ampliada */
const TemplatePreview: React.FC<{ template: InvitationTemplate; onClose: () => void; onUse: () => void }> = ({ template, onClose, onUse }) => {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const accent = template.design.accent;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/85 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Plantilla ${template.name}`}
    >
      <motion.div
        className="relative grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-[32px] border border-white/10 bg-[#0b0b10] sm:rounded-[32px] md:grid-cols-[0.9fr_1.1fr]"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center p-8" style={{ background: `radial-gradient(circle at 50% 40%, ${accent}40 0%, transparent 70%)` }}>
          <motion.div initial={{ rotate: -4, y: 10 }} animate={{ rotate: 0, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-[14rem] sm:w-[16rem]">
            <PhoneShell>
              <InviteScreen invite={template.design} />
            </PhoneShell>
          </motion.div>
        </div>

        <div className="flex flex-col p-7 sm:p-9">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white"
            aria-label="Cerrar vista previa"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
            {categoryLabel(template.category)}
          </p>
          <h3 className="mt-2 text-[2.2rem] font-semibold leading-none tracking-[-0.03em] text-white">{template.name}</h3>
          <p className="mt-3 text-[1rem] leading-7 text-zinc-400">{template.description}</p>

          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Paleta</p>
          <div className="mt-2 flex gap-2">
            {template.palette.map((color) => (
              <span key={color} className="h-8 w-8 rounded-full border border-white/15" style={{ backgroundColor: color }} />
            ))}
          </div>

          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Incluye</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {INCLUDED_SECTIONS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-2 sm:mt-auto sm:pt-8">
            <button type="button" onClick={onUse} className="rounded-full bg-white py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-white/85">
              Usar esta plantilla · $389
            </button>
            <p className="text-center text-xs text-zinc-500">Textos, colores y fotos se personalizan con tus datos.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const TemplatesCatalog: React.FC<TemplatesCatalogProps> = ({ displayFont, fadeInUp, staggerGroup, onUseTemplate }) => {
  const [category, setCategory] = useState<TemplateCategory | 'todas'>('todas');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const visible = useMemo(
    () => (category === 'todas' ? INVITATION_TEMPLATES : INVITATION_TEMPLATES.filter((template) => template.category === category)),
    [category]
  );
  const previewTemplate = INVITATION_TEMPLATES.find((template) => template.id === previewId) ?? null;

  return (
    <section id="plantillas" className="cv-auto scroll-mt-24 w-full py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerGroup}
        className="mx-auto w-full max-w-[120rem] px-4 sm:px-6 lg:px-16 2xl:px-24"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <motion.div variants={fadeInUp}>
            <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">Plantillas</p>
            <h2 className="mt-4 max-w-[16ch] text-[2.5rem] leading-[0.98] tracking-[-0.045em] text-white sm:text-[3.4rem] lg:text-[4rem]" style={displayFont}>
              Tú eliges el diseño. <span className="brand-gradient-text">Nosotros, el control.</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
            {[`${INVITATION_TEMPLATES.length} diseños`, 'Personalizables', 'Incluidas en los $389'].map((chip) => (
              <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                {chip}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={fadeInUp}
          className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Categorías de plantillas"
        >
          {TEMPLATE_CATEGORIES.map((item) => {
            const isActive = item.id === category;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCategory(item.id)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[14px] font-medium transition ${
                  isActive ? 'bg-white text-zinc-950' : 'border border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </motion.div>

        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((template) => (
              <motion.div
                key={template.id}
                className="w-[78vw] max-w-[20rem] shrink-0 snap-center sm:w-auto sm:max-w-none"
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <TemplateCard template={template} onPreview={() => setPreviewId(template.id)} onUse={() => onUseTemplate(template.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {createPortal(
      <AnimatePresence>
        {previewTemplate ? (
          <TemplatePreview
            key={previewTemplate.id}
            template={previewTemplate}
            onClose={() => setPreviewId(null)}
            onUse={() => {
              setPreviewId(null);
              onUseTemplate(previewTemplate.id);
            }}
          />
        ) : null}
      </AnimatePresence>,
        document.body
      )}
    </section>
  );
};
