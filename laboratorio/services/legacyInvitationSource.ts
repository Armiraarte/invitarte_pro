import type { EventPortalRecord } from '../../components/event-portal/types';
import { PackageType, type InvitationData, type Section, type SectionElement } from '../types';
import { getSectionElements } from '../components/dashboard/sectionElements';

type LegacyInvitationConfig = {
  id?: string;
  title?: string;
  subtitle?: string;
  hosts?: string;
  mainMessage?: string;
  date?: string;
  time?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapsUrl?: string;
  theme?: string;
  backgroundMusicUrl?: string;
  musicPlaylistUrl?: string;
  dressCode?: string;
  dressCodeColor?: string;
  story?: string;
  timeline?: Array<{
    id?: string;
    time?: string;
    title?: string;
    description?: string;
    icon?: string;
  }>;
  honorPeople?: Array<{
    role?: string;
    names?: string;
  }>;
  giftTables?: Array<{
    storeName?: string;
    link?: string;
    accountNumber?: string;
    notes?: string;
  }>;
  gallery?: Array<{
    id?: string;
    title?: string;
    url?: string;
  }>;
  specialNotes?: string[];
  recommendedStays?: Array<{
    name?: string;
    address?: string;
    phone?: string;
    link?: string;
    notes?: string;
  }>;
  transportInfo?: {
    parking?: string;
    shuttle?: string;
    notes?: string;
  };
  photoShareUrl?: string;
  photoShareMessage?: string;
  organizerContacts?: Array<{
    name?: string;
    role?: string;
    phone?: string;
    email?: string;
    whatsappUrl?: string;
  }>;
  shareTitle?: string;
  shareText?: string;
  rsvpList?: unknown[];
  guestbookList?: unknown[];
  musicRequested?: boolean;
  coverImage?: string;
  [key: string]: unknown;
};

const DEFAULT_THEME_BY_PACKAGE: Record<PackageType, string> = {
  [PackageType.ELEGANT]: 'elegant',
  [PackageType.PARTY]: 'festive',
  [PackageType.BABY]: 'boho',
  [PackageType.MODERN]: 'minimalist',
};

const LEGACY_SOURCE_MARKERS = [
  'export const INVITATION_CONFIG',
  'const INVITATION_CONFIG',
];

const normalizeUrl = (value?: string | null) => (value?.trim() ?? '').replace(/\\/g, '/');

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const asArray = <T>(value: unknown) => (Array.isArray(value) ? value as T[] : []);

const splitTextBlocks = (value?: string | null) => (
  (value ?? '')
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
);

const splitBulletLines = (value?: string | null) => (
  (value ?? '')
    .split('\n')
    .map((line) => line.replace(/^(?:[\u2022*-])\s*/, '').trim())
    .filter(Boolean)
);

const extractFirstUrl = (value?: string | null) => {
  const match = (value ?? '').match(/https?:\/\/[^\s]+/i);
  return match?.[0]?.trim() ?? '';
};

