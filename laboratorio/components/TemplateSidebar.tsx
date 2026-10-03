import React, { useDeferredValue, useMemo, useState } from 'react';
import { PACKAGES, TEMPLATE_PRESETS } from '../constants';

interface TemplateSidebarProps {
  onClose: () => void;
  onUseTemplate: (templateId: string) => void;
}

const CATEGORY_ORDER = ['XV ANOS', 'BODAS', 'BABY SHOWER', 'CUMPLEANOS', 'SOCIAL', 'CORPORATIVO'];

const CATEGORY_LABELS: Record<string, string> = {
  'XV ANOS': 'XV anos',
  BODAS: 'Bodas',
  'BABY SHOWER': 'Baby shower',
  CUMPLEANOS: 'Cumpleanos',
  SOCIAL: 'Social',
  CORPORATIVO: 'Corporativo',
};

const TEMPLATE_LABELS: Record<string, string> = {
  'wedding-editorial': 'Boda editorial',
  'wedding-night': 'Boda nocturna',
  'xv-festiva': 'XV festiva',
  'xv-luxe': 'XV luxe',
  'xv-bloom': 'XV bloom',
  'baby-soft': 'Baby shower aura',
  'birthday-bold': 'Cumpleanos bold',
  'corporate-clean': 'Evento corporativo clean',
  'intimate-minimal': 'Reunion intima minimal',
};

const normalizeValue = (value: string) => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

const getScaleLabel = (value: string) => {
  if (value.toLowerCase().includes('gran')) return 'Grande';
  if (value.toLowerCase().includes('peq')) return 'Pequeno';
  return 'Mediano';
};

const getPreviewGradient = (accent: string, fallback: string) => (
  `linear-gradient(160deg, ${accent} 0%, ${fallback} 58%, #ffffff 100%)`
);

export const TemplateSidebar: React.FC<TemplateSidebarProps> = ({ onClose, onUseTemplate }) => {
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const groupedTemplates = useMemo(() => {
    const normalizedQuery = normalizeValue(deferredSearchValue.trim());

    return CATEGORY_ORDER
      .map((category) => ({
        category,
        items: TEMPLATE_PRESETS.filter((template) => {
          if (template.category !== category) {
            return false;
          }

          if (!normalizedQuery) {
            return true;
          }

          const visualStyle = PACKAGES.find((pkg) => pkg.id === template.packageId);
          const searchableContent = [
            template.name,
            TEMPLATE_LABELS[template.id] || '',
            template.description,
            template.audience,
            template.category,
            CATEGORY_LABELS[template.category] || '',
            template.eventScale,
            visualStyle?.name || '',
          ].join(' ');

          return normalizeValue(searchableContent).includes(normalizedQuery);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [deferredSearchValue]);

  const totalMatches = groupedTemplates.reduce((total, group) => total + group.items.length, 0);
  const hasSearch = searchValue.trim().length > 0;

  return (
    <aside className="flex h-full w-[270px] shrink-0 flex-col border-r border-black/5 bg-white lg:w-[300px] xl:w-[330px]">
      <div className="border-b border-black/5 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600">Sidebar anidado</p>
            <h2 className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-slate-950">Plantillas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
            aria-label="Cerrar plantillas"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <label className="relative mt-4 block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por evento, estilo o tamano"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:text-slate-950"
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearchValue('')}
              className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Limpiar busqueda"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </label>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {hasSearch ? `${totalMatches} resultado${totalMatches === 1 ? '' : 's'}` : `${TEMPLATE_PRESETS.length} plantillas`}
          </p>
          {hasSearch && (
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
              Filtro activo
            </p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 custom-scrollbar">
        {totalMatches === 0 && (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Sin resultados</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Prueba con boda, XV, baby shower, social o corporativo.
            </p>
          </div>
        )}

        {groupedTemplates.map(({ category, items }) => (
          <section key={category} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {CATEGORY_LABELS[category] || category}
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((template) => {
                const visualStyle = PACKAGES.find((pkg) => pkg.id === template.packageId);
                const previewTitle = TEMPLATE_LABELS[template.id] || template.name;
                const categoryLabel = CATEGORY_LABELS[template.category] || template.category;
                const fallback = visualStyle?.secondaryColor || '#f8fafc';

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onUseTemplate(template.id)}
                    className="w-full rounded-[24px] border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-[88px] shrink-0 rounded-[22px] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                        style={{ background: getPreviewGradient(template.accent, fallback) }}
                      >
                        <div className="rounded-[16px] border border-white/45 bg-white/88 p-2">
                          <div
                            className="rounded-[12px] px-2 py-2 text-white"
                            style={{ background: `linear-gradient(180deg, ${template.accent} 0%, #0f172a 140%)` }}
                          >
                            <p className="truncate text-[6px] font-black uppercase tracking-[0.18em] text-white/70">
                              {categoryLabel}
                            </p>
                            <p className="mt-1 truncate text-[10px] font-black leading-none">
                              {previewTitle}
                            </p>
                          </div>

                          <div className="mt-2 space-y-1">
                            <div className="h-1.5 rounded-full bg-slate-200" />
                            <div className="h-1.5 w-4/5 rounded-full bg-slate-200/80" />
                            <div className="grid grid-cols-2 gap-1 pt-0.5">
                              <div className="h-5 rounded-[8px]" style={{ backgroundColor: `${template.accent}20` }} />
                              <div className="h-5 rounded-[8px] bg-slate-100" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-black uppercase tracking-[0.08em] text-slate-950">
                              {previewTitle}
                            </p>
                            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                              {visualStyle?.name || 'Base visual'}
                            </p>
                          </div>
                          <span
                            className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: template.accent }}
                          />
                        </div>

                        <p className="mt-2 text-[11px] leading-5 text-slate-600">
                          {template.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                            {getScaleLabel(template.eventScale)}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                            {categoryLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
};
