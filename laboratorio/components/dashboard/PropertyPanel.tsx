import React from 'react';
import { CountdownDisplay } from '../CountdownDisplay';
import {
  ContainerStyle,
  RepeatableSectionElementKind,
  Section,
  SectionAnimationType,
  SectionElement,
  SectionHeight,
  SectionPositionKey,
  TextAlignment
} from '../../types';
import {
  addSectionElement,
  getSectionContainerStyle,
  getSectionElementAnimation,
  getSectionElementById,
  getSectionElementCount,
  getSectionElementLayer,
  getSectionElements,
  getSectionImageStyle,
  getSectionTextStyle,
  removeSectionElement,
  syncSectionElements,
  updateSectionElement,
} from './sectionElements';
import {
  getCountdownParts,
  getDefaultCountdownTargetValue,
  getGoogleMapsEmbedUrl,
  getRevealButtonLabel,
} from './sectionInteractive';
import {
  ITINERARY_ICON_OPTIONS,
  ItineraryTimeline,
  createItineraryItem,
  getDefaultItineraryItems,
  getItineraryStyle,
  renderItineraryIcon,
} from './itinerary';
import { ImageOptimizationTarget, optimizeUploadedImage } from './imageOptimization';

type ActiveTextElement =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'image'
  | 'contentImage'
  | 'container'
  | 'backgroundImage'
  | 'countdown'
  | 'timeline'
  | 'guests'
  | 'location'
  | 'music'
  | null;
type PanelPane = 'section' | 'layers' | 'tools';
type ToolPanel = 'controls' | 'preview' | 'guides' | 'addSection' | 'globalBackground' | 'section' | 'text' | 'image' | 'container' | 'layers' | 'audio' | 'animation' | 'timeline' | 'countdown' | 'location';
type CollapsibleToolSectionKey = 'controls' | 'preview' | 'guides' | 'addSection' | 'globalBackground' | 'sectionConfig' | 'text' | 'image' | 'container' | 'layers' | 'audio' | 'animation' | 'timeline' | 'countdown' | 'location';
type ImagePanelTarget = 'image' | 'contentImage';
type PreviewSurfaceMode = 'editor' | 'live';
type IconConfig = {
  label: string;
  icon: React.ReactNode;
};

interface PropertyPanelProps {
  section?: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete?: () => void;
  onMove?: (direction: 'up' | 'down') => void;
  onAddSection?: (height: SectionHeight) => void;
  onRefreshPreview?: () => void;
  activeTextElement?: ActiveTextElement;
  selectedElementId?: string | null;
  onSelectElement?: (element: ActiveTextElement, elementId?: string | null) => void;
  globalBg?: { type: 'color' | 'image'; value: string };
  onUpdateGlobalBg?: (bg: { type: 'color' | 'image'; value: string }) => void;
  showGuides?: boolean;
  onToggleGuides?: (show: boolean) => void;
  viewMode?: 'mobile' | 'tablet' | 'desktop';
  onToggleViewMode?: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  hasLivePreview?: boolean;
  previewSurfaceMode?: PreviewSurfaceMode;
  onTogglePreviewSurfaceMode?: (mode: PreviewSurfaceMode) => void;
  focusMode?: boolean;
}

const sectionHeights: { value: SectionHeight; label: string }[] = [
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
];

const alignments: { value: TextAlignment; icon: string }[] = [
  { value: 'left', icon: 'IZQ' },
  { value: 'center', icon: 'CENT' },
  { value: 'right', icon: 'DER' },
];

const animationOptions: { value: SectionAnimationType; label: string }[] = [
  { value: 'none', label: 'Sin animacion' },
  { value: 'fade', label: 'Aparecer' },
  { value: 'slide-up', label: 'Subir' },
  { value: 'slide-down', label: 'Bajar' },
  { value: 'slide-left', label: 'Izquierda' },
  { value: 'slide-right', label: 'Derecha' },
  { value: 'zoom', label: 'Zoom' },
];

const iconClass = 'w-[17px] h-[17px]';

const panelIcons: Record<ToolPanel, IconConfig> = {
  controls: {
    label: 'Controles',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="1.8" d="M6 7h12M6 12h12M6 17h12" />
        <circle cx="9" cy="7" r="2" strokeWidth="1.8" />
        <circle cx="15" cy="12" r="2" strokeWidth="1.8" />
        <circle cx="11" cy="17" r="2" strokeWidth="1.8" />
      </svg>
    ),
  },
  preview: {
    label: 'Preview real',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.8" strokeWidth="1.8" />
      </svg>
    ),
  },
  guides: {
    label: 'Mover',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="1.8" d="M8 4v16M16 4v16M4 8h16M4 16h16" />
      </svg>
    ),
  },
  addSection: {
    label: 'Seccion',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="1.8" d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  globalBackground: {
    label: 'Fondo',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 14a5 5 0 1 1 10 0c0 3-2.2 5-5 5s-5-2-5-5Z" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M12 5v4" />
      </svg>
    ),
  },
  section: {
    label: 'Seccion',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M8 9h8M8 12h8M8 15h5" />
      </svg>
    ),
  },
  text: {
    label: 'Texto',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 6h14M12 6v12M8 18h8" />
      </svg>
    ),
  },
  image: {
    label: 'Imagen',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 15l3.2-3.2L13 14.5l2.3-2.3L18 15" />
        <circle cx="9" cy="9" r="1.2" strokeWidth="1.8" />
      </svg>
    ),
  },
  container: {
    label: 'Contenedor',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="6" width="16" height="12" rx="3" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M8 10h8M8 14h5" />
      </svg>
    ),
  },
  layers: {
    label: 'Capas',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 5 4 9l8 4 8-4-8-4Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 13l8 4 8-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 17l8 4 8-4" />
      </svg>
    ),
  },
  animation: {
    label: 'Animaciones',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 12h9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8l4 4-4 4" />
        <circle cx="7" cy="12" r="2" strokeWidth="1.8" />
      </svg>
    ),
  },
  timeline: {
    label: 'Itinerario',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="1.8" d="M5 12h14" />
        <circle cx="8" cy="12" r="2" strokeWidth="1.8" />
        <circle cx="16" cy="12" r="2" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M12 7v10" />
      </svg>
    ),
  },
  countdown: {
    label: 'Countdown',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="13" r="7" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v4l2 2M9 4h6" />
      </svg>
    ),
  },
  location: {
    label: 'Ubicacion',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 21s6-3.8 6-9.5a6 6 0 1 0-12 0C6 17.2 12 21 12 21Z" />
        <circle cx="12" cy="11" r="2.2" strokeWidth="1.8" />
      </svg>
    ),
  },
  audio: {
    label: 'Audio',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 18a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm8-2a2 2 0 1 1-2-2 2 2 0 0 1 2 2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 18V7l8-2v11" />
      </svg>
    ),
  },
};

const panelFieldLabelClass = 'mb-1 block text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-500';
const panelChipButtonClass = 'rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(79,70,229,0.14)] active:translate-y-0';
const panelNumericChipClass = 'h-10 rounded-2xl border border-transparent text-[11px] font-semibold tabular-nums tracking-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_10px_24px_rgba(79,70,229,0.12)] active:translate-y-0';
const panelIconToggleClass = 'flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(79,70,229,0.14)] active:translate-y-0';

const typeLabels: Record<Section['type'], string> = {
  HERO: 'Hero',
  MESSAGE: 'Mensaje',
  DETAILS: 'Detalles',
  LOCATION: 'Ubicacion',
  FOOTER: 'Cierre',
  GUESTS: 'RSVP',
  COUNTDOWN: 'Cuenta regresiva',
  BLANK: 'Libre',
  IMAGE: 'Imagen',
  MUSIC: 'Musica',
  ITINERARY: 'Itinerario',
};

const repeatableElementLabels: Record<RepeatableSectionElementKind, string> = {
  title: 'titulo',
  subtitle: 'subtitulo',
  content: 'texto',
  image: 'imagen',
  contentImage: 'imagen secundaria',
  container: 'contenedor',
};

const getNextTextType = (currentType?: Section['type'], fallback: Section['type'] = 'HERO'): Section['type'] => {
  if (!currentType || currentType === 'BLANK') return fallback;
  if (currentType === 'IMAGE' || currentType === 'COUNTDOWN' || currentType === 'GUESTS' || currentType === 'MUSIC') {
    return currentType;
  }
  return currentType;
};

const ensurePositions = (section?: Section): NonNullable<Section['positions']> => ({
  title: section?.positions?.title ?? { x: 0, y: 0 },
  subtitle: section?.positions?.subtitle ?? { x: 0, y: 0 },
  content: section?.positions?.content ?? { x: 0, y: 0 },
  image: section?.positions?.image ?? section?.positions?.extra ?? { x: 0, y: 0 },
  extra: section?.positions?.extra ?? { x: 0, y: 0 },
  contentImage: section?.positions?.contentImage ?? { x: 0, y: 0 },
  countdown: section?.positions?.countdown ?? section?.positions?.extra ?? { x: 0, y: 0 },
  guests: section?.positions?.guests ?? section?.positions?.extra ?? { x: 0, y: 0 },
  music: section?.positions?.music ?? section?.positions?.extra ?? { x: 0, y: 0 },
});

const isValidColorValue = (value?: string) => !!value && (value === 'transparent' || value.startsWith('#'));
const resolveColorPickerValue = (value: string | undefined, fallback: string) => (
  typeof value === 'string' && value.startsWith('#') ? value : fallback
);

const readLocalImageAsDataUrl = (
  event: React.ChangeEvent<HTMLInputElement>,
  target: ImageOptimizationTarget,
  onSuccess: (dataUrl: string) => void
): void => {
  const file = event.target.files?.[0];
  event.target.value = '';

  if (!file || !file.type.startsWith('image/')) return;

  void optimizeUploadedImage(file, target).then((dataUrl) => {
    onSuccess(dataUrl);
  }).catch((error) => {
    console.error('No se pudo optimizar la imagen local.', error);
  });
};

interface GeneralToolsPanelProps {
  onAddSection?: (height: SectionHeight) => void;
  globalBg?: { type: 'color' | 'image'; value: string };
  onUpdateGlobalBg?: (bg: { type: 'color' | 'image'; value: string }) => void;
  showGuides?: boolean;
  onToggleGuides?: (show: boolean) => void;
  onActivateMoveMode?: () => void;
  viewMode?: 'mobile' | 'tablet' | 'desktop';
  onToggleViewMode?: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  compactMode?: boolean;
}

