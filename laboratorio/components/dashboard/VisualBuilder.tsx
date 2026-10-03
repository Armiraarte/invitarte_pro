import React, { useEffect, useState } from 'react';
import { Section, PackageDefinition, SectionHeight, SectionPositionKey } from '../../types';
import { Canvas } from './Canvas';
import { GeneralToolsPanel, PropertyPanel } from './PropertyPanel';
import { MobileMockup } from '../MobileMockup';
import {
  getSectionElementById,
  getSectionElementCount,
  getSectionElements,
  isRepeatableElementKind,
  removeSectionElement,
  syncSectionElements,
} from './sectionElements';

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
type PreviewSurfaceMode = 'editor' | 'live';
type LivePreviewBridgeSelectionMessage = {
  type: 'invitarte-preview-select';
  payload?: {
    sectionId?: string | null;
    element?: ActiveTextElement;
    elementId?: string | null;
  };
};

type LivePreviewBridgeUpdateMessage = {
  type: 'invitarte-preview-update';
  payload?: {
    sectionId?: string | null;
    element?: ActiveTextElement;
    elementId?: string | null;
    position?: {
      x?: number | null;
      y?: number | null;
    } | null;
  };
};

type LivePreviewBridgeStateMessage = {
  type: 'invitarte-preview-state';
  payload: {
    sections: Section[];
    globalBg?: { type: 'color' | 'image'; value: string };
    projectTitle?: string;
    selectedSectionId: string | null;
    selectedElementId: string | null;
    activeTextElement: ActiveTextElement;
    moveModeActive: boolean;
    previewRefreshToken: number;
  };
};

const HISTORY_LIMIT = 100;
const getDefaultPreviewSurfaceMode = (
  hasLivePreview: boolean
): PreviewSurfaceMode => {
  return hasLivePreview ? 'live' : 'editor';
};

const cloneSectionsSnapshot = (snapshot: Section[]): Section[] => {
  if (typeof structuredClone === 'function') {
    return structuredClone(snapshot);
  }

  return JSON.parse(JSON.stringify(snapshot)) as Section[];
};

const serializeSectionsSnapshot = (snapshot: Section[]) => JSON.stringify(snapshot);

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;

  return !!element && (
    element.tagName === 'INPUT'
    || element.tagName === 'TEXTAREA'
    || element.tagName === 'SELECT'
    || element.isContentEditable
  );
};

const isActiveTextElement = (value: unknown): value is ActiveTextElement => {
  return value === null
    || value === 'title'
    || value === 'subtitle'
    || value === 'content'
    || value === 'image'
    || value === 'contentImage'
    || value === 'container'
    || value === 'backgroundImage'
    || value === 'countdown'
    || value === 'timeline'
    || value === 'guests'
    || value === 'location'
    || value === 'music';
};

const omitSectionPositionKeys = (
  positions: Section['positions'],
  keys: SectionPositionKey[]
): NonNullable<Section['positions']> => {
  const nextPositions = { ...(positions || {}) };

  keys.forEach((key) => {
    delete nextPositions[key];
  });

  return nextPositions;
};

const hasBackgroundImage = (section: Section) => {
  return section.bgType === 'image'
    || getSectionElements(section).some((element) => element.kind === 'image' && !!element.value && !!element.style?.asSectionBackground);
};

const hasActiveElementInSection = (section: Section, activeElement: ActiveTextElement) => {
  if (activeElement === 'title') return getSectionElementCount(section, 'title') > 0;
  if (activeElement === 'subtitle') return getSectionElementCount(section, 'subtitle') > 0;
  if (activeElement === 'content') return getSectionElementCount(section, 'content') > 0;
  if (activeElement === 'image') return getSectionElementCount(section, 'image') > 0;
  if (activeElement === 'contentImage') return getSectionElementCount(section, 'contentImage') > 0;
  if (activeElement === 'container') return getSectionElementCount(section, 'container') > 0;
  if (activeElement === 'backgroundImage') return hasBackgroundImage(section);
  if (activeElement === 'countdown') return section.type === 'COUNTDOWN';
  if (activeElement === 'timeline') return section.type === 'ITINERARY';
  if (activeElement === 'guests') return section.type === 'GUESTS';
  if (activeElement === 'location') return section.type === 'LOCATION';
  if (activeElement === 'music') return section.type === 'MUSIC';
  return true;
};

