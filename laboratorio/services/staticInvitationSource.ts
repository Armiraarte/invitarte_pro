import type { EventPortalRecord } from '../../components/event-portal/types';
import { PackageType, type InvitationData, type Section, type SectionElement } from '../types';
import { getSectionElements } from '../components/dashboard/sectionElements';

type InvitationSourcePhotoItem = {
  id: string;
  title: string;
  url: string;
};

type InvitationSourceGiftTable = {
  storeName: string;
  link?: string;
  accountNumber?: string;
  notes?: string;
};

type InvitationSourceRecommendedStay = {
  name: string;
  address?: string;
  phone?: string;
  link?: string;
  notes?: string;
};

type InvitationSourceTransportInfo = {
  parking?: string;
  shuttle?: string;
  notes?: string;
};

type StaticInvitationConfig = {
  eventLabel: string;
  title: string;
  subtitle: string;
  hosts: string;
  mainMessage: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  theme: 'elegant' | 'festive' | 'boho' | 'minimalist';
  dressCode: string;
  dressCodeColor: string;
  story: string;
  timeline: Array<{ id: string; time: string; title: string; description: string; icon: string }>;
  giftTables: InvitationSourceGiftTable[];
  gallery: InvitationSourcePhotoItem[];
  specialNotes: string[];
  recommendedStays: InvitationSourceRecommendedStay[];
  transportInfo: InvitationSourceTransportInfo;
  photoShareUrl: string;
  photoShareMessage: string;
  organizerContacts: Array<{
    name: string;
    role?: string;
    phone?: string;
    email?: string;
    whatsappUrl?: string;
  }>;
  backgroundMusicUrl: string;
  musicPlaylistUrl: string;
  musicRequested: boolean;
  coverImage: string;
  colors: {
    bg: string;
    surface: string;
    surfaceStrong: string;
    text: string;
    muted: string;
    line: string;
    accent: string;
    accentStrong: string;
  };
  rsvpPhone: string;
  rsvpMessage: string;
  footerTitle: string;
  footerCopy: string;
};

