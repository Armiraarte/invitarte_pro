import {
  ContainerStyle,
  ImageStyle,
  RepeatableSectionElementKind,
  SectionAnimation,
  Section,
  SectionElement,
  SectionElementStyle,
  SectionPositionKey,
} from '../../types';

const MAIN_IMAGE_DEFAULTS: Required<Pick<ImageStyle, 'scale' | 'fit' | 'asSectionBackground' | 'width' | 'height'>> = {
  scale: 100,
  fit: 'contain',
  asSectionBackground: false,
  width: 260,
  height: 300,
};

const CONTENT_IMAGE_DEFAULTS: Required<Pick<ImageStyle, 'scale' | 'fit' | 'asSectionBackground' | 'width' | 'height'>> = {
  scale: 100,
  fit: 'contain',
  asSectionBackground: false,
  width: 220,
  height: 200,
};

const ELEMENT_ANIMATION_DEFAULTS: Required<SectionAnimation> = {
  type: 'none',
  duration: 0.6,
};

const CONTAINER_DEFAULTS: Required<Pick<ContainerStyle, 'width' | 'height' | 'backgroundColor' | 'borderColor' | 'borderWidth' | 'borderRadius' | 'opacity' | 'shadow'>> & {
  animation: Required<NonNullable<ContainerStyle['animation']>>;
} = {
  width: 240,
  height: 140,
  backgroundColor: 'transparent',
  borderColor: '#1f2937',
  borderWidth: 2,
  borderRadius: 24,
  opacity: 100,
  shadow: true,
  animation: {
    type: 'none',
    duration: 0.6,
  },
};

const ELEMENT_LAYER_BASE: Record<RepeatableSectionElementKind, number> = {
  container: 100,
  image: 200,
  title: 300,
  subtitle: 400,
  content: 500,
  contentImage: 600,
};

const LEGACY_POSITION_KEYS: Record<Exclude<RepeatableSectionElementKind, 'container'>, SectionPositionKey> = {
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  image: 'image',
  contentImage: 'contentImage',
};

const PLACEHOLDER_VALUES: Record<RepeatableSectionElementKind, string> = {
  title: 'Nuevo titulo',
  subtitle: 'Nuevo subtitulo',
  content: 'Nuevo texto',
  image: '',
  contentImage: '',
  container: 'Contenedor',
};

const DEFAULT_POSITION_OFFSETS: Record<RepeatableSectionElementKind, { x: number; y: number }> = {
  title: { x: 0, y: 0 },
  subtitle: { x: 0, y: 18 },
  content: { x: 0, y: 36 },
  image: { x: 0, y: 0 },
  contentImage: { x: 0, y: 18 },
  container: { x: 0, y: 0 },
};

const createElementId = () => Math.random().toString(36).slice(2, 11);

export const isRepeatableElementKind = (
  value: string | null | undefined
): value is RepeatableSectionElementKind => {
  return value === 'title'
    || value === 'subtitle'
    || value === 'content'
    || value === 'image'
    || value === 'contentImage'
    || value === 'container';
};

const isImageKind = (kind: RepeatableSectionElementKind): kind is 'image' | 'contentImage' => (
  kind === 'image' || kind === 'contentImage'
);
const isContainerKind = (kind: RepeatableSectionElementKind): kind is 'container' => kind === 'container';

const getLegacyPosition = (section: Section, kind: RepeatableSectionElementKind) => {
  if (kind === 'container') {
    return { x: 0, y: 0 };
  }

  if (kind === 'image') {
    return section.positions?.image || section.positions?.extra || { x: 0, y: 0 };
  }

  return section.positions?.[LEGACY_POSITION_KEYS[kind]] || { x: 0, y: 0 };
};

const getImageDefaults = (kind: 'image' | 'contentImage') => {
  return kind === 'image' ? MAIN_IMAGE_DEFAULTS : CONTENT_IMAGE_DEFAULTS;
};

const normalizeElementAnimation = (animation?: SectionAnimation) => ({
  ...ELEMENT_ANIMATION_DEFAULTS,
  ...animation,
});

const normalizeTextStyle = (style?: SectionElementStyle): SectionElementStyle | undefined => {
  if (!style) {
    return undefined;
  }

  const nextStyle: SectionElementStyle = { ...style };

  if (style.animation) {
    nextStyle.animation = normalizeElementAnimation(style.animation);
  }

  if (Object.keys(nextStyle).length === 0) {
    return undefined;
  }

  return {
    ...nextStyle,
  };
};