interface VisualBuilderProps {
  sections: Section[];
  onUpdateSections: (sections: Section[]) => void;
  pkg: PackageDefinition;
  projectTitle?: string;
  globalBg?: { type: 'color' | 'image'; value: string };
  onUpdateGlobalBg?: (bg: { type: 'color' | 'image'; value: string }) => void;
  onRefreshPreview?: () => void;
  previewRefreshToken?: number;
  livePreviewBaseUrl?: string | null;
  focusMode?: boolean;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  sections,
  onUpdateSections,
  pkg,
  projectTitle,
  globalBg,
  onUpdateGlobalBg,
  onRefreshPreview,
  previewRefreshToken = 0,
  livePreviewBaseUrl = null,
  focusMode = false,
}) => {
  const hasLivePreview = (livePreviewBaseUrl?.trim() ?? '') !== '';
  const keepLivePreviewVisible = focusMode && hasLivePreview;
  const defaultPreviewSurfaceMode = keepLivePreviewVisible ? 'live' : getDefaultPreviewSurfaceMode(hasLivePreview);
  const defaultShowGuides = false;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(sections[0]?.id || null);
  const [activeTextElement, setActiveTextElement] = useState<ActiveTextElement>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGuides, setShowGuides] = useState(() => defaultShowGuides);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewSurfaceMode, setPreviewSurfaceMode] = useState<PreviewSurfaceMode>(() => defaultPreviewSurfaceMode);
  const [previewScale, setPreviewScale] = useState(1);
  const [isLivePreviewLoading, setIsLivePreviewLoading] = useState(false);
  const [isLivePreviewReady, setIsLivePreviewReady] = useState(false);
  const [livePreviewLoadError, setLivePreviewLoadError] = useState<string | null>(null);
  const [livePreviewRetryToken, setLivePreviewRetryToken] = useState(0);
  const previewViewportRef = React.useRef<HTMLDivElement | null>(null);
  const livePreviewFrameRef = React.useRef<HTMLIFrameElement | null>(null);
  const lastPreviewSourceKeyRef = React.useRef<string | null>(null);
  const undoHistoryRef = React.useRef<Section[][]>([]);
  const redoHistoryRef = React.useRef<Section[][]>([]);
  const expectedSectionsSignatureRef = React.useRef<string | null>(null);
  const currentSectionsSignatureRef = React.useRef(serializeSectionsSnapshot(sections));
  const hasManualPreviewSurfaceSelectionRef = React.useRef(false);

  const clearSelection = React.useCallback(() => {
    setSelectedSectionId(null);
    setActiveTextElement(null);
    setSelectedElementId(null);
  }, []);

  const pushHistorySnapshot = React.useCallback(
    (historyRef: React.MutableRefObject<Section[][]>, snapshot: Section[]) => {
      const nextSnapshot = cloneSectionsSnapshot(snapshot);
      const nextSignature = serializeSectionsSnapshot(nextSnapshot);
      const lastSnapshot = historyRef.current[historyRef.current.length - 1];

      if (lastSnapshot && serializeSectionsSnapshot(lastSnapshot) === nextSignature) {
        return;
      }

      historyRef.current = historyRef.current.length >= HISTORY_LIMIT
        ? [...historyRef.current.slice(-(HISTORY_LIMIT - 1)), nextSnapshot]
        : [...historyRef.current, nextSnapshot];
    },
    []
  );

  const applySectionsUpdate = React.useCallback((
    nextSections: Section[],
    options?: { recordHistory?: boolean; clearRedo?: boolean }
  ) => {
    const nextSignature = serializeSectionsSnapshot(nextSections);
    const currentSignature = serializeSectionsSnapshot(sections);

    if (nextSignature === currentSignature) {
      return;
    }

    if (options?.recordHistory !== false) {
      pushHistorySnapshot(undoHistoryRef, sections);
    }

    if (options?.clearRedo !== false) {
      redoHistoryRef.current = [];
    }

    expectedSectionsSignatureRef.current = nextSignature;
    onUpdateSections(cloneSectionsSnapshot(nextSections));
  }, [onUpdateSections, pushHistorySnapshot, sections]);

  const undo = React.useCallback(() => {
    const previousSections = undoHistoryRef.current[undoHistoryRef.current.length - 1];

    if (!previousSections) {
      return;
    }

    undoHistoryRef.current = undoHistoryRef.current.slice(0, -1);
    pushHistorySnapshot(redoHistoryRef, sections);
    applySectionsUpdate(previousSections, { recordHistory: false, clearRedo: false });
  }, [applySectionsUpdate, pushHistorySnapshot, sections]);

  const redo = React.useCallback(() => {
    const nextSections = redoHistoryRef.current[redoHistoryRef.current.length - 1];

    if (!nextSections) {
      return;
    }

    redoHistoryRef.current = redoHistoryRef.current.slice(0, -1);
    pushHistorySnapshot(undoHistoryRef, sections);
    applySectionsUpdate(nextSections, { recordHistory: false, clearRedo: false });
  }, [applySectionsUpdate, pushHistorySnapshot, sections]);

  useEffect(() => {
    const incomingSignature = serializeSectionsSnapshot(sections);

    if (expectedSectionsSignatureRef.current === incomingSignature) {
      currentSectionsSignatureRef.current = incomingSignature;
      expectedSectionsSignatureRef.current = null;
      return;
    }

    if (currentSectionsSignatureRef.current !== incomingSignature) {
      undoHistoryRef.current = [];
      redoHistoryRef.current = [];
      currentSectionsSignatureRef.current = incomingSignature;
      expectedSectionsSignatureRef.current = null;
    }
  }, [sections]);

  const addSection = (height: SectionHeight = '100') => {
    const newSection: Section = {
      id: Math.random().toString(36).slice(2, 11),
      type: 'BLANK',
      title: undefined,
      subtitle: undefined,
      content: undefined,
      imageUrl: undefined,
      audioUrl: undefined,
      animation: {
        type: 'none',
        duration: 0.6
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
      alignment: 'center',
      bgType: 'color',
      bgValue: 'transparent',
      height,
      textColor: '#1a1a1a',
      positions: {}
    };

    applySectionsUpdate([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    setActiveTextElement(null);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    applySectionsUpdate(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    const nextSections = sections.filter((s) => s.id !== id);
    applySectionsUpdate(nextSections);

    if (selectedSectionId === id) {
      const nextSelected = nextSections[0]?.id || null;
      setSelectedSectionId(nextSelected);
      setActiveTextElement(null);
      setSelectedElementId(null);
    }
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    applySectionsUpdate(newSections);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const livePreviewEmbedUrl = React.useMemo(() => {
    const normalizedBaseUrl = livePreviewBaseUrl?.trim() ?? '';
    if (normalizedBaseUrl === '') {
      return null;
    }

    if (typeof window === 'undefined') {
      return `${normalizedBaseUrl}${normalizedBaseUrl.includes('?') ? '&' : '?'}laboratorioPreview=${previewRefreshToken}`;
    }

    const previewUrl = new URL(normalizedBaseUrl, window.location.origin);
    previewUrl.searchParams.set('laboratorioPreview', String(previewRefreshToken));
    previewUrl.searchParams.set('laboratorioPreviewRetry', String(livePreviewRetryToken));
    previewUrl.searchParams.set('laboratorioParentOrigin', window.location.origin);
    return previewUrl.toString();
  }, [livePreviewBaseUrl, livePreviewRetryToken, previewRefreshToken]);
  const livePreviewOrigin = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return '*';
    }

    if (!livePreviewEmbedUrl) {
      return window.location.origin;
    }

    try {
      return new URL(livePreviewEmbedUrl, window.location.origin).origin;
    } catch {
      return window.location.origin;
    }
  }, [livePreviewEmbedUrl]);
  const previewSourceKey = React.useMemo(
    () => `${pkg.id}::${livePreviewBaseUrl?.trim() ?? ''}`,
    [livePreviewBaseUrl, pkg.id]
  );
  const effectivePreviewSurfaceMode = keepLivePreviewVisible ? 'live' : previewSurfaceMode;
  const showLivePreview = hasLivePreview && effectivePreviewSurfaceMode === 'live' && !!livePreviewEmbedUrl;
  const handlePreviewSurfaceModeChange = React.useCallback((mode: PreviewSurfaceMode) => {
    hasManualPreviewSurfaceSelectionRef.current = true;
    if (keepLivePreviewVisible) {
      setPreviewSurfaceMode('live');
      setShowGuides(mode !== 'live');
      return;
    }

    setPreviewSurfaceMode(mode);
    if (mode === 'live') {
      setShowGuides(false);
      return;
    }

    if (focusMode) {
      setShowGuides(true);
    }
  }, [focusMode, keepLivePreviewVisible]);
  const activateMoveMode = React.useCallback(() => {
    hasManualPreviewSurfaceSelectionRef.current = true;
    if (keepLivePreviewVisible) {
      setPreviewSurfaceMode('live');
      setShowGuides(true);
      return;
    }

    setPreviewSurfaceMode('editor');
    setShowGuides(true);
  }, [keepLivePreviewVisible]);
  const postLivePreviewState = React.useCallback(() => {
    const frameWindow = livePreviewFrameRef.current?.contentWindow;
    if (!frameWindow || !showLivePreview || !isLivePreviewReady) {
      return;
    }

    const message: LivePreviewBridgeStateMessage = {
      type: 'invitarte-preview-state',
      payload: {
        sections,
        globalBg,
        projectTitle,
        selectedSectionId,
        selectedElementId,
        activeTextElement,
        moveModeActive: showGuides,
        previewRefreshToken,
      },
    };

    try {
      frameWindow.postMessage(message, livePreviewOrigin);
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.warn('[VisualBuilder] No pudimos sincronizar el preview vivo todavía.', error);
      }
    }
  }, [
    activeTextElement,
    globalBg,
    isLivePreviewReady,
    livePreviewOrigin,
    showGuides,
    previewRefreshToken,
    projectTitle,
    sections,
    selectedElementId,
    selectedSectionId,
    showLivePreview,
  ]);
  const handleLivePreviewLoad = React.useCallback(() => {
    setLivePreviewLoadError(null);
    setIsLivePreviewLoading(false);
    setIsLivePreviewReady(true);
  }, []);
  const handleLivePreviewError = React.useCallback(() => {
    setIsLivePreviewLoading(false);
    setIsLivePreviewReady(false);
    setLivePreviewLoadError('No pudimos cargar la invitacion real con esta ruta.');
  }, []);
  const retryLivePreview = React.useCallback(() => {
    setLivePreviewLoadError(null);
    setIsLivePreviewLoading(true);
    setIsLivePreviewReady(false);
    setLivePreviewRetryToken((current) => current + 1);
    onRefreshPreview?.();
  }, [onRefreshPreview]);

  useEffect(() => {
    if (lastPreviewSourceKeyRef.current === null) {
      lastPreviewSourceKeyRef.current = previewSourceKey;
      return;
    }

    if (lastPreviewSourceKeyRef.current === previewSourceKey) {
      return;
    }

    lastPreviewSourceKeyRef.current = previewSourceKey;
    hasManualPreviewSurfaceSelectionRef.current = false;
    setShowGuides(defaultShowGuides);
    setPreviewSurfaceMode(defaultPreviewSurfaceMode);
  }, [defaultPreviewSurfaceMode, defaultShowGuides, previewSourceKey]);

  useEffect(() => {
    if (!hasLivePreview) {
      hasManualPreviewSurfaceSelectionRef.current = false;
      if (previewSurfaceMode !== defaultPreviewSurfaceMode) {
        setPreviewSurfaceMode(defaultPreviewSurfaceMode);
      }
      if (showGuides) {
        setShowGuides(false);
      }
      return;
    }

    if (keepLivePreviewVisible && previewSurfaceMode !== 'live') {
      setPreviewSurfaceMode('live');
      return;
    }

    if (!hasManualPreviewSurfaceSelectionRef.current && previewSurfaceMode !== defaultPreviewSurfaceMode) {
      setPreviewSurfaceMode(defaultPreviewSurfaceMode);
    }
  }, [defaultPreviewSurfaceMode, keepLivePreviewVisible, hasLivePreview, previewSurfaceMode, showGuides]);

  useEffect(() => {
    if (!showLivePreview) {
      return;
    }

    postLivePreviewState();
  }, [isLivePreviewReady, postLivePreviewState, showLivePreview]);

  useEffect(() => {
    if (!showLivePreview) {
      setLivePreviewLoadError(null);
      return;
    }

    setIsLivePreviewLoading(showLivePreview);
    setIsLivePreviewReady(false);
    setLivePreviewLoadError(null);
  }, [livePreviewEmbedUrl, showLivePreview]);

  useEffect(() => {
    if (
      typeof window === 'undefined'
      || !showLivePreview
      || !isLivePreviewLoading
      || isLivePreviewReady
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLivePreviewLoading(false);
      setIsLivePreviewReady(false);
      setLivePreviewLoadError('La invitacion real tardo demasiado en responder. Reintentala con la ruta local del evento.');
    }, 12000);

    return () => window.clearTimeout(timeoutId);
  }, [isLivePreviewLoading, isLivePreviewReady, showLivePreview]);

  useEffect(() => {
    const handlePreviewBridgeMessage = (event: MessageEvent<LivePreviewBridgeSelectionMessage | LivePreviewBridgeUpdateMessage>) => {
      const previewWindow = livePreviewFrameRef.current?.contentWindow;
      if (!previewWindow || event.source !== previewWindow) {
        return;
      }

      if (livePreviewOrigin !== '*' && event.origin !== livePreviewOrigin) {
        return;
      }

      if (event.data?.type === 'invitarte-preview-select') {
        const nextSectionId = typeof event.data.payload?.sectionId === 'string'
          ? event.data.payload.sectionId
          : null;
        const nextElement = isActiveTextElement(event.data.payload?.element)
          ? event.data.payload.element
          : null;
        const nextElementId = typeof event.data.payload?.elementId === 'string'
          ? event.data.payload.elementId
          : null;

        if (nextSectionId && sections.some((section) => section.id === nextSectionId)) {
          setSelectedSectionId(nextSectionId);
        }

        setActiveTextElement(nextElement);
        setSelectedElementId(nextElementId);
        return;
      }

      if (event.data?.type !== 'invitarte-preview-update') {
        return;
      }

      const nextSectionId = typeof event.data.payload?.sectionId === 'string'
        ? event.data.payload.sectionId
        : null;
      const nextElement = isActiveTextElement(event.data.payload?.element)
        ? event.data.payload.element
        : null;
      const nextElementId = typeof event.data.payload?.elementId === 'string'
        ? event.data.payload.elementId
        : null;
      const rawPosition = event.data.payload?.position;
      const nextPosition = rawPosition
        && Number.isFinite(rawPosition.x)
        && Number.isFinite(rawPosition.y)
        ? {
            x: Math.round(rawPosition.x),
            y: Math.round(rawPosition.y),
          }
        : null;

      if (!nextSectionId || !nextPosition) {
        return;
      }

      if (!sections.some((section) => section.id === nextSectionId)) {
        return;
      }

      let nextSections = sections;

      if (nextElement && isRepeatableElementKind(nextElement) && nextElementId) {
        nextSections = sections.map((section) => (
          section.id !== nextSectionId
            ? section
            : {
                ...section,
                ...syncSectionElements(
                  section,
                  getSectionElements(section).map((element) => (
                    element.id === nextElementId
                      ? {
                          ...element,
                          position: nextPosition,
                        }
                      : element
                  ))
                ),
              }
        ));
      } else if (nextElement === 'countdown' || nextElement === 'guests' || nextElement === 'location' || nextElement === 'music') {
        nextSections = sections.map((section) => (
          section.id !== nextSectionId
            ? section
            : {
                ...section,
                positions: {
                  ...(section.positions || {}),
                  [nextElement]: nextPosition,
                },
              }
        ));
      } else {
        return;
      }

      applySectionsUpdate(nextSections);
      setSelectedSectionId(nextSectionId);
      setActiveTextElement(nextElement);
      setSelectedElementId(nextElementId);
    };

    window.addEventListener('message', handlePreviewBridgeMessage);
    return () => window.removeEventListener('message', handlePreviewBridgeMessage);
  }, [applySectionsUpdate, livePreviewOrigin, sections]);

  useEffect(() => {
    if (viewMode === 'desktop') {
      setPreviewScale(1);
      return;
    }

    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const mockupWidth = viewMode === 'tablet' ? 768 : 375;
    const mockupHeight = viewMode === 'tablet' ? 1024 : 800;

    const updatePreviewScale = () => {
      const availableWidth = Math.max(viewport.clientWidth - 48, 0);
      const availableHeight = Math.max(viewport.clientHeight - 48, 0);

      if (!availableWidth || !availableHeight) return;

      setPreviewScale(
        Math.min(
          availableWidth / mockupWidth,
          availableHeight / mockupHeight,
          1
        )
      );
    };

    updatePreviewScale();

    const resizeObserver = new ResizeObserver(updatePreviewScale);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, [viewMode]);

  useEffect(() => {
    if (sections.length === 0) {
      if (selectedSectionId !== null) {
        setSelectedSectionId(null);
      }
      if (activeTextElement !== null) {
        setActiveTextElement(null);
      }
      if (selectedElementId !== null) {
        setSelectedElementId(null);
      }
      return;
    }

    if (selectedSectionId === null) {
      return;
    }

    if (!sections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(sections[0].id);
      setActiveTextElement(null);
      setSelectedElementId(null);
      return;
    }

    if (selectedSection && activeTextElement && !hasActiveElementInSection(selectedSection, activeTextElement)) {
      setActiveTextElement(null);
      setSelectedElementId(null);
      return;
    }

    if (
      selectedSection
      && selectedElementId
      && isRepeatableElementKind(activeTextElement)
      && !getSectionElementById(selectedSection, selectedElementId)
    ) {
      setSelectedElementId(null);
      setActiveTextElement(null);
    }
  }, [activeTextElement, sections, selectedElementId, selectedSection, selectedSectionId]);

  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.code !== 'Delete') return;
      if (!selectedSectionId) return;

      if (isTypingTarget(event.target)) return;

      const currentSection = sections.find((s) => s.id === selectedSectionId);
      if (!currentSection) return;

      event.preventDefault();

      if (isRepeatableElementKind(activeTextElement) && selectedElementId) {
        applySectionsUpdate(sections.map((s) => (
          s.id === selectedSectionId
            ? { ...s, ...removeSectionElement(s, selectedElementId) }
            : s
        )));
        setActiveTextElement(null);
        setSelectedElementId(null);
        return;
      }

      if (activeTextElement === 'backgroundImage') {
        const currentElements = getSectionElements(currentSection);
        const hasElementBackgroundImage = currentElements.some(
          (element) => element.kind === 'image' && !!element.value && !!element.style?.asSectionBackground
        );

        if (hasElementBackgroundImage) {
          applySectionsUpdate(sections.map((s) => (
            s.id === selectedSectionId
              ? {
                  ...s,
                  ...syncSectionElements(
                    s,
                    getSectionElements(s).map((element) => (
                      element.kind === 'image'
                        ? {
                            ...element,
                            style: {
                              ...element.style,
                              asSectionBackground: false,
                            },
                          }
                        : element
                    ))
                  ),
                }
              : s
          )));
          setActiveTextElement(null);
          return;
        }

        if (currentSection.bgType === 'image') {
          applySectionsUpdate(sections.map((s) => (
            s.id === selectedSectionId
              ? { ...s, bgType: 'color', bgValue: 'transparent' }
              : s
          )));
          setActiveTextElement(null);
          return;
        }
      }

      if (activeTextElement === 'countdown' && currentSection.type === 'COUNTDOWN') {
        applySectionsUpdate(sections.map((s) => (
          s.id === selectedSectionId
            ? {
                ...s,
                type: 'BLANK',
                countdownTargetDate: undefined,
                positions: omitSectionPositionKeys(s.positions, ['countdown', 'extra']),
              }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      if (activeTextElement === 'guests' && currentSection.type === 'GUESTS') {
        applySectionsUpdate(sections.map((s) => (
          s.id === selectedSectionId
            ? {
                ...s,
                type: 'BLANK',
                positions: omitSectionPositionKeys(s.positions, ['guests', 'extra']),
              }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      if (activeTextElement === 'location' && currentSection.type === 'LOCATION') {
        applySectionsUpdate(sections.map((s) => (
          s.id === selectedSectionId
            ? {
                ...s,
                type: 'BLANK',
                locationMapUrl: undefined,
              }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      if (activeTextElement === 'music' && currentSection.type === 'MUSIC') {
        applySectionsUpdate(sections.map((s) => (
          s.id === selectedSectionId
            ? {
                ...s,
                type: 'BLANK',
                audioUrl: undefined,
                positions: omitSectionPositionKeys(s.positions, ['music', 'extra']),
              }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      setActiveTextElement(null);
      setSelectedElementId(null);
    };

    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [activeTextElement, applySectionsUpdate, sections, selectedElementId, selectedSectionId]);

  useEffect(() => {
    const handleHistoryKey = (event: KeyboardEvent) => {
      const hasHistoryModifier = event.ctrlKey || event.metaKey;
      if (!hasHistoryModifier || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const wantsRedo = key === 'y' || (key === 'z' && event.shiftKey);
      const wantsUndo = key === 'z' && !event.shiftKey;

      if (!wantsUndo && !wantsRedo) return;

      event.preventDefault();

      if (wantsRedo) {
        redo();
        return;
      }

      undo();
    };

    window.addEventListener('keydown', handleHistoryKey);
    return () => window.removeEventListener('keydown', handleHistoryKey);
  }, [redo, undo]);

  return (
    <div className={`flex h-full min-h-0 flex-col ${focusMode ? 'gap-2' : 'gap-3'}`}>
      {!focusMode ? (
        <GeneralToolsPanel
          onAddSection={addSection}
          globalBg={globalBg}
          onUpdateGlobalBg={onUpdateGlobalBg}
          showGuides={showGuides}
          onToggleGuides={setShowGuides}
          onActivateMoveMode={activateMoveMode}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          compactMode={focusMode}
        />
      ) : null}

      <div className={`flex min-h-0 flex-1 flex-col ${focusMode ? 'gap-2' : 'gap-3'} lg:flex-row`}>
        <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${focusMode ? 'gap-2' : 'gap-3'}`}>
          <div className={`relative flex-1 overflow-hidden border border-black/5 bg-gray-200/30 shadow-inner ${
            focusMode ? 'rounded-[24px]' : 'rounded-[30px]'
          }`}>
            <div
              ref={previewViewportRef}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  clearSelection();
                }
              }}
              className={`flex h-full w-full items-center justify-center ${focusMode ? 'p-2 lg:p-3' : 'p-2.5 lg:p-4'}`}
            >
              {showGuides ? (
                <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-emerald-200 bg-white/92 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
                  {showLivePreview
                    ? 'Herramienta mover activa sobre la invitacion real'
                    : 'Herramienta mover activa: arrastra cada bloque dentro de su seccion'}
                </div>
              ) : null}
              <MobileMockup
                showGuides={showGuides && !showLivePreview}
                mode={viewMode}
                scale={previewScale}
                onOutsideContentClick={clearSelection}
              >
                {showLivePreview ? (
                  <div className="relative h-full w-full bg-stone-100">
                    {isLivePreviewLoading ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,0.92)_58%,_rgba(226,232,240,0.9))] px-6 text-center text-slate-500">
                        <div className="space-y-2">
                          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                            Cargando vista real
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {livePreviewLoadError ? (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(241,245,249,0.95)_58%,_rgba(226,232,240,0.94))] px-6 text-center text-slate-600">
                        <div className="max-w-[270px] space-y-3">
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M12 8v5m0 3h.01M10.29 3.86l-7.55 13.08A1 1 0 0 0 3.61 18h16.78a1 1 0 0 0 .87-1.5L13.71 3.86a1 1 0 0 0-1.74 0Z" />
                            </svg>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
                              No cargó la vista real
                            </p>
                            <p className="text-[11px] leading-5 text-slate-500">
                              {livePreviewLoadError}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={retryLivePreview}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Reintentar carga
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <iframe
                      key={livePreviewEmbedUrl}
                      ref={livePreviewFrameRef}
                      title={projectTitle?.trim() ? `Vista real de ${projectTitle}` : 'Vista real de la invitacion'}
                      src={livePreviewEmbedUrl}
                      className={`block h-full w-full border-0 bg-white transition-opacity duration-200 ${
                        isLivePreviewLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      loading="eager"
                      onLoad={handleLivePreviewLoad}
                      onError={handleLivePreviewError}
                    />
                  </div>
                ) : (
                  <div
                    className={`${sections.length === 0 ? 'min-h-full ' : ''}w-full relative`}
                    style={{
                      backgroundColor: globalBg?.type === 'color' ? globalBg.value : 'transparent',
                      backgroundImage: globalBg?.type === 'image' ? `url(${globalBg.value})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <Canvas
                      sections={sections}
                      selectedId={selectedSectionId}
                      onSelect={(id) => {
                        setSelectedSectionId(id);
                        setActiveTextElement(null);
                        setSelectedElementId(null);
                      }}
                      showGuides={showGuides}
                      canvasScale={viewMode === 'desktop' ? 1 : previewScale}
                      activeTextElement={activeTextElement}
                      selectedElementId={selectedElementId}
                      onSelectTextElement={(element, elementId) => {
                        setActiveTextElement(element);
                        setSelectedElementId(elementId ?? null);
                      }}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                      onMove={moveSection}
                      pkg={pkg}
                      previewRefreshToken={previewRefreshToken}
                    />
                  </div>
                )}
              </MobileMockup>
            </div>
          </div>
        </div>

        <div className={`min-h-0 w-full shrink-0 ${
          focusMode
            ? 'lg:w-[360px] xl:w-[400px] 2xl:w-[440px]'
            : hasLivePreview
              ? 'lg:w-[360px] xl:w-[390px] 2xl:w-[420px]'
              : 'lg:w-[320px] xl:w-[340px]'
        }`}>
          <PropertyPanel
            section={selectedSection}
            onUpdate={(updates) => selectedSection && updateSection(selectedSection.id, updates)}
            onDelete={() => selectedSection && deleteSection(selectedSection.id)}
            onMove={(dir) => selectedSection && moveSection(selectedSection.id, dir)}
            onAddSection={addSection}
            onRefreshPreview={onRefreshPreview}
            activeTextElement={activeTextElement}
            selectedElementId={selectedElementId}
            onSelectElement={(element, elementId) => {
              setActiveTextElement(element);
              setSelectedElementId(elementId ?? null);
            }}
            globalBg={globalBg}
            onUpdateGlobalBg={onUpdateGlobalBg}
            showGuides={showGuides}
            onToggleGuides={setShowGuides}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            hasLivePreview={hasLivePreview}
            previewSurfaceMode={effectivePreviewSurfaceMode}
            onTogglePreviewSurfaceMode={handlePreviewSurfaceModeChange}
            focusMode={focusMode}
          />
        </div>
      </div>
    </div>
  );
};




