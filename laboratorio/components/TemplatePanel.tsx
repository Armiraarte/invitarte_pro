import React, { useMemo } from 'react';
import { PACKAGES, TEMPLATE_PRESETS } from '../constants';

interface TemplatePanelProps {
  onUseTemplate: (templateId: string) => void;
}

const CATEGORY_ORDER = ['XV ANOS', 'BODAS', 'BABY SHOWER', 'CUMPLEANOS', 'SOCIAL', 'CORPORATIVO'];

const CATEGORY_COPY: Record<string, string> = {
  'XV ANOS': 'Catálogo de invitaciones para quinceañeras con enfoque visual y portada protagonista.',
  BODAS: 'Bases más elegantes para ceremonias, recepciones y eventos con detalle formal.',
  'BABY SHOWER': 'Diseños suaves y familiares para eventos más pequeños e íntimos.',
  CUMPLEANOS: 'Plantillas dinámicas con energía alta y flujo rápido para compartir.',
  SOCIAL: 'Opciones flexibles para cenas, pedidas, reuniones y celebraciones personales.',
  CORPORATIVO: 'Invitaciones limpias y directas para marcas, lanzamientos y networking.',
};

const PREVIEW_TAGS: Record<string, string[]> = {
  'wedding-editorial': ['Hero', 'RSVP', 'Mapa'],
  'wedding-night': ['Ceremonia', 'Galeria', 'RSVP'],
  'xv-festiva': ['Música', 'Cuenta atrás', 'Galería'],
  'xv-luxe': ['Portada', 'Dress code', 'RSVP'],
  'xv-bloom': ['Fotos', 'Mesa', 'Ubicación'],
  'baby-soft': ['Hero', 'Regalos', 'Mapa'],
  'birthday-bold': ['Agenda', 'RSVP', 'Countdown'],
  'intimate-minimal': ['Lugar', 'Mensaje', 'Confirmacion'],
  'corporate-clean': ['Agenda', 'Venue', 'Registro'],
};

const PREVIEW_TITLES: Record<string, { eyebrow: string; heading: string; subheading: string }> = {
  'wedding-editorial': { eyebrow: 'Save the date', heading: 'Camila & Diego', subheading: '24 OCT 2026' },
  'wedding-night': { eyebrow: 'Evening ceremony', heading: 'Boda nocturna', subheading: 'Formal invitation' },
  'xv-festiva': { eyebrow: 'XV party', heading: 'Valeria', subheading: 'Una noche para brillar' },
  'xv-luxe': { eyebrow: 'XV premium', heading: 'Regina', subheading: 'Brillo y gala' },
  'xv-bloom': { eyebrow: 'XV bloom', heading: 'Sofía XV', subheading: 'Flores y color' },
  'baby-soft': { eyebrow: 'Baby shower', heading: 'Sofía', subheading: 'Estamos esperándote' },
  'birthday-bold': { eyebrow: 'Birthday mood', heading: 'Mateo 30', subheading: 'Party all night' },
  'intimate-minimal': { eyebrow: 'Special night', heading: 'Cena privada', subheading: '11 DIC 2026' },
  'corporate-clean': { eyebrow: 'Business event', heading: 'Brand launch', subheading: 'Executive session' },
};

const getPreviewGradient = (accent: string, fallback: string) => (
  `linear-gradient(160deg, ${accent} 0%, ${fallback} 54%, #ffffff 100%)`
);

export const TemplatePanel: React.FC<TemplatePanelProps> = ({ onUseTemplate }) => {
  const groupedTemplates = useMemo(() => {
    return CATEGORY_ORDER
      .map((category) => ({
        category,
        items: TEMPLATE_PRESETS.filter((template) => template.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">Plantillas visuales</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
            Menos texto, más imagen y tarjetas compactas para no perderse.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Cada categoría agrupa invitaciones listas para usar. Abre una plantilla y te manda directo al editor.
        </p>
      </div>

      {groupedTemplates.map(({ category, items }) => (
        <section key={category} className="space-y-5" style={{ contentVisibility: 'auto', contain: 'layout paint style' }}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600">{category}</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                {items.length} plantilla{items.length === 1 ? '' : 's'} listas
              </h3>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">{CATEGORY_COPY[category]}</p>
          </div>

          <div className="scrollbar-hide flex snap-x gap-5 overflow-x-auto pb-2">
            {items.map((template) => {
              const visualStyle = PACKAGES.find((pkg) => pkg.id === template.packageId);
              const previewCopy = PREVIEW_TITLES[template.id] || {
                eyebrow: template.category,
                heading: template.name,
                subheading: visualStyle?.name || 'Invitación digital',
              };
              const tags = PREVIEW_TAGS[template.id] || ['Hero', 'Mapa', 'RSVP'];
              const accent = template.accent;
              const fallback = visualStyle?.secondaryColor || '#f8fafc';

              return (
                <article
                  key={template.id}
                  className="w-[292px] shrink-0 snap-start overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                  style={{ contentVisibility: 'auto', contain: 'layout paint style' }}
                >
                  <div className="relative overflow-hidden p-4">
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{ background: getPreviewGradient(accent, fallback) }}
                    />
                    <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/18" />
                    <div className="absolute -right-8 bottom-6 h-28 w-28 rounded-full bg-slate-950/8" />

                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                          {template.category}
                        </span>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
                          {template.eventScale}
                        </span>
                      </div>

                      <div className="mx-auto w-[78%] rounded-[30px] border border-white/40 bg-white/90 p-3 shadow-[0_24px_50px_rgba(15,23,42,0.18)]">
                        <div
                          className="rounded-[22px] p-4 text-white"
                          style={{ background: `linear-gradient(180deg, ${accent} 0%, #0f172a 140%)` }}
                        >
                          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/70">
                            {previewCopy.eyebrow}
                          </p>
                          <h4 className="mt-3 text-[24px] font-black leading-none">{previewCopy.heading}</h4>
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                            {previewCopy.subheading}
                          </p>
                          <div className="mt-5 h-28 rounded-[18px] border border-white/10 bg-white/12" />
                        </div>

                        <div className="mt-3 grid gap-2">
                          <div className="h-3 rounded-full bg-slate-200" />
                          <div className="h-3 w-4/5 rounded-full bg-slate-200/80" />
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div className="h-12 rounded-[14px]" style={{ backgroundColor: `${accent}20` }} />
                            <div className="h-12 rounded-[14px] bg-slate-100" />
                            <div className="h-12 rounded-[14px] bg-slate-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 pb-4 pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black tracking-[-0.03em] text-slate-950">{template.name}</h3>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                          {visualStyle?.name || 'Base visual'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onUseTemplate(template.id)}
                      className="w-full rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:bg-slate-800"
                    >
                      Usar plantilla
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