const STATIC_INVITATION_RUNTIME = String.raw`const root = document.documentElement;

const asArray = function (value) {
  return Array.isArray(value) ? value : [];
};

const escapeHtml = function (value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const applyTheme = function () {
  const palette = INVITATION_CONFIG.colors || {};
  Object.keys(palette).forEach(function (key) {
    const value = palette[key];
    if (typeof value !== 'string' || value.trim() === '') return;
    const cssVar = '--' + key.replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    });
    root.style.setProperty(cssVar, value);
  });
};

const buildEventDateIso = function () {
  const date = String(INVITATION_CONFIG.date || '').trim();
  const time = String(INVITATION_CONFIG.time || '').trim() || '00:00';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return '';
  }

  return date + 'T' + time + ':00';
};

const formatDateLabel = function () {
  const isoDate = buildEventDateIso();
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return [INVITATION_CONFIG.date, INVITATION_CONFIG.time].filter(Boolean).join(' ');
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(parsed);
};

const buildWhatsAppUrl = function (phone, message) {
  const normalizedPhone = String(phone || '').replace(/[^\d]/g, '');
  const encodedMessage = encodeURIComponent(message || '');
  return normalizedPhone ? 'https://wa.me/' + normalizedPhone + '?text=' + encodedMessage : '#';
};

const setText = function (selector, value) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value || '';
  }
};

const setLink = function (selector, href, fallbackLabel) {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLAnchorElement)) return;

  const normalizedHref = String(href || '').trim();
  if (normalizedHref === '') {
    node.setAttribute('href', '#');
    node.setAttribute('aria-disabled', 'true');
    node.classList.add('is-disabled');
    if (fallbackLabel) {
      node.textContent = fallbackLabel;
    }
    return;
  }

  node.setAttribute('href', normalizedHref);
  node.removeAttribute('aria-disabled');
  node.classList.remove('is-disabled');
};

const renderDetails = function () {
  const list = document.querySelector('#detail-list');
  if (!list) return;

  const details = [
    INVITATION_CONFIG.date ? { label: 'Fecha', value: INVITATION_CONFIG.date } : null,
    INVITATION_CONFIG.time ? { label: 'Hora', value: INVITATION_CONFIG.time } : null,
    INVITATION_CONFIG.venueName ? { label: 'Lugar', value: INVITATION_CONFIG.venueName } : null,
    INVITATION_CONFIG.dressCode ? { label: 'Codigo de vestimenta', value: INVITATION_CONFIG.dressCode } : null,
    INVITATION_CONFIG.dressCodeColor ? { label: 'Paleta sugerida', value: INVITATION_CONFIG.dressCodeColor } : null
  ].filter(Boolean);

  list.innerHTML = details.map(function (item) {
    return '<li><span class="detail-label">' + escapeHtml(item.label) + '</span><span>' + escapeHtml(item.value) + '</span></li>';
  }).join('');
};

const renderTimeline = function () {
  const container = document.querySelector('#timeline');
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.timeline).map(function (item) {
    return '<article class="timeline-item">' +
      '<span class="timeline-time">' + escapeHtml(item.time || '') + '</span>' +
      '<h3>' + escapeHtml(item.title || '') + '</h3>' +
      '<p>' + escapeHtml(item.description || '') + '</p>' +
    '</article>';
  }).join('');
};

const renderGallery = function () {
  const container = document.querySelector('#gallery');
  if (!container) return;

  container.innerHTML = '';
  asArray(INVITATION_CONFIG.gallery).forEach(function (item, index) {
    const card = document.createElement('article');
    card.className = 'gallery-card';

    const visual = document.createElement('div');
    visual.className = 'gallery-visual';
    const rawUrl = String(item.url || '').trim();
    if (rawUrl !== '') {
      visual.classList.add('has-image');
      visual.style.backgroundImage = "url('" + rawUrl.replace(/'/g, '%27') + "')";
    }

    const copy = document.createElement('div');
    copy.className = 'gallery-copy';
    const title = document.createElement('h3');
    title.textContent = item.title || ('Foto ' + String(index + 1));
    const description = document.createElement('p');
    description.textContent = rawUrl !== ''
      ? 'Imagen lista para este bloque.'
      : 'Agrega una imagen cuando quieras reemplazar este espacio.';

    copy.appendChild(title);
    copy.appendChild(description);
    card.appendChild(visual);
    card.appendChild(copy);
    container.appendChild(card);
  });
};

const renderGiftTables = function () {
  const container = document.querySelector('#gift-list');
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.giftTables).map(function (item) {
    const lines = [item.notes || '', item.accountNumber ? 'Cuenta: ' + item.accountNumber : '', item.link || ''].filter(Boolean);
    return '<div class="stack-item"><strong>' + escapeHtml(item.storeName || 'Mesa de regalos') + '</strong><span>' + escapeHtml(lines.join(' | ')) + '</span></div>';
  }).join('');
};

const renderNotes = function () {
  const container = document.querySelector('#note-list');
  if (!container) return;

  container.innerHTML = asArray(INVITATION_CONFIG.specialNotes).map(function (note) {
    return '<div class="stack-item"><strong>Nota</strong><span>' + escapeHtml(note) + '</span></div>';
  }).join('');
};

const setupHeroPhoto = function () {
  const photo = document.querySelector('#hero-photo');
  if (!photo) return;

  const coverImage = String(INVITATION_CONFIG.coverImage || '').trim();
  if (!coverImage) return;

  photo.classList.add('has-image');
  photo.style.backgroundImage = "url('" + coverImage.replace(/'/g, '%27') + "')";
  const placeholder = photo.querySelector('.hero-photo-placeholder');
  if (placeholder) {
    placeholder.remove();
  }
};

const updateCountdown = function () {
  const countdown = document.querySelector('#countdown');
  if (!countdown) return;

  const parsedTarget = new Date(buildEventDateIso());
  const now = new Date();
  const diff = parsedTarget.getTime() - now.getTime();
  const parts = countdown.querySelectorAll('strong');

  if (Number.isNaN(parsedTarget.getTime()) || diff <= 0) {
    parts.forEach(function (node) {
      node.textContent = '00';
    });
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  [days, hours, minutes, seconds].forEach(function (value, index) {
    if (parts[index]) {
      parts[index].textContent = String(value).padStart(2, '0');
    }
  });
};

const setupAudio = function () {
  const audio = document.querySelector('#background-audio');
  const toggle = document.querySelector('#music-toggle');
  if (!(audio instanceof HTMLAudioElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  const backgroundMusicUrl = String(INVITATION_CONFIG.backgroundMusicUrl || '').trim();
  if (!backgroundMusicUrl) {
    toggle.disabled = true;
    toggle.textContent = 'Sin musica';
    return;
  }

  audio.src = backgroundMusicUrl;
  let isPlaying = false;

  toggle.addEventListener('click', async function () {
    if (!isPlaying) {
      try {
        await audio.play();
        isPlaying = true;
        toggle.textContent = 'Pausar musica';
      } catch (error) {
        toggle.textContent = 'No se pudo reproducir';
      }
      return;
    }

    audio.pause();
    isPlaying = false;
    toggle.textContent = 'Activar musica';
  });
};

const boot = function () {
  applyTheme();
  document.title = INVITATION_CONFIG.title || 'Invitacion digital';

  setText('#event-label', INVITATION_CONFIG.eventLabel || 'Invitacion digital');
  setText('#event-title', INVITATION_CONFIG.title || '');
  setText('#event-hosts', INVITATION_CONFIG.hosts || INVITATION_CONFIG.subtitle || '');
  setText('#event-message', INVITATION_CONFIG.mainMessage || '');
  setText('#event-date', formatDateLabel());
  setText('#event-venue', [INVITATION_CONFIG.venueName, INVITATION_CONFIG.venueAddress].filter(Boolean).join(' | '));
  setText('#story-copy', INVITATION_CONFIG.story || '');
  setText('#footer-title', INVITATION_CONFIG.footerTitle || INVITATION_CONFIG.title || '');
  setText('#footer-copy', INVITATION_CONFIG.footerCopy || '');

  setLink('#map-link', INVITATION_CONFIG.venueMapsUrl, 'Sin ubicacion');
  setLink('#playlist-link', INVITATION_CONFIG.musicPlaylistUrl, 'Sin playlist');
  setLink('#rsvp-link', buildWhatsAppUrl(INVITATION_CONFIG.rsvpPhone, INVITATION_CONFIG.rsvpMessage), 'Sin RSVP');

  renderDetails();
  renderTimeline();
  renderGallery();
  renderGiftTables();
  renderNotes();
  setupHeroPhoto();
  setupAudio();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
};

window.addEventListener('DOMContentLoaded', boot);
`;

