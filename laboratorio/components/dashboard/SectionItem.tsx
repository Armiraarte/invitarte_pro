import React from 'react';
import { motion } from 'motion/react';
import { CountdownDisplay } from '../CountdownDisplay';
import { PackageDefinition, RepeatableSectionElementKind, Section, SectionAnimationType, SectionElement } from '../../types';
import {
  getSectionContainerStyle,
  getSectionElementAnimation,
  getSectionElementById,
  getSectionElementLayer,
  getSectionElements,
  getSectionImageStyle,
  getSectionTextStyle,
  syncSectionElements,
  updateSectionElement,
} from './sectionElements';
import { getImagePresentationStyle } from './imagePresentation';
import { ItineraryTimeline } from './itinerary';
import { getCountdownParts, getGoogleMapsEmbedUrl } from './sectionInteractive';

type ActiveTextElement =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'image'
  | 'contentImage'
  | 'container'
  | 'backgroundImage'
  | 'countdown'
  | 'guests'
  | 'location'
  | 'music'
  | null;

type DraggableCanvasTarget =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'image'
  | 'contentImage'
  | 'container'
  | 'countdown'
  | 'guests'
  | 'location'
  | 'music';

interface SectionItemProps {
  section: Section;
  isSelected: boolean;
  showGuides: boolean;
  canvasScale?: number;
  activeTextElement: ActiveTextElement;
  selectedElementId?: string | null;
  onSelect: () => void;
  onSelectTextElement: (element: ActiveTextElement, elementId?: string | null) => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  pkg: PackageDefinition;
  previewRefreshToken?: number;
}

interface GuideTargets {
  x?: number;
  y?: number;
}

interface GuideOrigin {
  left: number;
  top: number;
}