const toProjectAssetReference = (value?: string | null, eventCode?: string) => {
  const normalizedValue = normalizeUrl(value);
  if (
    normalizedValue === ''
    || normalizedValue.startsWith('data:')
    || normalizedValue.startsWith('blob:')
    || normalizedValue.startsWith('mailto:')
    || normalizedValue.startsWith('tel:')
    || /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(normalizedValue) && !normalizedValue.includes(`/invitaciones/${eventCode ?? ''}/`)
  ) {
    return normalizedValue;
  }

  const publicMarkers = [
    eventCode ? `/invitaciones/${eventCode}/public/invitacion/` : '',
    eventCode ? `/invitaciones/${eventCode}/invitacion/` : '',
    eventCode ? `invitaciones/${eventCode}/public/invitacion/` : '',
    eventCode ? `invitaciones/${eventCode}/invitacion/` : '',
    '/public/invitacion/',
    'public/invitacion/',
    '/invitacion/',
    'invitacion/',
    './invitacion/',
  ].filter(Boolean);

  for (const marker of publicMarkers) {
    const markerIndex = normalizedValue.indexOf(marker);
    if (markerIndex >= 0) {
      const relativePart = normalizedValue.slice(markerIndex + marker.length).replace(/^\/+/, '');
      return relativePart ? `invitacion/${relativePart}` : 'invitacion/';
    }
  }

  return normalizedValue.replace(/^\.\//, '');
};

const findSection = (formData: InvitationData, sectionId: string, type?: Section['type']) => (
  formData.sections.find((section) => section.id === sectionId)
  ?? (type ? formData.sections.find((section) => section.type === type) : undefined)
  ?? null
);

const getSectionElementMap = (section: Section | null) => {
  const elements = section ? getSectionElements(section) : [];
  return {
    elements,
    byId: new Map(elements.map((element) => [element.id, element])),
  };
};

const getElementValue = (section: Section | null, elementId: string, fallback = '') => {
  const element = getSectionElementMap(section).byId.get(elementId);
  const value = element?.value?.trim() ?? '';
  return value || fallback;
};

const getSectionImageValues = (section: Section | null, kind: SectionElement['kind']) => (
  (section ? getSectionElements(section) : [])
    .filter((element) => element.kind === kind)
    .map((element) => element.value?.trim() ?? '')
    .filter(Boolean)
);

const collectIndexedValues = (
  section: Section | null,
  pattern: RegExp
) => {
  const bucket = new Map<number, Record<string, string>>();
  const elements = section ? getSectionElements(section) : [];

  elements.forEach((element) => {
    const match = pattern.exec(element.id);
    if (!match) {
      return;
    }

    const index = Number.parseInt(match[1] || '0', 10);
    const field = match[2] || 'value';
    if (!Number.isFinite(index) || index <= 0) {
      return;
    }

    const current = bucket.get(index) ?? {};
    current[field] = element.value?.trim() ?? '';
    bucket.set(index, current);
  });

  return [...bucket.entries()]
    .sort((left, right) => left[0] - right[0])
    .map((entry) => entry[1]);
};

const resolveEventDateParts = (
  record: EventPortalRecord,
  countdownSection: Section | null,
  fallbackDate = '',
  fallbackTime = ''
) => {
  const rawDateTime = countdownSection?.countdownTargetDate?.trim()
    || record.eventDateValue?.trim()
    || '';

  if (!rawDateTime) {
    return { date: fallbackDate, time: fallbackTime };
  }

  const normalized = rawDateTime.includes('T')
    ? rawDateTime
    : rawDateTime.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return { date: fallbackDate, time: fallbackTime };
  }

  const localDate = new Date(parsed.getTime() - (parsed.getTimezoneOffset() * 60_000));
  const isoDate = localDate.toISOString();
  return {
    date: isoDate.slice(0, 10),
    time: `${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}`,
  };
};

const resolveDressCodeValue = (value: string, fallback: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('gala') || normalized.includes('etiqueta')) return 'gala';
  if (normalized.includes('coctel') || normalized.includes('cocktail')) return 'cocktail';
  if (normalized.includes('casual')) return 'casual';
  if (normalized.includes('playa') || normalized.includes('guayabera') || normalized.includes('beach')) return 'beach';
  if (normalized.includes('formal')) return 'formal';
  return fallback || 'formal';
};

const mapLegacyTimelineIcon = (value: string, fallback = '') => {
  switch (value) {
    case 'church':
      return 'church';
    case 'toast':
      return fallback === 'toast' ? fallback : 'glass-water';
    case 'calendarNote':
      return fallback === 'calendarNote' ? fallback : 'utensils';
    case 'party':
      return fallback === 'party' ? fallback : 'music';
    case 'moon':
      return 'moon';
    case 'sparkles':
      return 'sparkles';
    default:
      return fallback || 'calendar';
  }
};

