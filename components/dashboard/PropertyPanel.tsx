import React from 'react';
import { Section, SectionAnimationType, SectionHeight, TextAlignment } from '../../types';
import { optimizeImageFileToDataUrl } from '../../lib/imageOptimization';

type ActiveTextElement = 'title' | 'subtitle' | 'content' | 'image' | 'contentImage' | null;
type PanelTab = 'general' | 'tools';

interface PropertyPanelProps {
  section?: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete?: () => void;
  onMove?: (direction: 'up' | 'down') => void;
  onAdd?: (type: Section['type'], height?: SectionHeight) => void;
  activeTextElement?: ActiveTextElement;
  globalBg?: { type: 'color' | 'image'; value: string };
  onUpdateGlobalBg?: (bg: { type: 'color' | 'image'; value: string }) => void;
  showGuides?: boolean;
  onToggleGuides?: (show: boolean) => void;
  viewMode?: 'mobile' | 'tablet' | 'desktop';
  onToggleViewMode?: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  canAddElements?: boolean;
}

const iconClass = 'w-4 h-4';

const sectionTypes: { type: Section['type']; label: string; icon: React.ReactNode }[] = [
  {
    type: 'HERO',
    label: 'Titulo',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10M4 17h8" />
      </svg>
    )
  },
  {
    type: 'MESSAGE',
    label: 'Mensaje',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
      </svg>
    )
  },
  {
    type: 'DETAILS',
    label: 'Detalles',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h11M9 9h11M9 13h11M9 17h11M5 5h.01M5 9h.01M5 13h.01M5 17h.01" />
      </svg>
    )
  },
  {
    type: 'LOCATION',
    label: 'Ubicacion',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" strokeWidth="2" />
      </svg>
    )
  },
  {
    type: 'GUESTS',
    label: 'Invitados',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11a4 4 0 10-8 0m10 8a6 6 0 10-12 0" />
      </svg>
    )
  },
  {
    type: 'COUNTDOWN',
    label: 'Cuenta regresiva',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="13" r="8" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4l2 2M9 3h6" />
      </svg>
    )
  },
  {
    type: 'IMAGE',
    label: 'Imagen',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14l2.5-2.5L14 15l2-2 3 3" />
        <circle cx="9" cy="9" r="1.2" strokeWidth="2" />
      </svg>
    )
  },
  {
    type: 'MUSIC',
    label: 'Musica',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18a2 2 0 11-2-2 2 2 0 012 2zm10-2a2 2 0 11-2-2 2 2 0 012 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18V6l10-2v12" />
      </svg>
    )
  },
  {
    type: 'FOOTER',
    label: 'Cierre',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M4 5h16M8 9h8v6H8z" />
      </svg>
    )
  },
  {
    type: 'BLANK',
    label: 'Limpia',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
      </svg>
    )
  },
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

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  section,
  onUpdate,
  onDelete,
  onAdd,
  activeTextElement,
  globalBg,
  onUpdateGlobalBg,
  showGuides,
  onToggleGuides,
  viewMode = 'mobile',
  onToggleViewMode,
  canAddElements = true
}) => {
  const [panelTab, setPanelTab] = React.useState<PanelTab>('general');
  const globalBgImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const sectionBgImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const sectionImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const contentImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const musicAudioInputRef = React.useRef<HTMLInputElement | null>(null);
  const isValidColorValue = (value?: string) => !!value && (value === 'transparent' || value.startsWith('#'));
  const safeGlobalColorValue = isValidColorValue(globalBg?.value) ? (globalBg?.value as string) : '#ffffff';

  React.useEffect(() => {
    const hasElementSelection = activeTextElement === 'title'
      || activeTextElement === 'subtitle'
      || activeTextElement === 'content'
      || activeTextElement === 'image'
      || activeTextElement === 'contentImage';

    if (hasElementSelection) {
      setPanelTab('tools');
    }
  }, [activeTextElement]);

  const heights: { value: SectionHeight; label: string }[] = [
    { value: '25', label: 'S 25' },
    { value: '50', label: 'M 50' },
    { value: '75', label: 'L 75' },
    { value: '100', label: 'XL 100' },
  ];
  const blankSectionHeights: SectionHeight[] = ['25', '50', '75', '100'];

  const alignments: { value: TextAlignment; icon: string }[] = [
    { value: 'left', icon: 'IZQ' },
    { value: 'center', icon: 'CENT' },
    { value: 'right', icon: 'DER' },
  ];

  const activeToolContext: 'text' | 'image' | 'section' = activeTextElement === 'image' || activeTextElement === 'contentImage'
    ? 'image'
    : activeTextElement === 'title' || activeTextElement === 'subtitle' || activeTextElement === 'content'
      ? 'text'
      : 'section';

  const textSize = section?.fontSize || 14;
  const textColor = section?.textColor || '#1a1a1a';
  const textAlign = section?.alignment || 'center';
  const textWeight = section?.fontWeight || '600';
  const textFontFamily = section?.fontFamily || 'Inter';
  const textFontStyle = section?.fontStyle || 'normal';
  const selectedAnimationType: SectionAnimationType = section?.animation?.type || 'none';
  const selectedAnimationDuration = Math.max(0.2, Math.min(2, section?.animation?.duration ?? 0.6));

  const clampImageScale = (value?: number) => Math.max(20, Math.min(300, value ?? 100));
  const imageScaleValue = clampImageScale(section?.imageStyle?.scale);
  const contentImageScaleValue = clampImageScale(section?.contentImageStyle?.scale);
  const imageFit = section?.imageStyle?.fit === 'cover' ? 'cover' : 'contain';
  const contentImageFit = section?.contentImageStyle?.fit === 'cover' ? 'cover' : 'contain';
  const activeImageTarget: 'image' | 'contentImage' | null = activeTextElement === 'image'
    ? 'image'
    : activeTextElement === 'contentImage'
      ? 'contentImage'
      : section?.type === 'IMAGE' || section?.bgType === 'image'
        ? 'image'
        : section?.contentImageUrl
          ? 'contentImage'
          : null;
  const isSectionBackgroundImageTarget = !!section && section.bgType === 'image' && section.type !== 'IMAGE';
  const selectedImageUrl = isSectionBackgroundImageTarget ? (section?.bgValue || '') : (section?.imageUrl || '');

  const updateSelectedImageUrl = (value: string) => {
    if (!section) return;

    if (isSectionBackgroundImageTarget) {
      onUpdate({ bgType: 'image', bgValue: value });
      return;
    }

    onUpdate({ imageUrl: value });
  };

  const updateImageStyle = (updates: Partial<NonNullable<Section['imageStyle']>>) => {
    if (!section) return;
    onUpdate({
      imageStyle: {
        scale: 100,
        fit: 'contain',
        asSectionBackground: false,
        ...section.imageStyle,
        ...updates
      }
    });
  };

  const updateContentImageStyle = (updates: Partial<NonNullable<Section['contentImageStyle']>>) => {
    if (!section) return;
    onUpdate({
      contentImageStyle: {
        scale: 100,
        fit: 'contain',
        asSectionBackground: false,
        ...section.contentImageStyle,
        ...updates
      }
    });
  };

  const updateSectionAnimation = (updates: Partial<NonNullable<Section['animation']>>) => {
    if (!section) return;
    onUpdate({
      animation: {
        type: 'none',
        duration: 0.6,
        ...section.animation,
        ...updates
      }
    });
  };

  const readLocalImageAsDataUrl = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    // Permite volver a seleccionar el mismo archivo si se necesita.
    event.target.value = '';

    const dataUrl = await optimizeImageFileToDataUrl(file, {
      maxDimension: 1800,
      quality: 0.84,
      minBytesToProcess: 140 * 1024
    });

    onSuccess(dataUrl);
  };

  const handleGlobalBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    void readLocalImageAsDataUrl(event, (dataUrl) => {
      onUpdateGlobalBg?.({ type: 'image', value: dataUrl });
    });
  };

  const handleSectionBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    void readLocalImageAsDataUrl(event, (dataUrl) => {
      onUpdate({ bgType: 'image', bgValue: dataUrl });
    });
  };

  const handleSectionImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    void readLocalImageAsDataUrl(event, (dataUrl) => {
      updateSelectedImageUrl(dataUrl);
    });
  };

  const handleContentImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    void readLocalImageAsDataUrl(event, (dataUrl) => {
      onUpdate({ contentImageUrl: dataUrl });
    });
  };

  const handleMusicAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type && !file.type.startsWith('audio/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdate({ audioUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  return (
    <div className="bg-white p-2 rounded-none border border-gray-100 shadow-none h-full overflow-y-auto custom-scrollbar">
      <div className="mb-3">
        <div className="flex bg-gray-100 p-0.5 rounded-md">
          <button
            onClick={() => setPanelTab('general')}
            className={`flex-1 py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
              panelTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setPanelTab('tools')}
            className={`flex-1 py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
              panelTab === 'tools' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Herramientas
          </button>
        </div>
      </div>

      {panelTab === 'general' && (
        <>
      <div className="mb-4">
        <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Vista previa</h3>
        <div className="flex bg-gray-100 p-0.5 rounded-md">
          <button
            onClick={() => onToggleViewMode?.('mobile')}
            className={`flex-1 py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              viewMode === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="7" y="2.5" width="10" height="19" rx="2" strokeWidth="2" />
              <circle cx="12" cy="18" r="0.8" strokeWidth="2" />
            </svg>
            Movil
          </button>
          <button
            onClick={() => onToggleViewMode?.('tablet')}
            className={`flex-1 py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              viewMode === 'tablet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="3" width="14" height="18" rx="1.8" strokeWidth="2" />
              <circle cx="12" cy="18" r="0.9" strokeWidth="2" />
            </svg>
            Tablet
          </button>
          <button
            onClick={() => onToggleViewMode?.('desktop')}
            className={`flex-1 py-1.5 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              viewMode === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="12" rx="1.5" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20h6M12 16v4" />
            </svg>
            PC
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-100 my-3" />

      <div className="mb-4">
        <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Agregar elemento</h3>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {sectionTypes.map((item) => (
            <button
              key={item.type}
              disabled={!canAddElements}
              onClick={() => onAdd?.(item.type)}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
            >
              <span className="text-gray-700 group-hover:text-indigo-600 mb-0.5">{item.icon}</span>
              <span className="text-[7px] font-black text-gray-600 group-hover:text-indigo-600 uppercase tracking-tight text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1 mb-2">
          {blankSectionHeights.map((height) => (
            <button
              key={`blank-${height}`}
              onClick={() => onAdd?.('BLANK', height)}
              className="py-1.5 px-2 text-[8px] font-bold uppercase tracking-tight border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              Agregar seccion limpia ({height}%)
            </button>
          ))}
        </div>

        {!canAddElements && (
          <p className="text-[8px] text-amber-600 uppercase mb-2">
            Primero agrega una seccion limpia para habilitar nuevos elementos.
          </p>
        )}

        <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-tight mb-2">
          Arrastra y encima elementos sin restricciones.
        </p>

        <button
          onClick={() => onToggleGuides?.(!showGuides)}
          className={`w-full py-1.5 px-2 text-[9px] font-bold uppercase tracking-wider border transition-colors ${
            showGuides ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {showGuides ? 'Ocultar guias' : 'Mostrar guias'}
        </button>
      </div>

      <div className="h-px bg-gray-100 my-3" />

      <div className="mb-3">
        <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Diseno global</h3>
        <div className="space-y-2">
          <div>
            <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Fondo general</label>
            <div className="flex gap-0.5 mb-1.5">
              <button
                onClick={() => onUpdateGlobalBg?.({ type: 'color', value: safeGlobalColorValue })}
                className={`flex-1 py-0.5 rounded-none text-[8px] font-black transition-all uppercase ${
                  globalBg?.type === 'color' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => onUpdateGlobalBg?.({ type: 'image', value: globalBg?.type === 'image' ? (globalBg.value || '') : '' })}
                className={`flex-1 py-0.5 rounded-none text-[8px] font-black transition-all uppercase ${
                  globalBg?.type === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Imagen
              </button>
            </div>
            {globalBg?.type === 'color' ? (
              <div className="space-y-1.5">
                <input
                  type="color"
                  value={safeGlobalColorValue.startsWith('#') ? safeGlobalColorValue : '#ffffff'}
                  onChange={(e) => onUpdateGlobalBg?.({ type: 'color', value: e.target.value })}
                  className="w-full h-6 rounded-none border-gray-200 p-0.5 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => onUpdateGlobalBg?.({ type: 'color', value: 'transparent' })}
                  className={`w-full py-1 px-1.5 border text-[8px] font-black uppercase transition-colors ${
                    safeGlobalColorValue === 'transparent'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Transparente
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
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
                    className="py-1 px-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase hover:bg-indigo-100 transition-colors"
                  >
                    Seleccionar imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateGlobalBg?.({ type: 'image', value: '' })}
                    disabled={!globalBg?.value}
                    className="py-1 px-1.5 bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Limpiar
                  </button>
                </div>
                <input
                  type="text"
                  value={globalBg?.value || ''}
                  onChange={(e) => onUpdateGlobalBg?.({ type: 'image', value: e.target.value })}
                  className="w-full px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-none text-[8px] focus:ring-1 focus:ring-indigo-500"
                  placeholder="URL fondo global"
                />
                {globalBg?.value && (
                  <div
                    className="h-12 w-full border border-gray-100 bg-cover bg-center"
                    style={{ backgroundImage: `url(${globalBg.value})` }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {panelTab === 'tools' && (
        <>
      <div className="h-px bg-gray-100 my-3" />

      {!section ? (
        <div className="py-4 flex flex-col items-center justify-center text-center text-gray-400">
          <p className="text-[8px] font-black uppercase">Selecciona un elemento para abrir herramientas</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <div className="flex items-center gap-1">
                <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cinta dinamica</h3>
                <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {activeToolContext === 'text' ? 'Texto' : activeToolContext === 'image' ? 'Imagen' : 'Seccion'}
                </span>
              </div>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-50 rounded-none text-red-500 text-[10px] font-black"
                title="Eliminar"
              >
                X
              </button>
            </div>
            <p className="text-[10px] font-black text-gray-900 leading-tight uppercase">Editar {section.type}</p>
          </div>

          <div className="space-y-1.5 border-t border-gray-100 pt-2">
            <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Animacion de entrada</label>
            <div className="grid grid-cols-2 gap-0.5">
              {animationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateSectionAnimation({ type: option.value })}
                  className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                    selectedAnimationType === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[7px] font-bold text-gray-400 uppercase block">Duracion (s)</label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min={0.2}
                  max={2}
                  step={0.1}
                  value={selectedAnimationDuration}
                  onChange={(e) => updateSectionAnimation({ duration: parseFloat(e.target.value) || 0.6 })}
                  className="w-full accent-indigo-600"
                />
                <input
                  type="number"
                  min={0.2}
                  max={2}
                  step={0.1}
                  value={selectedAnimationDuration.toFixed(1)}
                  onChange={(e) => updateSectionAnimation({ duration: Math.max(0.2, Math.min(2, parseFloat(e.target.value) || 0.6)) })}
                  className="w-14 px-1 py-0.5 bg-white border border-gray-200 text-[8px]"
                />
              </div>
            </div>
          </div>

          {activeToolContext === 'section' && (
            <>
              <p className="text-[8px] text-gray-500 uppercase">
                Selecciona un texto o imagen en el lienzo para ver sus herramientas especificas.
              </p>

              <div>
                <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Fondo elemento</label>
                <div className="flex gap-0.5 mb-1.5">
                  <button
                    onClick={() => onUpdate({ bgType: 'color' })}
                    className={`flex-1 py-0.5 rounded-none text-[8px] font-black transition-all uppercase ${
                      section.bgType === 'color' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Color
                  </button>
                  <button
                    onClick={() => onUpdate({ bgType: 'image' })}
                    className={`flex-1 py-0.5 rounded-none text-[8px] font-black transition-all uppercase ${
                      section.bgType === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Imagen
                  </button>
                </div>

                {section.bgType === 'color' ? (
                  <input
                    type="color"
                    value={section.bgValue.startsWith('#') ? section.bgValue : '#ffffff'}
                    onChange={(e) => onUpdate({ bgValue: e.target.value })}
                    className="w-full h-6 rounded-none border-gray-200 p-0.5 cursor-pointer"
                  />
                ) : (
                  <div className="space-y-1.5">
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
                        className="py-1 px-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase hover:bg-indigo-100 transition-colors"
                      >
                        Seleccionar imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ bgType: 'image', bgValue: '' })}
                        disabled={!section.bgValue}
                        className="py-1 px-1.5 bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Limpiar
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.bgValue}
                      onChange={(e) => onUpdate({ bgValue: e.target.value })}
                      className="w-full px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-none text-[8px] focus:ring-1 focus:ring-indigo-500 uppercase"
                      placeholder="URL imagen elemento"
                    />
                    {section.bgValue && (
                      <div
                        className="h-12 w-full border border-gray-100 bg-cover bg-center"
                        style={{ backgroundImage: `url(${section.bgValue})` }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Altura del bloque</label>
                <div className="grid grid-cols-4 gap-0.5">
                  {heights.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => onUpdate({ height: h.value })}
                      className={`py-0.5 rounded-none text-[7px] font-black uppercase tracking-widest transition-all ${
                        section.height === h.value ? 'bg-indigo-600 text-white shadow-none' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {section.type === 'MUSIC' && (
            <div className="space-y-1.5 border-t border-gray-100 pt-2">
              <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Audio MP3</label>
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
                  className="py-1 px-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase hover:bg-indigo-100 transition-colors"
                >
                  Seleccionar MP3
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ audioUrl: '' })}
                  disabled={!section.audioUrl}
                  className="py-1 px-1.5 bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Limpiar
                </button>
              </div>
              <input
                type="text"
                value={section.audioUrl || ''}
                onChange={(e) => onUpdate({ audioUrl: e.target.value })}
                className="w-full px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-none text-[8px] focus:ring-1 focus:ring-indigo-500"
                placeholder="URL audio o base64"
              />
              {section.audioUrl ? (
                <audio
                  controls
                  preload="metadata"
                  src={section.audioUrl}
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-[8px] text-gray-500 uppercase">No hay audio seleccionado.</p>
              )}
            </div>
          )}

          {activeToolContext === 'image' && (
            <div className="space-y-2">
              {activeImageTarget === 'image' && (
                <>
                  <div>
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Imagen</label>
                    <input
                      ref={sectionImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSectionImageUpload}
                      className="hidden"
                    />
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <button
                        type="button"
                        onClick={() => sectionImageInputRef.current?.click()}
                        className="py-1 px-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase hover:bg-indigo-100 transition-colors"
                      >
                        Seleccionar imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedImageUrl('')}
                        disabled={!selectedImageUrl}
                        className="py-1 px-1.5 bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Limpiar
                      </button>
                    </div>
                    <input
                      type="text"
                      value={selectedImageUrl}
                      onChange={(e) => updateSelectedImageUrl(e.target.value)}
                      className="w-full px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-none text-[8px] focus:ring-1 focus:ring-indigo-500 uppercase"
                      placeholder="URL o ruta base64"
                    />
                    {selectedImageUrl && (
                      <div
                        className="h-12 w-full border border-gray-100 bg-cover bg-center mt-1"
                        style={{ backgroundImage: `url(${selectedImageUrl})` }}
                      />
                    )}
                  </div>

                  {!isSectionBackgroundImageTarget && (
                    <>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="text-[7px] font-bold text-gray-400 uppercase block">Escala %</label>
                          <input
                            type="number"
                            min={20}
                            max={300}
                            value={Math.round(imageScaleValue)}
                            onChange={(e) => updateImageStyle({ scale: clampImageScale(parseInt(e.target.value || '100', 10)) })}
                            className="w-full px-1 py-0.5 bg-white border border-gray-200 text-[8px]"
                          />
                        </div>
                        <div>
                          <label className="text-[7px] font-bold text-gray-400 uppercase block">Ajuste</label>
                          <div className="grid grid-cols-2 gap-0.5">
                            <button
                              onClick={() => updateImageStyle({ fit: 'contain' })}
                              className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                                imageFit === 'contain' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Contener
                            </button>
                            <button
                              onClick={() => updateImageStyle({ fit: 'cover' })}
                              className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                                imageFit === 'cover' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Cubrir
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => updateImageStyle({ asSectionBackground: !section.imageStyle?.asSectionBackground })}
                        className={`w-full py-1 px-2 text-[8px] font-black uppercase tracking-wider border transition-colors ${
                          section.imageStyle?.asSectionBackground
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {section.imageStyle?.asSectionBackground ? 'Usando como fondo de seccion' : 'Usar imagen como fondo de seccion'}
                      </button>
                    </>
                  )}
                </>
              )}

              {activeImageTarget === 'contentImage' && (
                <>
                  <div>
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Imagen de contenido</label>
                    <input
                      ref={contentImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleContentImageUpload}
                      className="hidden"
                    />
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <button
                        type="button"
                        onClick={() => contentImageInputRef.current?.click()}
                        className="py-1 px-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase hover:bg-indigo-100 transition-colors"
                      >
                        Seleccionar imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ contentImageUrl: undefined })}
                        disabled={!section.contentImageUrl}
                        className="py-1 px-1.5 bg-white border border-gray-200 text-gray-600 text-[8px] font-black uppercase hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Limpiar
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.contentImageUrl || ''}
                      onChange={(e) => onUpdate({ contentImageUrl: e.target.value })}
                      className="w-full px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-none text-[8px] focus:ring-1 focus:ring-indigo-500 uppercase"
                      placeholder="URL imagen extra"
                    />
                    {section.contentImageUrl && (
                      <div
                        className="h-12 w-full border border-gray-100 bg-cover bg-center mt-1"
                        style={{ backgroundImage: `url(${section.contentImageUrl})` }}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="text-[7px] font-bold text-gray-400 uppercase block">Escala %</label>
                      <input
                        type="number"
                        min={20}
                        max={300}
                        value={Math.round(contentImageScaleValue)}
                        onChange={(e) => updateContentImageStyle({ scale: clampImageScale(parseInt(e.target.value || '100', 10)) })}
                        className="w-full px-1 py-0.5 bg-white border border-gray-200 text-[8px]"
                      />
                    </div>
                    <div>
                      <label className="text-[7px] font-bold text-gray-400 uppercase block">Ajuste</label>
                      <div className="grid grid-cols-2 gap-0.5">
                        <button
                          onClick={() => updateContentImageStyle({ fit: 'contain' })}
                          className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                            contentImageFit === 'contain' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Contener
                        </button>
                        <button
                          onClick={() => updateContentImageStyle({ fit: 'cover' })}
                          className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
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

              {!activeImageTarget && (
                <p className="text-[8px] text-gray-500 uppercase">
                  Este bloque no tiene imagen activa. Selecciona una imagen en el lienzo.
                </p>
              )}
            </div>
          )}

          {activeToolContext === 'text' && (
            <div className="space-y-2">
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Herramientas de texto</h3>
              <p className="text-[8px] text-gray-500 uppercase">Estilo unico para titulo, subtitulo y contenido.</p>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="text-[7px] font-bold text-gray-400 uppercase block">Tamano</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min={8}
                      max={72}
                      value={Math.round(Number(textSize || 14))}
                      onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value || '14', 10) || 14 })}
                      className="w-full accent-indigo-600"
                    />
                    <input
                      type="number"
                      min={8}
                      max={72}
                      value={Math.round(Number(textSize || 14))}
                      onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value || '14', 10) || 14 })}
                      className="w-14 px-1 py-0.5 bg-white border border-gray-200 text-[8px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[7px] font-bold text-gray-400 uppercase block">Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="w-full h-5 rounded-none border-gray-200 p-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="text-[7px] font-bold text-gray-400 uppercase block">Peso</label>
                  <select
                    value={String(textWeight)}
                    onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                    className="w-full px-1 py-0.5 bg-white border border-gray-200 text-[8px]"
                  >
                    <option value="300">Ligero</option>
                    <option value="400">Regular</option>
                    <option value="500">Medio</option>
                    <option value="700">Negrita</option>
                    <option value="900">Extra</option>
                  </select>
                </div>
                <div>
                  <label className="text-[7px] font-bold text-gray-400 uppercase block">Fuente</label>
                  <select
                    value={textFontFamily}
                    onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                    className="w-full px-1 py-0.5 bg-white border border-gray-200 text-[8px]"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair</option>
                    <option value="Dancing Script">Dancing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-0.5">
                {alignments.map((align) => (
                  <button
                    key={align.value}
                    onClick={() => onUpdate({ alignment: align.value })}
                    className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                      textAlign === align.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {align.icon}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onUpdate({ fontStyle: 'normal' })}
                  className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                    textFontStyle === 'normal'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => onUpdate({ fontStyle: 'italic' })}
                  className={`py-0.5 rounded-none text-[8px] font-black uppercase transition-all ${
                    textFontStyle === 'italic'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Cursiva
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};