const normalizeImageStyle = (kind: 'image' | 'contentImage', style?: SectionElementStyle): SectionElementStyle => {
  const defaults = getImageDefaults(kind);
  return {
    ...defaults,
    ...style,
    ...(style?.animation ? { animation: normalizeElementAnimation(style.animation) } : {}),
    asSectionBackground: kind === 'image' ? !!style?.asSectionBackground : false,
  };
};

const normalizeContainerStyle = (style?: SectionElementStyle): ContainerStyle => ({
  ...CONTAINER_DEFAULTS,
  ...style,
  animation: normalizeElementAnimation(style?.animation),
});

const normalizeElementStyle = (
  kind: RepeatableSectionElementKind,
  style?: SectionElement['style']
) => {
  if (isImageKind(kind)) {
    return normalizeImageStyle(kind, style);
  }

  if (isContainerKind(kind)) {
    return normalizeContainerStyle(style);
  }

  return normalizeTextStyle(style);
};

const createLegacyImageElement = (
  section: Section,
  kind: 'image' | 'contentImage',
  value: string
): SectionElement => ({
  id: `legacy-${kind}`,
  kind,
  value,
  position: getLegacyPosition(section, kind),
  layer: ELEMENT_LAYER_BASE[kind],
  style: normalizeImageStyle(kind, kind === 'image' ? section.imageStyle : section.contentImageStyle),
});

const withNormalizedLayers = (elements: SectionElement[]) => {
  const kindCounts: Partial<Record<RepeatableSectionElementKind, number>> = {};

  return elements.map((element) => {
    const nextCount = (kindCounts[element.kind] ?? 0) + 1;
    kindCounts[element.kind] = nextCount;

    return {
      ...element,
      layer: element.layer ?? (ELEMENT_LAYER_BASE[element.kind] + nextCount - 1),
    };
  });
};

export const getSectionElements = (section?: Section): SectionElement[] => {
  if (!section) return [];

  if (section.elements && section.elements.length > 0) {
    return withNormalizedLayers(section.elements.map((element) => ({
      ...element,
      style: normalizeElementStyle(element.kind, element.style),
    })));
  }

  const nextElements: SectionElement[] = [];

  if (section.title !== undefined) {
    nextElements.push({
      id: 'legacy-title',
      kind: 'title',
      value: section.title,
      position: getLegacyPosition(section, 'title'),
      layer: ELEMENT_LAYER_BASE.title,
    });
  }

  if (section.subtitle !== undefined) {
    nextElements.push({
      id: 'legacy-subtitle',
      kind: 'subtitle',
      value: section.subtitle,
      position: getLegacyPosition(section, 'subtitle'),
      layer: ELEMENT_LAYER_BASE.subtitle,
    });
  }

  if (section.content !== undefined) {
    nextElements.push({
      id: 'legacy-content',
      kind: 'content',
      value: section.content,
      position: getLegacyPosition(section, 'content'),
      layer: ELEMENT_LAYER_BASE.content,
    });
  }

  if (section.imageUrl !== undefined) {
    nextElements.push(createLegacyImageElement(section, 'image', section.imageUrl));
  }

  if (section.contentImageUrl !== undefined) {
    nextElements.push(createLegacyImageElement(section, 'contentImage', section.contentImageUrl));
  }

  return withNormalizedLayers(nextElements);
};

const buildLegacyPositions = (section: Section, elements: SectionElement[]) => {
  const nextPositions = { ...(section.positions || {}) };

  (Object.entries(LEGACY_POSITION_KEYS) as Array<[Exclude<RepeatableSectionElementKind, 'container'>, SectionPositionKey]>).forEach(
    ([kind, key]) => {
      const firstElement = elements.find((element) => element.kind === kind);

      if (firstElement) {
        nextPositions[key] = firstElement.position;
        if (kind === 'image') {
          nextPositions.extra = firstElement.position;
        }
      } else {
        delete nextPositions[key];
        if (kind === 'image') {
          delete nextPositions.extra;
        }
      }
    }
  );

  return nextPositions;
};