const extractInvitationConfigBounds = (rawSource: string) => {
  const source = rawSource.replace(/^\uFEFF/, '');
  const markerIndex = LEGACY_SOURCE_MARKERS
    .map((marker) => source.indexOf(marker))
    .find((index) => index >= 0) ?? -1;
  if (markerIndex < 0) {
    return null;
  }

  const equalsIndex = source.indexOf('=', markerIndex);
  const objectStart = source.indexOf('{', equalsIndex);
  if (equalsIndex < 0 || objectStart < 0) {
    return null;
  }

  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    const previous = source[index - 1];

    if (inLineComment) {
      if (current === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      if (current === '\'' && previous !== '\\') {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (current === '"' && previous !== '\\') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inTemplateQuote) {
      if (current === '`' && previous !== '\\') {
        inTemplateQuote = false;
      }
      continue;
    }

    if (current === '/' && next === '/') {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (current === '/' && next === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (current === '\'') {
      inSingleQuote = true;
      continue;
    }

    if (current === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (current === '`') {
      inTemplateQuote = true;
      continue;
    }

    if (current === '{') {
      depth += 1;
      continue;
    }

    if (current === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          source,
          objectStart,
          objectEnd: index + 1,
        };
      }
    }
  }

  return null;
};

const parseLegacyInvitationConfig = (source: string): LegacyInvitationConfig => {
  const bounds = extractInvitationConfigBounds(source);
  if (!bounds) {
    return {};
  }

  try {
    const evaluateConfig = new Function(
      'buildInvitationAssetPath',
      `"use strict"; return (${bounds.source.slice(bounds.objectStart, bounds.objectEnd)});`
    ) as (buildInvitationAssetPath: (relativePath: string) => string) => LegacyInvitationConfig;

    const parsed = evaluateConfig((relativePath: string) => toProjectAssetReference(relativePath));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const buildLegacyInvitationConfig = (
  formData: InvitationData,
  record: EventPortalRecord,
  packageId: PackageType,
  baseConfig: LegacyInvitationConfig
): LegacyInvitationConfig => {
  const heroSection = findSection(formData, 'inicio', 'HERO');
  const countdownSection = findSection(formData, 'cuenta', 'COUNTDOWN');
  const storySection = findSection(formData, 'historia', 'MESSAGE');
  const locationSection = findSection(formData, 'ubicacion', 'LOCATION');
  const itinerarySection = findSection(formData, 'itinerario', 'ITINERARY');
  const gallerySection = findSection(formData, 'galeria', 'IMAGE');
  const detailsSection = findSection(formData, 'detalles', 'DETAILS');
  const logisticsSection = findSection(formData, 'logistica', 'MESSAGE');
  const messagesSection = findSection(formData, 'mensajes', 'MESSAGE');
  const musicSection = findSection(formData, 'musica', 'MUSIC');

  const { date, time } = resolveEventDateParts(
    record,
    countdownSection,
    asString(baseConfig.date),
    asString(baseConfig.time)
  );
  const heroContentBlocks = splitTextBlocks(heroSection?.content);
  const locationContentBlocks = splitTextBlocks(locationSection?.content);
  const messagesBlocks = splitTextBlocks(messagesSection?.content);
  const title = getElementValue(heroSection, 'inicio-title', heroSection?.title?.trim() || formData.eventTitle.trim() || asString(baseConfig.title) || record.eventTitle);
  const subtitle = getElementValue(heroSection, 'inicio-subtitle', heroSection?.subtitle?.trim() || asString(baseConfig.subtitle) || 'Invitacion especial');
  const hosts = getElementValue(heroSection, 'inicio-hosts', heroContentBlocks[0] || asString(baseConfig.hosts) || formData.hostName.trim() || record.hostName || subtitle);
  const mainMessage = getElementValue(heroSection, 'inicio-message', heroContentBlocks.slice(1).join('\n\n') || heroSection?.content?.trim() || asString(baseConfig.mainMessage));
  const venueName = getElementValue(locationSection, 'ubicacion-title', locationSection?.title?.trim() || asString(baseConfig.venueName) || record.venue || '');
  const venueAddress = getElementValue(locationSection, 'ubicacion-address', locationContentBlocks[0] || locationSection?.content?.trim() || asString(baseConfig.venueAddress) || record.venue || '');
  const venueMapsUrl = locationSection?.locationMapUrl?.trim() || extractFirstUrl(locationSection?.content) || asString(baseConfig.venueMapsUrl) || record.venueMapsUrl || '';
  const story = getElementValue(storySection, 'historia-story', splitTextBlocks(storySection?.content)[0] || asString(baseConfig.story));
  const dressName = getElementValue(detailsSection, 'detalles-dress-name', asString(baseConfig.dressCode));
  const dressCode = resolveDressCodeValue(dressName, asString(baseConfig.dressCode));
  const dressCodeColor = getElementValue(detailsSection, 'detalles-dress-extra', asString(baseConfig.dressCodeColor));
  const honorPeople = collectIndexedValues(storySection, /^historia-honor-(\d+)-(role|names)$/)
    .map((item) => ({
      role: item.role || '',
      names: item.names || '',
    }))
    .filter((item) => item.role || item.names);
  const giftTables = collectIndexedValues(detailsSection, /^detalles-gift-(\d+)-(name|notes|account)$/)
    .map((item, index) => ({
      storeName: item.name || asString(asArray<LegacyInvitationConfig['giftTables'][number]>(baseConfig.giftTables)[index]?.storeName) || 'Mesa de regalos',
      notes: item.notes || '',
      accountNumber: item.account || '',
      link: asString(asArray<LegacyInvitationConfig['giftTables'][number]>(baseConfig.giftTables)[index]?.link),
    }))
    .filter((item) => item.storeName || item.notes || item.accountNumber || item.link);
  const specialNotes = collectIndexedValues(logisticsSection, /^logistica-note-(\d+)$/)
    .map((item) => item.value || '')
    .filter(Boolean);
  const recommendedStays = collectIndexedValues(logisticsSection, /^logistica-stay-(\d+)-(name|address|notes)$/)
    .map((item, index) => {
      const fallback = asArray<NonNullable<LegacyInvitationConfig['recommendedStays']>[number]>(baseConfig.recommendedStays)[index];
      return {
        name: item.name || '',
        address: item.address || '',
        notes: item.notes || '',
        phone: asString(fallback?.phone),
        link: asString(fallback?.link),
      };
    })
    .filter((item) => item.name || item.address || item.notes || item.phone || item.link);
  const transportInfo = {
    parking: getElementValue(logisticsSection, 'logistica-parking', asString(baseConfig.transportInfo?.parking)),
    shuttle: getElementValue(logisticsSection, 'logistica-shuttle', asString(baseConfig.transportInfo?.shuttle)),
    notes: getElementValue(logisticsSection, 'logistica-transport-notes', asString(baseConfig.transportInfo?.notes)),
  };
  const photoShareMessage = getElementValue(messagesSection, 'mensajes-share-message', messagesBlocks[0] || asString(baseConfig.photoShareMessage));
  const photoShareUrl = extractFirstUrl(messagesSection?.content) || asString(baseConfig.photoShareUrl);
  const playlistUrl = extractFirstUrl(musicSection?.content) || asString(baseConfig.musicPlaylistUrl);
  const backgroundMusicUrl = toProjectAssetReference(musicSection?.audioUrl?.trim() || asString(baseConfig.backgroundMusicUrl), record.code);
  const galleryTitles = splitBulletLines(gallerySection?.content);
  const galleryImages = [
    ...getSectionImageValues(gallerySection, 'image'),
    ...getSectionImageValues(gallerySection, 'contentImage'),
  ]
    .map((value) => toProjectAssetReference(value, record.code))
    .filter(Boolean);
  const baseGallery = asArray<NonNullable<LegacyInvitationConfig['gallery']>[number]>(baseConfig.gallery);
  const gallery = galleryImages.length > 0
    ? galleryImages.map((url, index) => ({
        id: asString(baseGallery[index]?.id) || `g${index + 1}`,
        title: galleryTitles[index] || asString(baseGallery[index]?.title) || `Foto ${index + 1}`,
        url,
      }))
    : baseGallery;
  const coverCandidates = [
    ...getSectionImageValues(heroSection, 'contentImage'),
    ...getSectionImageValues(heroSection, 'image'),
    ...galleryImages,
  ]
    .map((value) => toProjectAssetReference(value, record.code))
    .filter(Boolean);
  const baseTimeline = asArray<NonNullable<LegacyInvitationConfig['timeline']>[number]>(baseConfig.timeline);
  const timeline = (itinerarySection?.itineraryItems ?? []).length > 0
    ? (itinerarySection?.itineraryItems ?? []).map((item, index) => {
        const fallback = baseTimeline[index];
        return {
          id: item.id || asString(fallback?.id) || `${index + 1}`,
          time: item.time || asString(fallback?.time),
          title: item.title || asString(fallback?.title) || `Momento ${index + 1}`,
          description: asString(fallback?.description),
          icon: mapLegacyTimelineIcon(item.icon || 'calendar', asString(fallback?.icon)),
        };
      })
    : baseTimeline;

  return {
    ...baseConfig,
    id: asString(baseConfig.id) || 'mi-invitacion-digital',
    theme: asString(baseConfig.theme) || DEFAULT_THEME_BY_PACKAGE[packageId] || 'elegant',
    title,
    subtitle,
    hosts,
    mainMessage,
    date,
    time,
    venueName,
    venueAddress,
    venueMapsUrl,
    dressCode,
    dressCodeColor,
    story,
    honorPeople: honorPeople.length > 0 ? honorPeople : asArray(baseConfig.honorPeople),
    giftTables: giftTables.length > 0 ? giftTables : asArray(baseConfig.giftTables),
    timeline,
    gallery,
    specialNotes: specialNotes.length > 0 ? specialNotes : asArray<string>(baseConfig.specialNotes),
    recommendedStays: recommendedStays.length > 0 ? recommendedStays : asArray(baseConfig.recommendedStays),
    transportInfo,
    photoShareUrl,
    photoShareMessage,
    organizerContacts: asArray(baseConfig.organizerContacts),
    shareTitle: asString(baseConfig.shareTitle) || `Invitacion de ${title}`,
    shareText: asString(baseConfig.shareText) || `Te comparto la invitacion digital de ${title}.`,
    rsvpList: asArray(baseConfig.rsvpList),
    guestbookList: asArray(baseConfig.guestbookList),
    backgroundMusicUrl,
    musicPlaylistUrl: playlistUrl,
    musicRequested: Boolean(backgroundMusicUrl || playlistUrl || baseConfig.musicRequested),
    coverImage: coverCandidates[0] || toProjectAssetReference(asString(baseConfig.coverImage), record.code),
  };
};

export const isLegacyInvitationProjectSource = (source: string) => (
  LEGACY_SOURCE_MARKERS.some((marker) => source.includes(marker))
);

export const buildLegacyInvitationProjectSource = (
  source: string,
  formData: InvitationData,
  record: EventPortalRecord,
  packageId: PackageType
) => {
  const bounds = extractInvitationConfigBounds(source);
  if (!bounds) {
    return source;
  }

  const nextConfig = buildLegacyInvitationConfig(
    formData,
    record,
    packageId,
    parseLegacyInvitationConfig(source)
  );

  return `${bounds.source.slice(0, bounds.objectStart)}${JSON.stringify(nextConfig, null, 2)}${bounds.source.slice(bounds.objectEnd)}`;
};