interface SoftSnapDraggableProps {
  x: number;
  y: number;
  className: string;
  style?: React.CSSProperties;
  dragEnabled?: boolean;
  dragScale?: number;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onPositionCommit: (position: { x: number; y: number }) => void;
  getGuideTargets?: (size: { width: number; height: number }, origin: GuideOrigin) => GuideTargets;
  constrainPosition?: (
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => { x: number; y: number };
  children: React.ReactNode;
}

type ContainerResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const CANVAS_BASE_POSITIONS: Record<DraggableCanvasTarget, { left: number; top: number }> = {
  title: { left: 24, top: 22 },
  subtitle: { left: 24, top: 72 },
  content: { left: 24, top: 126 },
  image: { left: 28, top: 28 },
  contentImage: { left: 36, top: 214 },
  container: { left: 24, top: 120 },
  countdown: { left: 24, top: 170 },
  guests: { left: 24, top: 170 },
  location: { left: 38, top: 170 },
  music: { left: 24, top: 170 },
};

const GUIDE_SNAP_THRESHOLD = 26;

const positionsMatch = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => a.x === b.x && a.y === b.y;

const applySoftGuideSnap = (position: number, size: number, target: number) => {
  const delta = target - (position + size / 2);

  if (Math.abs(delta) > GUIDE_SNAP_THRESHOLD) {
    return position;
  }

  const normalized = 1 - Math.abs(delta) / GUIDE_SNAP_THRESHOLD;
  const influence = 0.82 * normalized * normalized;

  return position + delta * influence;
};

const SoftSnapDraggable: React.FC<SoftSnapDraggableProps> = ({
  x,
  y,
  className,
  style,
  dragEnabled = true,
  dragScale = 1,
  onPointerDown,
  onClick,
  onPositionCommit,
  getGuideTargets,
  constrainPosition,
  children,
}) => {
  const itemRef = React.useRef<HTMLDivElement | null>(null);
  const safeDragScale = Number.isFinite(dragScale) && dragScale > 0 ? dragScale : 1;
  const [previewPosition, setPreviewPosition] = React.useState({ x, y });
  const previewPositionRef = React.useRef({ x, y });
  const dragSessionRef = React.useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const suppressClickRef = React.useRef(false);
  const cleanupDragRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (dragSessionRef.current) {
      return;
    }

    const nextPosition = { x, y };
    previewPositionRef.current = nextPosition;
    setPreviewPosition(nextPosition);
  }, [x, y]);

  const resolvePointerPosition = (clientX: number, clientY: number) => {
    const session = dragSessionRef.current;
    const element = itemRef.current;
    if (!session) {
      return previewPositionRef.current;
    }

    const size = {
      width: element?.offsetWidth || 0,
      height: element?.offsetHeight || 0,
    };
    const origin = {
      left: element?.offsetLeft || 0,
      top: element?.offsetTop || 0,
    };
    const guideTargets = getGuideTargets?.(size, origin);
    const rawX = session.originX + ((clientX - session.startClientX) / safeDragScale);
    const rawY = session.originY + ((clientY - session.startClientY) / safeDragScale);
    const constrainedPosition = constrainPosition
      ? constrainPosition({ x: rawX, y: rawY }, size)
      : { x: rawX, y: rawY };
    const snappedX = guideTargets?.x !== undefined
      ? applySoftGuideSnap(constrainedPosition.x, size.width, guideTargets.x)
      : constrainedPosition.x;
    const snappedY = guideTargets?.y !== undefined
      ? applySoftGuideSnap(constrainedPosition.y, size.height, guideTargets.y)
      : constrainedPosition.y;
    const nextPosition = constrainPosition
      ? constrainPosition({ x: snappedX, y: snappedY }, size)
      : { x: snappedX, y: snappedY };

    return nextPosition;
  };

  const updatePreviewPosition = (nextPosition: { x: number; y: number }) => {
    previewPositionRef.current = nextPosition;
    setPreviewPosition(nextPosition);
  };

  const handlePointerDownInternal: React.PointerEventHandler<HTMLDivElement> = (event) => {
    onPointerDown?.(event);

    if (!dragEnabled || event.defaultPrevented || event.button !== 0) {
      return;
    }

    event.preventDefault();
    suppressClickRef.current = false;
    cleanupDragRef.current?.();

    const pointerId = event.pointerId;
    dragSessionRef.current = {
      pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: previewPositionRef.current.x,
      originY: previewPositionRef.current.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || moveEvent.pointerId !== session.pointerId) {
        return;
      }

      const nextPosition = resolvePointerPosition(moveEvent.clientX, moveEvent.clientY);
      if (
        Math.abs(moveEvent.clientX - session.startClientX) > 3
        || Math.abs(moveEvent.clientY - session.startClientY) > 3
      ) {
        suppressClickRef.current = true;
      }

      updatePreviewPosition(nextPosition);
    };

    const stopDragging = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', stopDragging);
      document.body.style.removeProperty('user-select');
      dragSessionRef.current = null;
      cleanupDragRef.current = null;
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || upEvent.pointerId !== session.pointerId) {
        return;
      }

      const nextPosition = resolvePointerPosition(upEvent.clientX, upEvent.clientY);
      updatePreviewPosition(nextPosition);
      onPositionCommit({
        x: Math.round(nextPosition.x),
        y: Math.round(nextPosition.y),
      });
      stopDragging();
    };

    cleanupDragRef.current = stopDragging;
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', stopDragging);
  };

  React.useEffect(() => {
    return () => cleanupDragRef.current?.();
  }, []);

  const handleClickInternal: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  const baseTransform = style?.transform ? `${style.transform} ` : '';

  return (
    <div
      ref={itemRef}
      data-editor-element="true"
      onPointerDown={handlePointerDownInternal}
      onClick={handleClickInternal}
      className={className}
      style={{
        ...style,
        transform: `${baseTransform}translate3d(${previewPosition.x}px, ${previewPosition.y}px, 0)`,
        touchAction: dragEnabled ? 'none' : 'auto',
        willChange: dragEnabled ? 'transform' : undefined,
      }}
    >
      {children}
    </div>
  );
};

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
  showGuides,
  canvasScale = 1,
  activeTextElement,
  selectedElementId,
  onSelect,
  onSelectTextElement,
  onUpdate,
  isFirst,
  pkg,
  previewRefreshToken = 0,
}) => {
  const MOBILE_EDITOR_BASE_WIDTH = 347;
  const [countdownNow, setCountdownNow] = React.useState(() => Date.now());
  const sectionFrameRef = React.useRef<HTMLDivElement | null>(null);
  const sectionContentRef = React.useRef<HTMLDivElement | null>(null);
  const [sectionWidth, setSectionWidth] = React.useState(MOBILE_EDITOR_BASE_WIDTH);
  const getCanvasBasePosition = (target: DraggableCanvasTarget) => CANVAS_BASE_POSITIONS[target];

  const getSectionHeight = () => {
    if (section.height === '25') return 'calc((var(--mockup-height) - var(--mockup-safe-top, 0px)) * 0.25)';
    if (section.height === '50') return 'calc((var(--mockup-height) - var(--mockup-safe-top, 0px)) * 0.50)';
    if (section.height === '75') return 'calc((var(--mockup-height) - var(--mockup-safe-top, 0px)) * 0.75)';
    return 'calc(var(--mockup-height) - var(--mockup-safe-top, 0px))';
  };

  const getSpecialElementPosition = (element: 'countdown' | 'guests' | 'location' | 'music') => {
    if (element === 'countdown') {
      return section.positions?.countdown || section.positions?.extra || { x: 0, y: 0 };
    }

    if (element === 'guests') {
      return section.positions?.guests || section.positions?.extra || { x: 0, y: 0 };
    }

    if (element === 'location') {
      return section.positions?.location || { x: 0, y: 0 };
    }

    return section.positions?.music || section.positions?.extra || { x: 0, y: 0 };
  };

  const constrainPositionToSection = React.useCallback((
    target: DraggableCanvasTarget,
    position: { x: number; y: number },
    size?: { width: number; height: number }
  ) => {
    const content = sectionContentRef.current;
    if (!content) {
      return {
        x: Math.round(position.x),
        y: Math.round(position.y),
      };
    }

    const basePosition = getCanvasBasePosition(target);
    const width = Math.max(0, size?.width ?? 0);
    const height = Math.max(0, size?.height ?? 0);
    const minX = -basePosition.left;
    const minY = -basePosition.top;
    const maxX = Math.max(minX, content.clientWidth - basePosition.left - width);
    const maxY = Math.max(minY, content.clientHeight - basePosition.top - height);

    return {
      x: Math.round(Math.min(Math.max(position.x, minX), maxX)),
      y: Math.round(Math.min(Math.max(position.y, minY), maxY)),
    };
  }, [getCanvasBasePosition]);

  const getGuideTargets = React.useCallback((
    _size: { width: number; height: number },
    origin: GuideOrigin
  ): GuideTargets => {
    if (!showGuides) return {};

    const frame = sectionFrameRef.current;
    if (!frame) return {};

    const computedStyle = window.getComputedStyle(frame);
    const mockupHeight = Number.parseFloat(computedStyle.getPropertyValue('--mockup-height')) || frame.clientHeight;
    const safeTop = Number.parseFloat(computedStyle.getPropertyValue('--mockup-safe-top')) || 0;
    const sectionOffsetTop = frame.offsetTop;

    return {
      x: (sectionWidth / 2) - origin.left,
      y: ((mockupHeight / 2) - safeTop - sectionOffsetTop) - origin.top,
    };
  }, [sectionWidth, showGuides]);

  const updateSpecialElementPosition = (
    element: 'countdown' | 'guests' | 'location' | 'music',
    position: { x: number; y: number }
  ) => {
    const currentPositions = section.positions || {};
    const nextPosition = constrainPositionToSection(element, position);

    onUpdate({
      positions: {
        ...currentPositions,
        [element]: nextPosition,
      }
    });
  };

  const selectRepeatableElement = (target: RepeatableSectionElementKind, elementId: string) => {
    onSelect();
    onSelectTextElement(target, elementId);
  };

  const clampScale = (value: number) => Math.max(20, Math.min(300, value));
  const clampImageDimension = (value: number) => Math.max(40, Math.min(960, value));
  const clampContainerWidth = (value: number) => Math.max(60, Math.min(960, value));
  const clampContainerHeight = (value: number) => Math.max(40, Math.min(960, value));
  const clampCountdownGap = (value: number) => Math.max(0, Math.min(96, value));
  const previewScaleFactor = Math.max(sectionWidth / MOBILE_EDITOR_BASE_WIDTH, 0.35);
  const effectiveCanvasScale = Math.max(canvasScale, 0.01);
  const isMoveModeActive = showGuides;
  const scaleCanvasValue = (value: number) => value * previewScaleFactor;
  const normalizeCanvasDelta = (value: number) => value / (previewScaleFactor * effectiveCanvasScale);
  const renderSelectionCenterGuide = (visible: boolean) => {
    if (!visible) return null;

    return (
      <span className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 h-10 w-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/80 shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_0_10px_rgba(99,102,241,0.18)]" />
        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/80 shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_0_10px_rgba(99,102,241,0.18)]" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.16)]" />
      </span>
    );
  };

  const renderSelectionRectangle = (
    visible: boolean,
    options?: {
      insetClassName?: string;
    }
  ) => {
    if (!visible) return null;

    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-10 border-2 border-indigo-500/90 bg-indigo-500/8 shadow-[0_0_0_1px_rgba(255,255,255,0.92),0_12px_24px_rgba(79,70,229,0.18)] ${
          options?.insetClassName ?? 'inset-0'
        } rounded-none`}
      />
    );
  };

  const updateRepeatableElementPosition = (
    kind: RepeatableSectionElementKind,
    elementId: string,
    position: { x: number; y: number }
  ) => {
    onUpdate(updateSectionElement(section, elementId, {
      position: constrainPositionToSection(kind, position),
    }));
  };

  const startContainerResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    elementId: string,
    handle: ContainerResizeHandle
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onSelect();
    onSelectTextElement('container', elementId);

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const currentElement = getSectionElementById(section, elementId);
    const currentContainerStyle = getSectionContainerStyle(currentElement);
    const startPosition = currentElement?.position
      ? constrainPositionToSection('container', currentElement.position)
      : { x: 0, y: 0 };
    const startWidth = currentContainerStyle.width ?? 240;
    const startHeight = currentContainerStyle.height ?? 140;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const deltaX = normalizeCanvasDelta(moveEvent.clientX - startX);
      const deltaY = normalizeCanvasDelta(moveEvent.clientY - startY);
      const affectsWest = handle.includes('w');
      const affectsEast = handle.includes('e');
      const affectsNorth = handle.includes('n');
      const affectsSouth = handle.includes('s');
      const rawWidth = affectsWest
        ? startWidth - deltaX
        : affectsEast
          ? startWidth + deltaX
          : startWidth;
      const rawHeight = affectsNorth
        ? startHeight - deltaY
        : affectsSouth
          ? startHeight + deltaY
          : startHeight;
      const nextWidth = clampContainerWidth(rawWidth);
      const nextHeight = clampContainerHeight(rawHeight);
      const nextPosition = constrainPositionToSection('container', {
        x: Math.round(affectsWest ? startPosition.x + (startWidth - nextWidth) : startPosition.x),
        y: Math.round(affectsNorth ? startPosition.y + (startHeight - nextHeight) : startPosition.y),
      }, {
        width: nextWidth,
        height: nextHeight,
      });

      onUpdate(updateSectionElement(section, elementId, {
        position: nextPosition,
        style: {
          ...currentContainerStyle,
          width: Math.round(nextWidth),
          height: Math.round(nextHeight),
        },
      }));
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

  const renderContainerResizeHandles = (elementId: string, visible: boolean) => {
    if (!visible) return null;

    const handles: Array<{
      key: ContainerResizeHandle;
      className: string;
      cursor: string;
      isMiddleHandle?: boolean;
      lineClassName?: string;
    }> = [
      { key: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-nwse-resize' },
      {
        key: 'n',
        className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
        cursor: 'cursor-ns-resize',
        isMiddleHandle: true,
        lineClassName: 'h-[3px] w-6 rounded-full',
      },
      { key: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2', cursor: 'cursor-nesw-resize' },
      {
        key: 'e',
        className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
        cursor: 'cursor-ew-resize',
        isMiddleHandle: true,
        lineClassName: 'h-6 w-[3px] rounded-full',
      },
      { key: 'se', className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'cursor-nwse-resize' },
      {
        key: 's',
        className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
        cursor: 'cursor-ns-resize',
        isMiddleHandle: true,
        lineClassName: 'h-[3px] w-6 rounded-full',
      },
      { key: 'sw', className: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', cursor: 'cursor-nesw-resize' },
      {
        key: 'w',
        className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
        cursor: 'cursor-ew-resize',
        isMiddleHandle: true,
        lineClassName: 'h-6 w-[3px] rounded-full',
      },
    ];

    return (
      <>
        {handles.map((handle) => (
          <button
            key={handle.key}
            type="button"
            data-editor-element="true"
            aria-label={`Redimensionar contenedor ${handle.key}`}
            onClick={(resizeEvent) => resizeEvent.stopPropagation()}
            onPointerDown={(resizeEvent) => startContainerResize(resizeEvent, elementId, handle.key)}
            className={`absolute z-30 flex items-center justify-center transition-transform hover:scale-110 ${handle.className} ${handle.cursor} ${
              handle.isMiddleHandle
                ? 'h-7 w-7 rounded-full border border-transparent bg-transparent'
                : 'h-4 w-4 rounded-full border border-white bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.14),0_8px_18px_rgba(79,70,229,0.32)]'
            }`}
          >
            {handle.isMiddleHandle && (
              <span
                className={`${handle.lineClassName} bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.14),0_8px_18px_rgba(79,70,229,0.32)]`}
              />
            )}
          </button>
        ))}
      </>
    );
  };

  const startImageResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    elementId: string,
    target: 'image' | 'contentImage'
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onSelect();
    onSelectTextElement(target, elementId);

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const currentElement = getSectionElementById(section, elementId);
    const currentImageStyle = getSectionImageStyle(currentElement, section, target);
    const startPosition = currentElement?.position
      ? constrainPositionToSection(target, currentElement.position)
      : { x: 0, y: 0 };
    const startWidth = currentImageStyle.width ?? (target === 'image' ? 260 : 220);
    const startHeight = currentImageStyle.height ?? (target === 'image' ? 300 : 200);
    const aspectRatio = startHeight === 0 ? 1 : startWidth / startHeight;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextWidth = clampImageDimension(startWidth + normalizeCanvasDelta((deltaX + deltaY) / 2));
      const nextHeight = clampImageDimension(nextWidth / aspectRatio);
      const centeredOffsetX = (startWidth - nextWidth) / 2;
      const centeredOffsetY = (startHeight - nextHeight) / 2;
      const nextPosition = constrainPositionToSection(target, {
        x: Math.round(startPosition.x + centeredOffsetX),
        y: Math.round(startPosition.y + centeredOffsetY),
      }, {
        width: nextWidth,
        height: nextHeight,
      });

      onUpdate(updateSectionElement(section, elementId, {
        position: nextPosition,
        style: {
          ...currentImageStyle,
          width: Math.round(nextWidth),
          height: Math.round(nextHeight),
        }
      }));
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

  const startCountdownResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onSelect();
    onSelectTextElement('countdown', null);

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const startScale = clampScale(section.countdownStyle?.scale ?? 100);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextScale = clampScale(startScale + normalizeCanvasDelta((deltaX + deltaY) / 2));

      onUpdate({
        countdownStyle: {
          ...section.countdownStyle,
          scale: Math.round(nextScale),
        },
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

  const repeatableElements = getSectionElements(section);
  const countdownParts = React.useMemo(
    () => getCountdownParts(section.countdownTargetDate, countdownNow),
    [countdownNow, section.countdownTargetDate]
  );
  const locationEmbedUrl = React.useMemo(
    () => getGoogleMapsEmbedUrl(section.locationMapUrl),
    [section.locationMapUrl]
  );
  const mainImageElements = repeatableElements.filter((element) => element.kind === 'image');
  const contentImageElements = repeatableElements.filter((element) => element.kind === 'contentImage');
  const containerElements = repeatableElements.filter((element) => element.kind === 'container');
  const backgroundImageElement = mainImageElements.find((element) => element.style?.asSectionBackground && !!element.value) || null;
  const visibleMainImageElements = mainImageElements.filter((element) => element.value && !element.style?.asSectionBackground);
  const visibleContentImageElements = contentImageElements.filter((element) => element.value);
  const hasSelectableBackgroundImage = section.bgType === 'image' || !!backgroundImageElement;
  const sectionBackgroundImage = backgroundImageElement
    ? `url(${backgroundImageElement.value})`
    : section.bgType === 'image'
      ? `url(${section.bgValue})`
      : 'none';
  const sectionBackgroundSize = backgroundImageElement
    ? (backgroundImageElement.style?.fit === 'cover' ? 'cover' : 'contain')
    : 'cover';
  const countdownFontSize = Math.max(14, section.countdownStyle?.fontSize ?? section.fontSize ?? 16);
  const countdownFontFamily = section.countdownStyle?.fontFamily ?? section.fontFamily ?? 'Inter';
  const countdownFontWeight = section.countdownStyle?.fontWeight ?? section.fontWeight ?? '700';
  const countdownFontStyle = section.countdownStyle?.fontStyle ?? section.fontStyle ?? 'normal';
  const countdownTextColor = section.countdownStyle?.textColor ?? section.textColor ?? '#1a1a1a';
  const countdownScale = clampScale(section.countdownStyle?.scale ?? 100);
  const countdownItemGap = section.countdownStyle?.itemGap !== undefined
    ? clampCountdownGap(section.countdownStyle.itemGap)
    : undefined;
  const countdownTitleElement = getSectionElementById(section, 'cuenta-title');
  const countdownPanelElement = getSectionElementById(section, 'cuenta-panel');
  const countdownTileElement = repeatableElements.find((element) => /^cuenta-tile-\d+$/.test(element.id)) ?? null;
  const countdownTitleStyle = getSectionTextStyle(countdownTitleElement);
  const countdownPanelStyle = getSectionContainerStyle(countdownPanelElement);
  const countdownTileStyle = getSectionContainerStyle(countdownTileElement);
  const countdownTitleValue = countdownTitleElement?.value?.trim() || section.title?.trim() || 'Cuenta regresiva';
  const countdownTitleFontSize = Math.max(
    11,
    countdownTitleStyle.fontSize ?? Math.max(11, Math.round((section.fontSize ?? 16) * 0.78))
  );
  const countdownTitleFontFamily = countdownTitleStyle.fontFamily ?? section.fontFamily ?? 'Inter';
  const countdownTitleFontWeight = countdownTitleStyle.fontWeight ?? section.fontWeight ?? '800';
  const countdownTitleFontStyle = countdownTitleStyle.fontStyle ?? section.fontStyle ?? 'normal';
  const countdownTitleColor = countdownTitleStyle.textColor ?? section.textColor ?? '#7c6f64';
  const isItinerary = section.type === 'ITINERARY';

  React.useEffect(() => {
    if (!isFirst) {
      return;
    }

    let repeatableChanged = false;
    const normalizedElements = getSectionElements(section).map((element) => {
      const nextPosition = constrainPositionToSection(element.kind, element.position);

      if (positionsMatch(nextPosition, element.position)) {
        return element;
      }

      repeatableChanged = true;
      return {
        ...element,
        position: nextPosition,
      };
    });

    const nextUpdates: Partial<Section> = repeatableChanged
      ? syncSectionElements(section, normalizedElements)
      : {};
    const nextPositions = { ...(nextUpdates.positions || section.positions || {}) };

    const getStoredSpecialPosition = (
      kind: 'countdown' | 'guests' | 'location' | 'music'
    ): { key: 'countdown' | 'guests' | 'location' | 'music' | 'extra'; position: { x: number; y: number } } | null => {
      if (section.positions?.[kind]) {
        return { key: kind, position: section.positions[kind]! };
      }

      if (kind === 'location') {
        return null;
      }

      if (section.positions?.extra) {
        return { key: 'extra', position: section.positions.extra };
      }

      return null;
    };

    let specialChanged = false;

    if (section.type === 'COUNTDOWN') {
      const stored = getStoredSpecialPosition('countdown');

      if (stored) {
        const nextPosition = constrainPositionToSection('countdown', stored.position);

        if (!positionsMatch(nextPosition, stored.position)) {
          nextPositions[stored.key] = nextPosition;
          specialChanged = true;
        }
      }
    }

    if (section.type === 'GUESTS') {
      const stored = getStoredSpecialPosition('guests');

      if (stored) {
        const nextPosition = constrainPositionToSection('guests', stored.position);

        if (!positionsMatch(nextPosition, stored.position)) {
          nextPositions[stored.key] = nextPosition;
          specialChanged = true;
        }
      }
    }

    if (section.type === 'LOCATION') {
      const stored = getStoredSpecialPosition('location');

      if (stored) {
        const nextPosition = constrainPositionToSection('location', stored.position);

        if (!positionsMatch(nextPosition, stored.position)) {
          nextPositions[stored.key] = nextPosition;
          specialChanged = true;
        }
      }
    }

    if (section.type === 'MUSIC') {
      const stored = getStoredSpecialPosition('music');

      if (stored) {
        const nextPosition = constrainPositionToSection('music', stored.position);

        if (!positionsMatch(nextPosition, stored.position)) {
          nextPositions[stored.key] = nextPosition;
          specialChanged = true;
        }
      }
    }

    if (!repeatableChanged && !specialChanged) {
      return;
    }

    onUpdate({
      ...nextUpdates,
      ...(specialChanged ? { positions: nextPositions } : {}),
    });
  }, [constrainPositionToSection, isFirst, onUpdate, section]);

  const isElementSelected = (kind: RepeatableSectionElementKind, elementId: string) => {
    return isSelected && activeTextElement === kind && selectedElementId === elementId;
  };

  const renderAnimatedElement = (
    element: SectionElement,
    children: React.ReactNode,
    className?: string
  ) => {
    const elementAnimation = getSectionElementAnimation(element);
    const animationType = elementAnimation.type || 'none';
    const animationDuration = Math.max(0.2, Math.min(2, elementAnimation.duration ?? 0.6));
    const enterAnimation = getSectionEnterAnimation(animationType);
    const replayKey = `${element.id}:${animationType}:${animationDuration}:${previewRefreshToken}`;

    return (
      <motion.div
        key={replayKey}
        initial={enterAnimation.initial}
        animate={enterAnimation.animate}
        transition={
          animationType === 'none'
            ? undefined
            : { duration: animationDuration, ease: 'easeOut' }
        }
        className={className}
      >
        {children}
      </motion.div>
    );
  };

  React.useEffect(() => {
    if (section.type !== 'COUNTDOWN') return;

    const timer = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [section.type]);

  React.useEffect(() => {
    const element = sectionFrameRef.current;
    if (!element) return;

    const updateWidth = () => {
      setSectionWidth(element.clientWidth || MOBILE_EDITOR_BASE_WIDTH);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  const renderTextElement = (kind: 'title' | 'subtitle' | 'content') => {
    return repeatableElements
      .filter((element) => element.kind === kind && element.value !== '')
      .map((element) => {
        const isActive = isElementSelected(kind, element.id);
        const selectedClassName = isActive ? ' ring-1 ring-indigo-500' : '';
        const basePosition = getCanvasBasePosition(kind);
        const elementPosition = constrainPositionToSection(kind, element.position);
        const textStyle = getSectionTextStyle(element);
        const baseTextSize = section.fontSize || 24;
        const resolvedFontSize = textStyle.fontSize !== undefined
          ? textStyle.fontSize
          : kind === 'title'
            ? baseTextSize
            : kind === 'subtitle'
              ? Math.max(10, Math.round(baseTextSize * 0.55))
              : Math.max(12, Math.round(baseTextSize * 0.6));
        const textBlockWidth = Math.max(
          scaleCanvasValue(160),
          Math.min(
            sectionWidth - scaleCanvasValue(48),
            scaleCanvasValue(kind === 'content' ? 260 : 280)
          )
        );
        const sharedStyle: React.CSSProperties = {
          left: basePosition.left,
          top: basePosition.top,
          zIndex: getSectionElementLayer(element),
          width: 'fit-content',
          maxWidth: textBlockWidth,
          whiteSpace: 'pre-wrap',
          color: textStyle.textColor ?? section.textColor ?? '#1a1a1a',
          fontFamily: textStyle.fontFamily ?? section.fontFamily ?? 'inherit',
          fontStyle: textStyle.fontStyle ?? section.fontStyle ?? 'normal',
          textAlign: textStyle.textAlign ?? section.alignment ?? 'center',
        };

        if (kind === 'title') {
          return (
            <SoftSnapDraggable
              key={element.id}
              x={elementPosition.x}
              y={elementPosition.y}
              dragEnabled={isMoveModeActive}
              dragScale={effectiveCanvasScale}
              onPointerDown={() => selectRepeatableElement('title', element.id)}
              onClick={(event) => event.stopPropagation()}
              onPositionCommit={(position) => updateRepeatableElementPosition('title', element.id, position)}
              getGuideTargets={getGuideTargets}
              constrainPosition={(position, size) => constrainPositionToSection('title', position, size)}
              className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'}${selectedClassName}`}
              style={sharedStyle}
            >
              {renderSelectionRectangle(isActive, {
                insetClassName: '-inset-x-2 -inset-y-1',
              })}
              {renderAnimatedElement(
                element,
                (
                  <h3
                    className="relative z-20 font-black uppercase tracking-tight"
                    style={{
                      fontSize: scaleCanvasValue(resolvedFontSize),
                      fontWeight: textStyle.fontWeight ?? section.fontWeight ?? 800,
                      lineHeight: 1.05,
                    }}
                  >
                    {element.value}
                  </h3>
                )
              )}
              {renderSelectionCenterGuide(isActive)}
            </SoftSnapDraggable>
          );
        }

        if (kind === 'subtitle') {
          return (
            <SoftSnapDraggable
              key={element.id}
              x={elementPosition.x}
              y={elementPosition.y}
              dragEnabled={isMoveModeActive}
              dragScale={effectiveCanvasScale}
              onPointerDown={() => selectRepeatableElement('subtitle', element.id)}
              onClick={(event) => event.stopPropagation()}
              onPositionCommit={(position) => updateRepeatableElementPosition('subtitle', element.id, position)}
              getGuideTargets={getGuideTargets}
              constrainPosition={(position, size) => constrainPositionToSection('subtitle', position, size)}
              className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'}${selectedClassName}`}
              style={sharedStyle}
            >
              {renderSelectionRectangle(isActive, {
                insetClassName: '-inset-x-2 -inset-y-1',
              })}
              {renderAnimatedElement(
                element,
                (
                  <p
                    className="relative z-20 uppercase tracking-[0.2em]"
                    style={{
                      fontSize: scaleCanvasValue(resolvedFontSize),
                      fontWeight: textStyle.fontWeight ?? section.fontWeight ?? 700,
                      lineHeight: 1.15,
                    }}
                  >
                    {element.value}
                  </p>
                )
              )}
              {renderSelectionCenterGuide(isActive)}
            </SoftSnapDraggable>
          );
        }

        return (
          <SoftSnapDraggable
            key={element.id}
            x={elementPosition.x}
            y={elementPosition.y}
            dragEnabled={isMoveModeActive}
            dragScale={effectiveCanvasScale}
            onPointerDown={() => selectRepeatableElement('content', element.id)}
            onClick={(event) => event.stopPropagation()}
            onPositionCommit={(position) => updateRepeatableElementPosition('content', element.id, position)}
            getGuideTargets={getGuideTargets}
            constrainPosition={(position, size) => constrainPositionToSection('content', position, size)}
            className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'}${selectedClassName}`}
            style={sharedStyle}
          >
            {renderSelectionRectangle(isActive, {
              insetClassName: '-inset-x-2 -inset-y-1.5',
            })}
            {renderAnimatedElement(
              element,
              (
                <p
                  className="relative z-20"
                  style={{
                    fontSize: scaleCanvasValue(resolvedFontSize),
                    fontWeight: textStyle.fontWeight ?? section.fontWeight ?? 600,
                    lineHeight: 1.45,
                  }}
                >
                  {element.value}
                </p>
              )
            )}
            {renderSelectionCenterGuide(isActive)}
          </SoftSnapDraggable>
        );
      });
  };

  return (
    <div
      ref={sectionFrameRef}
      onClick={(e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement | null;
        if (target?.closest('[data-editor-element="true"]')) {
          return;
        }
        onSelect();
        onSelectTextElement(hasSelectableBackgroundImage ? 'backgroundImage' : null, null);
      }}
      className={`relative group transition-all duration-300 rounded-none overflow-visible cursor-pointer border-2 ${pkg.fontClass} ${
        isSelected ? 'border-indigo-500 z-10' : 'border-transparent hover:border-indigo-200'
      }`}
      style={{
        height: getSectionHeight(),
        minHeight: getSectionHeight(),
        flexShrink: 0,
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
      {renderSelectionCenterGuide(isSelected && activeTextElement === 'backgroundImage')}
      <div ref={sectionContentRef} className="relative flex flex-col p-4 w-full h-full justify-center overflow-visible">
        {isItinerary ? (
          <ItineraryTimeline
            items={section.itineraryItems}
            textColor={section.textColor || '#1a1a1a'}
            fontFamily={section.fontFamily || 'Inter'}
            fontSize={section.fontSize || 16}
            fontWeight={section.fontWeight || '600'}
            fontStyle={section.fontStyle || 'normal'}
            styleConfig={section.itineraryStyle}
            compact
            className="min-h-full pb-4"
          />
        ) : section.type === 'COUNTDOWN' ? (
          (() => {
            const countdownPosition = constrainPositionToSection('countdown', getSpecialElementPosition('countdown'));

            return (
          <SoftSnapDraggable
            x={countdownPosition.x}
            y={countdownPosition.y}
            dragEnabled={isMoveModeActive}
            dragScale={effectiveCanvasScale}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement('countdown', null);
            }}
            onClick={(event) => event.stopPropagation()}
            onPositionCommit={(position) => updateSpecialElementPosition('countdown', position)}
            getGuideTargets={getGuideTargets}
            constrainPosition={(position, size) => constrainPositionToSection('countdown', position, size)}
            className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${
              isSelected && activeTextElement === 'countdown' ? 'ring-1 ring-indigo-500' : ''
            }`}
              style={{
                left: getCanvasBasePosition('countdown').left,
                top: getCanvasBasePosition('countdown').top,
                zIndex: 10000,
                width: 'fit-content',
              }}
          >
            {renderSelectionRectangle(isSelected && activeTextElement === 'countdown')}
              <CountdownDisplay
              parts={countdownParts}
              fontSize={scaleCanvasValue(countdownFontSize)}
              fontFamily={countdownFontFamily}
              fontWeight={countdownFontWeight}
              fontStyle={countdownFontStyle}
              textColor={countdownTextColor}
              scale={countdownScale}
              itemGap={countdownItemGap !== undefined ? scaleCanvasValue(countdownItemGap) : undefined}
              title={countdownTitleValue}
              titleFontSize={scaleCanvasValue(countdownTitleFontSize)}
              titleFontFamily={countdownTitleFontFamily}
              titleFontWeight={countdownTitleFontWeight}
              titleFontStyle={countdownTitleFontStyle}
              titleTextColor={countdownTitleColor}
              panelStyle={{
                width: countdownPanelStyle.width,
                height: countdownPanelStyle.height,
                backgroundColor: countdownPanelStyle.backgroundColor,
                borderColor: countdownPanelStyle.borderColor,
                borderWidth: countdownPanelStyle.borderWidth,
                borderRadius: countdownPanelStyle.borderRadius !== undefined ? scaleCanvasValue(countdownPanelStyle.borderRadius) : undefined,
                opacity: countdownPanelStyle.opacity,
                shadow: countdownPanelStyle.shadow,
              }}
              tileStyle={{
                width: countdownTileStyle.width !== undefined ? scaleCanvasValue(countdownTileStyle.width) : undefined,
                height: countdownTileStyle.height !== undefined ? scaleCanvasValue(countdownTileStyle.height) : undefined,
                backgroundColor: countdownTileStyle.backgroundColor,
                borderColor: countdownTileStyle.borderColor,
                borderWidth: countdownTileStyle.borderWidth,
                borderRadius: countdownTileStyle.borderRadius !== undefined ? scaleCanvasValue(countdownTileStyle.borderRadius) : undefined,
                opacity: countdownTileStyle.opacity,
                shadow: countdownTileStyle.shadow,
              }}
            />
            {renderSelectionCenterGuide(isSelected && activeTextElement === 'countdown')}
            {isSelected && activeTextElement === 'countdown' && (
              <button
                type="button"
                data-editor-element="true"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={startCountdownResize}
                className="absolute -right-3 -bottom-3 h-7 w-7 rounded-full bg-indigo-600 text-white shadow-lg border-2 border-white flex items-center justify-center"
                title="Redimensionar cuenta regresiva"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l5-5M20 4v4m0-4h-4M9 15l-5 5m0-4v4m0 0h4" />
                </svg>
              </button>
            )}
          </SoftSnapDraggable>
            );
          })()
        ) : section.type === 'GUESTS' ? (
          (() => {
            const guestsPosition = constrainPositionToSection('guests', getSpecialElementPosition('guests'));

            return (
          <SoftSnapDraggable
            x={guestsPosition.x}
            y={guestsPosition.y}
            dragEnabled={isMoveModeActive}
            dragScale={effectiveCanvasScale}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement('guests', null);
            }}
            onClick={(event) => event.stopPropagation()}
            onPositionCommit={(position) => updateSpecialElementPosition('guests', position)}
            getGuideTargets={getGuideTargets}
            constrainPosition={(position, size) => constrainPositionToSection('guests', position, size)}
            className={`absolute relative flex flex-col items-center gap-1 ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${
              isSelected && activeTextElement === 'guests' ? 'ring-1 ring-indigo-500' : ''
            }`}
              style={{
                left: getCanvasBasePosition('guests').left,
                top: getCanvasBasePosition('guests').top,
                zIndex: 10000,
                width: scaleCanvasValue(140),
              }}
          >
            {renderSelectionRectangle(isSelected && activeTextElement === 'guests')}
            {renderSelectionCenterGuide(isSelected && activeTextElement === 'guests')}
            <div className="w-full bg-black/5 rounded-none p-1.5 border border-black/5">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[7px] font-bold opacity-70 uppercase tracking-tighter">Confirmar</span>
                <span className="text-[7px]">RSVP</span>
              </div>
              <div className="h-3 bg-white/50 rounded-none mb-0.5"></div>
              <div className="h-3 bg-indigo-500/20 rounded-none"></div>
            </div>
          </SoftSnapDraggable>
            );
          })()
        ) : section.type === 'MUSIC' ? (
          (() => {
            const musicPosition = constrainPositionToSection('music', getSpecialElementPosition('music'));

            return (
          <SoftSnapDraggable
            x={musicPosition.x}
            y={musicPosition.y}
            dragEnabled={isMoveModeActive}
            dragScale={effectiveCanvasScale}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement('music', null);
            }}
            onClick={(event) => event.stopPropagation()}
            onPositionCommit={(position) => updateSpecialElementPosition('music', position)}
            getGuideTargets={getGuideTargets}
            constrainPosition={(position, size) => constrainPositionToSection('music', position, size)}
            className={`absolute relative flex flex-col items-center gap-1 ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${
              isSelected && activeTextElement === 'music' ? 'ring-1 ring-indigo-500' : ''
            }`}
              style={{
                left: getCanvasBasePosition('music').left,
                top: getCanvasBasePosition('music').top,
                zIndex: 10000,
                width: scaleCanvasValue(220),
              }}
          >
            {renderSelectionRectangle(isSelected && activeTextElement === 'music')}
            {renderSelectionCenterGuide(isSelected && activeTextElement === 'music')}
            {section.audioUrl ? (
              <audio controls className="w-full h-8">
                <source src={section.audioUrl} />
              </audio>
            ) : (
              <div className="w-full bg-black/10 rounded-none px-3 py-2 text-[8px] font-bold uppercase tracking-widest opacity-70">
                Agrega un audio para reproducir música
              </div>
            )}
          </SoftSnapDraggable>
            );
          })()
        ) : null}

        {containerElements.map((element) => {
          const containerStyle = getSectionContainerStyle(element);
          const isActive = isElementSelected('container', element.id);
          const containerCanvasBasePosition = getCanvasBasePosition('container');
          const containerPosition = constrainPositionToSection('container', element.position);

          return (
            <SoftSnapDraggable
              key={element.id}
              x={containerPosition.x}
              y={containerPosition.y}
              dragEnabled={isMoveModeActive}
              dragScale={effectiveCanvasScale}
              onPointerDown={() => selectRepeatableElement('container', element.id)}
              onClick={(event) => event.stopPropagation()}
              onPositionCommit={(position) => updateRepeatableElementPosition('container', element.id, position)}
              getGuideTargets={getGuideTargets}
              constrainPosition={(position, size) => constrainPositionToSection('container', position, size)}
              className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${isActive ? 'ring-1 ring-indigo-500' : ''}`}
              style={{
                left: containerCanvasBasePosition.left,
                top: containerCanvasBasePosition.top,
                zIndex: getSectionElementLayer(element),
                width: scaleCanvasValue(containerStyle.width ?? 240),
                height: scaleCanvasValue(containerStyle.height ?? 140),
              }}
            >
              {renderSelectionRectangle(isActive, {
                insetClassName: '-inset-1',
              })}
              {renderSelectionCenterGuide(isActive)}
              {renderAnimatedElement(
                element,
                (
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundColor: containerStyle.backgroundColor || 'transparent',
                      borderColor: containerStyle.borderColor || '#1f2937',
                      borderStyle: 'solid',
                      borderWidth: Math.max(1, scaleCanvasValue(containerStyle.borderWidth ?? 2)),
                      borderRadius: scaleCanvasValue(containerStyle.borderRadius ?? 24),
                      opacity: Math.max(0, Math.min(100, containerStyle.opacity ?? 100)) / 100,
                      boxShadow: containerStyle.shadow
                        ? '0 18px 40px rgba(15, 23, 42, 0.16)'
                        : 'none',
                    }}
                  />
                ),
                'h-full w-full'
              )}
              {renderContainerResizeHandles(element.id, isActive)}
            </SoftSnapDraggable>
          );
        })}

        {visibleMainImageElements.map((element) => {
          const imageStyle = getSectionImageStyle(element, section, 'image');
          const isActive = isElementSelected('image', element.id);
          const imageCanvasBasePosition = getCanvasBasePosition('image');
          const imagePosition = constrainPositionToSection('image', element.position);

          return (
            <SoftSnapDraggable
              key={element.id}
              x={imagePosition.x}
              y={imagePosition.y}
              dragEnabled={isMoveModeActive}
              dragScale={effectiveCanvasScale}
              onPointerDown={() => selectRepeatableElement('image', element.id)}
              onClick={(event) => event.stopPropagation()}
              onPositionCommit={(position) => updateRepeatableElementPosition('image', element.id, position)}
              getGuideTargets={getGuideTargets}
              constrainPosition={(position, size) => constrainPositionToSection('image', position, size)}
              className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${isActive ? 'ring-1 ring-indigo-500' : ''}`}
              style={{
                left: imageCanvasBasePosition.left,
                top: imageCanvasBasePosition.top,
                zIndex: getSectionElementLayer(element),
                width: scaleCanvasValue(imageStyle.width ?? 260),
                height: scaleCanvasValue(imageStyle.height ?? 300),
              }}
            >
              {renderSelectionRectangle(isActive, {
                insetClassName: '-inset-1',
              })}
              {renderSelectionCenterGuide(isActive)}
              {renderAnimatedElement(
                element,
                (
                  <div className="h-full w-full overflow-hidden rounded-xl shadow-sm">
                    <img
                      src={element.value}
                      alt=""
                      decoding="async"
                      draggable={false}
                      className={`h-full w-full ${imageStyle.fit === 'cover' ? 'object-cover' : 'object-contain'} pointer-events-none select-none`}
                      style={getImagePresentationStyle(Math.max(20, Math.min(300, imageStyle.scale ?? 100)) / 100)}
                    />
                  </div>
                ),
                'h-full w-full'
              )}
              {isActive && (
                <button
                  type="button"
                  data-editor-element="true"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => startImageResize(event, element.id, 'image')}
                  className="absolute -right-3 -bottom-3 h-7 w-7 rounded-full bg-indigo-600 text-white shadow-lg border-2 border-white flex items-center justify-center"
                  title="Redimensionar imagen"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l5-5M20 4v4m0-4h-4M9 15l-5 5m0-4v4m0 0h4" />
                  </svg>
                </button>
              )}
            </SoftSnapDraggable>
          );
        })}

        {!isItinerary && renderTextElement('title')}
        {!isItinerary && renderTextElement('subtitle')}
        {!isItinerary && renderTextElement('content')}

        {section.type === 'LOCATION' && (
          <SoftSnapDraggable
            x={constrainPositionToSection('location', getSpecialElementPosition('location')).x}
            y={constrainPositionToSection('location', getSpecialElementPosition('location')).y}
            dragEnabled={isMoveModeActive}
            dragScale={effectiveCanvasScale}
            onPointerDown={() => {
              onSelect();
              onSelectTextElement('location', null);
            }}
            onClick={(event) => event.stopPropagation()}
            onPositionCommit={(position) => updateSpecialElementPosition('location', position)}
            getGuideTargets={getGuideTargets}
            constrainPosition={(position, size) => constrainPositionToSection('location', position, size)}
            className={`absolute relative overflow-hidden rounded-2xl border bg-white/90 shadow-sm ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${
              isSelected && activeTextElement === 'location'
                ? 'border-indigo-500 ring-1 ring-indigo-500'
                : 'border-black/10'
            }`}
            style={{
              left: getCanvasBasePosition('location').left,
              top: getCanvasBasePosition('location').top,
              zIndex: 10000,
              width: scaleCanvasValue(270),
            }}
          >
            {renderSelectionRectangle(isSelected && activeTextElement === 'location', {
              insetClassName: '-inset-1',
            })}
            {renderSelectionCenterGuide(isSelected && activeTextElement === 'location')}
            {locationEmbedUrl ? (
              <div className="pointer-events-none h-40 w-full">
                <iframe
                  src={locationEmbedUrl}
                  title="Vista previa de ubicación"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                />
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center px-4 text-center text-[8px] font-black uppercase tracking-[0.16em] text-gray-400">
                Pega un link de Google Maps para mostrar el mapa aquí.
              </div>
            )}
          </SoftSnapDraggable>
        )}

        {visibleContentImageElements.map((element) => {
          const imageStyle = getSectionImageStyle(element, section, 'contentImage');
          const isActive = isElementSelected('contentImage', element.id);
          const imageCanvasBasePosition = getCanvasBasePosition('contentImage');
          const imagePosition = constrainPositionToSection('contentImage', element.position);

          return (
            <SoftSnapDraggable
              key={element.id}
              x={imagePosition.x}
              y={imagePosition.y}
              dragEnabled={isMoveModeActive}
              dragScale={effectiveCanvasScale}
              onPointerDown={() => selectRepeatableElement('contentImage', element.id)}
              onClick={(event) => event.stopPropagation()}
              onPositionCommit={(position) => updateRepeatableElementPosition('contentImage', element.id, position)}
              getGuideTargets={getGuideTargets}
              constrainPosition={(position, size) => constrainPositionToSection('contentImage', position, size)}
              className={`absolute relative ${isMoveModeActive ? 'cursor-move' : 'cursor-pointer'} ${isActive ? 'ring-1 ring-indigo-500' : ''}`}
              style={{
                left: imageCanvasBasePosition.left,
                top: imageCanvasBasePosition.top,
                zIndex: getSectionElementLayer(element),
                width: scaleCanvasValue(imageStyle.width ?? 220),
                height: scaleCanvasValue(imageStyle.height ?? 200),
              }}
            >
              {renderSelectionRectangle(isActive, {
                insetClassName: '-inset-1',
              })}
              {renderSelectionCenterGuide(isActive)}
              {renderAnimatedElement(
                element,
                (
                  <div className="h-full w-full overflow-hidden rounded-xl shadow-sm">
                    <img
                      src={element.value}
                      alt=""
                      decoding="async"
                      draggable={false}
                      className={`h-full w-full ${imageStyle.fit === 'cover' ? 'object-cover' : 'object-contain'} pointer-events-none select-none`}
                      style={getImagePresentationStyle(Math.max(20, Math.min(300, imageStyle.scale ?? 100)) / 100)}
                    />
                  </div>
                ),
                'h-full w-full'
              )}
              {isActive && (
                <button
                  type="button"
                  data-editor-element="true"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => startImageResize(event, element.id, 'contentImage')}
                  className="absolute -right-3 -bottom-3 h-7 w-7 rounded-full bg-indigo-600 text-white shadow-lg border-2 border-white flex items-center justify-center"
                  title="Redimensionar imagen secundaria"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l5-5M20 4v4m0-4h-4M9 15l-5 5m0-4v4m0 0h4" />
                  </svg>
                </button>
              )}
            </SoftSnapDraggable>
          );
        })}
      </div>
    </div>
  );
};