const DEFAULT_THEME_BY_PACKAGE: Record<PackageType, StaticInvitationConfig['theme']> = {
  [PackageType.ELEGANT]: 'elegant',
  [PackageType.PARTY]: 'festive',
  [PackageType.BABY]: 'boho',
  [PackageType.MODERN]: 'minimalist',
};

const DEFAULT_COLORS_BY_PACKAGE: Record<PackageType, StaticInvitationConfig['colors']> = {
  [PackageType.ELEGANT]: {
    bg: '#f4ede3',
    surface: 'rgba(255, 252, 247, 0.9)',
    surfaceStrong: '#fffdf9',
    text: '#1d1a17',
    muted: '#6d6255',
    line: 'rgba(125, 96, 53, 0.14)',
    accent: '#b88a2e',
    accentStrong: '#7c5615',
  },
  [PackageType.PARTY]: {
    bg: '#181224',
    surface: 'rgba(25, 20, 39, 0.88)',
    surfaceStrong: '#221a35',
    text: '#f7efff',
    muted: '#d2c4ea',
    line: 'rgba(212, 187, 255, 0.16)',
    accent: '#ffb84d',
    accentStrong: '#ffd999',
  },
  [PackageType.BABY]: {
    bg: '#f8efe6',
    surface: 'rgba(255, 251, 246, 0.92)',
    surfaceStrong: '#fffdf9',
    text: '#43352b',
    muted: '#7a675a',
    line: 'rgba(152, 118, 88, 0.14)',
    accent: '#c4836a',
    accentStrong: '#8e5d49',
  },
  [PackageType.MODERN]: {
    bg: '#f3f4f6',
    surface: 'rgba(255, 255, 255, 0.92)',
    surfaceStrong: '#ffffff',
    text: '#111827',
    muted: '#4b5563',
    line: 'rgba(17, 24, 39, 0.10)',
    accent: '#0f766e',
    accentStrong: '#115e59',
  },
};

