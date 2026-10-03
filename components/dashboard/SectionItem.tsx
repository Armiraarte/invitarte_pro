import React from 'react';
import { motion } from 'motion/react';
import { Section, SectionAnimationType, PackageDefinition } from '../../types';

type ActiveTextElement = 'title' | 'subtitle' | 'content' | 'image' | 'contentImage' | null;

interface SectionItemProps {
  section: Section;
  isSelected: boolean;
  activeTextElement: ActiveTextElement;
  onSelect: () => void;
  onSelectTextElement: (element: ActiveTextElement) => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  pkg: PackageDefinition;
}

const getSectionEnterAnimation = (type?: SectionAnimationType) => {
  const resolvedType = type || 'none';

  switch (resolvedType) {
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case 'slide-up':
      return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
    case 'slide-down':
      return { initial: { opacity: 0, y: -24 }, animate: { opacity: 1, y: 0 } };
    case 'slide-left':
      return { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } };
    case 'slide-right':
      return { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } };
    case 'zoom':
      return { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 } };
    default:
      return { initial: false as const, animate: undefined };
  }
};

export const SectionItem: React.FC<SectionItemProps> = ({
  section,
  isSelected,
  activeTextElement,
  onSelect,
  onSelectTextElement,
  onUpdate,
  pkg
}) => {
  const getMinHeight = () => {
    if (section.height === '25') return 'calc((var(--mockup-height) - var(--mockup-safe-top, 0px)) * 0.25)';
    if (section.height === '50') return 'calc((var(--mockup-height) - var(--mockup-safe-top, 0px)) * 0.50)';
    if (section.height === '75') return 'calc((var(--mockup-height) - var(--mockup-safe-top, 0px)) * 0.75)';
    return 'calc(var(--mockup-height) - var(--mockup-safe-top, 0px))';
  };

  const handleDragEnd = (element: keyof NonNullable<Section['positions']>, info: any) => {
    const currentPositions = section.positions || {};
    const currentPos = currentPositions[element] || { x: 0, y: 0 };

    onUpdate({
      positions: {
        ...currentPositions,
        [element]: {
          x: currentPos.x + info.offset.x,
          y: currentPos.y + info.offset.y
        }
      }
    });
  };

  const selectText = (target: ActiveTextElement) => {
    onSelect();
    onSelectTextElement(target);
  };

  const getElementAlignSelf = (): React.CSSProperties['alignSelf'] => {
    if (section.alignment === 'left') return 'flex-start';
    if (section.alignment === 'right') return 'flex-end';
    return 'center';
  };

  const clampScale = (value: number) => Math.max(20, Math.min(300, value));

  const startImageResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    target: 'image' | 'contentImage'
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onSelect();
    onSelectTextElement(target);

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const startScale = target === 'image'
      ? section.imageStyle?.scale ?? 100
      : section.contentImageStyle?.scale ?? 100;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextScale = clampScale(startScale + ((deltaX + deltaY) / 2) * 0.6);

      if (target === 'image') {
        onUpdate({
          imageStyle: {
            fit: 'contain',
            asSectionBackground: false,
            ...section.imageStyle,
            scale: nextScale
          }
        });
        return;
      }

      onUpdate({
        contentImageStyle: {
          fit: 'contain',
          asSectionBackground: false,
          ...section.contentImageStyle,
          scale: nextScale
        }
      });
    };

    const stopResize = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', stopResize);
      document.body.style.removeProperty('user-select');
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) return;
      stopResize();
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', stopResize);
  };

  const imageScale = Math.max(20, Math.min(300, section.imageStyle?.scale ?? 100)) / 100;
  const contentImageScale = Math.max(20, Math.min(300, section.contentImageStyle?.scale ?? 100)) / 100;
  const showMainImageHandle = isSelected && (activeTextElement === 'image' || activeTextElement === null);
  const showContentImageHandle = isSelected && (activeTextElement === 'contentImage' || activeTextElement === null);
  const imageFitClass = section.imageStyle?.fit === 'cover' ? 'object-cover' : 'object-contain';
  const contentImageFitClass = section.contentImageStyle?.fit === 'cover' ? 'object-cover' : 'object-contain';
  const isImageAsSectionBackground = !!section.imageStyle?.asSectionBackground && !!section.imageUrl;
  const hasSelectableBackgroundImage = section.bgType === 'image' || isImageAsSectionBackground;
  const sectionBackgroundImage = isImageAsSectionBackground
    ? `url(${section.imageUrl})`
    : section.bgType === 'image'
      ? `url(${section.bgValue})`
      : 'none';
  const sectionBackgroundSize = isImageAsSectionBackground
    ? (section.imageStyle?.fit === 'cover' ? 'cover' : 'contain')
    : 'cover';
  const sectionAnimationType = section.animation?.type || 'none';
  const sectionAnimationDuration = Math.max(0.2, Math.min(2, section.animation?.duration ?? 0.6));
  const sectionEnterAnimation = getSectionEnterAnimation(sectionAnimationType);

  return (
    <motion.div
      initial={sectionEnterAnimation.initial}
      animate={sectionEnterAnimation.animate}
      transition={
        sectionAnimationType === 'none'
          ? undefined
          : { duration: sectionAnimationDuration, ease: 'easeOut' }
      }
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
        onSelectTextElement(hasSelectableBackgroundImage ? 'image' : null);
      }}
      className={`relative group transition-all duration-300 rounded-none overflow-visible cursor-pointer border-2 ${pkg.fontClass} ${
        isSelected ? 'border-indigo-500 z-10' : 'border-transparent hover:border-indigo-200'
      }`}
      style={{
        minHeight: getMinHeight(),
        backgroundColor: section.bgType === 'color' ? section.bgValue : 'transparent',
        backgroundImage: sectionBackgroundImage,
        backgroundSize: sectionBackgroundSize,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        color: section.textColor || '#1a1a1a',
        fontFamily: section.fontFamily || 'inherit',
        textAlign: section.alignment || 'center'
      }}
    >
      <div className="relative flex flex-col p-4 w-full h-full justify-center overflow-visible">
        {section.type === 'COUNTDOWN' ? (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement(null);
            }}
            onDragEnd={(_, info) => handleDragEnd('extra', info)}
            initial={section.positions?.extra || { x: 0, y: 0 }}
            className="flex flex-col items-center gap-1 cursor-move"
          >
            <div className="flex gap-0.5">
              {['00', '00', '00', '00'].map((val, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="bg-black/10 backdrop-blur-md w-7 h-7 rounded-none flex items-center justify-center text-[10px] font-black">
                    {val}
                  </div>
                  <span className="text-[5px] font-black uppercase tracking-tighter mt-0.5 opacity-50">
                    {['Dias', 'Hrs', 'Min', 'Seg'][i]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : section.type === 'GUESTS' ? (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement(null);
            }}
            onDragEnd={(_, info) => handleDragEnd('extra', info)}
            initial={section.positions?.extra || { x: 0, y: 0 }}
            className="flex flex-col items-center gap-1 w-full max-w-[120px] mx-auto cursor-move"
          >
            <div className="w-full bg-black/5 rounded-none p-1.5 border border-black/5">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[7px] font-bold opacity-70 uppercase tracking-tighter">Confirmar</span>
                <span className="text-[7px]">Asistencia</span>
              </div>
              <div className="h-3 bg-white/50 rounded-none mb-0.5"></div>
              <div className="h-3 bg-indigo-500/20 rounded-none"></div>
            </div>
          </motion.div>
        ) : section.type === 'MUSIC' ? (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement(null);
            }}
            onDragEnd={(_, info) => handleDragEnd('extra', info)}
            initial={section.positions?.extra || { x: 0, y: 0 }}
            className="flex flex-col items-center gap-1 w-full max-w-[220px] mx-auto cursor-move"
          >
            {section.audioUrl ? (
              <audio
                controls
                preload="metadata"
                src={section.audioUrl}
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="w-full p-2 border border-dashed border-black/20 bg-white/40 text-[8px] font-bold uppercase tracking-tight text-center opacity-70">
                Sin audio. Carga un MP3 en herramientas.
              </div>
            )}
          </motion.div>
        ) : section.type === 'IMAGE' && !isImageAsSectionBackground ? (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement('image');
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
              onSelectTextElement('image');
            }}
            onDragEnd={(_, info) => handleDragEnd('content', info)}
            initial={section.positions?.content || { x: 0, y: 0 }}
            className={`relative w-full flex justify-center cursor-move z-20 ${activeTextElement === 'image' ? 'ring-1 ring-indigo-400 px-1' : ''}`}
          >
            <div className="relative w-[85%]">
              <img
                src={section.imageUrl || 'https://via.placeholder.com/300'}
                alt="Imagen de seccion"
                className={`w-full h-[300px] ${imageFitClass} rounded-sm shadow-sm pointer-events-none origin-center`}
                style={{ transform: `scale(${imageScale})` }}
              />
              {showMainImageHandle && (
                <button
                  type="button"
                  onPointerDown={(e) => startImageResize(e, 'image')}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-indigo-500 text-indigo-600 shadow cursor-se-resize flex items-center justify-center"
                  title="Redimensionar imagen desde la esquina"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 16L16 8" />
                    <path d="M12 16L16 12" />
                    <path d="M16 16L16 16" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        ) : null}

        {section.contentImageUrl && (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement('contentImage');
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
              onSelectTextElement('contentImage');
            }}
            onDragEnd={(_, info) => handleDragEnd('contentImage', info)}
            initial={section.positions?.contentImage || { x: 0, y: 0 }}
            className={`relative w-full flex justify-center cursor-move z-20 mb-2 ${activeTextElement === 'contentImage' ? 'ring-1 ring-indigo-400 px-1' : ''}`}
          >
            <div className="relative w-[80%]">
              <img
                src={section.contentImageUrl}
                alt="Imagen de contenido"
                className={`w-full h-[200px] ${contentImageFitClass} rounded-sm shadow-sm pointer-events-none origin-center`}
                style={{ transform: `scale(${contentImageScale})` }}
              />
              {showContentImageHandle && (
                <button
                  type="button"
                  onPointerDown={(e) => startImageResize(e, 'contentImage')}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-indigo-500 text-indigo-600 shadow cursor-se-resize flex items-center justify-center"
                  title="Redimensionar imagen de contenido desde la esquina"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 16L16 8" />
                    <path d="M12 16L16 12" />
                    <path d="M16 16L16 16" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {section.type !== 'BLANK' && (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => selectText('title')}
            onDragEnd={(_, info) => handleDragEnd('title', info)}
            initial={section.positions?.title || { x: 0, y: 0 }}
            className={`cursor-move z-20 inline-flex w-fit max-w-full justify-center ${activeTextElement === 'title' ? 'ring-1 ring-indigo-400 px-1' : ''}`}
            style={{ alignSelf: getElementAlignSelf() }}
          >
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onFocus={() => selectText('title')}
              className="bg-transparent border-none focus:ring-0 font-black tracking-tight text-inherit placeholder:opacity-50 p-0 uppercase w-auto min-w-[50px] text-center"
              style={{
                fontSize: section.fontSize ? `${section.fontSize}px` : '14px',
                fontWeight: section.fontWeight || '900',
                fontStyle: section.fontStyle || 'normal',
                color: section.textColor || 'inherit',
                fontFamily: section.fontFamily || 'inherit',
                textAlign: section.alignment || 'center'
              }}
              placeholder="Titulo"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}

        {section.subtitle !== undefined && (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => selectText('subtitle')}
            onDragEnd={(_, info) => handleDragEnd('subtitle', info)}
            initial={section.positions?.subtitle || { x: 0, y: 0 }}
            className={`cursor-move z-20 inline-flex w-fit max-w-full justify-center ${activeTextElement === 'subtitle' ? 'ring-1 ring-indigo-400 px-1' : ''}`}
            style={{ alignSelf: getElementAlignSelf() }}
          >
            <input
              type="text"
              value={section.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              onFocus={() => selectText('subtitle')}
              className="bg-transparent border-none focus:ring-0 font-medium opacity-70 text-inherit placeholder:opacity-50 mt-0.5 p-0 uppercase w-auto min-w-[50px] text-center"
              style={{
                fontSize: section.fontSize ? `${section.fontSize}px` : '14px',
                fontWeight: section.fontWeight || '900',
                fontStyle: section.fontStyle || 'normal',
                color: section.textColor || 'inherit',
                fontFamily: section.fontFamily || 'inherit',
                textAlign: section.alignment || 'center'
              }}
              placeholder="Subtitulo"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}

        {section.content !== undefined && (
          <motion.div
            drag
            dragMomentum={false}
            onPointerDown={() => selectText('content')}
            onDragEnd={(_, info) => handleDragEnd('content', info)}
            initial={section.positions?.content || { x: 0, y: 0 }}
            className={`cursor-move z-20 inline-flex w-fit max-w-[90%] justify-center ${activeTextElement === 'content' ? 'ring-1 ring-indigo-400 px-1' : ''}`}
            style={{ alignSelf: getElementAlignSelf() }}
          >
            <textarea
              value={section.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onFocus={() => selectText('content')}
              className="bg-transparent border-none focus:ring-0 opacity-80 text-inherit placeholder:opacity-50 mt-2 resize-none min-h-[30px] p-0 uppercase w-auto min-w-[70px] max-w-full text-center overflow-hidden"
              style={{
                fontSize: section.fontSize ? `${section.fontSize}px` : '14px',
                fontWeight: section.fontWeight || '900',
                fontStyle: section.fontStyle || 'normal',
                color: section.textColor || 'inherit',
                fontFamily: section.fontFamily || 'inherit',
                textAlign: section.alignment || 'center'
              }}
              placeholder="Contenido..."
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};