export const syncSectionElements = (section: Section, elements: SectionElement[]): Partial<Section> => {
  const normalizedElements = withNormalizedLayers(elements.map((element) => ({
    ...element,
    style: normalizeElementStyle(element.kind, element.style),
  })));

  const firstByKind = (kind: RepeatableSectionElementKind) => normalizedElements.find((element) => element.kind === kind);
  const firstTitle = firstByKind('title');
  const firstSubtitle = firstByKind('subtitle');
  const firstContent = firstByKind('content');
  const firstMainImage = firstByKind('image');
  const firstContentImage = firstByKind('contentImage');
  const normalizedMainImageStyle = firstMainImage?.style
    ? normalizeImageStyle('image', firstMainImage.style)
    : { ...MAIN_IMAGE_DEFAULTS, ...section.imageStyle, asSectionBackground: false };
  const normalizedContentImageStyle = firstContentImage?.style
    ? normalizeImageStyle('contentImage', firstContentImage.style)
    : { ...CONTENT_IMAGE_DEFAULTS, ...section.contentImageStyle, asSectionBackground: false };
  const { animation: _mainImageAnimation, ...legacyMainImageStyle } = normalizedMainImageStyle || {};
  const { animation: _contentImageAnimation, ...legacyContentImageStyle } = normalizedContentImageStyle || {};

  return {
    elements: normalizedElements,
    title: firstTitle?.value,
    subtitle: firstSubtitle?.value,
    content: firstContent?.value,
    imageUrl: firstMainImage?.value,
    contentImageUrl: firstContentImage?.value,
    imageStyle: legacyMainImageStyle,
    contentImageStyle: legacyContentImageStyle,
    positions: buildLegacyPositions(section, normalizedElements),
  };
};

const getInitialElementPosition = (section: Section, kind: RepeatableSectionElementKind) => {
  const baseOffset = DEFAULT_POSITION_OFFSETS[kind];

  return {
    x: baseOffset.x,
    y: baseOffset.y,
  };
};

export const addSectionElement = (section: Section, kind: RepeatableSectionElementKind) => {
  const nextElement: SectionElement = {
    id: createElementId(),
    kind,
    value: PLACEHOLDER_VALUES[kind],
    position: getInitialElementPosition(section, kind),
    layer: Math.max(
      ELEMENT_LAYER_BASE[kind],
      ...getSectionElements(section).map((element) => element.layer ?? 0)
    ) + 1,
    style: isImageKind(kind)
      ? normalizeImageStyle(kind, kind === 'image' ? section.imageStyle : section.contentImageStyle)
      : isContainerKind(kind)
        ? normalizeContainerStyle()
        : undefined,
  };

  const nextElements = [...getSectionElements(section), nextElement];

  return {
    element: nextElement,
    updates: syncSectionElements(section, nextElements),
  };
};

export const updateSectionElement = (
  section: Section,
  elementId: string,
  updates: Partial<SectionElement>
) => {
  const nextElements = getSectionElements(section).map((element) => {
    if (element.id !== elementId) return element;

    const nextKind = updates.kind ?? element.kind;
    return {
      ...element,
      ...updates,
      kind: nextKind,
      layer: updates.layer ?? element.layer,
      style: normalizeElementStyle(nextKind, updates.style ?? element.style),
    };
  });

  return syncSectionElements(section, nextElements);
};

export const removeSectionElement = (section: Section, elementId: string) => {
  const nextElements = getSectionElements(section).filter((element) => element.id !== elementId);
  return syncSectionElements(section, nextElements);
};

export const getSectionElementById = (section: Section | undefined, elementId?: string | null) => {
  if (!section || !elementId) return null;
  return getSectionElements(section).find((element) => element.id === elementId) || null;
};

export const getSectionElementCount = (section: Section | undefined, kind: RepeatableSectionElementKind) => {
  if (!section) return 0;
  return getSectionElements(section).filter((element) => element.kind === kind).length;
};

export const getSectionImageStyle = (element: SectionElement | null, section: Section, kind: 'image' | 'contentImage') => {
  return normalizeImageStyle(kind, element?.style ?? (kind === 'image' ? section.imageStyle : section.contentImageStyle));
};

export const getSectionContainerStyle = (element: SectionElement | null) => {
  return normalizeContainerStyle(element?.style);
};

export const getSectionTextStyle = (element: SectionElement | null | undefined) => {
  return normalizeTextStyle(element?.style) || {};
};

export const getSectionElementAnimation = (element: Pick<SectionElement, 'style'> | null | undefined) => {
  return normalizeElementAnimation(element?.style?.animation);
};

export const getSectionElementLayer = (element: SectionElement) => {
  return element.layer ?? ELEMENT_LAYER_BASE[element.kind];
};