const DEFAULT_STATIC_CONFIG: StaticInvitationConfig = {
  eventLabel: 'Invitacion digital',
  title: 'Evento especial',
  subtitle: 'Lista para compartir',
  hosts: 'Anfitrion por definir',
  mainMessage: 'Edita los textos y comparte tu invitacion sin compilar nada.',
  date: '',
  time: '',
  venueName: '',
  venueAddress: '',
  venueMapsUrl: '',
  theme: 'elegant',
  dressCode: '',
  dressCodeColor: '',
  story: '',
  timeline: [],
  giftTables: [],
  gallery: [],
  specialNotes: [],
  recommendedStays: [],
  transportInfo: {},
  photoShareUrl: '',
  photoShareMessage: '',
  organizerContacts: [],
  backgroundMusicUrl: '',
  musicPlaylistUrl: '',
  musicRequested: false,
  coverImage: '',
  colors: DEFAULT_COLORS_BY_PACKAGE[PackageType.ELEGANT],
  rsvpPhone: '5215512345678',
  rsvpMessage: 'Hola, quiero confirmar mi asistencia.',
  footerTitle: 'Invitacion lista para publicar',
  footerCopy: 'Esta version ya funciona como HTML, CSS y JS plano.',
};

const normalizeUrl = (value?: string | null) => (value?.trim() ?? '').replace(/\\/g, '/');

const toPortableProjectAssetUrl = (value: string, eventCode: string) => {
  const normalizedValue = normalizeUrl(value);
  if (
    normalizedValue === ''
    || normalizedValue.startsWith('data:')
    || normalizedValue.startsWith('blob:')
    || /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(normalizedValue)
      && !normalizedValue.includes(`/invitaciones/${eventCode}/`)
  ) {
    return normalizedValue;
  }

  const publicMarkers = [
    `/invitaciones/${eventCode}/public/invitacion/`,
    `/invitaciones/${eventCode}/invitacion/`,
    `invitaciones/${eventCode}/public/invitacion/`,
    `invitaciones/${eventCode}/invitacion/`,
    '/public/invitacion/',
    'public/invitacion/',
    '/invitacion/',
    'invitacion/',
    './invitacion/',
  ];

  for (const marker of publicMarkers) {
    const markerIndex = normalizedValue.indexOf(marker);
    if (markerIndex >= 0) {
      const relativePart = normalizedValue.slice(markerIndex + marker.length).replace(/^\/+/, '');
      return relativePart ? `./invitacion/${relativePart}` : './invitacion/';
    }
  }

  return normalizedValue;
};

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

const resolveEventDateParts = (record: EventPortalRecord, countdownSection: Section | null) => {
  const rawDateTime = countdownSection?.countdownTargetDate?.trim()
    || record.eventDateValue?.trim()
    || '';

  if (!rawDateTime) {
    return { date: '', time: '' };
  }

  const normalized = rawDateTime.includes('T')
    ? rawDateTime
    : rawDateTime.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  const isoDate = parsed.toISOString();
  return {
    date: isoDate.slice(0, 10),
    time: `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`,
  };
};