export const GeneralToolsPanel: React.FC<GeneralToolsPanelProps> = ({
  onAddSection,
  globalBg,
  onUpdateGlobalBg,
  showGuides = false,
  onToggleGuides,
  onActivateMoveMode,
  viewMode = 'mobile',
  onToggleViewMode,
  compactMode = false,
}) => {
  const [openMenu, setOpenMenu] = React.useState<'preview' | 'section' | 'background' | null>(null);
  const globalBgImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const safeGlobalColorValue = isValidColorValue(globalBg?.value) ? (globalBg.value as string) : '#ffffff';

  const handleGlobalBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    readLocalImageAsDataUrl(event, 'global-background', (dataUrl) => {
      onUpdateGlobalBg?.({ type: 'image', value: dataUrl });
    });
  };

  const toggleMenu = (menu: 'preview' | 'section' | 'background') => {
    setOpenMenu((current) => current === menu ? null : menu);
  };

  return (
    <section className={`border border-black/5 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${
      compactMode ? 'rounded-[20px] px-2.5 py-2' : 'rounded-[22px] px-3 py-2.5'
    }`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toggleMenu('preview')}
          className={`inline-flex items-center gap-2 rounded-full border px-3 font-black uppercase tracking-[0.18em] transition-colors ${
            compactMode ? 'h-8 text-[8px]' : 'h-9 text-[9px]'
          } ${
            openMenu === 'preview'
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4.5" y="6" width="15" height="11.5" rx="1.8" strokeWidth="1.8" />
            <path strokeLinecap="round" strokeWidth="1.8" d="M10 19.5h4" />
          </svg>
          Preview
        </button>

        <button
          type="button"
          onClick={() => {
            if (showGuides) {
              onToggleGuides?.(false);
              return;
            }

            if (onActivateMoveMode) {
              onActivateMoveMode();
              return;
            }

            onToggleGuides?.(true);
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-3 font-black uppercase tracking-[0.18em] transition-colors ${
            compactMode ? 'h-8 text-[8px]' : 'h-9 text-[9px]'
          } ${
            showGuides
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="1.8" d="M8 4v16M16 4v16M4 8h16M4 16h16" />
          </svg>
          Mover
        </button>

        <button
          type="button"
          onClick={() => toggleMenu('section')}
          className={`inline-flex items-center gap-2 rounded-full border px-3 font-black uppercase tracking-[0.18em] transition-colors ${
            compactMode ? 'h-8 text-[8px]' : 'h-9 text-[9px]'
          } ${
            openMenu === 'section'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="1.8" d="M12 5v14M5 12h14" />
          </svg>
          Seccion
        </button>

        <button
          type="button"
          onClick={() => toggleMenu('background')}
          className={`inline-flex items-center gap-2 rounded-full border px-3 font-black uppercase tracking-[0.18em] transition-colors ${
            compactMode ? 'h-8 text-[8px]' : 'h-9 text-[9px]'
          } ${
            openMenu === 'background'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 14a5 5 0 1 1 10 0c0 3-2.2 5-5 5s-5-2-5-5Z" />
            <path strokeLinecap="round" strokeWidth="1.8" d="M12 5v4" />
          </svg>
          Fondo
        </button>
      </div>

      {openMenu === 'preview' && (
        <div className="mt-2 rounded-2xl border border-gray-200 bg-slate-50/80 p-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Preview</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              {
                key: 'mobile' as const,
                label: 'Movil',
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="8" y="3.8" width="8" height="16.4" rx="1.8" strokeWidth="1.8" />
                    <path strokeLinecap="round" strokeWidth="1.8" d="M11 6h2" />
                  </svg>
                ),
              },
              {
                key: 'tablet' as const,
                label: 'Tablet',
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4.5" width="12" height="15" rx="1.8" strokeWidth="1.8" />
                  </svg>
                ),
              },
              {
                key: 'desktop' as const,
                label: 'PC',
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4.5" y="5.5" width="15" height="10.8" rx="1.8" strokeWidth="1.8" />
                    <path strokeLinecap="round" strokeWidth="1.8" d="M10 19h4M8 16.5h8" />
                  </svg>
                ),
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onToggleViewMode?.(item.key);
                }}
                className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                  viewMode === item.key
                    ? 'border-indigo-200 bg-indigo-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {openMenu === 'section' && (
        <div className="mt-2 rounded-2xl border border-gray-200 bg-slate-50/80 p-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Nueva seccion</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sectionHeights.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onAddSection?.(item.value);
                  setOpenMenu(null);
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-amber-200 bg-white px-3 text-[8px] font-black uppercase tracking-[0.16em] text-amber-700 transition-colors hover:bg-amber-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {openMenu === 'background' && (
        <div className="mt-2 rounded-2xl border border-gray-200 bg-slate-50/80 p-2">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => onUpdateGlobalBg?.({ type: 'color', value: safeGlobalColorValue })}
              className={`inline-flex h-8 items-center rounded-xl border px-3 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                globalBg?.type === 'color'
                  ? 'border-rose-200 bg-rose-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Color
            </button>
            <button
              type="button"
              onClick={() => onUpdateGlobalBg?.({ type: 'image', value: globalBg?.type === 'image' ? (globalBg.value || '') : '' })}
              className={`inline-flex h-8 items-center rounded-xl border px-3 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                globalBg?.type === 'image'
                  ? 'border-rose-200 bg-rose-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Imagen
            </button>

            {globalBg?.type === 'color' ? (
              <>
                <input
                  type="color"
                  value={safeGlobalColorValue.startsWith('#') ? safeGlobalColorValue : '#ffffff'}
                  onChange={(e) => onUpdateGlobalBg?.({ type: 'color', value: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => onUpdateGlobalBg?.({ type: 'color', value: 'transparent' })}
                  className={`inline-flex h-9 items-center rounded-xl border px-3 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                    safeGlobalColorValue === 'transparent'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Transparente
                </button>
              </>
            ) : (
              <>
                <input
                  ref={globalBgImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGlobalBgImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => globalBgImageInputRef.current?.click()}
                  className="inline-flex h-9 items-center rounded-xl border border-rose-200 bg-white px-3 text-[8px] font-black uppercase tracking-[0.16em] text-rose-700 transition-colors hover:bg-rose-50"
                >
                  Importar fondo general
                </button>
                {globalBg?.value && (
                  <button
                    type="button"
                    onClick={() => onUpdateGlobalBg?.({ type: 'image', value: '' })}
                    className="inline-flex h-9 items-center rounded-xl border border-gray-200 bg-white px-3 text-[8px] font-black uppercase tracking-[0.16em] text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Limpiar
                  </button>
                )}
                <p className="w-full text-[7px] uppercase tracking-[0.16em] text-gray-500">
                  Las imagenes locales se optimizan automaticamente para mantener la invitacion fluida.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const CollapsibleToolSection: React.FC<{
  eyebrow: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
}> = ({
  eyebrow,
  title,
  isOpen,
  onToggle,
  children,
  bodyClassName = 'space-y-3 border-t border-gray-200 bg-white p-3',
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 bg-white px-3 py-3 text-left transition-colors hover:bg-gray-50"
    >
      <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-900">{title}</h3>
      <svg
        className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {isOpen && <div className={bodyClassName}>{children}</div>}
  </section>
);

const ToolSidebarButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  included?: boolean;
  onClick: () => void;
}> = ({ label, icon, active = false, included = false, onClick }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
      active
        ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-[0_12px_26px_rgba(79,70,229,0.18)]'
        : included
          ? 'border-slate-300 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-[0_12px_24px_rgba(79,70,229,0.14)]'
          : 'border-gray-200 bg-white text-gray-500 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-[0_12px_24px_rgba(79,70,229,0.16)]'
    }`}
  >
    {icon}
    <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-white opacity-0 shadow-[0_10px_24px_rgba(15,23,42,0.24)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
      {label}
    </span>
  </button>
);

const ToolActionCard: React.FC<{
  label: string;
  detail: string;
  icon: React.ReactNode;
  active?: boolean;
  included?: boolean;
  onClick: () => void;
}> = ({ label, detail, icon, active = false, included = true, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 rounded-2xl border p-2.5 text-left transition-all ${
      active
        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_12px_26px_rgba(79,70,229,0.12)]'
        : included
          ? 'border-gray-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-[0_12px_24px_rgba(79,70,229,0.12)]'
          : 'border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-white'
    }`}
  >
    <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
      active
        ? 'bg-indigo-600 text-white'
        : included
          ? 'bg-slate-100 text-slate-700'
          : 'bg-white text-gray-400'
    }`}>
      {icon}
    </span>
    <span className="mt-2 block truncate text-[8px] font-black uppercase tracking-[0.14em]">{label}</span>
    <span className="mt-1 block text-[8px] leading-4 text-current/75">{detail}</span>
  </button>
);

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  section,
  onUpdate,
  onDelete,
  onMove,
  onAddSection,
  onRefreshPreview,
  activeTextElement,
  selectedElementId,
  onSelectElement,
  globalBg,
  onUpdateGlobalBg,
  showGuides,
  onToggleGuides,
  viewMode = 'mobile',
  onToggleViewMode,
  hasLivePreview = false,
  previewSurfaceMode = 'editor',
  onTogglePreviewSurfaceMode,
  focusMode = false,
}) => {
  const getPaneForToolPanel = React.useCallback((panel: ToolPanel): PanelPane => {
    if (panel === 'section') return 'section';
    if (panel === 'layers') return 'layers';
    return 'tools';
  }, []);

  const [toolPanel, setToolPanel] = React.useState<ToolPanel>('section');
  const [activePane, setActivePane] = React.useState<PanelPane>('section');
  const [imagePanelTarget, setImagePanelTarget] = React.useState<ImagePanelTarget>('image');
  const [openToolSections, setOpenToolSections] = React.useState<Record<CollapsibleToolSectionKey, boolean>>({
    controls: true,
    preview: true,
    guides: true,
    addSection: true,
    globalBackground: true,
    sectionConfig: true,
    text: true,
    image: true,
    container: true,
    layers: true,
    audio: true,
    animation: true,
    timeline: true,
    countdown: true,
    location: true,
  });
  const globalBgImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const sectionBgImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const sectionImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const contentImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const musicAudioInputRef = React.useRef<HTMLInputElement | null>(null);

  const safeGlobalColorValue = isValidColorValue(globalBg?.value) ? (globalBg?.value as string) : '#ffffff';
  const safeSectionColorValue = isValidColorValue(section?.bgValue) ? (section?.bgValue as string) : '#ffffff';
  const repeatableElements = React.useMemo(() => getSectionElements(section), [section]);
  const selectedRepeatableElement = React.useMemo(
    () => getSectionElementById(section, selectedElementId),
    [section, selectedElementId]
  );
  const selectedElementAnimation = React.useMemo(
    () => getSectionElementAnimation(selectedRepeatableElement),
    [selectedRepeatableElement]
  );
  const selectedAnimationType: SectionAnimationType = selectedElementAnimation.type || 'none';
  const selectedAnimationDuration = Math.max(0.2, Math.min(2, selectedElementAnimation.duration ?? 0.6));
  const selectedElementHasAnimation = !!selectedRepeatableElement && selectedAnimationType !== 'none';
  const selectedTextElement = selectedRepeatableElement && (
    selectedRepeatableElement.kind === 'title'
    || selectedRepeatableElement.kind === 'subtitle'
    || selectedRepeatableElement.kind === 'content'
  ) ? selectedRepeatableElement : null;
  const selectedTextStyle = React.useMemo(
    () => getSectionTextStyle(selectedTextElement),
    [selectedTextElement]
  );
  const countdownTitleElement = React.useMemo(
    () => getSectionElementById(section, 'cuenta-title'),
    [section]
  );
  const countdownPanelElement = React.useMemo(
    () => getSectionElementById(section, 'cuenta-panel'),
    [section]
  );
  const countdownTileElements = React.useMemo(
    () => repeatableElements.filter((element) => /^cuenta-tile-\d+$/.test(element.id)),
    [repeatableElements]
  );
  const countdownTitleStyle = React.useMemo(
    () => getSectionTextStyle(countdownTitleElement),
    [countdownTitleElement]
  );
  const textSize = selectedTextStyle.fontSize ?? section?.fontSize ?? 14;
  const textColor = selectedTextStyle.textColor ?? section?.textColor ?? '#1a1a1a';
  const textAlign = selectedTextStyle.textAlign ?? section?.alignment ?? 'center';
  const textWeight = selectedTextStyle.fontWeight ?? section?.fontWeight ?? '600';
  const textFontFamily = selectedTextStyle.fontFamily ?? section?.fontFamily ?? 'Inter';
  const textFontStyle = selectedTextStyle.fontStyle ?? section?.fontStyle ?? 'normal';
  const currentContainerElement = React.useMemo(() => {
    if (!section) return null;

    if (selectedRepeatableElement?.kind === 'container') {
      return selectedRepeatableElement;
    }

    const containerElements = repeatableElements.filter((element) => element.kind === 'container');
    return containerElements[containerElements.length - 1] || null;
  }, [repeatableElements, section, selectedRepeatableElement]);
  const currentImageElement = React.useMemo(() => {
    if (!section) return null;

    if (selectedRepeatableElement?.kind === imagePanelTarget) {
      return selectedRepeatableElement;
    }

    const sameKindElements = repeatableElements.filter((element) => element.kind === imagePanelTarget);
    return sameKindElements[sameKindElements.length - 1] || null;
  }, [imagePanelTarget, repeatableElements, section, selectedRepeatableElement]);
  const currentImageStyle = section && currentImageElement
    ? getSectionImageStyle(currentImageElement, section, imagePanelTarget)
    : undefined;
  const currentContainerStyle = currentContainerElement
    ? getSectionContainerStyle(currentContainerElement)
    : undefined;
  const safeContainerBackgroundColor = isValidColorValue(currentContainerStyle?.backgroundColor)
    ? (currentContainerStyle?.backgroundColor as string)
    : '#ffffff';
  const safeContainerBorderColor = isValidColorValue(currentContainerStyle?.borderColor)
    ? (currentContainerStyle?.borderColor as string)
    : '#1f2937';
  const countdownPanelContainerStyle = React.useMemo(
    () => getSectionContainerStyle(countdownPanelElement),
    [countdownPanelElement]
  );
  const countdownTileContainerStyle = React.useMemo(
    () => countdownTileElements.length > 0
      ? getSectionContainerStyle(countdownTileElements[0])
      : getSectionContainerStyle(null),
    [countdownTileElements]
  );
  const countdownTitleValue = countdownTitleElement?.value?.trim() || section?.title || 'Cuenta regresiva';
  const countdownTitleFontSize = Math.max(
    10,
    countdownTitleStyle.fontSize ?? Math.max(11, Math.round((section?.fontSize ?? 16) * 0.78))
  );
  const countdownTitleColor = countdownTitleStyle.textColor ?? section?.textColor ?? '#7c6f64';
  const countdownTitleWeight = countdownTitleStyle.fontWeight ?? section?.fontWeight ?? '800';
  const countdownTitleFontFamily = countdownTitleStyle.fontFamily ?? section?.fontFamily ?? 'Inter';
  const countdownTitleFontStyle = countdownTitleStyle.fontStyle ?? section?.fontStyle ?? 'normal';
  const countdownPanelBorderPickerColor = resolveColorPickerValue(countdownPanelContainerStyle.borderColor, '#e8d6ad');
  const countdownPanelBackgroundPickerColor = resolveColorPickerValue(countdownPanelContainerStyle.backgroundColor, '#fffaf3');
  const countdownTileBorderPickerColor = resolveColorPickerValue(countdownTileContainerStyle.borderColor, '#f1e2bd');
  const countdownTileBackgroundPickerColor = resolveColorPickerValue(countdownTileContainerStyle.backgroundColor, '#fff8eb');
  const selectedContainerAnimationType: SectionAnimationType = currentContainerStyle?.animation?.type || 'none';
  const selectedContainerAnimationDuration = Math.max(0.2, Math.min(2, currentContainerStyle?.animation?.duration ?? 0.6));
  const imageScaleValue = Math.max(20, Math.min(300, currentImageStyle?.scale ?? 100));
  const contentImageScaleValue = Math.max(20, Math.min(300, currentImageStyle?.scale ?? 100));
  const mainImageFit = currentImageStyle?.fit === 'cover' ? 'cover' : 'contain';
  const contentImageFit = currentImageStyle?.fit === 'cover' ? 'cover' : 'contain';
  const currentImageUrl = currentImageElement?.value || '';
  const hasCurrentImageSource = currentImageUrl.trim().length > 0;
  const layerOrderedElements = React.useMemo(
    () => [...repeatableElements].sort((a, b) => getSectionElementLayer(b) - getSectionElementLayer(a)),
    [repeatableElements]
  );
  const titleCount = getSectionElementCount(section, 'title');
  const subtitleCount = getSectionElementCount(section, 'subtitle');
  const contentCount = getSectionElementCount(section, 'content');
  const mainImageCount = getSectionElementCount(section, 'image');
  const contentImageCount = getSectionElementCount(section, 'contentImage');
  const containerCount = getSectionElementCount(section, 'container');
  const hasTitle = titleCount > 0;
  const hasSubtitle = subtitleCount > 0;
  const hasContent = contentCount > 0;
  const hasMainImage = mainImageCount > 0;
  const hasContentImage = contentImageCount > 0;
  const hasContainer = containerCount > 0;
  const hasCountdown = section?.type === 'COUNTDOWN';
  const hasMusic = section?.type === 'MUSIC';
  const hasLocation = section?.type === 'LOCATION';
  const hasItinerary = section?.type === 'ITINERARY';
  const lockVisibleSurfaceToLivePreview = focusMode && hasLivePreview;
  const isCountdownToolSelection = !!section
    && section.type === 'COUNTDOWN'
    && (
      activeTextElement === 'countdown'
      || selectedElementId === 'cuenta-title'
      || selectedElementId === 'cuenta-panel'
      || /^cuenta-tile-\d+$/.test(selectedElementId ?? '')
    );
  const isLivePreviewSurfaceActive = hasLivePreview && (previewSurfaceMode === 'live' || lockVisibleSurfaceToLivePreview);
  const canEditTextStyle = hasItinerary || !!selectedTextElement;
  const hasLayerableElements = repeatableElements.length > 0;
  const getDefaultToolsPanel = React.useCallback((): ToolPanel => {
    if (hasCountdown) return 'countdown';
    if (hasMainImage || hasContentImage) return 'image';
    if (hasContainer) return 'container';
    if (hasLocation) return 'location';
    if (hasMusic) return 'audio';
    if (hasItinerary) return 'timeline';
    return 'controls';
  }, [hasContainer, hasContentImage, hasCountdown, hasItinerary, hasLocation, hasMainImage, hasMusic]);
  const countdownPreview = React.useMemo(() => getCountdownParts(section?.countdownTargetDate), [section?.countdownTargetDate]);
  const countdownFontSize = Math.max(14, section?.countdownStyle?.fontSize ?? section?.fontSize ?? 16);
  const countdownTextColor = section?.countdownStyle?.textColor || section?.textColor || '#1a1a1a';
  const countdownFontWeight = section?.countdownStyle?.fontWeight || section?.fontWeight || '700';
  const countdownFontFamily = section?.countdownStyle?.fontFamily || section?.fontFamily || 'Inter';
  const countdownFontStyle = section?.countdownStyle?.fontStyle || section?.fontStyle || 'normal';
  const countdownScale = Math.max(20, Math.min(300, section?.countdownStyle?.scale ?? 100));
  const countdownItemGap = section?.countdownStyle?.itemGap;
  const countdownItemGapControl = Math.max(
    0,
    Math.min(96, countdownItemGap ?? Math.round((countdownFontSize * (countdownScale / 100)) * 0.65))
  );
  const itineraryItems = section?.itineraryItems || [];
  const itineraryStyle = getItineraryStyle(section?.itineraryStyle);
  const countdownStatusLabel = countdownPreview.hasTarget
    ? countdownPreview.isComplete
      ? 'La cuenta ya lleg? a cero.'
      : 'El conteo iniciará automáticamente en la vista final.'
    : 'Define fecha y hora para activar el conteo.';
  const locationEmbedUrl = React.useMemo(() => getGoogleMapsEmbedUrl(section?.locationMapUrl), [section?.locationMapUrl]);
  const revealButtonLabelPreview = section ? getRevealButtonLabel(section) : '';
  const countdownPanel = section?.type === 'COUNTDOWN' ? (
    <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Countdown</p>
        <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Fecha del evento</h4>
      </div>
      <input
        type="datetime-local"
        value={section.countdownTargetDate || ''}
        onChange={(e) => onUpdate({ countdownTargetDate: e.target.value })}
        className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
      />
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Titulo</p>
          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Texto de la cuenta</h4>
        </div>
        <input
          type="text"
          value={countdownTitleValue}
          onChange={(e) => updateCountdownTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
          placeholder="Cuenta regresiva"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Tamano del titulo</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={10}
                max={34}
                value={Math.round(Number(countdownTitleFontSize || 14))}
                onChange={(e) => updateCountdownTitleStyle({ fontSize: parseInt(e.target.value || '14', 10) || 14 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={10}
                max={34}
                value={Math.round(Number(countdownTitleFontSize || 14))}
                onChange={(e) => updateCountdownTitleStyle({ fontSize: parseInt(e.target.value || '14', 10) || 14 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M7 16l8.5-8.5a2.12 2.12 0 1 1 3 3L10 19H7v-3Z" />
                  <path strokeLinecap="round" strokeWidth="1.9" d="M14 6l4 4" />
                </svg>
              </span>
              <input
                type="color"
                value={resolveColorPickerValue(countdownTitleColor, '#b79a6b')}
                onChange={(e) => updateCountdownTitleStyle({ textColor: e.target.value })}
                aria-label="Seleccionar color del titulo de la cuenta"
                className="h-9 w-9 cursor-pointer rounded-xl border border-gray-200 bg-white p-1 transition-all duration-200 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(79,70,229,0.12)]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Tipografia</p>
          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Numeros y etiquetas</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Tamaño</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={10}
                max={40}
                value={Math.round(Number(countdownFontSize || 16))}
                onChange={(e) => updateCountdownStyle({ fontSize: parseInt(e.target.value || '16', 10) || 16 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={10}
                max={40}
                value={Math.round(Number(countdownFontSize || 16))}
                onChange={(e) => updateCountdownStyle({ fontSize: parseInt(e.target.value || '16', 10) || 16 })}
                className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
              />
            </div>
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M7 16l8.5-8.5a2.12 2.12 0 1 1 3 3L10 19H7v-3Z" />
                  <path strokeLinecap="round" strokeWidth="1.9" d="M14 6l4 4" />
                </svg>
              </span>
              <input
                type="color"
                value={resolveColorPickerValue(countdownTextColor, '#1a1a1a')}
                onChange={(e) => updateCountdownStyle({ textColor: e.target.value })}
                aria-label="Seleccionar color de la cuenta regresiva"
                className="h-9 w-9 cursor-pointer rounded-xl border border-gray-200 bg-white p-1 transition-all duration-200 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(79,70,229,0.12)]"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Peso</label>
            <select
              value={String(countdownFontWeight)}
              onChange={(e) => updateCountdownStyle({ fontWeight: e.target.value })}
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
            >
              <option value="300">Ligero</option>
              <option value="400">Regular</option>
              <option value="500">Medio</option>
              <option value="700">Negrita</option>
              <option value="900">Extra</option>
            </select>
          </div>
          <div>
            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Fuente</label>
            <select
              value={countdownFontFamily}
              onChange={(e) => updateCountdownStyle({ fontFamily: e.target.value })}
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
            >
              <option value="Inter">Inter</option>
              <option value="Playfair Display">Playfair</option>
              <option value="Dancing Script">Dancing</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => updateCountdownStyle({ fontStyle: 'normal' })}
            className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
              countdownFontStyle === 'normal' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => updateCountdownStyle({ fontStyle: 'italic' })}
            className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
              countdownFontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Italic
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Escala</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={20}
                max={300}
                value={Math.round(Number(countdownScale || 100))}
                onChange={(e) => updateCountdownStyle({ scale: parseInt(e.target.value || '100', 10) || 100 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={20}
                max={300}
                value={Math.round(Number(countdownScale || 100))}
                onChange={(e) => updateCountdownStyle({ scale: parseInt(e.target.value || '100', 10) || 100 })}
                className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
              />
            </div>
          </div>
          <div>
            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Separacion</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={96}
                value={Math.round(Number(countdownItemGapControl))}
                onChange={(e) => updateCountdownStyle({ itemGap: parseInt(e.target.value || '10', 10) || 0 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={0}
                max={96}
                value={Math.round(Number(countdownItemGapControl))}
                onChange={(e) => updateCountdownStyle({ itemGap: parseInt(e.target.value || '10', 10) || 0 })}
                className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Recuadros</p>
          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Tarjetas del contador</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Ancho parejo</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={48}
                max={140}
                value={Math.round(Number(countdownTileContainerStyle.width || 66))}
                onChange={(e) => updateCountdownTilesStyle({ width: parseInt(e.target.value || '66', 10) || 66 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={48}
                max={140}
                value={Math.round(Number(countdownTileContainerStyle.width || 66))}
                onChange={(e) => updateCountdownTilesStyle({ width: parseInt(e.target.value || '66', 10) || 66 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Alto parejo</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={48}
                max={160}
                value={Math.round(Number(countdownTileContainerStyle.height || 76))}
                onChange={(e) => updateCountdownTilesStyle({ height: parseInt(e.target.value || '76', 10) || 76 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={48}
                max={160}
                value={Math.round(Number(countdownTileContainerStyle.height || 76))}
                onChange={(e) => updateCountdownTilesStyle({ height: parseInt(e.target.value || '76', 10) || 76 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-2">
            <label className="mb-1 block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Color del centro</label>
            <input
              type="color"
              value={countdownTileBackgroundPickerColor}
              onChange={(e) => updateCountdownTilesStyle({ backgroundColor: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-2">
            <label className="mb-1 block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Color del borde</label>
            <input
              type="color"
              value={countdownTileBorderPickerColor}
              onChange={(e) => updateCountdownTilesStyle({ borderColor: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Grosor del borde</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={8}
                value={Math.round(Number(countdownTileContainerStyle.borderWidth || 1))}
                onChange={(e) => updateCountdownTilesStyle({ borderWidth: parseInt(e.target.value || '1', 10) || 0 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={0}
                max={8}
                value={Math.round(Number(countdownTileContainerStyle.borderWidth || 1))}
                onChange={(e) => updateCountdownTilesStyle({ borderWidth: parseInt(e.target.value || '1', 10) || 0 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Radio</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={40}
                value={Math.round(Number(countdownTileContainerStyle.borderRadius || 24))}
                onChange={(e) => updateCountdownTilesStyle({ borderRadius: parseInt(e.target.value || '24', 10) || 0 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={0}
                max={40}
                value={Math.round(Number(countdownTileContainerStyle.borderRadius || 24))}
                onChange={(e) => updateCountdownTilesStyle({ borderRadius: parseInt(e.target.value || '24', 10) || 0 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateCountdownTilesStyle({ shadow: !countdownTileContainerStyle.shadow })}
          className={`w-full rounded-xl border py-1.5 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
            countdownTileContainerStyle.shadow
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {countdownTileContainerStyle.shadow ? 'Sombra activa en las 4 tarjetas' : 'Activar sombra en las 4 tarjetas'}
        </button>
      </div>
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Panel base</p>
          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Marco del contador</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-2">
            <label className="mb-1 block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Centro del panel</label>
            <input
              type="color"
              value={countdownPanelBackgroundPickerColor}
              onChange={(e) => updateCountdownPanelStyle({ backgroundColor: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-2">
            <label className="mb-1 block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Borde del panel</label>
            <input
              type="color"
              value={countdownPanelBorderPickerColor}
              onChange={(e) => updateCountdownPanelStyle({ borderColor: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Grosor del panel</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={8}
                value={Math.round(Number(countdownPanelContainerStyle.borderWidth || 1))}
                onChange={(e) => updateCountdownPanelStyle({ borderWidth: parseInt(e.target.value || '1', 10) || 0 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={0}
                max={8}
                value={Math.round(Number(countdownPanelContainerStyle.borderWidth || 1))}
                onChange={(e) => updateCountdownPanelStyle({ borderWidth: parseInt(e.target.value || '1', 10) || 0 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Radio del panel</label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={48}
                value={Math.round(Number(countdownPanelContainerStyle.borderRadius || 32))}
                onChange={(e) => updateCountdownPanelStyle({ borderRadius: parseInt(e.target.value || '32', 10) || 0 })}
                className="w-full accent-indigo-600"
              />
              <input
                type="number"
                min={0}
                max={48}
                value={Math.round(Number(countdownPanelContainerStyle.borderRadius || 32))}
                onChange={(e) => updateCountdownPanelStyle({ borderRadius: parseInt(e.target.value || '32', 10) || 0 })}
                className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateCountdownPanelStyle({ shadow: !countdownPanelContainerStyle.shadow })}
          className={`w-full rounded-xl border py-1.5 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
            countdownPanelContainerStyle.shadow
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {countdownPanelContainerStyle.shadow ? 'Sombra activa en el panel' : 'Activar sombra en el panel'}
        </button>
      </div>
      <div className="hidden">
        {[countdownPreview.days, countdownPreview.hours, countdownPreview.minutes, countdownPreview.seconds].map((value, index) => (
          <div key={index} className="rounded-xl border border-indigo-100 bg-white px-1 py-1.5 text-center">
            <div className="text-[10px] font-black text-indigo-700">{value}</div>
            <div className="text-[6px] font-black uppercase tracking-[0.14em] text-gray-400">
              {['Días', 'Hrs', 'Min', 'Seg'][index]}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4">
        <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-3">
          <p
            className="text-center uppercase tracking-[0.24em]"
            style={{
              margin: 0,
              color: countdownTitleColor,
              fontFamily: countdownTitleFontFamily,
              fontSize: `${countdownTitleFontSize}px`,
              fontWeight: countdownTitleWeight,
              fontStyle: countdownTitleFontStyle,
            }}
          >
            {countdownTitleValue}
          </p>
          <div
            className="flex w-full items-center justify-center px-3 py-4"
            style={{
              gap: `${Math.max(6, Math.min(48, countdownItemGap ?? 12))}px`,
              backgroundColor: countdownPanelContainerStyle.backgroundColor || 'rgba(255,255,255,0.64)',
              borderColor: countdownPanelContainerStyle.borderColor,
              borderWidth: countdownPanelContainerStyle.borderWidth,
              borderStyle: 'solid',
              borderRadius: `${countdownPanelContainerStyle.borderRadius || 32}px`,
              boxShadow: countdownPanelContainerStyle.shadow ? '0 16px 36px rgba(120,113,108,0.12)' : 'none',
              opacity: (countdownPanelContainerStyle.opacity ?? 100) / 100,
              transform: `scale(${countdownScale / 100})`,
              transformOrigin: 'center top',
            }}
          >
            {[
              { value: countdownPreview.days, label: 'DIAS' },
              { value: countdownPreview.hours, label: 'HRS' },
              { value: countdownPreview.minutes, label: 'MIN' },
              { value: countdownPreview.seconds, label: 'SEG' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: `${countdownTileContainerStyle.width || 66}px`,
                    height: `${countdownTileContainerStyle.height || 76}px`,
                    backgroundColor: countdownTileContainerStyle.backgroundColor || 'rgba(255,255,255,0.78)',
                    borderColor: countdownTileContainerStyle.borderColor,
                    borderWidth: countdownTileContainerStyle.borderWidth,
                    borderStyle: 'solid',
                    borderRadius: `${countdownTileContainerStyle.borderRadius || 24}px`,
                    boxShadow: countdownTileContainerStyle.shadow ? '0 12px 28px rgba(120,113,108,0.14)' : 'none',
                    opacity: (countdownTileContainerStyle.opacity ?? 100) / 100,
                    color: countdownTextColor,
                    fontFamily: countdownFontFamily,
                    fontSize: `${Math.min(countdownFontSize, 24)}px`,
                    fontWeight: countdownFontWeight,
                    fontStyle: countdownFontStyle,
                  }}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <span
                  className="mt-2 text-center uppercase tracking-[0.14em]"
                  style={{
                    color: countdownTextColor,
                    fontFamily: countdownFontFamily,
                    fontSize: `${Math.max(8, Math.round(countdownFontSize * 0.42))}px`,
                    fontWeight: countdownFontWeight,
                    fontStyle: countdownFontStyle,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[7px] text-gray-500 uppercase">
        {countdownStatusLabel}
      </p>
      <button
        type="button"
        onClick={removeCountdown}
        className="w-full rounded-xl border border-red-200 bg-red-50 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-100"
      >
        Quitar cuenta regresiva
      </button>
    </div>
  ) : null;
  const locationPanel = section?.type === 'LOCATION' ? (
    <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
      <input
        type="text"
        value={section.locationMapUrl || ''}
        onChange={(e) => onUpdate({ locationMapUrl: e.target.value })}
        className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
        placeholder="Pega el link completo o la direccion"
      />
      {locationEmbedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <iframe
            src={locationEmbedUrl}
            title="Vista previa de Google Maps"
            className="h-36 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-3 text-center text-[8px] uppercase text-gray-400">
          Agrega un link valido de Google Maps.
        </div>
      )}
      <button
        type="button"
        onClick={removeLocation}
        className="w-full rounded-xl border border-red-200 bg-red-50 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-100"
      >
        Quitar ubicacion
      </button>
    </div>
  ) : null;
  const toolPanelSectionMap: Record<ToolPanel, CollapsibleToolSectionKey> = {
    controls: 'controls',
    preview: 'preview',
    guides: 'guides',
    addSection: 'addSection',
    globalBackground: 'globalBackground',
    section: 'sectionConfig',
    text: 'text',
    image: 'image',
    container: 'container',
    layers: 'layers',
    audio: 'audio',
    animation: 'animation',
    timeline: 'timeline',
    countdown: 'countdown',
    location: 'location',
  };
  const openPanelPane = (pane: PanelPane) => {
    if (pane === 'section') {
      setActivePane('section');
      setToolPanel('section');
      return;
    }

    if (pane === 'layers') {
      setActivePane('layers');
      setToolPanel('layers');
      return;
    }

    const nextToolPanel = getPaneForToolPanel(toolPanel) === 'tools' ? toolPanel : getDefaultToolsPanel();
    setActivePane('tools');
    setToolPanel(nextToolPanel);
    setOpenToolSections((current) => ({ ...current, [toolPanelSectionMap[nextToolPanel]]: true }));
  };
  const getElementButtonClass = (included: boolean, isActive: boolean) => {
    if (isActive) {
      return 'bg-indigo-600 text-white';
    }

    if (included) {
      return 'bg-slate-100 text-slate-700 border border-slate-300';
    }

    return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
  };

  const getLayerElementLabel = (element: SectionElement) => {
    if (element.kind === 'title') return element.value?.trim() || 'Titulo';
    if (element.kind === 'subtitle') return element.value?.trim() || 'Subtitulo';
    if (element.kind === 'content') return element.value?.trim() || 'Texto';
    if (element.kind === 'image') return element.value ? 'Imagen principal' : 'Imagen';
    if (element.kind === 'contentImage') return element.value ? 'Imagen complementaria' : 'Imagen complementaria';
    return element.value?.trim() || 'Contenedor';
  };

  const removePositionKeys = (keys: SectionPositionKey[]) => {
    const nextPositions = { ...(section?.positions || {}) };

    keys.forEach((key) => {
      delete nextPositions[key];
    });

    return nextPositions;
  };

  React.useEffect(() => {
    if (isCountdownToolSelection) {
      setToolPanel('countdown');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'title' || activeTextElement === 'subtitle' || activeTextElement === 'content') {
      setToolPanel('text');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'image') {
      setToolPanel('image');
      setImagePanelTarget('image');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'contentImage') {
      setToolPanel('image');
      setImagePanelTarget('contentImage');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'container') {
      setToolPanel('container');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'backgroundImage') {
      setToolPanel('section');
      setActivePane('section');
      return;
    }

    if (activeTextElement === 'countdown') {
      setToolPanel('countdown');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'timeline') {
      setToolPanel('timeline');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'guests') {
      setToolPanel('section');
      setActivePane('section');
      return;
    }

    if (activeTextElement === 'location') {
      setToolPanel('location');
      setActivePane('tools');
      return;
    }

    if (activeTextElement === 'music') {
      setToolPanel('audio');
      setActivePane('tools');
    }
  }, [activeTextElement, isCountdownToolSelection]);

  React.useEffect(() => {
    if (!section) {
      setToolPanel('section');
      setImagePanelTarget('image');
      return;
    }

    if (imagePanelTarget === 'image' && getSectionElementCount(section, 'image') === 0 && getSectionElementCount(section, 'contentImage') > 0) {
      setImagePanelTarget('contentImage');
    }
  }, [imagePanelTarget, section, toolPanel]);

  React.useEffect(() => {
    const targetSection = toolPanelSectionMap[toolPanel];
    setOpenToolSections((current) => (
      current[targetSection]
        ? current
        : { ...current, [targetSection]: true }
    ));
  }, [toolPanel]);

  const openTools = (nextPanel: ToolPanel, nextImageTarget?: ImagePanelTarget) => {
    setToolPanel(nextPanel);
    setActivePane(getPaneForToolPanel(nextPanel));
    setOpenToolSections((current) => ({ ...current, [toolPanelSectionMap[nextPanel]]: true }));
    if (nextImageTarget) {
      setImagePanelTarget(nextImageTarget);
    }
  };

  const toggleToolSection = (sectionKey: CollapsibleToolSectionKey, nextPanel?: ToolPanel) => {
    if (nextPanel && toolPanel !== nextPanel) {
      setToolPanel(nextPanel);
      setActivePane(getPaneForToolPanel(nextPanel));
      setOpenToolSections((current) => ({ ...current, [sectionKey]: true }));
      return;
    }

    setOpenToolSections((current) => ({ ...current, [sectionKey]: !current[sectionKey] }));
  };

  const applySectionUpdates = (updates: Partial<Section>, nextPanel?: ToolPanel, nextImageTarget?: ImagePanelTarget) => {
    if (!section) return;
    onUpdate({
      positions: ensurePositions(section),
      ...updates,
    });
    if (nextPanel) {
      openTools(nextPanel, nextImageTarget);
    }
  };

  const addRepeatableElement = (
    kind: RepeatableSectionElementKind,
    nextPanel: ToolPanel,
    nextImageTarget?: ImagePanelTarget,
    baseUpdates?: Partial<Section>
  ) => {
    if (!section) return null;

    const { element, updates } = addSectionElement(section, kind);
    onUpdate({
      ...baseUpdates,
      positions: ensurePositions(section),
      ...updates,
    });
    openTools(nextPanel, nextImageTarget);
    onSelectElement?.(kind, element.id);
    return element;
  };

  const updateSelectedRepeatableElement = (updates: Partial<SectionElement>) => {
    if (!section || !selectedRepeatableElement) return;
    onUpdate({
      positions: ensurePositions(section),
      ...updateSectionElement(section, selectedRepeatableElement.id, updates),
    });
  };

  const updateSelectedTextStyle = (updates: Partial<NonNullable<SectionElement['style']>>) => {
    if (!selectedTextElement) return;

    updateSelectedRepeatableElement({
      style: {
        ...getSectionTextStyle(selectedTextElement),
        ...updates,
      },
    });
  };

  const updateCurrentImageElement = (updates: Partial<SectionElement>) => {
    if (!section || !currentImageElement) return;
    onUpdate({
      positions: ensurePositions(section),
      ...updateSectionElement(section, currentImageElement.id, updates),
    });
  };

  const removeSelectedRepeatableElementByKind = (kind: RepeatableSectionElementKind) => {
    if (!section) return;

    const targetElement = selectedRepeatableElement?.kind === kind
      ? selectedRepeatableElement
      : [...repeatableElements].reverse().find((element) => element.kind === kind) || null;

    if (!targetElement) return;

    onUpdate({
      positions: ensurePositions(section),
      ...removeSectionElement(section, targetElement.id),
    });

    if (selectedElementId === targetElement.id || activeTextElement === kind) {
      onSelectElement?.(null, null);
    }
  };

  const enableTitle = () => {
    if (!section) return;
    addRepeatableElement('title', 'text', undefined, {
      type: getNextTextType(section.type, 'HERO'),
    });
  };

  const enableSubtitle = () => {
    if (!section) return;
    addRepeatableElement('subtitle', 'text', undefined, {
      type: getNextTextType(section.type, 'DETAILS'),
    });
  };

  const enableContent = () => {
    if (!section) return;
    addRepeatableElement('content', 'text', undefined, {
      type: getNextTextType(section.type, 'MESSAGE'),
    });
  };

  const enableLocation = () => {
    applySectionUpdates(
      {
        type: 'LOCATION',
        title: section?.title ?? '',
        subtitle: section?.subtitle ?? '',
        content: section?.content ?? '',
        locationMapUrl: section?.locationMapUrl ?? '',
      },
      'section'
    );
    onSelectElement?.('location');
  };

  const enableFooter = () => {
    applySectionUpdates(
      {
        type: 'FOOTER',
        title: section?.title ?? '',
        content: section?.content ?? '',
      },
      'text'
    );
  };

  const openImageTool = (target: ImagePanelTarget = 'image') => {
    openTools('image', target);

    if (selectedRepeatableElement?.kind === target) {
      onSelectElement?.(target, selectedRepeatableElement.id);
      return;
    }

    const existingImage = [...repeatableElements].reverse().find((element) => element.kind === target);
    if (existingImage) {
      onSelectElement?.(target, existingImage.id);
    }
  };

  const openPreviewTool = () => {
    onTogglePreviewSurfaceMode?.('live');
    openTools('preview');
  };

  const openControlsTool = () => {
    openTools('controls');
  };

  const activateGuidedLayoutMode = () => {
    if (!lockVisibleSurfaceToLivePreview) {
      onTogglePreviewSurfaceMode?.('editor');
    }
    onToggleGuides?.(true);
    openTools('guides');
  };

  const handleGuidesVisibilityChange = (nextShow: boolean) => {
    onToggleGuides?.(nextShow);
    openTools('guides');
  };

  const openContainerTool = () => {
    openTools('container');

    if (selectedRepeatableElement?.kind === 'container') {
      onSelectElement?.('container', selectedRepeatableElement.id);
      return;
    }

    const existingContainer = [...repeatableElements].reverse().find((element) => element.kind === 'container');
    if (existingContainer) {
      onSelectElement?.('container', existingContainer.id);
    }
  };

  const openCountdownTool = () => {
    openTools('countdown');
    if (section?.type === 'COUNTDOWN') {
      onSelectElement?.('countdown', null);
    }
  };

  const openAudioTool = () => {
    openTools('audio');
    if (section?.type === 'MUSIC') {
      onSelectElement?.('music', null);
    }
  };

  const openLocationTool = () => {
    openTools('location');
    if (section?.type === 'LOCATION') {
      onSelectElement?.('location', null);
    }
  };

  const openTimelineTool = () => {
    openTools('timeline');
  };

  const enableMainImage = () => {
    openImageTool('image');

    if (selectedRepeatableElement?.kind === 'image') {
      onSelectElement?.('image', selectedRepeatableElement.id);
      return;
    }

    const existingImage = [...repeatableElements].reverse().find((element) => element.kind === 'image');
    if (existingImage) {
      onSelectElement?.('image', existingImage.id);
    }
  };

  const enableContentImage = () => {
    openImageTool('contentImage');

    if (selectedRepeatableElement?.kind === 'contentImage') {
      onSelectElement?.('contentImage', selectedRepeatableElement.id);
      return;
    }

    const existingImage = [...repeatableElements].reverse().find((element) => element.kind === 'contentImage');
    if (existingImage) {
      onSelectElement?.('contentImage', existingImage.id);
    }
  };

  const enableContainer = () => {
    openContainerTool();

    if (selectedRepeatableElement?.kind === 'container') {
      if (section && selectedRepeatableElement.id && !getSectionContainerStyle(selectedRepeatableElement).shadow) {
        onUpdate({
          positions: ensurePositions(section),
          ...updateSectionElement(section, selectedRepeatableElement.id, {
            style: {
              ...getSectionContainerStyle(selectedRepeatableElement),
              shadow: true,
            },
          }),
        });
      }
      onSelectElement?.('container', selectedRepeatableElement.id);
      return;
    }

    const existingContainer = [...repeatableElements].reverse().find((element) => element.kind === 'container');
    if (existingContainer) {
      if (section && !getSectionContainerStyle(existingContainer).shadow) {
        onUpdate({
          positions: ensurePositions(section),
          ...updateSectionElement(section, existingContainer.id, {
            style: {
              ...getSectionContainerStyle(existingContainer),
              shadow: true,
            },
          }),
        });
      }
      onSelectElement?.('container', existingContainer.id);
      return;
    }

    const createdContainer = addRepeatableElement('container', 'container');
    if (createdContainer) {
      onSelectElement?.('container', createdContainer.id);
    }
  };

  const enableCountdown = () => {
    applySectionUpdates(
      {
        type: 'COUNTDOWN',
        title: section?.title ?? '',
        countdownTargetDate: section?.countdownTargetDate ?? getDefaultCountdownTargetValue(),
      },
      'countdown'
    );
    onSelectElement?.('countdown');
  };

  const enableGuests = () => {
    applySectionUpdates(
      {
        type: 'GUESTS',
        title: section?.title ?? '',
        content: section?.content ?? '',
      },
      'section'
    );
    onSelectElement?.('guests');
  };

  const enableMusic = () => {
    applySectionUpdates(
      {
        type: 'MUSIC',
        title: section?.title ?? '',
        audioUrl: section?.audioUrl ?? '',
      },
      'audio'
    );
    onSelectElement?.('music');
  };

  const enableItinerary = () => {
    applySectionUpdates(
      {
        type: 'ITINERARY',
        title: undefined,
        itineraryItems: section?.itineraryItems?.length ? section.itineraryItems : getDefaultItineraryItems(),
        itineraryStyle: getItineraryStyle(section?.itineraryStyle),
        textColor: section?.textColor ?? '#1a1a1a',
        fontFamily: section?.fontFamily ?? 'Inter',
        fontSize: section?.fontSize ?? 16,
        fontWeight: section?.fontWeight ?? '600',
        fontStyle: section?.fontStyle ?? 'normal',
      },
      'timeline'
    );
    onSelectElement?.(null, null);
  };

  const clearSection = () => {
    if (!section) return;
    onUpdate({
      type: 'BLANK',
      title: undefined,
      subtitle: undefined,
      content: undefined,
      imageUrl: undefined,
      contentImageUrl: undefined,
      audioUrl: undefined,
      countdownTargetDate: undefined,
      countdownStyle: undefined,
      itineraryItems: undefined,
      itineraryStyle: undefined,
      locationMapUrl: undefined,
      revealOnDemand: false,
      revealButtonLabel: undefined,
      bgType: 'color',
      bgValue: 'transparent',
      animation: {
        type: 'none',
        duration: 0.6,
      },
      imageStyle: {
        scale: 100,
        fit: 'contain',
        asSectionBackground: false,
        width: 260,
        height: 300,
      },
      contentImageStyle: {
        scale: 100,
        fit: 'contain',
        asSectionBackground: false,
        width: 220,
        height: 200,
      },
      positions: {},
      elements: [],
    });
    setToolPanel('section');
    setImagePanelTarget('image');
    onSelectElement?.(null, null);
  };

  const removeTitle = () => {
    removeSelectedRepeatableElementByKind('title');
  };

  const removeSubtitle = () => {
    removeSelectedRepeatableElementByKind('subtitle');
  };

  const removeContent = () => {
    removeSelectedRepeatableElementByKind('content');
  };

  const removeMainImage = () => {
    removeSelectedRepeatableElementByKind('image');

    if (imagePanelTarget === 'image' && contentImageCount > 0 && mainImageCount <= 1) {
      setImagePanelTarget('contentImage');
    }
  };

  const removeContentImage = () => {
    removeSelectedRepeatableElementByKind('contentImage');

    if (imagePanelTarget === 'contentImage' && mainImageCount > 0 && contentImageCount <= 1) {
      setImagePanelTarget('image');
    }
  };

  const removeContainer = () => {
    removeSelectedRepeatableElementByKind('container');
  };

  function removeCountdown() {
    if (!section) return;
    onUpdate({
      type: 'BLANK',
      countdownTargetDate: undefined,
      positions: removePositionKeys(['countdown', 'extra']),
    });
    if (activeTextElement === 'countdown') {
      onSelectElement?.(null, null);
    }
  }

  const removeGuests = () => {
    if (!section) return;
    onUpdate({
      type: 'BLANK',
      positions: removePositionKeys(['guests', 'extra']),
    });
    if (activeTextElement === 'guests') {
      onSelectElement?.(null, null);
    }
  };

  const removeMusic = () => {
    if (!section) return;
    onUpdate({
      type: 'BLANK',
      audioUrl: undefined,
      positions: removePositionKeys(['music', 'extra']),
    });
    if (toolPanel === 'audio') {
      setToolPanel('section');
    }
    if (activeTextElement === 'music') {
      onSelectElement?.(null, null);
    }
  };

  function removeLocation() {
    if (!section) return;
    onUpdate({ type: 'BLANK', locationMapUrl: undefined });
    if (activeTextElement === 'location') {
      onSelectElement?.(null, null);
    }
  }

  const removeItinerary = () => {
    if (!section) return;
    onUpdate({
      type: 'BLANK',
      title: undefined,
      itineraryItems: undefined,
      itineraryStyle: undefined,
    });
    if (toolPanel === 'timeline') {
      setToolPanel('section');
    }
  };

  const removeFooter = () => {
    if (!section) return;
    onUpdate({ type: 'BLANK' });
  };

  const updateImageStyle = (updates: Partial<NonNullable<Section['imageStyle']>>) => {
    if (!section || !currentImageElement || currentImageElement.kind !== 'image') return;

    if (updates.asSectionBackground !== undefined) {
      const nextElements = getSectionElements(section).map((element) => {
        if (element.kind !== 'image') return element;
        if (element.id === currentImageElement.id) {
          return {
            ...element,
            style: {
              ...getSectionImageStyle(element, section, 'image'),
              ...updates,
            },
          };
        }

        return {
          ...element,
          style: {
            ...getSectionImageStyle(element, section, 'image'),
            asSectionBackground: false,
          },
        };
      });

      onUpdate({
        positions: ensurePositions(section),
        ...syncSectionElements(section, nextElements),
      });
      return;
    }

    updateCurrentImageElement({
      style: {
        ...getSectionImageStyle(currentImageElement, section, 'image'),
        ...updates,
      }
    });
  };

  const updateContentImageStyle = (updates: Partial<NonNullable<Section['contentImageStyle']>>) => {
    if (!section || !currentImageElement || currentImageElement.kind !== 'contentImage') return;
    updateCurrentImageElement({
      style: {
        ...getSectionImageStyle(currentImageElement, section, 'contentImage'),
        ...updates,
      }
    });
  };

  const updateSelectedElementAnimation = (updates: Partial<NonNullable<ContainerStyle['animation']>>) => {
    if (!section || !selectedRepeatableElement) return;
    onUpdate({
      positions: ensurePositions(section),
      ...updateSectionElement(section, selectedRepeatableElement.id, {
        style: {
          ...selectedRepeatableElement.style,
          animation: {
            ...getSectionElementAnimation(selectedRepeatableElement),
            ...updates,
          },
        },
      }),
    });
  };

  const updateContainerStyle = (updates: Partial<ContainerStyle>) => {
    if (!section || !currentContainerElement) return;
    const nextStyle = {
      ...getSectionContainerStyle(currentContainerElement),
      ...updates,
      animation: {
        ...getSectionContainerStyle(currentContainerElement).animation,
        ...updates.animation,
      },
    };

    onUpdate({
      positions: ensurePositions(section),
      ...updateSectionElement(section, currentContainerElement.id, { style: nextStyle }),
    });
  };

  const reorderLayerElement = (
    elementId: string,
    direction: 'forward' | 'backward' | 'front' | 'back'
  ) => {
    if (!section) return;

    const orderedBackToFront = [...repeatableElements].sort(
      (a, b) => getSectionElementLayer(a) - getSectionElementLayer(b)
    );
    const currentIndex = orderedBackToFront.findIndex((element) => element.id === elementId);

    if (currentIndex === -1) return;

    const nextOrdered = [...orderedBackToFront];

    if (direction === 'forward' && currentIndex < nextOrdered.length - 1) {
      [nextOrdered[currentIndex], nextOrdered[currentIndex + 1]] = [nextOrdered[currentIndex + 1], nextOrdered[currentIndex]];
    }

    if (direction === 'backward' && currentIndex > 0) {
      [nextOrdered[currentIndex], nextOrdered[currentIndex - 1]] = [nextOrdered[currentIndex - 1], nextOrdered[currentIndex]];
    }

    if (direction === 'front' && currentIndex < nextOrdered.length - 1) {
      const [target] = nextOrdered.splice(currentIndex, 1);
      nextOrdered.push(target);
    }

    if (direction === 'back' && currentIndex > 0) {
      const [target] = nextOrdered.splice(currentIndex, 1);
      nextOrdered.unshift(target);
    }

    const reassignedLayers = new Map(
      nextOrdered.map((element, index) => [
        element.id,
        {
          ...element,
          layer: (index + 1) * 10,
        },
      ])
    );

    onUpdate({
      positions: ensurePositions(section),
      ...syncSectionElements(
        section,
        repeatableElements.map((element) => reassignedLayers.get(element.id) || element)
      ),
    });
  };

  const updateCountdownStyle = (updates: Partial<NonNullable<Section['countdownStyle']>>) => {
    if (!section) return;
    onUpdate({
      countdownStyle: {
        ...section.countdownStyle,
        ...updates,
      },
    });
  };

  const updateCountdownTitle = (value: string) => {
    if (!section || !countdownTitleElement) return;
    onUpdate({
      ...updateSectionElement(section, countdownTitleElement.id, {
        value,
      }),
    });
  };

  const updateCountdownTitleStyle = (updates: Partial<NonNullable<SectionElement['style']>>) => {
    if (!section || !countdownTitleElement) return;
    onUpdate({
      ...updateSectionElement(section, countdownTitleElement.id, {
        style: {
          ...getSectionTextStyle(countdownTitleElement),
          ...updates,
        },
      }),
    });
  };

  const updateCountdownPanelStyle = (updates: Partial<ContainerStyle>) => {
    if (!section || !countdownPanelElement) return;
    onUpdate({
      ...updateSectionElement(section, countdownPanelElement.id, {
        style: {
          ...countdownPanelContainerStyle,
          ...updates,
        },
      }),
    });
  };

  const updateCountdownTilesStyle = (updates: Partial<ContainerStyle>) => {
    if (!section || countdownTileElements.length === 0) return;

    onUpdate(syncSectionElements(
      section,
      repeatableElements.map((element) => (
        /^cuenta-tile-\d+$/.test(element.id)
          ? {
              ...element,
              style: {
                ...getSectionContainerStyle(element),
                ...updates,
              },
            }
          : element
      ))
    ));
  };

  const updateItineraryStyle = (updates: Partial<NonNullable<Section['itineraryStyle']>>) => {
    if (!section) return;
    onUpdate({
      itineraryStyle: {
        ...getItineraryStyle(section.itineraryStyle),
        ...updates,
      },
    });
  };

  const updateItineraryItems = (nextItems: NonNullable<Section['itineraryItems']>) => {
    if (!section) return;
    onUpdate({ itineraryItems: nextItems });
  };

  const updateItineraryItem = (itemId: string, updates: Partial<NonNullable<Section['itineraryItems']>[number]>) => {
    updateItineraryItems(
      itineraryItems.map((item) => (
        item.id === itemId
          ? { ...item, ...updates }
          : item
      ))
    );
  };

  const addItineraryOption = () => {
    const nextDefaultIcon = ITINERARY_ICON_OPTIONS[itineraryItems.length % ITINERARY_ICON_OPTIONS.length]?.value || 'sparkles';
    updateItineraryItems([
      ...itineraryItems,
      createItineraryItem({ icon: nextDefaultIcon }),
    ]);
  };

  const moveItineraryItem = (itemId: string, direction: 'up' | 'down') => {
    const index = itineraryItems.findIndex((item) => item.id === itemId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === itineraryItems.length - 1) return;

    const nextItems = [...itineraryItems];
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
    updateItineraryItems(nextItems);
  };

  const removeItineraryItem = (itemId: string) => {
    updateItineraryItems(itineraryItems.filter((item) => item.id !== itemId));
  };

  const handleGlobalBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    readLocalImageAsDataUrl(event, 'global-background', (dataUrl) => {
      onUpdateGlobalBg?.({ type: 'image', value: dataUrl });
    });
  };

  const handleSectionBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    readLocalImageAsDataUrl(event, 'section-background', (dataUrl) => {
      onUpdate({ bgType: 'image', bgValue: dataUrl });
    });
  };

  const handleSectionImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    readLocalImageAsDataUrl(
      event,
      imagePanelTarget === 'image' ? 'main-image' : 'content-image',
      (dataUrl) => {
        if (!section) return;

        if (imagePanelTarget === 'image') {
          if (currentImageElement?.kind === 'image') {
            onUpdate({
              positions: ensurePositions(section),
              ...updateSectionElement(section, currentImageElement.id, { value: dataUrl }),
            });
            onSelectElement?.('image', currentImageElement.id);
            return;
          }

          const createdImage = addSectionElement(section, 'image');
          onUpdate({
            positions: ensurePositions(section),
            ...updateSectionElement(
              {
                ...section,
                ...createdImage.updates,
              },
              createdImage.element.id,
              { value: dataUrl }
            ),
          });
          openTools('image', 'image');
          onSelectElement?.('image', createdImage.element.id);
          return;
        }

        if (currentImageElement?.kind === 'contentImage') {
          onUpdate({
            positions: ensurePositions(section),
            ...updateSectionElement(section, currentImageElement.id, { value: dataUrl }),
          });
          onSelectElement?.('contentImage', currentImageElement.id);
          return;
        }

        const createdImage = addSectionElement(section, 'contentImage');
        onUpdate({
          positions: ensurePositions(section),
          ...updateSectionElement(
            {
              ...section,
              ...createdImage.updates,
            },
            createdImage.element.id,
            { value: dataUrl }
          ),
        });
        openTools('image', 'contentImage');
        onSelectElement?.('contentImage', createdImage.element.id);
      }
    );
  };

  const handleMusicAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type && !file.type.startsWith('audio/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        applySectionUpdates(
          {
            type: 'MUSIC',
            audioUrl: reader.result,
          },
          'audio'
        );
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const isControlsToolGroupActive = toolPanel === 'controls'
    || toolPanel === 'preview'
    || toolPanel === 'guides'
    || toolPanel === 'addSection'
    || toolPanel === 'globalBackground';

  const quickActions: Array<{
    key: string;
    label: string;
    active: boolean;
    included: boolean;
    icon: React.ReactNode;
    onClick: () => void;
  }> = [
    {
      key: 'controls',
      label: 'Controles',
      active: isControlsToolGroupActive,
      included: true,
      onClick: openControlsTool,
      icon: panelIcons.controls.icon,
    },
    {
      key: 'text',
      label: 'Texto',
      active: (toolPanel === 'text' || activeTextElement === 'title' || activeTextElement === 'subtitle' || activeTextElement === 'content') && !isCountdownToolSelection,
      included: hasTitle || hasSubtitle || hasContent || hasItinerary,
      onClick: () => openTools('text'),
      icon: panelIcons.text.icon,
    },
    {
      key: 'image',
      label: 'Imagen',
      active: toolPanel === 'image',
      included: hasMainImage || hasContentImage,
      onClick: () => openImageTool(imagePanelTarget),
      icon: panelIcons.image.icon,
    },
    {
      key: 'container',
      label: 'Contenedor',
      active: (toolPanel === 'container' || activeTextElement === 'container') && !isCountdownToolSelection,
      included: hasContainer,
      onClick: openContainerTool,
      icon: panelIcons.container.icon,
    },
    {
      key: 'countdown',
      label: 'Cuenta',
      active: toolPanel === 'countdown' || isCountdownToolSelection,
      included: hasCountdown,
      onClick: openCountdownTool,
      icon: panelIcons.countdown.icon,
    },
    {
      key: 'music',
      label: 'Musica',
      active: toolPanel === 'audio' || activeTextElement === 'music',
      included: hasMusic,
      onClick: openAudioTool,
      icon: panelIcons.audio.icon,
    },
    {
      key: 'location',
      label: 'Ubicacion',
      active: toolPanel === 'location' || activeTextElement === 'location',
      included: hasLocation,
      onClick: openLocationTool,
      icon: panelIcons.location.icon,
    },
    {
      key: 'animation',
      label: 'Animaciones',
      active: toolPanel === 'animation',
      included: !!selectedRepeatableElement,
      onClick: () => openTools('animation'),
      icon: panelIcons.animation.icon,
    },
    {
      key: 'timeline',
      label: 'Itinerario',
      active: toolPanel === 'timeline',
      included: hasItinerary,
      onClick: openTimelineTool,
      icon: panelIcons.timeline.icon,
    },
  ];
  const generalToolActions: Array<{
    key: string;
    label: string;
    detail: string;
    active: boolean;
    included: boolean;
    icon: React.ReactNode;
    onClick: () => void;
  }> = [
    ...(hasLivePreview ? [{
      key: 'preview',
      label: 'Preview real',
      detail: lockVisibleSurfaceToLivePreview
        ? 'La invitacion real permanece activa mientras editas.'
        : isLivePreviewSurfaceActive
          ? 'Vista real activa en el lienzo.'
          : 'Abre la invitacion real para validar scroll y efectos.',
      active: toolPanel === 'preview' || isLivePreviewSurfaceActive,
      included: true,
      icon: panelIcons.preview.icon,
      onClick: openPreviewTool,
    }] : []),
    {
      key: 'guides',
      label: 'Mover',
      detail: lockVisibleSurfaceToLivePreview
        ? showGuides
          ? 'Mover esta activo sobre la invitacion real.'
          : 'Activa mover para arrastrar bloques sobre la invitacion real.'
        : isLivePreviewSurfaceActive
          ? 'Abre el lienzo editable para mover bloques y luego puedes volver al preview real.'
        : showGuides
          ? 'La herramienta mover ya esta activa para arrastrar dentro de cada seccion.'
          : 'Activa mover para arrastrar bloques sin desacomodar el resto del lienzo.',
      active: toolPanel === 'guides' || !!showGuides,
      included: true,
      icon: panelIcons.guides.icon,
      onClick: activateGuidedLayoutMode,
    },
    {
      key: 'add-section',
      label: 'Seccion',
      detail: 'Agrega una nueva seccion limpia y sigue editando.',
      active: toolPanel === 'addSection',
      included: true,
      icon: panelIcons.addSection.icon,
      onClick: () => openTools('addSection'),
    },
    {
      key: 'global-background',
      label: 'Fondo global',
      detail: 'Cambia el fondo general del proyecto sin salir del editor.',
      active: toolPanel === 'globalBackground',
      included: true,
      icon: panelIcons.globalBackground.icon,
      onClick: () => openTools('globalBackground'),
    },
  ];
  const editorShortcuts: Array<{
    key: string;
    label: string;
    detail: string;
    active: boolean;
    included: boolean;
    icon: React.ReactNode;
    onClick: () => void;
  }> = [
    ...(hasLivePreview ? [{
      key: 'preview',
      label: 'Preview',
      detail: 'Vista real',
      active: toolPanel === 'preview',
      included: true,
      icon: panelIcons.preview.icon,
      onClick: openPreviewTool,
    }] : []),
    {
      key: 'size',
      label: 'Tamanos',
      detail: 'Seccion y texto',
      active: activePane === 'section' || toolPanel === 'text',
      included: true,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 8V5h3M18 8V5h-3M6 16v3h3M18 16v3h-3" />
          <rect x="8" y="8" width="8" height="8" rx="2" strokeWidth="1.8" />
        </svg>
      ),
      onClick: () => openPanelPane('section'),
    },
    {
      key: 'borders',
      label: 'Bordes',
      detail: 'Radio y sombra',
      active: toolPanel === 'container',
      included: hasContainer,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="5" width="14" height="14" rx="4" strokeWidth="1.8" />
          <path strokeLinecap="round" strokeWidth="1.8" d="M9 9h6M9 13h4" />
        </svg>
      ),
      onClick: openContainerTool,
    },
    ...(hasLivePreview ? [{
      key: 'carousel',
      label: 'Carrusel',
      detail: 'Prueba en vivo',
      active: toolPanel === 'preview',
      included: true,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="6" width="16" height="12" rx="2.5" strokeWidth="1.8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 10.5 7 12l2 1.5M15 10.5 17 12l-2 1.5" />
          <path strokeLinecap="round" strokeWidth="1.8" d="M12 9v6" />
        </svg>
      ),
      onClick: () => {
        onToggleViewMode?.('mobile');
        onRefreshPreview?.();
        openPreviewTool();
      },
    }] : []),
    {
      key: 'layers',
      label: 'Capas',
      detail: 'Orden visual',
      active: activePane === 'layers',
      included: hasLayerableElements,
      icon: panelIcons.layers.icon,
      onClick: () => openPanelPane('layers'),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full overflow-y-auto custom-scrollbar">
      {false && (
        <div className="p-3 space-y-4">
          <section className="rounded-2xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Vista previa</p>
                <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-900">Modo de lienzo</h3>
              </div>
              <button
                onClick={() => handleGuidesVisibilityChange(!showGuides)}
                className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.18em] border transition-colors ${
                  showGuides ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                  {showGuides ? 'Salir de mover' : 'Activar mover'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onToggleViewMode?.('mobile')}
                className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.18em] transition-all ${
                  viewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Movil
              </button>
              <button
                onClick={() => onToggleViewMode?.('tablet')}
                className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.18em] transition-all ${
                  viewMode === 'tablet' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tablet
              </button>
              <button
                onClick={() => onToggleViewMode?.('desktop')}
                className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.18em] transition-all ${
                  viewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                PC
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 p-3">
            <div className="mb-2">
              <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Estructura</p>
              <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-900">Agregar sección</h3>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {sectionHeights.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onAddSection?.(item.value)}
                  className="py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-indigo-100 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 p-3 space-y-2">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Lienzo global</p>
              <h3 className="text-[11px] font-black uppercase tracking-tight text-gray-900">Fondo general</h3>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => onUpdateGlobalBg?.({ type: 'color', value: safeGlobalColorValue })}
                className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                  globalBg?.type === 'color' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => onUpdateGlobalBg?.({ type: 'image', value: globalBg?.type === 'image' ? (globalBg.value || '') : '' })}
                className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                  globalBg?.type === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Imagen
              </button>
            </div>

            {globalBg?.type === 'color' ? (
              <div className="space-y-2">
                <input
                  type="color"
                  value={safeGlobalColorValue.startsWith('#') ? safeGlobalColorValue : '#ffffff'}
                  onChange={(e) => onUpdateGlobalBg?.({ type: 'color', value: e.target.value })}
                  className="w-full h-8 rounded-xl border border-gray-200 p-1 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => onUpdateGlobalBg?.({ type: 'color', value: 'transparent' })}
                  className={`w-full py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                    safeGlobalColorValue === 'transparent'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Transparente
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={globalBgImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGlobalBgImageUpload}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => globalBgImageInputRef.current?.click()}
                    className="py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-indigo-100 transition-colors"
                  >
                    Subir imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateGlobalBg?.({ type: 'image', value: '' })}
                    disabled={!globalBg?.value}
                    className="py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Limpiar
                  </button>
                </div>
                <input
                  type="text"
                  value={globalBg?.value || ''}
                  onChange={(e) => onUpdateGlobalBg?.({ type: 'image', value: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[8px] focus:ring-1 focus:ring-indigo-500"
                  placeholder="URL del fondo global"
                />
                {globalBg?.value && (
                  <div
                    className="h-14 w-full border border-gray-100 rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${globalBg.value})` }}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <div className="p-3 space-y-4">
          {!section ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
              <p className="text-[8px] font-black uppercase tracking-[0.22em]">Selecciona una sección para editarla</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-1.5 rounded-[22px] border border-gray-200 bg-white p-1.5 shadow-sm">
                  {[
                    { key: 'section' as const, label: 'Seccion' },
                    { key: 'layers' as const, label: 'Capas' },
                    { key: 'tools' as const, label: 'Herramientas' },
                  ].map((pane) => (
                    <button
                      key={pane.key}
                      type="button"
                      onClick={() => openPanelPane(pane.key)}
                      className={`min-w-0 rounded-2xl px-2.5 py-2 text-[7px] font-black uppercase tracking-[0.14em] transition-all ${
                        activePane === pane.key
                          ? 'bg-indigo-600 text-white shadow-[0_10px_22px_rgba(79,70,229,0.16)]'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pane.label}
                    </button>
                  ))}
                </div>

                {!focusMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    {editorShortcuts.map((shortcut) => (
                      <ToolActionCard
                        key={shortcut.key}
                        label={shortcut.label}
                        detail={shortcut.detail}
                        icon={shortcut.icon}
                        active={shortcut.active}
                        included={shortcut.included}
                        onClick={shortcut.onClick}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="flex min-h-0 gap-3">
                  {activePane === 'tools' && (
                    <aside className="flex w-11 shrink-0 flex-col items-center gap-1.5 rounded-[20px] border border-gray-200 bg-white/95 p-1.5">
                      {quickActions.map((action) => (
                        <ToolSidebarButton
                          key={action.key}
                          label={action.label}
                          icon={action.icon}
                          active={action.active}
                          included={action.included}
                          onClick={action.onClick}
                        />
                      ))}
                    </aside>
                  )}

                  <div className="min-w-0 flex-1 space-y-4">
                    {activePane === 'tools' && toolPanel === 'controls' && (
                      <CollapsibleToolSection
                        eyebrow="General"
                        title="Controles base"
                        isOpen={openToolSections.controls}
                        onToggle={() => toggleToolSection('controls', 'controls')}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {generalToolActions.map((action) => (
                            <ToolActionCard
                              key={action.key}
                              label={action.label}
                              detail={action.detail}
                              icon={action.icon}
                              active={action.active}
                              included={action.included}
                              onClick={action.onClick}
                            />
                          ))}
                        </div>

                        {hasLivePreview && !lockVisibleSurfaceToLivePreview ? (
                          <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-indigo-500">Superficie actual</p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => onTogglePreviewSurfaceMode?.('editor')}
                                className={`rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                  !isLivePreviewSurfaceActive
                                    ? 'border-transparent bg-indigo-600 text-white'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                Lienzo editable
                              </button>
                              <button
                                type="button"
                                onClick={openPreviewTool}
                                className={`rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                  isLivePreviewSurfaceActive
                                    ? 'border-transparent bg-indigo-600 text-white'
                                    : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                                }`}
                              >
                                Preview real
                              </button>
                            </div>
                            <p className="mt-2 text-[8px] leading-4 text-slate-600">
                              Trabaja en el lienzo para seleccionar texto e imagen. Cambia a preview real solo para validar la invitacion publicada.
                            </p>
                          </div>
                        ) : null}

                        {hasLivePreview && lockVisibleSurfaceToLivePreview ? (
                          <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-indigo-500">Superficie actual</p>
                            <p className="mt-2 text-[8px] leading-4 text-slate-600">
                              La invitacion real se mantiene siempre visible. Usa seleccionar, imagenes y modo mover sin cambiar a un lienzo alterno.
                            </p>
                          </div>
                        ) : null}
                      </CollapsibleToolSection>
                    )}

                    {activePane === 'tools' && toolPanel === 'preview' && hasLivePreview && (
                      <CollapsibleToolSection
                        eyebrow="Preview"
                        title="Preview real y pruebas"
                        isOpen={openToolSections.preview}
                        onToggle={() => toggleToolSection('preview', 'preview')}
                      >
                        <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-indigo-500">Laboratorio vinculado</p>
                              <h4 className="mt-1 text-[10px] font-black uppercase tracking-tight text-slate-900">
                                {lockVisibleSurfaceToLivePreview
                                  ? 'La invitacion real se mantiene activa en pantalla'
                                  : isLivePreviewSurfaceActive
                                    ? 'La invitacion real esta activa en pantalla'
                                    : 'Alterna entre editor y preview real'}
                              </h4>
                            </div>
                            <span className="rounded-full border border-indigo-200 bg-white px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-indigo-700">
                              {lockVisibleSurfaceToLivePreview ? 'Live fijo' : isLivePreviewSurfaceActive ? 'Live' : 'Editor'}
                            </span>
                          </div>
                          <p className="text-[8px] leading-4 text-slate-600">
                            {lockVisibleSurfaceToLivePreview
                              ? 'Revisa scroll, animaciones y comportamiento publicado sin salir del diseno real. El modo mover se activa sobre esta misma vista.'
                              : 'Cambia al preview real para revisar scroll, animaciones, carrusel y comportamiento publicado. Vuelve al lienzo editable cuando necesites seleccionar textos o imagenes.'}
                          </p>
                          {!lockVisibleSurfaceToLivePreview ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => onTogglePreviewSurfaceMode?.('editor')}
                                className={`rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                  !isLivePreviewSurfaceActive
                                    ? 'border-transparent bg-indigo-600 text-white'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                Lienzo editable
                              </button>
                              <button
                                type="button"
                                onClick={openPreviewTool}
                                className={`rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                  isLivePreviewSurfaceActive
                                    ? 'border-transparent bg-indigo-600 text-white'
                                    : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                                }`}
                              >
                                Preview real
                              </button>
                            </div>
                          ) : null}
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                key: 'mobile' as const,
                                label: 'Movil',
                                icon: (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="8" y="3.8" width="8" height="16.4" rx="1.8" strokeWidth="1.8" />
                                    <path strokeLinecap="round" strokeWidth="1.8" d="M11 6h2" />
                                  </svg>
                                ),
                              },
                              {
                                key: 'tablet' as const,
                                label: 'Tablet',
                                icon: (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="4.5" width="12" height="15" rx="1.8" strokeWidth="1.8" />
                                  </svg>
                                ),
                              },
                              {
                                key: 'desktop' as const,
                                label: 'Web',
                                icon: (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="4.5" y="5.5" width="15" height="10.8" rx="1.8" strokeWidth="1.8" />
                                    <path strokeLinecap="round" strokeWidth="1.8" d="M10 19h4M8 16.5h8" />
                                  </svg>
                                ),
                              },
                            ].map((device) => (
                              <button
                                key={device.key}
                                type="button"
                                onClick={() => onToggleViewMode?.(device.key)}
                                className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl border px-3 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                  viewMode === device.key
                                    ? 'border-indigo-200 bg-indigo-600 text-white'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                {device.icon}
                                {device.label}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRefreshPreview?.()}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-700 transition-colors hover:bg-indigo-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.85" d="M4.75 12a7.25 7.25 0 0 1 12.37-5.12M19.25 12A7.25 7.25 0 0 1 6.88 17.12M17.12 4.88v3.25h-3.25M6.88 19.12v-3.25h3.25" />
                            </svg>
                            Recargar preview real
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <ToolActionCard
                            label="Bordes"
                            detail="Abre contenedor para radio, color y sombra."
                            icon={panelIcons.container.icon}
                            active={toolPanel === 'container'}
                            included={hasContainer}
                            onClick={openContainerTool}
                          />
                          <ToolActionCard
                            label="Tamanos"
                            detail="Altura de seccion, texto e imagen."
                            icon={panelIcons.section.icon}
                            active={activePane === 'section' || toolPanel === 'text'}
                            included
                            onClick={() => openPanelPane('section')}
                          />
                          <ToolActionCard
                            label="Carrusel"
                            detail="Compruebalo directo en el preview vivo."
                            icon={panelIcons.preview.icon}
                            active
                            included
                            onClick={() => {
                              onToggleViewMode?.('mobile');
                              onRefreshPreview?.();
                            }}
                          />
                          <ToolActionCard
                            label="Capas"
                            detail="Ajusta el orden visual del bloque."
                            icon={panelIcons.layers.icon}
                            active={activePane === 'layers'}
                            included={hasLayerableElements}
                            onClick={() => openPanelPane('layers')}
                          />
                          {hasLocation ? (
                            <ToolActionCard
                              label="Mapa"
                              detail="Edita enlace y vista de Google Maps."
                              icon={panelIcons.location.icon}
                              active={toolPanel === 'location'}
                              included
                              onClick={openLocationTool}
                            />
                          ) : null}
                          {hasMusic ? (
                            <ToolActionCard
                              label="Musica"
                              detail="Sube audio o cambia la pista del bloque."
                              icon={panelIcons.audio.icon}
                              active={toolPanel === 'audio'}
                              included
                              onClick={openAudioTool}
                            />
                          ) : null}
                          {hasItinerary ? (
                            <ToolActionCard
                              label="Programa"
                              detail="Controla iconos, linea y eventos."
                              icon={panelIcons.timeline.icon}
                              active={toolPanel === 'timeline'}
                              included
                              onClick={openTimelineTool}
                            />
                          ) : null}
                        </div>
                      </CollapsibleToolSection>
                    )}

                    {activePane === 'tools' && toolPanel === 'guides' && (
                      <CollapsibleToolSection
                        eyebrow="Mover"
                        title="Herramienta mover"
                        isOpen={openToolSections.guides}
                        onToggle={() => toggleToolSection('guides', 'guides')}
                      >
                        <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600">Alineacion</p>
                            <p className="mt-1 text-[8px] leading-4 text-slate-600">
                              {lockVisibleSurfaceToLivePreview
                                ? 'Mover trabaja directo sobre la invitacion real. No cambia la plantilla visible, solo activa el arrastre independiente.'
                                : 'Al entrar a mover se abre el lienzo editable para arrastrar cada bloque dentro de su seccion y luego puedes volver al preview real.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGuidesVisibilityChange(!showGuides)}
                            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                              showGuides
                                ? 'border-emerald-200 bg-emerald-600 text-white'
                                : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeWidth="1.8" d="M8 4v16M16 4v16M4 8h16M4 16h16" />
                            </svg>
                            {showGuides ? 'Salir de mover' : 'Activar mover'}
                          </button>
                          <div className="rounded-2xl border border-emerald-100 bg-white/85 px-3 py-2 text-[8px] leading-4 text-slate-600">
                              El arrastre ahora solo se activa dentro del modo mover para conservar controles de seccion y evitar movimientos accidentales.
                          </div>
                        </div>
                      </CollapsibleToolSection>
                    )}

                    {activePane === 'tools' && toolPanel === 'addSection' && (
                      <CollapsibleToolSection
                        eyebrow="Seccion"
                        title="Agregar seccion"
                        isOpen={openToolSections.addSection}
                        onToggle={() => toggleToolSection('addSection', 'addSection')}
                      >
                        <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-600">Nueva seccion</p>
                            <p className="mt-1 text-[8px] leading-4 text-slate-600">
                              Inserta un bloque nuevo y luego edita su contenido por separado desde el panel.
                            </p>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {sectionHeights.map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => onAddSection?.(item.value)}
                                className="inline-flex h-10 items-center justify-center rounded-2xl border border-amber-200 bg-white px-3 text-[8px] font-black uppercase tracking-[0.16em] text-amber-700 transition-colors hover:bg-amber-50"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CollapsibleToolSection>
                    )}

                    {activePane === 'tools' && toolPanel === 'globalBackground' && (
                      <CollapsibleToolSection
                        eyebrow="Fondo"
                        title="Fondo general"
                        isOpen={openToolSections.globalBackground}
                        onToggle={() => toggleToolSection('globalBackground', 'globalBackground')}
                      >
                        <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onUpdateGlobalBg?.({ type: 'color', value: safeGlobalColorValue })}
                              className={`flex-1 rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                globalBg?.type === 'color'
                                  ? 'border-rose-200 bg-rose-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              Color
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateGlobalBg?.({ type: 'image', value: globalBg?.type === 'image' ? (globalBg.value || '') : '' })}
                              className={`flex-1 rounded-2xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                globalBg?.type === 'image'
                                  ? 'border-rose-200 bg-rose-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              Imagen
                            </button>
                          </div>

                          {globalBg?.type === 'color' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
                                <input
                                  type="color"
                                  value={safeGlobalColorValue.startsWith('#') ? safeGlobalColorValue : '#ffffff'}
                                  onChange={(e) => onUpdateGlobalBg?.({ type: 'color', value: e.target.value })}
                                  className="h-9 w-10 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => onUpdateGlobalBg?.({ type: 'color', value: 'transparent' })}
                                  className={`rounded-xl border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                                    safeGlobalColorValue === 'transparent'
                                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  Transparente
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <input
                                ref={globalBgImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleGlobalBgImageUpload}
                                className="hidden"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => globalBgImageInputRef.current?.click()}
                                  className="rounded-2xl border border-rose-200 bg-white px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-rose-700 transition-colors hover:bg-rose-50"
                                >
                                  Importar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateGlobalBg?.({ type: 'image', value: '' })}
                                  disabled={!globalBg?.value}
                                  className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Limpiar
                                </button>
                              </div>
                              <input
                                type="text"
                                value={globalBg?.value || ''}
                                onChange={(e) => onUpdateGlobalBg?.({ type: 'image', value: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[8px]"
                                placeholder="URL del fondo global"
                              />
                            </div>
                          )}
                        </div>
                      </CollapsibleToolSection>
                    )}

                    {activePane === 'section' && (
              <CollapsibleToolSection
                eyebrow="Seccion"
                title="Fondo y tamaño"
                isOpen={toolPanel === 'section' && openToolSections.sectionConfig}
                onToggle={() => toggleToolSection('sectionConfig', 'section')}
              >
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-sky-700">Preview</p>
                          <p className="mt-1 text-[8px] leading-4 text-sky-900/75">
                            Reproduce otra vez la invitacion y las animaciones visibles.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRefreshPreview?.()}
                          aria-label="Refrescar invitacion"
                          title="Refrescar invitacion"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600 shadow-[0_10px_20px_rgba(2,132,199,0.12)] transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.85}
                              d="M4.75 12a7.25 7.25 0 0112.37-5.12M19.25 12A7.25 7.25 0 016.88 17.12M17.12 4.88v3.25h-3.25M6.88 19.12v-3.25h3.25"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={panelFieldLabelClass}>Altura</label>
                      <div className="grid grid-cols-4 gap-2">
                        {sectionHeights.map((item) => (
                          <button
                            key={item.value}
                            onClick={() => onUpdate({ height: item.value })}
                            className={`${panelNumericChipClass} ${
                              section.height === item.value
                                ? 'bg-indigo-600 text-white shadow-[0_10px_22px_rgba(79,70,229,0.16)]'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <label className={panelFieldLabelClass}>Fondo</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Usar color de fondo"
                            onClick={() => onUpdate({ bgType: 'color', bgValue: safeSectionColorValue })}
                            className={`${panelIconToggleClass} ${
                              section.bgType === 'color'
                                ? 'border-indigo-200 bg-indigo-600 text-white shadow-[0_10px_22px_rgba(79,70,229,0.16)]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M7 16l8.5-8.5a2.12 2.12 0 1 1 3 3L10 19H7v-3Z" />
                              <path strokeLinecap="round" strokeWidth="1.9" d="M14 6l4 4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            aria-label="Usar imagen de fondo"
                            onClick={() => onUpdate({ bgType: 'image', bgValue: section.bgType === 'image' ? section.bgValue : '' })}
                            className={`${panelIconToggleClass} ${
                              section.bgType === 'image'
                                ? 'border-indigo-200 bg-indigo-600 text-white shadow-[0_10px_22px_rgba(79,70,229,0.16)]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="1.8" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 15l3.2-3.2L13 14.5l2.3-2.3L18 15" />
                              <circle cx="9" cy="9" r="1.2" strokeWidth="1.8" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {section.bgType === 'color' ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M7 16l8.5-8.5a2.12 2.12 0 1 1 3 3L10 19H7v-3Z" />
                                <path strokeLinecap="round" strokeWidth="1.9" d="M14 6l4 4" />
                              </svg>
                            </span>
                            <input
                              type="color"
                              value={safeSectionColorValue.startsWith('#') ? safeSectionColorValue : '#ffffff'}
                              onChange={(e) => onUpdate({ bgValue: e.target.value })}
                              aria-label="Seleccionar color de fondo"
                              className="h-9 w-9 shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-white p-1 transition-all duration-200 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(79,70,229,0.12)]"
                            />
                          </div>
                          <button
                            type="button"
                            aria-label="Usar fondo transparente"
                            onClick={() => onUpdate({ bgType: 'color', bgValue: 'transparent' })}
                            className={`${panelIconToggleClass} ${
                              section.bgValue === 'transparent'
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_10px_20px_rgba(79,70,229,0.12)]'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="5" y="5" width="14" height="14" rx="2" strokeWidth="1.8" strokeDasharray="2.5 2.5" />
                              <path strokeLinecap="round" strokeWidth="1.8" d="M7 17L17 7" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            ref={sectionBgImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSectionBgImageUpload}
                            className="hidden"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => sectionBgImageInputRef.current?.click()}
                              className={`${panelChipButtonClass} h-10 border border-indigo-200 bg-indigo-50 px-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-indigo-700 hover:bg-indigo-100`}
                            >
                              Subir imagen
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdate({ bgType: 'image', bgValue: '' })}
                              disabled={!section.bgValue}
                              className={`${panelChipButtonClass} h-10 border border-gray-200 bg-white px-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                              Limpiar
                            </button>
                          </div>
                          <p className="text-[8px] text-gray-500">
                            Al subirla, se reduce peso y se mantiene buena calidad automaticamente.
                          </p>
                          <input
                            type="text"
                            value={section.bgValue}
                            onChange={(e) => onUpdate({ bgValue: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[9px] font-medium focus:ring-1 focus:ring-indigo-500"
                            placeholder="URL del fondo de sección"
                          />
                          {section.bgValue && (
                            <div
                              className="h-16 w-full rounded-xl border border-gray-100 bg-cover bg-center"
                              style={{ backgroundImage: `url(${section.bgValue})` }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {false && (
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-[0.16em] text-gray-500 block">Fondo de la sección</label>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onUpdate({ bgType: 'color', bgValue: safeSectionColorValue })}
                          className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                            section.bgType === 'color' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Color
                        </button>
                        <button
                          onClick={() => onUpdate({ bgType: 'image', bgValue: section.bgType === 'image' ? section.bgValue : '' })}
                          className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                            section.bgType === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Imagen
                        </button>
                      </div>

                      {section.bgType === 'color' ? (
                        <div className="space-y-2">
                          <input
                            type="color"
                            value={safeSectionColorValue.startsWith('#') ? safeSectionColorValue : '#ffffff'}
                            onChange={(e) => onUpdate({ bgValue: e.target.value })}
                            className="w-full h-8 rounded-xl border border-gray-200 p-1 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdate({ bgType: 'color', bgValue: 'transparent' })}
                            className={`w-full py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                              section.bgValue === 'transparent'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Transparente
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            ref={sectionBgImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSectionBgImageUpload}
                            className="hidden"
                          />
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => sectionBgImageInputRef.current?.click()}
                              className="py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-indigo-100 transition-colors"
                            >
                              Subir imagen
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdate({ bgType: 'image', bgValue: '' })}
                              disabled={!section.bgValue}
                              className="py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Limpiar
                            </button>
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.16em] text-gray-500">
                            Al subirla, se reduce peso y se mantiene buena calidad automaticamente.
                          </p>
                          <input
                            type="text"
                            value={section.bgValue}
                            onChange={(e) => onUpdate({ bgValue: e.target.value })}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[8px] focus:ring-1 focus:ring-indigo-500"
                            placeholder="URL del fondo de sección"
                          />
                          {section.bgValue && (
                            <div
                              className="h-14 w-full border border-gray-100 rounded-xl bg-cover bg-center"
                              style={{ backgroundImage: `url(${section.bgValue})` }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    )}

                    {false && section.type === 'COUNTDOWN' && (
                      <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Countdown</p>
                          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Fecha del evento</h4>
                        </div>
                        <input
                          type="datetime-local"
                          value={section.countdownTargetDate || ''}
                          onChange={(e) => onUpdate({ countdownTargetDate: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                        />
                        <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Tipografia</p>
                            <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Estilo de la cuenta</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Tamaño</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="range"
                                  min={10}
                                  max={40}
                                  value={Math.round(Number(countdownFontSize || 16))}
                                  onChange={(e) => updateCountdownStyle({ fontSize: parseInt(e.target.value || '16', 10) || 16 })}
                                  className="w-full accent-indigo-600"
                                />
                                <input
                                  type="number"
                                  min={10}
                                  max={40}
                                  value={Math.round(Number(countdownFontSize || 16))}
                                  onChange={(e) => updateCountdownStyle({ fontSize: parseInt(e.target.value || '16', 10) || 16 })}
                                  className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
                                />
                              </div>
                            </div>
                            <div className="flex items-end">
                              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M7 16l8.5-8.5a2.12 2.12 0 1 1 3 3L10 19H7v-3Z" />
                                    <path strokeLinecap="round" strokeWidth="1.9" d="M14 6l4 4" />
                                  </svg>
                                </span>
                                <input
                                  type="color"
                                  value={resolveColorPickerValue(countdownTextColor, '#1a1a1a')}
                                  onChange={(e) => updateCountdownStyle({ textColor: e.target.value })}
                                  aria-label="Seleccionar color de la cuenta regresiva"
                                  className="h-9 w-9 cursor-pointer rounded-xl border border-gray-200 bg-white p-1 transition-all duration-200 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(79,70,229,0.12)]"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Peso</label>
                              <select
                                value={String(countdownFontWeight)}
                                onChange={(e) => updateCountdownStyle({ fontWeight: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              >
                                <option value="300">Ligero</option>
                                <option value="400">Regular</option>
                                <option value="500">Medio</option>
                                <option value="700">Negrita</option>
                                <option value="900">Extra</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Fuente</label>
                              <select
                                value={countdownFontFamily}
                                onChange={(e) => updateCountdownStyle({ fontFamily: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              >
                                <option value="Inter">Inter</option>
                                <option value="Playfair Display">Playfair</option>
                                <option value="Dancing Script">Dancing</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => updateCountdownStyle({ fontStyle: 'normal' })}
                              className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                                countdownFontStyle === 'normal' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Normal
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCountdownStyle({ fontStyle: 'italic' })}
                              className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                                countdownFontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Italic
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Escala</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="range"
                                  min={20}
                                  max={300}
                                  value={Math.round(Number(countdownScale || 100))}
                                  onChange={(e) => updateCountdownStyle({ scale: parseInt(e.target.value || '100', 10) || 100 })}
                                  className="w-full accent-indigo-600"
                                />
                                <input
                                  type="number"
                                  min={20}
                                  max={300}
                                  value={Math.round(Number(countdownScale || 100))}
                                  onChange={(e) => updateCountdownStyle({ scale: parseInt(e.target.value || '100', 10) || 100 })}
                                  className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Separacion</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="range"
                                  min={0}
                                  max={96}
                                  value={Math.round(Number(countdownItemGapControl))}
                                  onChange={(e) => updateCountdownStyle({ itemGap: parseInt(e.target.value || '10', 10) || 0 })}
                                  className="w-full accent-indigo-600"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  max={96}
                                  value={Math.round(Number(countdownItemGapControl))}
                                  onChange={(e) => updateCountdownStyle({ itemGap: parseInt(e.target.value || '10', 10) || 0 })}
                                  className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden">
                          {[countdownPreview.days, countdownPreview.hours, countdownPreview.minutes, countdownPreview.seconds].map((value, index) => (
                            <div key={index} className="rounded-xl border border-indigo-100 bg-white px-1 py-1.5 text-center">
                              <div className="text-[10px] font-black text-indigo-700">{value}</div>
                              <div className="text-[6px] font-black uppercase tracking-[0.14em] text-gray-400">
                                {['Días', 'Hrs', 'Min', 'Seg'][index]}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4">
                          <CountdownDisplay
                            parts={countdownPreview}
                            fontSize={Math.min(countdownFontSize, 18)}
                            fontFamily={countdownFontFamily}
                            fontWeight={countdownFontWeight}
                            fontStyle={countdownFontStyle}
                            textColor={countdownTextColor}
                            scale={countdownScale}
                            itemGap={countdownItemGap}
                          />
                        </div>
                        <p className="text-[7px] text-gray-500 uppercase">
                          {countdownPreview.hasTarget
                            ? countdownPreview.isComplete
                              ? 'La cuenta ya lleg? a cero.'
                              : 'El conteo iniciará automáticamente en la vista final.'
                            : 'Define fecha y hora para activar el conteo.'}
                        </p>
                        <button
                          type="button"
                          onClick={removeCountdown}
                          className="w-full rounded-xl border border-red-200 bg-red-50 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-100"
                        >
                          Quitar cuenta regresiva
                        </button>
                      </div>
                    )}

                    {section.type !== 'BLANK' && (
                      <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Desplazamiento</p>
                          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Mostrar con botón</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onUpdate({ revealOnDemand: !section.revealOnDemand })}
                          className={`w-full rounded-xl border py-1.5 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                            section.revealOnDemand
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {section.revealOnDemand ? 'Sección oculta hasta tocar el botón' : 'Mostrar siempre esta sección'}
                        </button>
                        {section.revealOnDemand && (
                          <>
                            <input
                              type="text"
                              value={section.revealButtonLabel || ''}
                              onChange={(e) => onUpdate({ revealButtonLabel: e.target.value })}
                              className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                              placeholder="Texto del botón"
                            />
                            <p className="text-[7px] text-gray-500 uppercase">
                              El botón se verá como: {revealButtonLabelPreview}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={clearSection}
                      className="w-full py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-red-100 transition-colors"
                    >
                      Vaciar contenido
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.()}
                      disabled={!onDelete}
                      className="w-full py-2 rounded-xl border border-red-300 bg-red-600 text-white text-[8px] font-black uppercase tracking-[0.16em] hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Eliminar sección
                    </button>
              </CollapsibleToolSection>
                    )}

              {activePane === 'tools' && toolPanel === 'countdown' && (
                <CollapsibleToolSection
                  eyebrow="Countdown"
                  title="Cuenta regresiva"
                  isOpen={openToolSections.countdown}
                  onToggle={() => toggleToolSection('countdown', 'countdown')}
                >
                  {countdownPanel || (
                    <button
                      type="button"
                      onClick={enableCountdown}
                      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      Agregar cuenta
                    </button>
                  )}
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'location' && (
                <CollapsibleToolSection
                  eyebrow="Ubicacion"
                  title="Google Maps"
                  isOpen={openToolSections.location}
                  onToggle={() => toggleToolSection('location', 'location')}
                >
                  {locationPanel || (
                    <button
                      type="button"
                      onClick={enableLocation}
                      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      Agregar ubicacion
                    </button>
                  )}
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'text' && (
                <CollapsibleToolSection
                  eyebrow="Texto"
                  title="Color, tamaño y estilo"
                  isOpen={openToolSections.text}
                  onToggle={() => toggleToolSection('text', 'text')}
                >
                  {!hasItinerary && (
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={enableTitle}
                        className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${getElementButtonClass(hasTitle, activeTextElement === 'title')}`}
                      >
                        Agregar titulo
                      </button>
                      <button
                        onClick={enableSubtitle}
                        className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${getElementButtonClass(hasSubtitle, activeTextElement === 'subtitle')}`}
                      >
                        Agregar subtitulo
                      </button>
                      <button
                        onClick={enableContent}
                        className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${getElementButtonClass(hasContent, activeTextElement === 'content')}`}
                      >
                        Agregar texto
                      </button>
                    </div>
                  )}

                  {hasItinerary ? null : selectedTextElement ? (
                    <div className="space-y-2">
                      {selectedTextElement.kind === 'content' ? (
                        <textarea
                          value={selectedTextElement.value}
                          onChange={(e) => updateSelectedRepeatableElement({ value: e.target.value })}
                          className="w-full min-h-20 px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px] resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={selectedTextElement.value}
                          onChange={(e) => updateSelectedRepeatableElement({ value: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                        />
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Tamaño</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min={8}
                          max={72}
                          value={Math.round(Number(textSize || 14))}
                          onChange={(e) => {
                            const nextFontSize = parseInt(e.target.value || '14', 10) || 14;
                            if (hasItinerary) {
                              onUpdate({ fontSize: nextFontSize });
                              return;
                            }
                            updateSelectedTextStyle({ fontSize: nextFontSize });
                          }}
                          disabled={!canEditTextStyle}
                          className="w-full accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                        <input
                          type="number"
                          min={8}
                          max={72}
                          value={Math.round(Number(textSize || 14))}
                          onChange={(e) => {
                            const nextFontSize = parseInt(e.target.value || '14', 10) || 14;
                            if (hasItinerary) {
                              onUpdate({ fontSize: nextFontSize });
                              return;
                            }
                            updateSelectedTextStyle({ fontSize: nextFontSize });
                          }}
                          disabled={!canEditTextStyle}
                          className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px] disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M7 16l8.5-8.5a2.12 2.12 0 1 1 3 3L10 19H7v-3Z" />
                            <path strokeLinecap="round" strokeWidth="1.9" d="M14 6l4 4" />
                          </svg>
                        </span>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => {
                            if (hasItinerary) {
                              onUpdate({ textColor: e.target.value });
                              return;
                            }
                            updateSelectedTextStyle({ textColor: e.target.value });
                          }}
                          aria-label="Seleccionar color del texto"
                          disabled={!canEditTextStyle}
                          className="h-9 w-9 cursor-pointer rounded-xl border border-gray-200 bg-white p-1 transition-all duration-200 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(79,70,229,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Peso</label>
                      <select
                        value={String(textWeight)}
                        onChange={(e) => {
                          if (hasItinerary) {
                            onUpdate({ fontWeight: e.target.value });
                            return;
                          }
                          updateSelectedTextStyle({ fontWeight: e.target.value });
                        }}
                        disabled={!canEditTextStyle}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <option value="300">Ligero</option>
                        <option value="400">Regular</option>
                        <option value="500">Medio</option>
                        <option value="700">Negrita</option>
                        <option value="900">Extra</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Fuente</label>
                      <select
                        value={textFontFamily}
                        onChange={(e) => {
                          if (hasItinerary) {
                            onUpdate({ fontFamily: e.target.value });
                            return;
                          }
                          updateSelectedTextStyle({ fontFamily: e.target.value });
                        }}
                        disabled={!canEditTextStyle}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">Playfair</option>
                        <option value="Dancing Script">Dancing</option>
                      </select>
                    </div>
                  </div>

                  {!hasItinerary && (
                    <div className="grid grid-cols-3 gap-1">
                      {alignments.map((align) => (
                        <button
                          key={align.value}
                          onClick={() => updateSelectedTextStyle({ textAlign: align.value })}
                          disabled={!selectedTextElement}
                          className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                            textAlign === align.value ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          } ${!selectedTextElement ? 'cursor-not-allowed opacity-40 hover:bg-gray-50' : ''}`}
                        >
                          {align.icon}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        if (hasItinerary) {
                          onUpdate({ fontStyle: 'normal' });
                          return;
                        }
                        updateSelectedTextStyle({ fontStyle: 'normal' });
                      }}
                      disabled={!canEditTextStyle}
                      className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                        textFontStyle === 'normal' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      } ${!canEditTextStyle ? 'cursor-not-allowed opacity-40 hover:bg-gray-50' : ''}`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => {
                        if (hasItinerary) {
                          onUpdate({ fontStyle: 'italic' });
                          return;
                        }
                        updateSelectedTextStyle({ fontStyle: 'italic' });
                      }}
                      disabled={!canEditTextStyle}
                      className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                        textFontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      } ${!canEditTextStyle ? 'cursor-not-allowed opacity-40 hover:bg-gray-50' : ''}`}
                    >
                      Italic
                    </button>
                  </div>
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'image' && (
                <CollapsibleToolSection
                  eyebrow="Imagen"
                  title="Contenido visual"
                  isOpen={openToolSections.image}
                  onToggle={() => toggleToolSection('image', 'image')}
                >
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={enableMainImage}
                      className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                        imagePanelTarget === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Principal
                    </button>
                    <button
                      onClick={enableContentImage}
                      className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                        imagePanelTarget === 'contentImage' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Complementaria
                    </button>
                  </div>

                  <input
                    ref={sectionImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSectionImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={contentImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSectionImageUpload}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        imagePanelTarget === 'image'
                          ? sectionImageInputRef.current?.click()
                          : contentImageInputRef.current?.click()
                      }
                      className="py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-indigo-100 transition-colors"
                    >
                      Agregar imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (imagePanelTarget === 'image') {
                          removeMainImage();
                          return;
                        }
                        removeContentImage();
                      }}
                      disabled={!currentImageUrl}
                      className="py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Limpiar
                    </button>
                  </div>

                  {hasCurrentImageSource ? (
                    <>
                      <div
                        className="h-16 w-full border border-gray-100 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${currentImageUrl})` }}
                      />

                      {imagePanelTarget === 'image' ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Ancho</label>
                              <input
                                type="number"
                                min={80}
                                max={520}
                                value={Math.round(currentImageStyle?.width ?? 260)}
                                onChange={(e) => updateImageStyle({ width: Math.max(80, Math.min(520, parseInt(e.target.value || '260', 10))) })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              />
                            </div>
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Alto</label>
                              <input
                                type="number"
                                min={80}
                                max={520}
                                value={Math.round(currentImageStyle?.height ?? 300)}
                                onChange={(e) => updateImageStyle({ height: Math.max(80, Math.min(520, parseInt(e.target.value || '300', 10))) })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Escala %</label>
                              <input
                                type="number"
                                min={20}
                                max={300}
                                value={Math.round(imageScaleValue)}
                                onChange={(e) => updateImageStyle({ scale: Math.max(20, Math.min(300, parseInt(e.target.value || '100', 10))) })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              />
                            </div>
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Ajuste</label>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => updateImageStyle({ fit: 'contain' })}
                                  className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${
                                    mainImageFit === 'contain' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Contener
                                </button>
                                <button
                                  onClick={() => updateImageStyle({ fit: 'cover' })}
                                  className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${
                                    mainImageFit === 'cover' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Cubrir
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => updateImageStyle({ asSectionBackground: !currentImageStyle?.asSectionBackground })}
                            className={`w-full py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                              currentImageStyle?.asSectionBackground
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {currentImageStyle?.asSectionBackground ? 'Imagen usada como fondo' : 'Usar imagen como fondo'}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Ancho</label>
                              <input
                                type="number"
                                min={80}
                                max={520}
                                value={Math.round(currentImageStyle?.width ?? 220)}
                                onChange={(e) => updateContentImageStyle({ width: Math.max(80, Math.min(520, parseInt(e.target.value || '220', 10))) })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              />
                            </div>
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Alto</label>
                              <input
                                type="number"
                                min={80}
                                max={520}
                                value={Math.round(currentImageStyle?.height ?? 200)}
                                onChange={(e) => updateContentImageStyle({ height: Math.max(80, Math.min(520, parseInt(e.target.value || '200', 10))) })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Escala %</label>
                              <input
                                type="number"
                                min={20}
                                max={300}
                                value={Math.round(contentImageScaleValue)}
                                onChange={(e) => updateContentImageStyle({ scale: Math.max(20, Math.min(300, parseInt(e.target.value || '100', 10))) })}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-[8px]"
                              />
                            </div>
                            <div>
                              <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Ajuste</label>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => updateContentImageStyle({ fit: 'contain' })}
                                  className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${
                                    contentImageFit === 'contain' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Contener
                                </button>
                                <button
                                  onClick={() => updateContentImageStyle({ fit: 'cover' })}
                                  className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${
                                    contentImageFit === 'cover' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Cubrir
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[8px] uppercase tracking-[0.16em] text-gray-400">
                      Aún no hay una imagen importada.
                    </div>
                  )}
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'container' && (
                <CollapsibleToolSection
                  eyebrow="Contenedor"
                  title="Caja con borde"
                  isOpen={openToolSections.container}
                  onToggle={() => toggleToolSection('container', 'container')}
                >
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={enableContainer}
                      className="rounded-xl border border-indigo-200 bg-indigo-50 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      {hasContainer ? 'Seleccionar' : 'Agregar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => addRepeatableElement('container', 'container')}
                      className="rounded-xl border border-gray-200 bg-white py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Nuevo
                    </button>
                  </div>

                  {currentContainerStyle ? (
                    <>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Base</p>
                            <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Tamaño y borde</h4>
                          </div>
                          <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-gray-500">
                            {containerCount} cont.
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Ancho</label>
                            <input
                              type="number"
                              min={60}
                              max={640}
                              value={Math.round(currentContainerStyle.width ?? 240)}
                              onChange={(e) => updateContainerStyle({ width: Math.max(60, Math.min(640, parseInt(e.target.value || '240', 10))) })}
                              className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                            />
                          </div>
                          <div>
                            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Alto</label>
                            <input
                              type="number"
                              min={40}
                              max={640}
                              value={Math.round(currentContainerStyle.height ?? 140)}
                              onChange={(e) => updateContainerStyle({ height: Math.max(40, Math.min(640, parseInt(e.target.value || '140', 10))) })}
                              className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                            />
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Borde</label>
                            <input
                              type="number"
                              min={0}
                              max={24}
                              value={Math.round(currentContainerStyle.borderWidth ?? 2)}
                              onChange={(e) => updateContainerStyle({ borderWidth: Math.max(0, Math.min(24, parseInt(e.target.value || '2', 10))) })}
                              className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                            />
                          </div>
                          <div>
                            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Radio</label>
                            <input
                              type="number"
                              min={0}
                              max={96}
                              value={Math.round(currentContainerStyle.borderRadius ?? 24)}
                              onChange={(e) => updateContainerStyle({ borderRadius: Math.max(0, Math.min(96, parseInt(e.target.value || '24', 10))) })}
                              className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                            />
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Fondo</label>
                            <input
                              type="color"
                              value={safeContainerBackgroundColor.startsWith('#') ? safeContainerBackgroundColor : '#ffffff'}
                              onChange={(e) => updateContainerStyle({ backgroundColor: e.target.value })}
                              className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                            />
                          </div>
                          <div>
                            <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Borde color</label>
                            <input
                              type="color"
                              value={safeContainerBorderColor.startsWith('#') ? safeContainerBorderColor : '#1f2937'}
                              onChange={(e) => updateContainerStyle({ borderColor: e.target.value })}
                              className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                            />
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => updateContainerStyle({ backgroundColor: 'transparent' })}
                            className={`rounded-xl border py-1.5 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                              currentContainerStyle.backgroundColor === 'transparent'
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Transparente
                          </button>
                          <button
                            type="button"
                            onClick={() => updateContainerStyle({ shadow: !currentContainerStyle.shadow })}
                            className={`rounded-xl border py-1.5 text-[8px] font-black uppercase tracking-[0.16em] transition-colors ${
                              currentContainerStyle.shadow
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {currentContainerStyle.shadow ? 'Con sombra' : 'Sin sombra'}
                          </button>
                        </div>

                        <div className="mt-2">
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Opacidad</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Math.round(currentContainerStyle.opacity ?? 100)}
                              onChange={(e) => updateContainerStyle({ opacity: Math.max(0, Math.min(100, parseInt(e.target.value || '100', 10))) })}
                              className="w-full accent-indigo-600"
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={Math.round(currentContainerStyle.opacity ?? 100)}
                              onChange={(e) => updateContainerStyle({ opacity: Math.max(0, Math.min(100, parseInt(e.target.value || '100', 10))) })}
                              className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                        <div className="mb-2">
                          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Animacion</p>
                          <h4 className="text-[10px] font-black uppercase tracking-tight text-gray-900">Entrada del contenedor</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          {animationOptions.map((option) => (
                            <button
                              key={`container-${option.value}`}
                              type="button"
                              onClick={() => updateContainerStyle({ animation: { type: option.value } })}
                              className={`rounded-xl py-1.5 text-[8px] font-black uppercase tracking-[0.14em] transition-all ${
                                selectedContainerAnimationType === option.value ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        <div className="mt-2">
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Duracion (s)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min={0.2}
                              max={2}
                              step={0.1}
                              value={selectedContainerAnimationDuration}
                              onChange={(e) => updateContainerStyle({ animation: { duration: Math.max(0.2, Math.min(2, parseFloat(e.target.value) || 0.6)) } })}
                              className="w-full accent-indigo-600"
                            />
                            <input
                              type="number"
                              min={0.2}
                              max={2}
                              step={0.1}
                              value={selectedContainerAnimationDuration.toFixed(1)}
                              onChange={(e) => updateContainerStyle({ animation: { duration: Math.max(0.2, Math.min(2, parseFloat(e.target.value) || 0.6)) } })}
                              className="w-14 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[8px]"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeContainer}
                        className="w-full rounded-xl border border-red-200 bg-red-50 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-100"
                      >
                        Quitar contenedor
                      </button>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[8px] uppercase tracking-[0.16em] text-gray-400">
                      Aún no hay un contenedor en esta sección.
                    </div>
                  )}
                </CollapsibleToolSection>
              )}

              {activePane === 'layers' && toolPanel === 'layers' && (
                <CollapsibleToolSection
                  eyebrow="Capas"
                  title="Orden visual"
                  isOpen={openToolSections.layers}
                  onToggle={() => toggleToolSection('layers', 'layers')}
                >
                  {hasLayerableElements ? (
                    <div className="space-y-2">
                      <p className="text-[8px] text-gray-500 uppercase">
                        Arriba aparece el elemento mas al frente.
                      </p>

                      {layerOrderedElements.map((element, index) => {
                        const isActiveLayer = selectedRepeatableElement?.id === element.id;

                        return (
                          <div
                            key={element.id}
                            className={`rounded-2xl border p-2 transition-colors ${
                              isActiveLayer
                                ? 'border-indigo-200 bg-indigo-50/70'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => onSelectElement?.(element.kind, element.id)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <p className="truncate text-[9px] font-black uppercase tracking-[0.14em] text-gray-900">
                                  {getLayerElementLabel(element)}
                                </p>
                                <p className="mt-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">
                                  {panelIcons[element.kind === 'container' ? 'container' : element.kind === 'image' || element.kind === 'contentImage' ? 'image' : 'text']?.label || element.kind}
                                  {' • '}Capa {getSectionElementLayer(element)}
                                  {index === 0 ? ' • Frente' : index === layerOrderedElements.length - 1 ? ' • Fondo' : ''}
                                </p>
                              </button>

                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  title="Subir una capa"
                                  onClick={() => reorderLayerElement(element.id, 'forward')}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V6m0 0l-4 4m4-4l4 4" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  title="Bajar una capa"
                                  onClick={() => reorderLayerElement(element.id, 'backward')}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m0 0l-4-4m4 4l4-4" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[8px] uppercase tracking-[0.16em] text-gray-400">
                      Aún no hay elementos para ordenar en capas.
                    </div>
                  )}
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'audio' && (
                <CollapsibleToolSection
                  eyebrow="Audio"
                  title="Reproductor de música"
                  isOpen={openToolSections.audio}
                  onToggle={() => toggleToolSection('audio', 'audio')}
                >
                  {section.type !== 'MUSIC' && !section.audioUrl && (
                    <button
                      onClick={enableMusic}
                      className="w-full py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-indigo-100 transition-colors"
                    >
                      Agregar musica
                    </button>
                  )}

                  <input
                    ref={musicAudioInputRef}
                    type="file"
                    accept=".mp3,audio/mpeg,audio/mp3"
                    onChange={handleMusicAudioUpload}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => musicAudioInputRef.current?.click()}
                      className="py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-indigo-100 transition-colors"
                    >
                      Subir MP3
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate({ audioUrl: '' })}
                      disabled={!section.audioUrl}
                      className="py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase tracking-[0.16em] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Limpiar
                    </button>
                  </div>

                    <input
                      type="text"
                      value={section.audioUrl || ''}
                      onChange={(e) => applySectionUpdates({ type: 'MUSIC', audioUrl: e.target.value }, 'audio')}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[8px] focus:ring-1 focus:ring-indigo-500"
                    placeholder="URL o base64 del audio"
                  />

                  {section.audioUrl ? (
                    <audio
                      controls
                      preload="metadata"
                      src={section.audioUrl}
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : null}
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'animation' && (
                <CollapsibleToolSection
                  eyebrow="Animaciones"
                  title="Movimiento y entrada"
                  isOpen={openToolSections.animation}
                  onToggle={() => toggleToolSection('animation', 'animation')}
                >
                  {!selectedRepeatableElement ? null : (
                    <>
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-2">
                        <p className={`mt-2 text-[7px] font-black uppercase tracking-[0.16em] ${
                          selectedElementHasAnimation ? 'text-indigo-700' : 'text-gray-500'
                        }`}>
                          {repeatableElementLabels[selectedRepeatableElement.kind]}: {selectedElementHasAnimation ? 'animacion activa' : 'sin animacion'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        {animationOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateSelectedElementAnimation({ type: option.value })}
                            className={`py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.14em] transition-all ${
                              selectedAnimationType === option.value ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Duracion (s)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min={0.2}
                            max={2}
                            step={0.1}
                            value={selectedAnimationDuration}
                            onChange={(e) => updateSelectedElementAnimation({ duration: parseFloat(e.target.value) || 0.6 })}
                            className="w-full accent-indigo-600"
                          />
                          <input
                            type="number"
                            min={0.2}
                            max={2}
                            step={0.1}
                            value={selectedAnimationDuration.toFixed(1)}
                            onChange={(e) => updateSelectedElementAnimation({ duration: Math.max(0.2, Math.min(2, parseFloat(e.target.value) || 0.6)) })}
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-[8px]"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CollapsibleToolSection>
              )}

              {activePane === 'tools' && toolPanel === 'timeline' && (
                <CollapsibleToolSection
                  eyebrow="Itinerario"
                  title="Eventos intercalados"
                  isOpen={openToolSections.timeline}
                  onToggle={() => toggleToolSection('timeline', 'timeline')}
                >
                  {!hasItinerary ? (
                    <button
                      onClick={enableItinerary}
                      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      Agregar itinerario
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Fuente hora</label>
                          <select
                            value={itineraryStyle.timeFontFamily}
                            onChange={(e) => updateItineraryStyle({ timeFontFamily: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                          >
                            <option value="Playfair Display">Playfair</option>
                            <option value="Inter">Inter</option>
                            <option value="Dancing Script">Dancing</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Tamaño hora</label>
                          <input
                            type="number"
                            min={10}
                            max={32}
                            value={Math.round(itineraryStyle.timeFontSize)}
                            onChange={(e) => updateItineraryStyle({ timeFontSize: Math.max(10, Math.min(32, parseInt(e.target.value || '16', 10))) })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Línea</label>
                          <input
                            type="color"
                            value={itineraryStyle.lineColor}
                            onChange={(e) => updateItineraryStyle({ lineColor: e.target.value })}
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                          />
                        </div>
                        <div>
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Puntos</label>
                          <input
                            type="color"
                            value={itineraryStyle.dotColor}
                            onChange={(e) => updateItineraryStyle({ dotColor: e.target.value })}
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                          />
                        </div>
                        <div>
                          <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Iconos</label>
                          <input
                            type="color"
                            value={itineraryStyle.iconColor}
                            onChange={(e) => updateItineraryStyle({ iconColor: e.target.value })}
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                          />
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-gray-200 bg-slate-50/80 p-3">
                        <div className="mb-3">
                          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Vista previa</p>
                        </div>
                        <div className="rounded-[28px] border border-black/5 bg-[#bfe7f0] px-3 py-4">
                          <ItineraryTimeline
                            items={itineraryItems}
                            textColor={section.textColor || '#1a1a1a'}
                            fontFamily={section.fontFamily || 'Inter'}
                            fontSize={section.fontSize || 16}
                            fontWeight={section.fontWeight || '600'}
                            fontStyle={section.fontStyle || 'normal'}
                            styleConfig={section.itineraryStyle}
                            compact
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-gray-700">Eventos</p>
                          <p className="text-[7px] uppercase tracking-[0.14em] text-gray-400">Se intercalan automáticamente.</p>
                        </div>
                        <button
                          type="button"
                          onClick={addItineraryOption}
                          className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-700 transition-colors hover:bg-indigo-100"
                        >
                          Agregar
                        </button>
                      </div>

                      {itineraryItems.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[8px] uppercase tracking-[0.16em] text-gray-400">
                          Aún no hay eventos.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {itineraryItems.map((item, index) => (
                            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                                    {renderItineraryIcon(item.icon, 'h-4 w-4')}
                                  </span>
                                  <div>
                                    <p className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400">Evento {index + 1}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveItineraryItem(item.id, 'up')}
                                    disabled={index === 0}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveItineraryItem(item.id, 'down')}
                                    disabled={index === itineraryItems.length - 1}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItineraryItem(item.id)}
                                    aria-label="Quitar evento"
                                    title="Quitar evento"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M9.5 11v5M14.5 11v5M6.5 7l1 11a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8l1-11M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Hora</label>
                                  <input
                                    type="text"
                                    value={item.time}
                                    onChange={(e) => updateItineraryItem(item.id, { time: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                                    placeholder="04:00 pm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Icono</label>
                                  <select
                                    value={item.icon}
                                    onChange={(e) => updateItineraryItem(item.id, { icon: e.target.value as typeof item.icon })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                                  >
                                    {ITINERARY_ICON_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="mt-2">
                                <label className="text-[7px] font-black uppercase tracking-[0.16em] text-gray-400 block">Texto</label>
                                <textarea
                                  value={item.title}
                                  onChange={(e) => updateItineraryItem(item.id, { title: e.target.value })}
                                  className="w-full min-h-16 resize-none rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[8px]"
                                  placeholder="Ceremonia religiosa"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={removeItinerary}
                        className="w-full rounded-xl border border-red-200 bg-red-50 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-100"
                      >
                        Quitar itinerario
                      </button>
                    </div>
                  )}
                </CollapsibleToolSection>
              )}
                </div>
              </div>
            </div>
            </>
          )}
        </div>
    </div>
  );
};