const extractFirstUrl = (value?: string | null) => {
  const match = (value ?? '').match(/https?:\/\/[^\s]+/i);
  return match?.[0]?.trim() ?? '';
};

const extractRsvpPhone = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    const matches = (value ?? '').match(/(?:\+?\d[\d\s().-]{8,}\d)/g);
    if (!matches) {
      continue;
    }

    const candidate = matches
      .map((match) => match.replace(/[^\d]/g, ''))
      .find((digits) => digits.length >= 10);

    if (candidate) {
      return candidate;
    }
  }

  return DEFAULT_STATIC_CONFIG.rsvpPhone;
};

const buildStaticInvitationConfig = (
  formData: InvitationData,
  record: EventPortalRecord,
  packageId: PackageType
): StaticInvitationConfig => {
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
  const rsvpSection = findSection(formData, 'rsvp', 'GUESTS');

  const { date, time } = resolveEventDateParts(record, countdownSection);
  const heroContentBlocks = splitTextBlocks(heroSection?.content);
  const locationContentBlocks = splitTextBlocks(locationSection?.content);
  const messagesBlocks = splitTextBlocks(messagesSection?.content);
  const heroTitle = getElementValue(heroSection, 'inicio-title', heroSection?.title?.trim() || formData.eventTitle.trim() || record.eventTitle);
  const heroSubtitle = getElementValue(heroSection, 'inicio-subtitle', heroSection?.subtitle?.trim() || 'Invitacion especial');
  const heroHosts = getElementValue(heroSection, 'inicio-hosts', heroContentBlocks[0] || formData.hostName.trim() || record.hostName || heroSubtitle);
  const heroMessage = getElementValue(heroSection, 'inicio-message', heroContentBlocks.slice(1).join('\n\n') || heroSection?.content?.trim() || DEFAULT_STATIC_CONFIG.mainMessage);
  const venueName = getElementValue(locationSection, 'ubicacion-title', locationSection?.title?.trim() || record.venue || '');
  const venueAddress = getElementValue(locationSection, 'ubicacion-address', locationContentBlocks[0] || locationSection?.content?.trim() || record.venue || '');
  const venueMapsUrl = locationSection?.locationMapUrl?.trim() || extractFirstUrl(locationSection?.content) || record.venueMapsUrl || '';
  const story = getElementValue(storySection, 'historia-story', splitTextBlocks(storySection?.content)[0] || storySection?.content?.trim() || '');
  const dressName = getElementValue(detailsSection, 'detalles-dress-name', detailsSection?.subtitle?.trim() || '');
  const dressExtra = getElementValue(detailsSection, 'detalles-dress-extra', '');
  const galleryTitles = splitBulletLines(gallerySection?.content);
  const galleryImages = [
    ...getSectionImageValues(gallerySection, 'image'),
    ...getSectionImageValues(gallerySection, 'contentImage'),
  ]
    .map((value) => toPortableProjectAssetUrl(value, record.code))
    .filter(Boolean);
  const coverCandidates = [
    ...getSectionImageValues(heroSection, 'contentImage'),
    ...getSectionImageValues(heroSection, 'image'),
    ...galleryImages,
  ].map((value) => toPortableProjectAssetUrl(value, record.code)).filter(Boolean);
  const giftTables = collectIndexedValues(detailsSection, /^detalles-gift-(\d+)-(name|notes|account)$/)
    .map((item) => ({
      storeName: item.name || 'Mesa de regalos',
      notes: item.notes || '',
      accountNumber: item.account || '',
    }))
    .filter((item) => item.storeName || item.notes || item.accountNumber);
  const specialNotes = collectIndexedValues(logisticsSection, /^logistica-note-(\d+)$/)
    .map((item) => item.value || '')
    .filter(Boolean);
  const recommendedStays = collectIndexedValues(logisticsSection, /^logistica-stay-(\d+)-(name|address|notes)$/)
    .map((item) => ({
      name: item.name || '',
      address: item.address || '',
      notes: item.notes || '',
    }))
    .filter((item) => item.name || item.address || item.notes);
  const transportInfo: InvitationSourceTransportInfo = {
    parking: getElementValue(logisticsSection, 'logistica-parking'),
    shuttle: getElementValue(logisticsSection, 'logistica-shuttle'),
    notes: getElementValue(logisticsSection, 'logistica-transport-notes'),
  };
  const photoShareMessage = getElementValue(messagesSection, 'mensajes-share-message', messagesBlocks[0] || messagesSection?.content?.trim() || '');
  const photoShareUrl = extractFirstUrl(messagesSection?.content);
  const playlistUrl = extractFirstUrl(musicSection?.content);
  const rsvpMessage = rsvpSection?.content?.trim()
    || `Hola, quiero confirmar mi asistencia al evento de ${heroTitle}.`;

  return {
    ...DEFAULT_STATIC_CONFIG,
    eventLabel: record.code ? `Invitacion ${record.code}` : DEFAULT_STATIC_CONFIG.eventLabel,
    title: heroTitle || DEFAULT_STATIC_CONFIG.title,
    subtitle: heroSubtitle || DEFAULT_STATIC_CONFIG.subtitle,
    hosts: heroHosts || DEFAULT_STATIC_CONFIG.hosts,
    mainMessage: heroMessage || DEFAULT_STATIC_CONFIG.mainMessage,
    date,
    time,
    venueName,
    venueAddress,
    venueMapsUrl,
    theme: DEFAULT_THEME_BY_PACKAGE[packageId] ?? DEFAULT_STATIC_CONFIG.theme,
    dressCode: dressName,
    dressCodeColor: dressExtra,
    story,
    timeline: (itinerarySection?.itineraryItems ?? []).map((item, index) => ({
      id: item.id || `momento-${index + 1}`,
      time: item.time || '',
      title: item.title || `Momento ${index + 1}`,
      description: '',
      icon: item.icon || 'calendar',
    })),
    giftTables,
    gallery: (galleryImages.length > 0 ? galleryImages : coverCandidates.slice(0, 1)).slice(0, 3).map((url, index) => ({
      id: `foto-${index + 1}`,
      title: galleryTitles[index] || `Foto ${index + 1}`,
      url,
    })),
    specialNotes,
    recommendedStays,
    transportInfo,
    photoShareUrl,
    photoShareMessage,
    backgroundMusicUrl: toPortableProjectAssetUrl(musicSection?.audioUrl?.trim() || '', record.code),
    musicPlaylistUrl: playlistUrl,
    musicRequested: !!(musicSection?.audioUrl || playlistUrl),
    coverImage: coverCandidates[0] || '',
    colors: DEFAULT_COLORS_BY_PACKAGE[packageId] ?? DEFAULT_STATIC_CONFIG.colors,
    rsvpPhone: extractRsvpPhone(rsvpSection?.content, heroSection?.content, messagesSection?.content),
    rsvpMessage,
    footerTitle: heroTitle || DEFAULT_STATIC_CONFIG.footerTitle,
    footerCopy: `Invitacion estatica generada desde el editor para ${heroTitle || record.eventTitle || 'tu evento'}.`,
  };
};

export const buildStaticInvitationProjectSource = (
  formData: InvitationData,
  record: EventPortalRecord,
  packageId: PackageType
) => {
  const config = buildStaticInvitationConfig(formData, record, packageId);
  return `const INVITATION_CONFIG = ${JSON.stringify(config, null, 2)};\nwindow.INVITATION_CONFIG = INVITATION_CONFIG;\n\n${STATIC_INVITATION_RUNTIME}\n`;
};
