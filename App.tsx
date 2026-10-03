import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { PageSectionFallback } from './components/layout/PageSectionFallback';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { AmbientBackdrop } from './components/landing/AmbientBackdrop';
import type {
  EventMetrics,
  EventAdminWorkspaceItem,
  EventPortalEventDraft,
  EventPortalGuest,
  EventPortalGuestDraft,
  EventPortalStatus,
  EventPortalRecord,
  GuestStatus,
  InvitationProjectRecord
} from './components/event-portal/types';
import { HeroSection } from './components/landing/HeroSection';
import { displayFont, fadeInUp, staggerGroup } from './components/landing/landingMotion';
import { renderLandingIcon } from './components/landing/LandingIcons';
import type { LandingBenefit } from './components/landing/BenefitsSection';
import { BRAND_COLORS } from './components/landing/palette';
import { OptimizedImage } from './components/ui/OptimizedImage';

const loadLandingBelowFold = () => import('./components/landing/LandingBelowFold');
const LandingBelowFold = lazy(() => loadLandingBelowFold().then((module) => ({ default: module.LandingBelowFold })));
const FooterSection = lazy(() =>
  import('./components/landing/FooterSection').then((module) => ({ default: module.FooterSection }))
);
const RegistrationPage = lazy(() =>
  import('./components/registration/RegistrationPage').then((module) => ({ default: module.RegistrationPage }))
);
const EventPortalPage = lazy(() =>
  import('./components/event-portal/EventPortalPage').then((module) => ({ default: module.EventPortalPage }))
);
const AdminPanel = lazy(() =>
  import('./laboratorio/AdminPanel').then((module) => ({ default: module.default }))
);
import type { FooterSocialItem, IconName, LandingProcessItem } from './components/landing/shared';
import { PACKAGES } from './constants';
import { CONTROL_IMAGES } from './control_images';
import {
  downloadGuestAdminWorkbook,
  downloadGuestLinksWorkbook,
  downloadGuestTemplateWorkbook,
  hydrateEventPortalGuest,
  mergeImportedGuests,
  parseGuestUploadFile
} from './lib/eventPortalGuests';
import {
  buildInvitationProjectLaunchUrl,
  downloadInvitationProjectArchive,
  fetchEventPortalRecord,
  fetchInvitationProject,
  listEventPortalRecords,
  openInvitationProject,
  provisionInvitationProject,
  registerEventPortalGuestCheckIn,
  upsertEventPortalRecord,
  uploadInvitationProjectArchive
} from './services/eventPortalApi';
import { createGuestSession } from './laboratorio/services/localAuth';
import type { UserSession as AdminWorkspaceSession } from './laboratorio/types';
import { PackageType, normalizePackageType } from './types';

type AppPage = 'inicio' | 'precios' | 'por-que-elegirnos' | 'mi-evento' | 'panel-evento' | 'editar-invitacion' | 'registro';
type GuestSyncTone = 'success' | 'error' | 'neutral';

type NavItem = {
  id: string;
  label: string;
  page: AppPage;
  sectionId?: string;
};

const EVENT_PORTAL_STORAGE_KEY = 'invitarte_event_portal_v1';
const EVENT_PORTAL_SNAPSHOT_STORAGE_KEY = 'invitarte_event_portal_snapshot_v1';
const EVENT_ACTIVE_CODE_STORAGE_KEY = 'invitarte_event_active_code_v1';
const ADMIN_WORKSPACE_OPEN_STORAGE_KEY = 'invitarte_admin_workspace_open_v1';
const EVENT_ADMIN_EDITOR_STATE_KEY_PREFIX = 'laboratorio_event_admin_editor_';
const DEFAULT_PACKAGE_ID = PackageType.ORO;
const SINGLE_PRICE_AMOUNT = '$389';

const INVITATION_FEATURES = [
  'Portada y cuenta regresiva',
  'Ubicación en Google Maps',
  'Música de fondo',
  'Galería de fotos',
  'Itinerario y vestimenta',
  'Mesa de regalos',
  'Botón a WhatsApp',
  'Diseños para cada ocasión'
] as const;

const NAV_ITEMS: NavItem[] = [
  { id: 'proceso', label: 'Cómo funciona', page: 'inicio', sectionId: 'proceso' },
  { id: 'plantillas', label: 'Plantillas', page: 'inicio', sectionId: 'plantillas' },
  { id: 'control-qr', label: 'Control QR', page: 'inicio', sectionId: 'control-qr' },
  { id: 'precio', label: 'Precio', page: 'inicio', sectionId: 'precio' }
];

const DEMO_EVENT_ACCESS_CODE = 'A1B2C3';
const DEMO_EVENT_EXPIRATION = '2026-12-31T23:59:00';
const EVENT_PORTAL_EXPIRATION_DAYS = 45;

/*
  Seccion retirada temporalmente: "Lo que tu invitacion puede incluir."
  Contenido preservado para reincorporarlo despues en una version mas concentrada.

  const LANDING_INCLUDES = [
    {
      icon: 'gallery' as IconName,
        image: CONTROL_IMAGES.optionalIncludesSection.portadaPrincipal,
      eyebrow: 'Portada',
      title: 'Portada principal',
      description: 'Foto, nombres y fecha en una sola vista.',
      accent: 'Primera impresion'
    },
    {
      icon: 'calendar' as IconName,
        image: CONTROL_IMAGES.optionalIncludesSection.datosEvento,
      eyebrow: 'Fecha y hora',
      title: 'Datos del evento',
      description: 'Dia, hora y mensaje principal bien acomodados.',
      accent: 'Lectura rapida'
    },
    {
      icon: 'map' as IconName,
        image: CONTROL_IMAGES.optionalIncludesSection.mapaUbicacion,
      eyebrow: 'Mapa',
      title: 'Mapa y ubicacion',
      description: 'Direccion con acceso rapido para llegar sin vueltas.',
      accent: 'Llegada simple'
    },
    {
      icon: 'clock' as IconName,
        image: CONTROL_IMAGES.optionalIncludesSection.cuentaRegresiva,
      eyebrow: 'Cuenta regresiva',
      title: 'Cuenta regresiva',
      description: 'Muestra cuanto falta para el gran dia.',
      accent: 'Genera expectativa'
    },
    {
      icon: 'tie' as IconName,
        image: CONTROL_IMAGES.optionalIncludesSection.ambienteVestimenta,
      eyebrow: 'Vestimenta',
      title: 'Codigo de vestimenta',
      description: 'Indica si el evento es formal, casual o tematico.',
      accent: 'Todo mas claro'
    },
    {
      icon: 'calendarAdd' as IconName,
        image: CONTROL_IMAGES.optionalIncludesSection.agregarCalendario,
      eyebrow: 'Calendario',
      title: 'Agregar al calendario',
      description: 'Un recordatorio practico junto con notas extra.',
      accent: 'Listo para agendar'
    }
  ];
*/

const LANDING_PROCESS: LandingProcessItem[] = [
  {
    step: '01',
    icon: 'ticket' as IconName,
    title: 'Activa tu evento',
    description: 'Un solo pago de $389 por evento: sin planes, sin mensualidades y sin letras chiquitas.'
  },
  {
    step: '02',
    icon: 'edit' as IconName,
    title: 'Agrega datos e invitados',
    description: 'Carga fecha, lugar y tu lista de invitados con sus pases y su mesa.'
  },
  {
    step: '03',
    icon: 'send' as IconName,
    title: 'Comparte las invitaciones',
    description: 'Cada invitado recibe su invitación con su acceso personal, directo por WhatsApp.'
  },
  {
    step: '04',
    icon: 'shield' as IconName,
    title: 'Controla en tiempo real',
    description: 'Ves quién confirmó, quién falta y cuántas personas llegan, sin hojas de cálculo.'
  },
  {
    step: '05',
    icon: 'heart' as IconName,
    title: 'Recibe con QR',
    description: 'En la entrada escaneas el QR y ves al instante pases, mesa y grupo. Tú solo disfruta.'
  }
];

const LANDING_BENEFITS: LandingBenefit[] = [
  {
    icon: 'clock' as IconName,
    eyebrow: 'Tiempo',
    title: 'Actualizas una sola vez',
    description: 'Si cambia la hora, el mapa o una nota importante, editas el enlace y todo el mundo ve la versión correcta.',
    accent: 'Menos vueltas',
    visual: 'update',
    color: BRAND_COLORS.cyan,
    points: ['Editas una sola versión.', 'Evitas reenviar cambios por separado.', 'Todos ven la información actualizada.']
  },
  {
    icon: 'users' as IconName,
    eyebrow: 'Invitados',
    title: 'Confirmaciones mucho más claras',
    description: 'Tus invitados revisan fecha, lugar y detalles sin escribirte para pedir la misma información una y otra vez.',
    accent: 'Más orden',
    visual: 'rsvp',
    color: BRAND_COLORS.orange,
    points: ['Menos mensajes repetidos.', 'Más contexto desde el primer vistazo.', 'La asistencia se resuelve con más orden.']
  },
  {
    icon: 'leaf' as IconName,
    eyebrow: 'Ambiente',
    title: 'Protege el medio ambiente',
    description: 'Al compartirse de forma digital, reduces el uso de papel y evitas impresiones innecesarias sin perder una presentación cuidada.',
    accent: 'Menos papel',
    visual: 'paper',
    color: BRAND_COLORS.emerald,
    points: ['Evita invitaciones impresas en papel.', 'Reduce residuos y reimpresiones innecesarias.', 'Mantiene una experiencia moderna y fácil de compartir.']
  },
  {
    icon: 'send' as IconName,
    eyebrow: 'Difusión',
    title: 'Se comparte mejor desde el celular',
    description: 'WhatsApp, redes o link directo: todo el evento viaja más rápido cuando la experiencia nace digital.',
    accent: 'Lista para enviar',
    visual: 'share',
    color: BRAND_COLORS.violet,
    points: ['Funciona mejor en WhatsApp.', 'El acceso al mapa y fecha es inmediato.', 'El enlace queda listo para circular.']
  },
  {
    icon: 'stars' as IconName,
    eyebrow: 'Innovadora',
    title: 'Tu evento se siente más actual',
    description: 'La invitación digital proyecta una experiencia moderna desde el primer vistazo y hace que tu evento destaque sin complicar a tus invitados.',
    accent: 'Imagen moderna',
    visual: 'modern',
    color: BRAND_COLORS.fuchsia,
    points: ['Da una primera impresión más actual.', 'Se percibe diferente a una invitación tradicional.', 'Combina estilo con practicidad en el mismo enlace.']
  }
];


const FOOTER_SOCIALS: readonly FooterSocialItem[] = [
  { label: 'Instagram', icon: 'instagram' as IconName, color: '#E4405F', href: 'https://www.instagram.com/' },
  { label: 'Facebook', icon: 'facebook' as IconName, color: '#1877F2', href: 'https://www.facebook.com/' },
  { label: 'TikTok', icon: 'tiktok' as IconName, color: '#25F4EE', href: 'https://www.tiktok.com/' },
  { label: 'WhatsApp', icon: 'whatsapp' as IconName, color: '#25D366', href: 'https://www.whatsapp.com/' }
];

const normalizeAccessCode = (value: string) => value.trim().toUpperCase();
const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const EVENT_ACCESS_CODE_LENGTH = 10;

function buildEventShareUrl(eventCode: string) {
  return buildInvitationProjectLaunchUrl(eventCode);
}

const createSeedGuests = (sourceCode: string, shareUrl = buildEventShareUrl(sourceCode)): EventPortalGuest[] => {
  const names = [
    'Familia Torres',
    'Daniela y Luis',
    'Martha Salazar',
    'Equipo ARMiRARTE',
    'Padrinos del evento',
    'Andrea Cuevas',
    'Sofia y Nico',
    'Invitados VIP'
  ];
  const groups = ['Familia', 'Amigos', 'Cercanos', 'Proveedor'];
  const base = sourceCode.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return names.map((name, index) => {
    const roll = (base + index * 7) % 9;
    const status: GuestStatus = roll <= 3 ? 'confirmado' : roll <= 6 ? 'pendiente' : 'declinado';
    const tableNumber = Math.floor(index / 2) + 1;

    return hydrateEventPortalGuest(
      {
        id: `${sourceCode}-${index}`,
        name,
        companions: 1 + ((base + index) % 3),
        group: groups[(base + index) % groups.length],
        tableLabel: `Mesa ${tableNumber}`,
        status,
        note:
          status === 'confirmado'
            ? 'Asistencia validada.'
            : status === 'pendiente'
              ? 'Falta respuesta final.'
              : 'No podra asistir.'
      },
      index,
      sourceCode,
      shareUrl
    );
  });
};

const addDaysToIso = (value: string, days: number) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return DEMO_EVENT_EXPIRATION;

  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString();
};

const hydrateEventPortalRecord = (input: Partial<EventPortalRecord>, fallbackCode: string): EventPortalRecord => {
  const code = normalizeAccessCode(typeof input.code === 'string' && input.code ? input.code : fallbackCode);
  const createdAt = typeof input.createdAt === 'string' && input.createdAt ? input.createdAt : new Date().toISOString();
  const updatedAt = typeof input.updatedAt === 'string' && input.updatedAt ? input.updatedAt : createdAt;
  const invitationId = typeof input.invitationId === 'string' && input.invitationId.trim() ? input.invitationId.trim() : null;
  const shareUrl =
    typeof input.shareUrl === 'string' && input.shareUrl
      ? input.shareUrl
      : buildEventShareUrl(code);
  const featureLabels = Array.isArray(input.featureLabels)
    ? input.featureLabels.filter((label): label is string => typeof label === 'string' && label.trim().length > 0).slice(0, 6)
    : [];
  const guests = Array.isArray(input.guests)
    ? input.guests.map((guest, index) => hydrateEventPortalGuest(guest, index, code, shareUrl))
    : code === DEMO_EVENT_ACCESS_CODE
      ? createSeedGuests(code, shareUrl)
      : [];

  return {
    code,
    invitationId,
    designId: typeof input.designId === 'string' && input.designId ? input.designId : code,
    packageId: normalizePackageType(input.packageId) ?? DEFAULT_PACKAGE_ID,
    eventTitle: typeof input.eventTitle === 'string' && input.eventTitle ? input.eventTitle : 'Evento sin titulo',
    hostName: typeof input.hostName === 'string' && input.hostName ? input.hostName : 'Anfitrion por definir',
    eventDate: typeof input.eventDate === 'string' && input.eventDate ? input.eventDate : 'Fecha pendiente',
    eventDateValue:
      typeof input.eventDateValue === 'string' && input.eventDateValue
        ? toDateTimeLocalInputValue(input.eventDateValue)
        : toDateTimeLocalInputValue(typeof input.eventDate === 'string' ? input.eventDate : ''),
    venue: typeof input.venue === 'string' && input.venue ? input.venue : 'Lugar por confirmar',
    venueMapsUrl: typeof input.venueMapsUrl === 'string' ? input.venueMapsUrl.trim() : '',
    status: normalizeEventPortalStatus(input.status),
    createdDate: toDateInputValue(typeof input.createdDate === 'string' ? input.createdDate : createdAt),
    shareUrl,
    featureLabels,
    guests,
    expiresAt:
      typeof input.expiresAt === 'string' && input.expiresAt
        ? input.expiresAt
        : code === DEMO_EVENT_ACCESS_CODE
          ? DEMO_EVENT_EXPIRATION
          : addDaysToIso(updatedAt, EVENT_PORTAL_EXPIRATION_DAYS),
    createdAt,
    updatedAt
  };
};

const createDemoEventPortalRecord = (): EventPortalRecord =>
  hydrateEventPortalRecord(
    {
      code: DEMO_EVENT_ACCESS_CODE,
      invitationId: DEMO_EVENT_ACCESS_CODE,
      designId: 'demo-event-a1b2c3',
      packageId: DEFAULT_PACKAGE_ID,
      eventTitle: 'Boda Fernanda y Diego',
      hostName: 'Fernanda y Diego',
      eventDate: '18/10/2026 · 17:00',
      eventDateValue: '2026-10-18T17:00',
      venue: 'Salón Aura, Hermosillo, Sonora',
      venueMapsUrl: 'https://maps.google.com/?q=Salon+Aura+Hermosillo+Sonora',
      status: 'activo',
      createdDate: '2026-05-08',
      shareUrl: buildEventShareUrl(DEMO_EVENT_ACCESS_CODE),
      featureLabels: [
        'Datos del evento',
        'Confirmacion de asistencia',
        'Boton a WhatsApp',
        'Galeria visual',
        'Itinerario del evento'
      ],
      guests: createSeedGuests(DEMO_EVENT_ACCESS_CODE, buildEventShareUrl(DEMO_EVENT_ACCESS_CODE)),
      expiresAt: DEMO_EVENT_EXPIRATION,
      createdAt: '2026-05-08T12:00:00.000Z',
      updatedAt: '2026-05-08T12:00:00.000Z'
    },
    DEMO_EVENT_ACCESS_CODE
  );

const stripGuestsFromCachedEventRecord = (record: EventPortalRecord): EventPortalRecord =>
  record.code === DEMO_EVENT_ACCESS_CODE
    ? record
    : {
        ...record,
        guests: [],
      };

const readEventPortalSnapshots = (): Record<string, EventPortalRecord> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(EVENT_PORTAL_SNAPSHOT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([key, value]) => {
        if (!value || typeof value !== 'object') return [];
        const normalizedCode = normalizeAccessCode(key);
        if (!normalizedCode) return [];
        return [[normalizedCode, hydrateEventPortalRecord(value as Partial<EventPortalRecord>, normalizedCode)]];
      })
    );
  } catch {
    return {};
  }
};

const writeEventPortalSnapshots = (records: Record<string, EventPortalRecord>) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(EVENT_PORTAL_SNAPSHOT_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
};

const readEventPortalSnapshotForCode = (code: string) => {
  const normalizedCode = normalizeAccessCode(code);
  if (!normalizedCode) return null;

  return readEventPortalSnapshots()[normalizedCode] ?? null;
};

const writeEventPortalSnapshot = (record: EventPortalRecord) => {
  if (typeof window === 'undefined') return;

  const snapshots = readEventPortalSnapshots();
  snapshots[record.code] = record;
  writeEventPortalSnapshots(snapshots);
};

const buildGuestConsultFallbackMessage = (hasSnapshot: boolean) =>
  hasSnapshot
    ? 'No pudimos consultar la base de datos. Mostrando la ultima version guardada en este navegador.'
    : 'No pudimos consultar la base de datos.';

const buildGuestRefreshFallbackMessage = (hasSnapshot: boolean) =>
  hasSnapshot
    ? 'No pudimos actualizar los invitados desde la base. Mostrando la ultima version guardada en este navegador.'
    : 'No pudimos actualizar los invitados desde la base.';

const buildMissingEventFallbackMessage = (hasSnapshot: boolean) =>
  hasSnapshot
    ? 'No encontramos este evento en la base. Mostrando la ultima version guardada en este navegador.'
    : 'No encontramos este evento en la base de datos.';

const readEventPortalRecords = (): Record<string, EventPortalRecord> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(EVENT_PORTAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([key, value]) => {
        if (!value || typeof value !== 'object') return [];
        const normalizedCode = normalizeAccessCode(key);
        if (!normalizedCode) return [];
        return [[normalizedCode, stripGuestsFromCachedEventRecord(hydrateEventPortalRecord(value as Partial<EventPortalRecord>, normalizedCode))]];
      })
    );
  } catch {
    return {};
  }
};

const writeEventPortalRecords = (records: Record<string, EventPortalRecord>) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(EVENT_PORTAL_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
};

const formatPortalDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim().length > 0 ? error.message : fallback;

const buildDefaultEventFeatureLabels = () => ['Datos del evento', 'Invitados', 'Acceso QR'];

const padDatePart = (value: number) => String(value).padStart(2, '0');

const buildTodayDateInputValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;
};

const normalizeEventPortalStatus = (value: unknown): EventPortalStatus => {
  switch (typeof value === 'string' ? value.trim().toLowerCase() : '') {
    case 'borrador':
      return 'borrador';
    case 'inactivo':
      return 'inactivo';
    case 'cancelado':
      return 'cancelado';
    default:
      return 'activo';
  }
};

const toDateInputValue = (value?: string | null) => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return buildTodayDateInputValue();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return buildTodayDateInputValue();

  return `${parsed.getFullYear()}-${padDatePart(parsed.getMonth() + 1)}-${padDatePart(parsed.getDate())}`;
};

const toDateTimeLocalInputValue = (value?: string | null) => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase() === 'fecha pendiente') return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const compact = trimmed.replace(/\s*[·|]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(compact)) {
    return compact.replace(' ', 'T');
  }

  const dayFirstMatch = compact.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?:\s+(\d{1,2})(?::(\d{2}))?)?$/);
  if (dayFirstMatch) {
    const [, dayText, monthText, yearText, hourText = '00', minuteText = '00'] = dayFirstMatch;
    return `${yearText}-${padDatePart(Number.parseInt(monthText, 10))}-${padDatePart(Number.parseInt(dayText, 10))}T${padDatePart(
      Number.parseInt(hourText, 10)
    )}:${padDatePart(Number.parseInt(minuteText, 10))}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';

  return `${parsed.getFullYear()}-${padDatePart(parsed.getMonth() + 1)}-${padDatePart(parsed.getDate())}T${padDatePart(
    parsed.getHours()
  )}:${padDatePart(parsed.getMinutes())}`;
};

const formatEventDateLabelFromInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Fecha pendiente';

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return trimmed;

  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} · ${hour}:${minute}`;
};

const createEventPortalDraftFromRecord = (record?: EventPortalRecord | null): EventPortalEventDraft => ({
  eventCode: record?.code ?? '',
  eventTitle: record?.eventTitle ?? '',
  hostName: record?.hostName ?? '',
  eventDate: record?.eventDateValue ? toDateTimeLocalInputValue(record.eventDateValue) : toDateTimeLocalInputValue(record?.eventDate),
  venue: record?.venue ?? '',
  venueMapsUrl: record?.venueMapsUrl ?? '',
  status: normalizeEventPortalStatus(record?.status),
  createdDate: toDateInputValue(record?.createdDate ?? record?.createdAt),
  packageId: record?.packageId ?? DEFAULT_PACKAGE_ID
});

const createEmptyManualGuestDraft = (): EventPortalGuestDraft => ({
  name: '',
  companions: 1,
  group: 'General',
  tableLabel: '',
  email: '',
  phone: '',
  status: 'pendiente',
  note: ''
});

const sortEventRecordsByUpdatedAt = (records: EventPortalRecord[]) => {
  return [...records].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
};

const buildEventAdminWorkspaceItem = (record: EventPortalRecord): EventAdminWorkspaceItem => ({
  record,
  projectPath: `invitaciones/${record.code}`,
  appEntry: `invitaciones/${record.code}/script.js`,
  previewPath: `invitaciones/${record.code}/dist/index.html`,
});

const setAdminWorkspaceOpenPreference = (isOpen: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    if (isOpen) {
      window.sessionStorage.setItem(ADMIN_WORKSPACE_OPEN_STORAGE_KEY, '1');
      return;
    }

    window.sessionStorage.removeItem(ADMIN_WORKSPACE_OPEN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
};

const consumeAdminWorkspaceOpenPreference = () => {
  if (typeof window === 'undefined') return false;

  try {
    const shouldRestore = window.sessionStorage.getItem(ADMIN_WORKSPACE_OPEN_STORAGE_KEY) === '1';
    window.sessionStorage.removeItem(ADMIN_WORKSPACE_OPEN_STORAGE_KEY);
    return shouldRestore;
  } catch {
    return false;
  }
};

const persistAdminWorkspaceEditorPreference = (sessionId: string, eventCode: string) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      `${EVENT_ADMIN_EDITOR_STATE_KEY_PREFIX}${sessionId}`,
      JSON.stringify({
        activeTab: 'create',
        activeCode: eventCode,
      })
    );
  } catch {
    // ignore storage errors
  }
};

const getRandomIndex = (maxExclusive: number) => {
  if (maxExclusive <= 0) {
    throw new Error('maxExclusive debe ser mayor a cero.');
  }

  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const values = new Uint32Array(1);
    const maxUint32 = 0x1_0000_0000;
    const unbiasedLimit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;

    do {
      globalThis.crypto.getRandomValues(values);
    } while (values[0] >= unbiasedLimit);

    return values[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
};

const generateRandomAccessCode = (length = EVENT_ACCESS_CODE_LENGTH) => {
  const availableCharacters = ACCESS_CODE_ALPHABET.split('');
  if (length > availableCharacters.length) {
    throw new Error('No hay suficientes caracteres unicos para generar el codigo.');
  }

  let code = '';
  for (let index = 0; index < length; index += 1) {
    const randomIndex = getRandomIndex(availableCharacters.length);
    code += availableCharacters[randomIndex];
    availableCharacters.splice(randomIndex, 1);
  }

  return code;
};

const renderIcon = (icon: IconName, className = 'h-5 w-5') => renderLandingIcon(icon, className);
const LANDING_DEFERRED_SECTION_STYLE: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '960px'
};
const INVITATION_PROJECT_DEBUG_PREFIX = '[InvitationProject]';

const logInvitationProjectDebug = (scope: string, details?: unknown) => {
  if (typeof console === 'undefined') return;

  if (details === undefined) {
    console.log(`${INVITATION_PROJECT_DEBUG_PREFIX} ${scope}`);
    return;
  }

  console.log(`${INVITATION_PROJECT_DEBUG_PREFIX} ${scope}`, details);
};

const logInvitationProjectError = (scope: string, error: unknown, details?: unknown) => {
  if (typeof console === 'undefined') return;

  if (details === undefined) {
    console.error(`${INVITATION_PROJECT_DEBUG_PREFIX} ${scope}`, error);
    return;
  }

  console.error(`${INVITATION_PROJECT_DEBUG_PREFIX} ${scope}`, {
    details,
    error,
  });
};

const WorkspacePageLoader: React.FC = () => (
  <div className="flex h-full items-center justify-center bg-slate-50 px-6">
    <div className="w-full max-w-xl rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <div className="h-4 w-32 rounded-full bg-slate-200" />
      <div className="mt-4 h-12 w-2/3 rounded-2xl bg-slate-100" />
      <div className="mt-6 h-44 rounded-[28px] bg-slate-100" />
    </div>
  </div>
);


const SPLASH_SEEN_STORAGE_KEY = 'invitarte_splash_seen_v1';

// La pantalla de bienvenida retrasaba ~0.8 s el primer contenido visible; se desactiva para cargar mas rapido.
const shouldShowSplash = () => false;

/* #registro o #registro/<plantilla>; tambien el regreso de Mercado Pago (?pago=aprobado|pendiente|rechazado) */
const isRegistrationLocation = () =>
  typeof window !== 'undefined' &&
  (window.location.hash.startsWith('#registro') || new URLSearchParams(window.location.search).has('pago'));

const getRegistrationTemplateFromHash = () => {
  if (typeof window === 'undefined') return null;
  const [, templateId] = window.location.hash.split('/');
  return templateId ? decodeURIComponent(templateId) : null;
};

const getPageFromHash = (): AppPage => {
  if (typeof window === 'undefined') return 'inicio';
  // Precio y "por que elegirnos" ahora son secciones de inicio.
  if (isRegistrationLocation()) return 'registro';
  if (window.location.hash === '#mi-evento') return 'mi-evento';
  if (window.location.hash === '#panel-evento') return 'panel-evento';
  if (window.location.hash === '#editar-invitacion') return 'editar-invitacion';
  return 'inicio';
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const [fadeSplash, setFadeSplash] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromHash);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hasScrolledNav, setHasScrolledNav] = useState(false);
  // Si se entra directo a una seccion (#plantillas, #precio...) se pinta todo de inmediato.
  const [isBelowFoldReady, setIsBelowFoldReady] = useState(
    () => typeof window !== 'undefined' && window.location.hash.length > 1 && window.location.hash !== '#inicio'
  );
  const [eventAccessCode, setEventAccessCode] = useState('');
  const [eventAccessError, setEventAccessError] = useState<string | null>(null);
  const [eventPortalRecords, setEventPortalRecords] = useState<Record<string, EventPortalRecord>>({});
  const [activeEventRecord, setActiveEventRecord] = useState<EventPortalRecord | null>(null);
  const [activeInvitationProject, setActiveInvitationProject] = useState<InvitationProjectRecord | null>(null);
  const [guestSyncMessage, setGuestSyncMessage] = useState<string | null>(null);
  const [guestSyncTone, setGuestSyncTone] = useState<GuestSyncTone>('neutral');
  const [invitationProjectMessage, setInvitationProjectMessage] = useState<string | null>(null);
  const [invitationProjectTone, setInvitationProjectTone] = useState<GuestSyncTone>('neutral');
  const [isEventAccessBusy, setIsEventAccessBusy] = useState(false);
  const [isEventEditorBusy, setIsEventEditorBusy] = useState(false);
  const [isGuestSyncBusy, setIsGuestSyncBusy] = useState(false);
  const [isInvitationProjectBusy, setIsInvitationProjectBusy] = useState(false);
  const [isAdminWorkspaceOpen, setIsAdminWorkspaceOpen] = useState(false);
  const [isAdminWorkspaceBusy, setIsAdminWorkspaceBusy] = useState(false);
  const [adminWorkspaceError, setAdminWorkspaceError] = useState<string | null>(null);
  const [adminWorkspaceSession, setAdminWorkspaceSession] = useState<AdminWorkspaceSession | null>(null);
  const hasScrolledNavRef = useRef(false);
  const activeEventCodeRef = useRef('');
  const hasRestoredAdminWorkspaceRef = useRef(false);
  const pageViewportRef = useRef<HTMLDivElement | null>(null);
  const panelContentRef = useRef<HTMLDivElement | null>(null);

  const isInvitationEditorPage = currentPage === 'editar-invitacion';
  const isEventPortalPage = currentPage === 'mi-evento' || currentPage === 'panel-evento' || isInvitationEditorPage;
  // El sitio publico siempre va en negro; el portal del evento conserva su tema claro.
  // Panel del evento y editor: layout de aplicacion (alto fijo, scroll interno).
  // El resto (inicio, registro, Mi evento) usa el scroll nativo del navegador, que es mucho mas fluido.
  const isAppShellPage = currentPage === 'panel-evento' || currentPage === 'editar-invitacion';
  // Todo el sitio va en negro; solo el editor de invitaciones conserva su tema claro.
  const isDark = !isInvitationEditorPage;

  /*
    Rendimiento: el hero se pinta solo; las secciones inferiores se descargan de inmediato
    pero se renderizan cuando el navegador queda libre o cuando el visitante empieza a bajar.
  */
  useEffect(() => {
    if (isBelowFoldReady || currentPage !== 'inicio') return;
    void loadLandingBelowFold();

    const reveal = () => setIsBelowFoldReady(true);
    const hasIdleCallback = typeof window.requestIdleCallback === 'function';
    const idleId = hasIdleCallback ? window.requestIdleCallback(reveal, { timeout: 1500 }) : window.setTimeout(reveal, 1000);
    window.addEventListener('scroll', reveal, { once: true, passive: true });

    return () => {
      if (hasIdleCallback) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      window.removeEventListener('scroll', reveal);
    };
  }, [isBelowFoldReady, currentPage]);

  const scrollPageViewportToTop = (behavior: ScrollBehavior = 'auto') => {
    const viewport = isAppShellPage ? pageViewportRef.current : null;

    if (viewport) {
      viewport.scrollTo({ top: 0, behavior });
      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior });
    }
  };

  const scrollPageViewportToSection = (sectionId: string, behavior: ScrollBehavior = 'auto') => {
    if (typeof window === 'undefined') return;

    // Las secciones inferiores se cargan con React.lazy: esperamos a que existan antes de hacer scroll.
    const startedAt = window.performance.now();
    const tryScroll = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({ behavior, block: 'start' });
        return;
      }

      if (window.performance.now() - startedAt > 2000) {
        scrollPageViewportToTop(behavior);
        return;
      }

      window.requestAnimationFrame(tryScroll);
    };

    window.requestAnimationFrame(tryScroll);
  };

  useEffect(() => {
    document.title =
      currentPage === 'precios'
        ? 'INViTARTE - Precio unico'
        : currentPage === 'por-que-elegirnos'
          ? 'INViTARTE - Por que elegirnos'
          : currentPage === 'editar-invitacion'
            ? 'INViTARTE - Editor de invitacion'
        : currentPage === 'mi-evento' || currentPage === 'panel-evento'
          ? 'INViTARTE - Eventos'
          : 'INViTARTE - Invitaciones Digitales';
  }, [currentPage]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const faviconHref = CONTROL_IMAGES.landingSlots.navbarLogo;
    const ensureLink = (selector: string, rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(selector);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = faviconHref;
    };

    ensureLink("link[rel='icon']", 'icon');
    ensureLink("link[rel='shortcut icon']", 'shortcut icon');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showSplash) return;

    try {
      window.sessionStorage.setItem(SPLASH_SEEN_STORAGE_KEY, '1');
    } catch {
      // Sin almacenamiento disponible: el splash corto se mostrara de nuevo.
    }

    const fadeTimer = window.setTimeout(() => {
      setFadeSplash(true);
    }, 420);

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 760);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    if (showSplash) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSplash]);

  useEffect(() => {
    if (!isAdminWorkspaceOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAdminWorkspaceOpenPreference(false);
        setIsAdminWorkspaceOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminWorkspaceOpen]);

  useEffect(() => {
    setEventPortalRecords(readEventPortalRecords());
  }, []);

  useEffect(() => {
    activeEventCodeRef.current = activeEventRecord?.code ?? '';
  }, [activeEventRecord?.code]);

  useEffect(() => {
    setActiveInvitationProject(null);
    setInvitationProjectFeedback('neutral', null);
    setIsInvitationProjectBusy(false);
  }, [activeEventRecord?.code]);

  const setActiveInvitationProjectForCode = (code: string, project: InvitationProjectRecord | null) => {
    logInvitationProjectDebug('state:update', {
      activeCode: activeEventCodeRef.current,
      code,
      hasProject: project !== null,
      previewUrl: project?.previewUrl ?? null,
      projectPath: project?.projectPath ?? null,
    });

    if (activeEventCodeRef.current === code) {
      setActiveInvitationProject(project);
    }
  };

  const ensureInvitationProjectForCode = React.useCallback(
    async (
      code: string,
      options: {
        buildPreview?: boolean;
        ensureProject?: boolean;
        source?: string;
      } = {}
    ) => {
      const ensureProject = options.ensureProject ?? true;
      const buildPreview = options.buildPreview ?? false;
      const source = options.source ?? 'unknown';

      logInvitationProjectDebug('ensure:start', {
        code,
        buildPreview,
        ensureProject,
        source,
      });

      try {
        let project = await fetchInvitationProject(code);

        logInvitationProjectDebug('ensure:fetch:done', {
          code,
          source,
          found: project !== null,
          previewUrl: project?.previewUrl ?? null,
          projectPath: project?.projectPath ?? null,
        });

        if (!project && ensureProject) {
          logInvitationProjectDebug('ensure:provision:start', { code, source });
          project = await provisionInvitationProject(code);
          logInvitationProjectDebug('ensure:provision:done', {
            code,
            source,
            previewUrl: project.previewUrl ?? null,
            projectPath: project.projectPath,
          });
        }

        if (project && buildPreview) {
          logInvitationProjectDebug('ensure:preview:start', {
            code,
            source,
            previousPreviewUrl: project.previewUrl ?? null,
          });
          project = await openInvitationProject(code);
          logInvitationProjectDebug('ensure:preview:done', {
            code,
            source,
            previewUrl: project.previewUrl ?? null,
            previewExists: project.previewExists,
          });
        }

        setActiveInvitationProjectForCode(code, project);
        return project;
      } catch (error) {
        logInvitationProjectError('ensure:failed', error, {
          code,
          buildPreview,
          ensureProject,
          source,
        });
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    const viewport = isAppShellPage ? pageViewportRef.current : null;
    const scrollTarget: HTMLElement | Window = viewport ?? window;
    let frameId = 0;

    const syncNavbarScroll = () => {
      const nextHasScrolled = (viewport ? viewport.scrollTop : window.scrollY) > 18;
      if (nextHasScrolled === hasScrolledNavRef.current) return;
      hasScrolledNavRef.current = nextHasScrolled;
      setHasScrolledNav(nextHasScrolled);
    };

    const scheduleNavbarScrollSync = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncNavbarScroll();
      });
    };

    syncNavbarScroll();
    scrollTarget.addEventListener('scroll', scheduleNavbarScrollSync, { passive: true });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      scrollTarget.removeEventListener('scroll', scheduleNavbarScrollSync);
    };
  }, [currentPage, isAppShellPage]);

  // Bloquea el scroll del documento solo en el layout de aplicacion (panel y editor).
  useEffect(() => {
    document.documentElement.classList.toggle('app-shell', isAppShellPage);
  }, [isAppShellPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((currentPage !== 'panel-evento' && currentPage !== 'editar-invitacion') || activeEventRecord) return;

    let isCancelled = false;

    const restoreActiveSession = async () => {
      const storedCode = normalizeAccessCode(window.localStorage.getItem(EVENT_ACTIVE_CODE_STORAGE_KEY) ?? '');
      if (!storedCode) {
        window.location.hash = '#mi-evento';
        return;
      }

      const cachedRecord = eventPortalRecords[storedCode] ?? null;
      const fallback = resolveCachedEventRecord(storedCode, cachedRecord);

      if (fallback.record) {
        persistEventRecord(fallback.record, {
          cacheSnapshot: fallback.hasSnapshot,
        });
        setEventAccessCode(fallback.record.code);
        setEventAccessError(null);
        if (!fallback.hasSnapshot) {
          setGuestFeedback('neutral', 'Actualizando invitados del evento...');
        }
        return;
      }

      let restoredRecord: EventPortalRecord | null = null;

      try {
        if (storedCode === DEMO_EVENT_ACCESS_CODE) {
          restoredRecord = createDemoEventPortalRecord();
        } else {
          const remoteRecord = await fetchEventPortalRecord(storedCode, {
            includeGuests: false,
          });
          if (remoteRecord) {
            restoredRecord = hydrateEventPortalRecord(remoteRecord, storedCode);
          }
        }
      } catch {
        restoredRecord = null;
      }

      if (isCancelled) return;

      if (!restoredRecord) {
        window.localStorage.removeItem(EVENT_ACTIVE_CODE_STORAGE_KEY);
        window.location.hash = '#mi-evento';
        return;
      }

      persistEventRecord(restoredRecord, {
        cacheSnapshot: restoredRecord.guests.length > 0,
      });
      setEventAccessCode(restoredRecord.code);
      setEventAccessError(null);
      if (restoredRecord.guests.length === 0) {
        setGuestFeedback('neutral', 'Actualizando invitados del evento...');
      }
    };

    void restoreActiveSession();

    return () => {
      isCancelled = true;
    };
  }, [activeEventRecord, currentPage, eventPortalRecords]);

  useEffect(() => {
    if (currentPage !== 'panel-evento' || !activeEventRecord) return;
    if (activeEventRecord.code === DEMO_EVENT_ACCESS_CODE) return;

    void refreshEventRecordFromServer(activeEventRecord.code);
  }, [activeEventRecord?.code, currentPage]);

  useEffect(() => {
    if (currentPage !== 'panel-evento' || !activeEventRecord) return;
    if (activeEventRecord.code === DEMO_EVENT_ACCESS_CODE) return;

    let isCancelled = false;
    const code = activeEventRecord.code;

    void (async () => {
      try {
        const project = await ensureInvitationProjectForCode(code, {
          buildPreview: false,
          ensureProject: true,
          source: 'panel-open',
        });

        if (isCancelled || activeEventCodeRef.current !== code) {
          return;
        }

        logInvitationProjectDebug('panel-open:project-ready', {
          code,
          hasProject: project !== null,
          previewUrl: project?.previewUrl ?? null,
          projectExists: project?.projectExists ?? null,
        });
      } catch (error) {
        if (isCancelled || activeEventCodeRef.current !== code) {
          return;
        }

        logInvitationProjectError('panel-open:project-load-failed', error, { code });
        setInvitationProjectFeedback('error', getErrorMessage(error, 'No pudimos recuperar el proyecto de la invitacion para este evento.'));
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activeEventRecord?.code, currentPage, ensureInvitationProjectForCode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromHash = () => {
      const hash = window.location.hash;
      const nextPage: AppPage = isRegistrationLocation()
        ? 'registro'
        : hash === '#precios' || hash === '#paquetes'
          ? 'precios'
          : hash === '#por-que-elegirnos'
            ? 'por-que-elegirnos'
          : hash === '#mi-evento'
            ? 'mi-evento'
            : hash === '#panel-evento'
              ? 'panel-evento'
              : hash === '#editar-invitacion'
                ? 'editar-invitacion'
              : 'inicio';
      setCurrentPage(nextPage);
      setMobileNavOpen(false);

      if (
        nextPage === 'precios'
        || nextPage === 'por-que-elegirnos'
        || nextPage === 'mi-evento'
        || nextPage === 'panel-evento'
        || nextPage === 'editar-invitacion'
      ) {
        scrollPageViewportToTop('auto');
        return;
      }

      const sectionId = hash.startsWith('#') ? hash.slice(1) : '';
      if (sectionId && sectionId !== 'inicio') {
        setIsBelowFoldReady(true);
        scrollPageViewportToSection(sectionId, 'auto');
      } else {
        scrollPageViewportToTop('auto');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  const pageClasses = isInvitationEditorPage
    ? 'bg-[#eef4f8] text-slate-950'
    : isDark
      ? 'bg-[#050507] text-stone-100'
      : 'bg-[#edf4f8] text-slate-950';
  const surfaceClasses = isDark
    ? 'border-white/[0.08] bg-[#0c0c11]/92 shadow-[0_24px_54px_rgba(0,0,0,0.5)]'
    : 'border-slate-200/70 bg-white/92 shadow-[0_20px_42px_rgba(15,23,42,0.08)]';
  const surfaceStrongClasses = isDark
    ? 'border-white/[0.08] bg-[#121218]/96 shadow-[0_22px_46px_rgba(0,0,0,0.45)]'
    : 'border-slate-200/80 bg-white/98 shadow-[0_18px_36px_rgba(15,23,42,0.09)]';
  const mutedTextClasses = isDark ? 'text-zinc-300' : 'text-slate-600';
  const heroLeadTextClasses = isDark ? 'text-slate-300' : 'text-slate-700';
  const tertiaryTextClasses = isDark ? 'text-zinc-400' : 'text-slate-500';
  const navChipClasses = isDark
    ? 'border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
    : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950';
  const navActiveClasses = isDark
    ? 'border-white/16 bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
    : 'border-slate-200/90 bg-white text-slate-950 shadow-[0_14px_32px_rgba(15,23,42,0.1)]';
  const secondaryButtonClasses = isDark
    ? 'border-white/14 bg-white/[0.04] text-slate-100 hover:bg-white/[0.1]'
    : 'border-slate-200/90 bg-white/86 text-slate-900 hover:bg-white';
  const primaryButtonClasses = isDark
    ? 'bg-white text-slate-950 hover:bg-slate-200'
    : 'bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)] hover:bg-slate-800';
  const shadowClasses = isDark
    ? 'shadow-[0_24px_60px_rgba(0,0,0,0.5)]'
    : 'shadow-[0_24px_60px_rgba(15,23,42,0.08)]';
  // Panel del evento en la misma paleta negra del sitio
  const panelShellClasses = 'border-white/[0.08] bg-[#0c0c11] text-white';
  const panelSurfaceStrongClasses = 'border-white/[0.08] bg-white/[0.03] text-white';
  const panelMutedTextClasses = 'text-zinc-400';
  const panelTertiaryTextClasses = 'text-zinc-500';
  const panelChipClasses = 'border-transparent bg-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white';
  const panelChipActiveClasses = 'border-white/15 bg-white/[0.1] text-white';
  const panelPrimaryButtonClasses = 'bg-white text-zinc-950 hover:bg-white/85';
  const isInicioPage = currentPage === 'inicio';
  const isHeroNavbar = isInicioPage && !hasScrolledNav;
  // Sobre la foto oscura del hero (o el menu movil abierto) el texto debe ser claro en ambos temas.
  const isNavbarOnDarkSurface = isDark || (isInicioPage && (isHeroNavbar || mobileNavOpen));
  const navbarTheme = isNavbarOnDarkSurface
    ? {
        panel: isHeroNavbar
          ? 'bg-[rgba(5,5,7,0.42)] text-stone-100 shadow-[0_18px_46px_rgba(0,0,0,0.28)]'
          : 'bg-[rgba(5,5,7,0.72)] text-stone-100 shadow-[0_18px_42px_rgba(0,0,0,0.24)]',
        softBorder: 'border-white/12',
        navChip: 'border-transparent bg-transparent text-white/80 hover:border-white/15 hover:bg-white/[0.1] hover:text-white',
        navActive: 'border-white/25 bg-white/[0.16] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.14)]',
        secondaryButton: 'border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.16]',
        primaryButton: 'bg-white text-zinc-950 shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:bg-white/85'
      }
    : {
        panel: isHeroNavbar
          ? 'bg-[rgba(255,255,255,0.36)] text-slate-950 shadow-[0_20px_42px_rgba(15,23,42,0.1)]'
          : 'bg-[rgba(255,255,255,0.72)] text-slate-950 shadow-[0_18px_36px_rgba(15,23,42,0.08)]',
        softBorder: 'border-slate-200/70',
        navChip: 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950',
        navActive: 'border-slate-200/90 bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
        secondaryButton: 'border border-slate-200/80 bg-white/70 text-slate-900 hover:bg-white',
        primaryButton: 'bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] hover:bg-slate-800'
      };
  const navbarWrapperClasses = isInicioPage
    ? 'fixed inset-x-0 top-0 z-50'
    : 'sticky top-0 z-50';
  const navbarPaddingClasses = isInicioPage
    ? `w-full px-3 sm:px-5 md:px-6 ${hasScrolledNav ? 'py-3 sm:py-4 md:py-4' : 'pt-4 pb-2 sm:pt-5 sm:pb-3 md:pt-6 md:pb-3'}`
    : isEventPortalPage
      ? 'w-full px-2 py-1.5 md:px-3 md:py-2'
      : 'w-full px-2.5 py-2.5 md:px-6 md:py-4';
  const inicioScrolledPanelClasses = isDark
    ? 'overflow-hidden rounded-[24px] bg-[rgba(5,5,7,0.82)] px-3 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-md'
    : 'overflow-hidden rounded-[24px] bg-[rgba(255,255,255,0.9)] px-3 py-3 shadow-[0_18px_36px_rgba(15,23,42,0.1)] backdrop-blur-md';
  const navbarPanelClasses = isInicioPage
    ? `relative isolate grid grid-cols-[1fr_auto] items-center gap-2.5 transition-[background-color,box-shadow] duration-500 lg:grid-cols-[auto_1fr_auto] ${
          mobileNavOpen
            ? 'overflow-hidden rounded-[24px] bg-[rgba(5,5,7,0.9)] px-3 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-md'
            : hasScrolledNav
              ? inicioScrolledPanelClasses
              : 'overflow-visible rounded-none bg-transparent px-0 py-0 shadow-none'
        }`
    : `relative isolate grid grid-cols-[1fr_auto] items-center gap-2.5 overflow-hidden transition-[background-color,box-shadow] duration-500 lg:grid-cols-[auto_1fr_auto] ${
        isEventPortalPage
          ? 'rounded-[18px] px-2 py-1.5 sm:px-2.5 sm:py-2 xl:gap-2'
          : 'rounded-[24px] px-2.5 py-2 sm:px-4 sm:py-3 xl:gap-3'
      } ${navbarTheme.panel}`;
  const navbarSoftBorderClasses = navbarTheme.softBorder;
  const navbarNavChipClasses = navbarTheme.navChip;
  const navbarNavActiveClasses = navbarTheme.navActive;
  const navbarSecondaryButtonClasses = navbarTheme.secondaryButton;
  const navbarPrimaryButtonClasses = navbarTheme.primaryButton;
  const navbarOverlayStyle: React.CSSProperties = isDark
    ? {
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 34%, rgba(255,255,255,0.02) 100%)'
      }
    : {
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.4) 34%, rgba(255,255,255,0.18) 100%)'
      };
  const navbarGlowStyle: React.CSSProperties = isDark
    ? {
        background:
          'radial-gradient(circle at 12% 18%, rgba(167,139,250,0.16) 0%, transparent 34%), radial-gradient(circle at 88% 0%, rgba(244,114,182,0.16) 0%, transparent 28%)'
      }
    : {
        background:
          'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.58) 0%, transparent 34%), radial-gradient(circle at 88% 0%, rgba(14,165,233,0.22) 0%, transparent 28%), radial-gradient(circle at 62% 12%, rgba(37,99,235,0.12) 0%, transparent 24%)'
      };
  const accentTextStyle = (color: string, surface: 'light' | 'dark' = 'light') => {
    return {
      color,
      textShadow: 'none',
      WebkitTextStroke: surface === 'dark' ? '0' : '0',
      paintOrder: 'normal' as const
    };
  };
  const activeHash = typeof window !== 'undefined' ? window.location.hash : '';

  const renderAccentBadge = React.useCallback(
    (icon: IconName, color: string, size = 'h-5 w-5') => (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[18px] border"
        style={{
          backgroundColor: `${color}${isDark ? '18' : '12'}`,
          borderColor: `${color}${isDark ? '42' : '30'}`,
          color
        }}
      >
        {renderIcon(icon, size)}
      </div>
    ),
    [isDark]
  );

  const titleScaleClasses = {
    hero: 'max-w-[11ch] text-[2.65rem] leading-[0.9] tracking-[-0.045em] sm:max-w-5xl sm:text-5xl md:text-7xl xl:text-[6.3rem]',
    heroWide: 'max-w-[12.5ch] text-[2.9rem] leading-[0.86] tracking-[-0.055em] sm:max-w-6xl sm:text-[4.8rem] md:text-[6.2rem] xl:text-[7.3rem]',
    section: 'max-w-[13ch] text-[2.35rem] leading-[0.92] tracking-[-0.04em] sm:max-w-4xl sm:text-4xl md:text-5xl',
    feature: 'max-w-[13ch] text-[2.2rem] leading-[0.94] tracking-[-0.04em] sm:text-4xl md:text-5xl',
    card: 'text-[1.85rem] leading-[0.98] tracking-[-0.03em] md:text-[2.05rem]',
    quote: 'text-3xl leading-[0.94] tracking-[-0.035em] md:text-4xl'
  } as const;

  const renderTitle = (
    title: string,
    color: string,
    options?: {
      as?: 'h1' | 'h2' | 'h3' | 'p';
      scale?: keyof typeof titleScaleClasses;
      light?: boolean;
      className?: string;
      titleClassName?: string;
    }
  ) => {
    const Tag = (options?.as ?? 'h2') as React.ElementType;
    const scale = options?.scale ?? 'section';

    return (
      <div className={`relative ${options?.className ?? ''}`}>
        <div
          className="pointer-events-none absolute -left-3 top-4 h-16 w-16 rounded-full blur-2xl"
          style={{ backgroundColor: `${color}${isDark ? '18' : '14'}` }}
        />
        <Tag
          className={`relative text-balance ${titleScaleClasses[scale]} ${
            options?.light ? 'text-stone-100' : isDark ? 'text-stone-100' : 'text-zinc-950'
          } ${options?.titleClassName ?? ''}`}
          style={displayFont}
        >
          {title}
        </Tag>
        <div className="relative mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
          <span className="h-px w-10 rounded-full sm:w-12" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}55` }} />
          <span className="h-px w-12 rounded-full opacity-70 sm:w-16" style={{ background: `linear-gradient(90deg, ${color}bb, transparent)` }} />
        </div>
      </div>
    );
  };

  const setGuestFeedback = (tone: GuestSyncTone, message: string | null) => {
    setGuestSyncTone(tone);
    setGuestSyncMessage(message);
  };

  const setInvitationProjectFeedback = (tone: GuestSyncTone, message: string | null) => {
    setInvitationProjectTone(tone);
    setInvitationProjectMessage(message);
  };

  const mergeEventPortalRecords = (records: EventPortalRecord[]) => {
    if (records.length === 0) return;

    setEventPortalRecords((prev) => {
      const next = { ...prev };
      records.forEach((record) => {
        const cachedRecord = stripGuestsFromCachedEventRecord(record);
        next[cachedRecord.code] = cachedRecord;
      });
      writeEventPortalRecords(next);
      return next;
    });
  };

  const cacheEventRecord = (record: EventPortalRecord) => {
    mergeEventPortalRecords([record]);
  };

  const activateEventRecord = (record: EventPortalRecord) => {
    activeEventCodeRef.current = record.code;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(EVENT_ACTIVE_CODE_STORAGE_KEY, record.code);
    }
    setActiveEventRecord(record);
  };

  const resolveCachedEventRecord = (code: string, cachedRecord?: EventPortalRecord | null) => {
    const snapshotRecord = readEventPortalSnapshotForCode(code);
    return {
      record: snapshotRecord ?? cachedRecord ?? null,
      hasSnapshot: snapshotRecord !== null,
    };
  };

  const persistEventRecord = (
    record: EventPortalRecord,
    options: { activateRecord?: boolean; cacheSnapshot?: boolean } = {}
  ) => {
    cacheEventRecord(record);

    if (options.cacheSnapshot === true) {
      writeEventPortalSnapshot(record);
    }

    if (options.activateRecord ?? true) {
      activateEventRecord(record);
    }
  };

  const openEventPanel = (
    record: EventPortalRecord,
    options: { preferSnapshot?: boolean; cacheSnapshot?: boolean } = {}
  ) => {
    const snapshotRecord = options.preferSnapshot ? readEventPortalSnapshotForCode(record.code) : null;
    const recordToOpen = snapshotRecord ?? record;

    persistEventRecord(recordToOpen, {
      cacheSnapshot: options.cacheSnapshot ?? false,
    });
    setEventAccessCode(recordToOpen.code);
    setEventAccessError(null);
    setGuestFeedback('neutral', null);
    navigateTo('panel-evento');
  };

  const syncEventRecordWithServer = async (
    record: EventPortalRecord,
    options: { syncGuests?: boolean; activateRecord?: boolean } = {}
  ) => {
    const savedRecord = hydrateEventPortalRecord(
      await upsertEventPortalRecord(record, {
        syncGuests: options.syncGuests ?? true
      }),
      record.code
    );
    persistEventRecord(savedRecord, {
      activateRecord: options.activateRecord ?? true,
      cacheSnapshot: true,
    });
    return savedRecord;
  };

  const refreshEventRecordFromServer = async (code: string) => {
    try {
      const remoteRecord = await fetchEventPortalRecord(code);
      if (activeEventCodeRef.current !== code) {
        return;
      }

      if (!remoteRecord) {
        if (currentPage === 'panel-evento') {
          const fallback = resolveCachedEventRecord(code, activeEventRecord);
          if (fallback.hasSnapshot && fallback.record) {
            persistEventRecord(fallback.record, {
              cacheSnapshot: true,
            });
          }

          setGuestFeedback('error', buildMissingEventFallbackMessage(fallback.hasSnapshot));
        }
        return;
      }

      persistEventRecord(hydrateEventPortalRecord(remoteRecord, code), {
        cacheSnapshot: true,
      });
      setGuestFeedback('neutral', null);
    } catch {
      if (activeEventCodeRef.current === code && currentPage === 'panel-evento') {
        const fallback = resolveCachedEventRecord(code, activeEventRecord);
        if (fallback.hasSnapshot && fallback.record) {
          persistEventRecord(fallback.record, {
            cacheSnapshot: true,
          });
        }

        setGuestFeedback('error', buildGuestRefreshFallbackMessage(fallback.hasSnapshot));
      }
    }
  };

  const prepareInvitationProjectPreviewByCode = async (code: string) => {
    const project = await ensureInvitationProjectForCode(code, {
      buildPreview: true,
      ensureProject: true,
      source: 'prepare-preview',
    });

    if (!project) {
      throw new Error('No se encontró ni se pudo generar el proyecto de la invitación.');
    }

    return project;
  };

  const openInvitationProjectWindowByCode = async (code: string) => {
    if (typeof window === 'undefined') {
      throw new Error('No hay una ventana disponible para abrir la invitacion.');
    }

    const project = await prepareInvitationProjectPreviewByCode(code);
    const previewUrl = new URL(
      `/db/invitaciones/${encodeURIComponent(code.trim())}/dist/index.html`,
      window.location.origin
    ).toString() || project.previewUrl?.trim();
    if (!previewUrl) {
      throw new Error('La invitacion se preparo, pero no devolvio una vista previa para abrir.');
    }

    logInvitationProjectDebug('open:window:navigate', {
      code,
      previewUrl,
      projectPath: project.projectPath,
    });
    window.location.assign(previewUrl);
  };

  const ensureAdminWorkspaceSession = React.useCallback(() => {
    const session = adminWorkspaceSession ?? createGuestSession();
    if (!adminWorkspaceSession) {
      setAdminWorkspaceSession(session);
    }

    return session;
  }, [adminWorkspaceSession]);

  const loadAdminWorkspaceRecords = React.useCallback(async () => {
    setIsAdminWorkspaceBusy(true);
    setAdminWorkspaceError(null);

    try {
      const records = sortEventRecordsByUpdatedAt(
        (await listEventPortalRecords({ limit: 120 })).map((record) => hydrateEventPortalRecord(record, record.code))
      );
      mergeEventPortalRecords(records);
      return records;
    } catch (error) {
      const message = getErrorMessage(error, 'No pudimos cargar los eventos del laboratorio.');
      setAdminWorkspaceError(message);
      return [];
    } finally {
      setIsAdminWorkspaceBusy(false);
    }
  }, []);

  const openAdminWorkspaceEditorForCode = React.useCallback(async (code: string) => {
    const session = ensureAdminWorkspaceSession();

    persistAdminWorkspaceEditorPreference(session.id, code);
    setAdminWorkspaceError(null);
    setAdminWorkspaceOpenPreference(true);
    setIsAdminWorkspaceOpen(true);
    await loadAdminWorkspaceRecords();
  }, [ensureAdminWorkspaceSession, loadAdminWorkspaceRecords]);

  const openEmbeddedInvitationEditorForCode = React.useCallback(async (code: string) => {
    const session = ensureAdminWorkspaceSession();

    persistAdminWorkspaceEditorPreference(session.id, code);
    setAdminWorkspaceOpenPreference(false);
    setAdminWorkspaceError(null);
    setCurrentPage('editar-invitacion');
    if (typeof window !== 'undefined') {
      window.location.hash = '#editar-invitacion';
    }
    scrollPageViewportToTop('smooth');
    await loadAdminWorkspaceRecords();
  }, [ensureAdminWorkspaceSession, loadAdminWorkspaceRecords]);

  const handleOpenInvitationProject = async () => {
    if (!activeEventRecord) return;

    const code = activeEventRecord.code;
    setIsInvitationProjectBusy(true);
    setInvitationProjectFeedback('neutral', 'Preparando la invitacion...');

    try {
      logInvitationProjectDebug('open:window:start', { code });
      await openInvitationProjectWindowByCode(code);
    } catch (error) {
      logInvitationProjectError('open:window:failed', error, { code });
      setInvitationProjectFeedback('error', getErrorMessage(error, 'No pudimos abrir la invitacion.'));
    } finally {
      if (activeEventCodeRef.current === code) {
        setIsInvitationProjectBusy(false);
      }
    }
  };

  const handlePreviewInvitationProject = async () => {
    if (!activeEventRecord) return;

    const code = activeEventRecord.code;
    setIsInvitationProjectBusy(true);
    setInvitationProjectFeedback('neutral', 'Preparando la vista previa de la invitacion...');

    try {
      const project = await prepareInvitationProjectPreviewByCode(code);
      if (!project.previewUrl?.trim()) {
        throw new Error('La invitacion se preparo, pero no devolvio una vista previa para mostrar en el panel.');
      }

      logInvitationProjectDebug('preview:ready', {
        code,
        previewUrl: project.previewUrl,
        projectPath: project.projectPath,
      });
      setInvitationProjectFeedback('success', 'Vista previa lista dentro del apartado Invitacion.');
    } catch (error) {
      logInvitationProjectError('preview:failed', error, { code });
      setInvitationProjectFeedback('error', getErrorMessage(error, 'No pudimos preparar la vista previa de la invitacion.'));
    } finally {
      if (activeEventCodeRef.current === code) {
        setIsInvitationProjectBusy(false);
      }
    }
  };

  const handleDownloadInvitationProject = async () => {
    if (!activeEventRecord) return;

    const code = activeEventRecord.code;
    setIsInvitationProjectBusy(true);
    setInvitationProjectFeedback('neutral', 'Empaquetando el proyecto de la invitación para descarga...');

    try {
      await downloadInvitationProjectArchive(code);
      const project = await ensureInvitationProjectForCode(code, {
        buildPreview: false,
        ensureProject: true,
        source: 'download-after-sync',
      });
      logInvitationProjectDebug('download:done', {
        code,
        hasProject: project !== null,
        previewUrl: project?.previewUrl ?? null,
      });
      setInvitationProjectFeedback('success', 'El ZIP del proyecto se descargó correctamente.');
    } catch (error) {
      logInvitationProjectError('download:failed', error, { code });
      setInvitationProjectFeedback('error', getErrorMessage(error, 'No pudimos descargar el proyecto de la invitación.'));
    } finally {
      if (activeEventCodeRef.current === code) {
        setIsInvitationProjectBusy(false);
      }
    }
  };

  const handleUploadInvitationProject = async (file: File) => {
    if (!activeEventRecord) return;

    const code = activeEventRecord.code;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setInvitationProjectFeedback('error', 'Sube un archivo ZIP con el proyecto de la invitación.');
      return;
    }

    setIsInvitationProjectBusy(true);
    setInvitationProjectFeedback('neutral', 'Subiendo el proyecto ZIP y reemplazando la carpeta del evento...');

    try {
      const project = await uploadInvitationProjectArchive(code, file);
      setActiveInvitationProjectForCode(code, project);
      logInvitationProjectDebug('upload:done', {
        code,
        fileName: file.name,
        previewUrl: project.previewUrl ?? null,
        projectPath: project.projectPath,
      });
      setInvitationProjectFeedback('success', 'Proyecto recibido y vista previa compilada. Usa "Abrir invitación" para revisar la nueva versión.');
    } catch (error) {
      logInvitationProjectError('upload:failed', error, {
        code,
        fileName: file.name,
      });
      setInvitationProjectFeedback('error', getErrorMessage(error, 'No pudimos subir el proyecto de la invitación.'));
    } finally {
      if (activeEventCodeRef.current === code) {
        setIsInvitationProjectBusy(false);
      }
    }
  };

  const generateUniqueEventCode = async () => {
    const knownCodes = new Set([
      DEMO_EVENT_ACCESS_CODE,
      ...Object.keys(eventPortalRecords),
    ]);

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = generateRandomAccessCode();
      if (knownCodes.has(candidate)) continue;

      const remoteRecord = await fetchEventPortalRecord(candidate);
      if (!remoteRecord) {
        return candidate;
      }
    }

    throw new Error('No pudimos generar un código único para el evento.');
  };

  const resolveEventCodeForDraft = async () => {
    return generateUniqueEventCode();
  };

  const buildManualEventPortalRecord = (draft: EventPortalEventDraft, code: string) => {
    const now = new Date().toISOString();
    const createdDate = toDateInputValue(draft.createdDate);
    const eventDateValue = toDateTimeLocalInputValue(draft.eventDate);

    return hydrateEventPortalRecord(
      {
        code,
        invitationId: null,
        designId: '',
        packageId: draft.packageId,
        eventTitle: draft.eventTitle.trim() || 'Evento sin titulo',
        hostName: draft.hostName.trim() || 'Anfitrion por definir',
        eventDate: formatEventDateLabelFromInput(eventDateValue),
        eventDateValue,
        venue: draft.venue.trim() || 'Lugar por confirmar',
        venueMapsUrl: draft.venueMapsUrl.trim(),
        status: normalizeEventPortalStatus(draft.status),
        createdDate,
        shareUrl: buildEventShareUrl(code),
        featureLabels: buildDefaultEventFeatureLabels(),
        guests: [],
        expiresAt: addDaysToIso(now, EVENT_PORTAL_EXPIRATION_DAYS),
        createdAt: `${createdDate}T00:00:00`,
        updatedAt: now
      },
      code
    );
  };

  const closeAdminWorkspace = React.useCallback(() => {
    setAdminWorkspaceOpenPreference(false);
    setIsAdminWorkspaceOpen(false);
  }, []);

  const handleOpenAdminWorkspace = React.useCallback(async () => {
    ensureAdminWorkspaceSession();
    setAdminWorkspaceOpenPreference(true);
    setIsAdminWorkspaceOpen(true);
    await loadAdminWorkspaceRecords();
  }, [ensureAdminWorkspaceSession, loadAdminWorkspaceRecords]);

  const handleOpenEventPanelFromAdminWorkspace = React.useCallback((record: EventPortalRecord) => {
    closeAdminWorkspace();
    openEventPanel(record, {
      preferSnapshot: true,
    });
  }, [closeAdminWorkspace]);

  const handleOpenInvitationProjectFromAdminWorkspace = React.useCallback(async (record: EventPortalRecord) => {
    setAdminWorkspaceError(null);

    try {
      await openAdminWorkspaceEditorForCode(record.code);
    } catch (error) {
      setAdminWorkspaceError(getErrorMessage(error, 'No pudimos abrir el editor de la invitacion de este evento.'));
    }
  }, [openAdminWorkspaceEditorForCode]);

  const handleEditInvitationProject = React.useCallback(async () => {
    if (!activeEventRecord) return;
    await openEmbeddedInvitationEditorForCode(activeEventRecord.code);
  }, [activeEventRecord, openEmbeddedInvitationEditorForCode]);

  useEffect(() => {
    if (currentPage !== 'editar-invitacion') {
      return;
    }

    ensureAdminWorkspaceSession();
    void loadAdminWorkspaceRecords();
  }, [currentPage, ensureAdminWorkspaceSession, loadAdminWorkspaceRecords]);

  useEffect(() => {
    if (currentPage !== 'editar-invitacion' || !activeEventRecord) {
      return;
    }

    const code = activeEventRecord.code;

    void ensureInvitationProjectForCode(code, {
      buildPreview: true,
      ensureProject: true,
      source: 'embedded-editor-open',
    }).catch((error) => {
      logInvitationProjectError('embedded-editor-open:failed', error, { code });
    });
  }, [activeEventRecord, currentPage, ensureInvitationProjectForCode]);

  useEffect(() => {
    if (hasRestoredAdminWorkspaceRef.current) {
      return;
    }

    hasRestoredAdminWorkspaceRef.current = true;
    if (!consumeAdminWorkspaceOpenPreference()) {
      return;
    }

    setAdminWorkspaceSession((current) => current ?? createGuestSession());
    setIsAdminWorkspaceOpen(true);
    void loadAdminWorkspaceRecords();
  }, [loadAdminWorkspaceRecords]);

  const createEventRecordAndProject = async (
    draft: EventPortalEventDraft,
    options: {
      activateRecord?: boolean;
      openPanelAfterCreate?: boolean;
      surfaceProjectFeedback?: boolean;
    } = {}
  ) => {
    const activateRecord = options.activateRecord ?? true;
    const openPanelAfterCreate = options.openPanelAfterCreate ?? false;
    const surfaceProjectFeedback = options.surfaceProjectFeedback ?? false;

    setIsEventEditorBusy(true);

    try {
      const code = await resolveEventCodeForDraft();
      const record = buildManualEventPortalRecord(draft, code);
      const savedRecord = await syncEventRecordWithServer(record, {
        syncGuests: false,
        activateRecord,
      });

      if (surfaceProjectFeedback) {
        setIsInvitationProjectBusy(true);
        setInvitationProjectFeedback('neutral', 'Generando el proyecto base y la vista previa de la invitacion para este evento...');
      }

      try {
        const project = await ensureInvitationProjectForCode(savedRecord.code, {
          buildPreview: true,
          ensureProject: true,
          source: 'event-create',
        });

        if (!project) {
          throw new Error('No se pudo crear el proyecto de la invitación para este evento.');
        }

        if (surfaceProjectFeedback) {
          setInvitationProjectFeedback(
            'success',
            project.previewUrl
              ? `La invitacion quedo creada y previsualizada en ${project.projectPath}. Ya puedes editarla, descargarla o abrirla desde este evento.`
              : `La invitacion base quedo creada en ${project.projectPath}. Ya puedes previsualizarla, descargarla o subir un ZIP nuevo.`
          );
        }
      } catch (projectError) {
        setActiveInvitationProjectForCode(savedRecord.code, null);
        const projectMessage = getErrorMessage(projectError, 'El evento se creo, pero no pudimos generar la carpeta base de la invitacion.');
        logInvitationProjectError('event-create:project-failed', projectError, {
          code: savedRecord.code,
          openPanelAfterCreate,
          surfaceProjectFeedback,
        });

        if (surfaceProjectFeedback) {
          setInvitationProjectFeedback('error', projectMessage);
        } else {
          throw new Error(projectMessage);
        }
      } finally {
        if (surfaceProjectFeedback && activeEventCodeRef.current === savedRecord.code) {
          setIsInvitationProjectBusy(false);
        }
      }

      if (openPanelAfterCreate) {
        openEventPanel(savedRecord, {
          cacheSnapshot: true,
        });
      }

      if (surfaceProjectFeedback) {
        setGuestFeedback('success', `Evento creado correctamente. Codigo generado: ${savedRecord.code}.`);
      }

      return savedRecord;
    } finally {
      setIsEventEditorBusy(false);
    }
  };

  const handleCreateEvent = async (draft: EventPortalEventDraft) => {
    return createEventRecordAndProject(draft, {
      activateRecord: true,
      openPanelAfterCreate: true,
      surfaceProjectFeedback: true,
    });
  };

  const handleCreateEventFromAdminWorkspace = async (draft: EventPortalEventDraft) => {
    const savedRecord = await createEventRecordAndProject(draft, {
      activateRecord: false,
      openPanelAfterCreate: false,
      surfaceProjectFeedback: false,
    });

    setAdminWorkspaceError(null);
    return savedRecord;
  };

  const handleSaveEventDetails = async (draft: EventPortalEventDraft) => {
    if (!activeEventRecord) return null;

    setIsEventEditorBusy(true);

    try {
      const nextRecord = hydrateEventPortalRecord(
        {
          ...activeEventRecord,
          packageId: draft.packageId,
          eventTitle: draft.eventTitle.trim() || activeEventRecord.eventTitle,
          hostName: draft.hostName.trim() || 'Anfitrion por definir',
          eventDate: formatEventDateLabelFromInput(draft.eventDate),
          eventDateValue: toDateTimeLocalInputValue(draft.eventDate),
          venue: draft.venue.trim() || 'Lugar por confirmar',
          venueMapsUrl: draft.venueMapsUrl.trim(),
          status: normalizeEventPortalStatus(draft.status),
          createdDate: toDateInputValue(draft.createdDate),
          createdAt: `${toDateInputValue(draft.createdDate)}T00:00:00`,
          updatedAt: new Date().toISOString()
        },
        activeEventRecord.code
      );

      const savedRecord = await syncEventRecordWithServer(nextRecord);
      setGuestFeedback('success', 'Se actualizaron los datos principales del evento.');
      return savedRecord;
    } catch (error) {
      setGuestFeedback('error', getErrorMessage(error, 'No pudimos guardar los datos del evento.'));
      return null;
    } finally {
      setIsEventEditorBusy(false);
    }
  };

  const handleAddManualGuest = async (draft: EventPortalGuestDraft) => {
    if (!activeEventRecord) return null;

    setIsGuestSyncBusy(true);

    try {
      const usedCodes = new Set<string>(activeEventRecord.guests.map((guest) => guest.guestCode));
      const nextGuest = hydrateEventPortalGuest(
        {
          name: draft.name.trim(),
          companions: Math.max(1, draft.companions),
          group: draft.group.trim() || 'General',
          tableLabel: draft.tableLabel?.trim() || undefined,
          email: draft.email?.trim() || undefined,
          phone: draft.phone?.trim() || undefined,
          status: draft.status,
          note: draft.note?.trim() || undefined
        },
        activeEventRecord.guests.length,
        activeEventRecord.code,
        activeEventRecord.shareUrl,
        undefined,
        usedCodes
      );

      const nextRecord = hydrateEventPortalRecord(
        {
          ...activeEventRecord,
          guests: [...activeEventRecord.guests, nextGuest],
          updatedAt: new Date().toISOString()
        },
        activeEventRecord.code
      );

      const savedRecord = await syncEventRecordWithServer(nextRecord);
      setGuestFeedback('success', `Invitado ${nextGuest.name} agregado y sincronizado con el servidor.`);
      return savedRecord;
    } catch (error) {
      setGuestFeedback('error', getErrorMessage(error, 'No pudimos agregar el invitado.'));
      return null;
    } finally {
      setIsGuestSyncBusy(false);
    }
  };

  const handleGuestTemplateDownload = async () => {
    if (!activeEventRecord) return;

    try {
      await downloadGuestTemplateWorkbook(activeEventRecord.code);
      setGuestFeedback('success', 'Plantilla descargada. Llena la hoja INVITADOS con los datos basicos; CODIGO_UNICO, ESTATUS y NOTA los resuelve el sistema por defecto.');
    } catch {
      setGuestFeedback('error', 'No pudimos generar la plantilla en este momento.');
    }
  };

  const handleGuestLinksExport = async () => {
    if (!activeEventRecord) return;

    if (activeEventRecord.guests.length === 0) {
      setGuestFeedback('error', 'Todavia no hay invitados cargados para exportar.');
      return;
    }

    try {
      await downloadGuestLinksWorkbook(activeEventRecord);
      setGuestFeedback('success', 'Se descargo el archivo con codigos y URLs individuales.');
    } catch {
      setGuestFeedback('error', 'No pudimos exportar el archivo de invitados.');
    }
  };

  const handleGuestAdminExport = async () => {
    if (!activeEventRecord) return;

    if (activeEventRecord.guests.length === 0) {
      setGuestFeedback('error', 'Todavia no hay invitados cargados para descargar la lista operativa.');
      return;
    }

    try {
      await downloadGuestAdminWorkbook(activeEventRecord);
      setGuestFeedback('success', 'Se descargo la lista operativa con mesa, numero de invitados y datos para QR.');
    } catch {
      setGuestFeedback('error', 'No pudimos exportar la lista operativa del evento.');
    }
  };

  const handleDeleteGuests = async () => {
    if (!activeEventRecord) return;

    if (activeEventRecord.guests.length === 0) {
      setGuestFeedback('error', 'Todavia no hay invitados cargados para eliminar.');
      return;
    }

    const shouldDelete =
      typeof window === 'undefined' ||
      window.confirm(
        'Estas a punto de eliminar todos los invitados ya registrados de este evento. Esta accion vaciara la lista actual. ¿Deseas continuar?'
      );

    if (!shouldDelete) {
      setGuestFeedback('neutral', 'La eliminacion de invitados se cancelo.');
      return;
    }

    setIsGuestSyncBusy(true);
    setGuestFeedback('neutral', 'Eliminando invitados del evento...');

    try {
      const nextRecord = hydrateEventPortalRecord(
        {
          ...activeEventRecord,
          guests: [],
          updatedAt: new Date().toISOString()
        },
        activeEventRecord.code
      );

      await syncEventRecordWithServer(nextRecord);
      setGuestFeedback('success', 'Se eliminaron todos los invitados del evento.');
    } catch (error) {
      setGuestFeedback('error', getErrorMessage(error, 'No pudimos eliminar los invitados del evento.'));
    } finally {
      setIsGuestSyncBusy(false);
    }
  };

  const handleGuestFileImport = async (file: File) => {
    if (!activeEventRecord) return;

    if (activeEventRecord.guests.length > 0) {
      const shouldReplace =
        typeof window === 'undefined' ||
        window.confirm(
          'Estas a punto de sustituir a los invitados ya registrados. Si continuas, la lista actual se reemplazara por completo con la plantilla que estas subiendo. ¿Deseas continuar?'
        );

      if (!shouldReplace) {
        setGuestFeedback('neutral', 'La sustitucion de invitados se cancelo.');
        return;
      }
    }

    setIsGuestSyncBusy(true);
    setGuestFeedback(
      'neutral',
      activeEventRecord.guests.length > 0 ? `Sustituyendo invitados con ${file.name}...` : `Procesando ${file.name}...`
    );

    try {
      const importedRows = await parseGuestUploadFile(file);
      const nextGuests = mergeImportedGuests(
        activeEventRecord.code,
        activeEventRecord.shareUrl,
        importedRows,
        activeEventRecord.guests
      );
      const nextRecord = hydrateEventPortalRecord(
        {
          ...activeEventRecord,
          guests: nextGuests,
          updatedAt: new Date().toISOString()
        },
        activeEventRecord.code
      );

      try {
        await syncEventRecordWithServer(nextRecord);
        setGuestFeedback(
          'success',
          `La lista de invitados se sustituyo correctamente. Ahora hay ${nextGuests.length} invitado(s) guardados en el servidor.`
        );
      } catch (error) {
        setGuestFeedback(
          'error',
          `No pudimos sustituir ${nextGuests.length} invitado(s) en la base. ${getErrorMessage(error, 'No se aplicaron cambios locales fuera del servidor.')}`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos leer la plantilla seleccionada.';
      setGuestFeedback('error', message);
    } finally {
      setIsGuestSyncBusy(false);
    }
  };

  const handleGuestCheckIn = async (guestCode: string) => {
    if (!activeEventRecord) return null;

    const previousGuest = activeEventRecord.guests.find((guest) => guest.guestCode === guestCode) ?? null;
    if (!previousGuest) {
      setGuestFeedback('error', 'No encontramos un invitado para ese QR.');
      return null;
    }

    try {
      const response = await registerEventPortalGuestCheckIn(activeEventRecord.code, guestCode);
      const syncedRecord = hydrateEventPortalRecord(response.record, activeEventRecord.code);
      const updatedGuest = syncedRecord.guests.find((guest) => guest.guestCode === guestCode) ?? response.updatedGuest ?? null;

      persistEventRecord(syncedRecord, {
        cacheSnapshot: true,
      });

      if (!updatedGuest) {
        setGuestFeedback('error', 'Registramos el acceso, pero no pudimos recuperar el invitado actualizado.');
        return null;
      }

      if ((previousGuest.checkInCount ?? 0) > 0) {
        setGuestFeedback(
          'neutral',
          `QR reconocido nuevamente para ${updatedGuest.name}. Registro acumulado: ${updatedGuest.checkInCount ?? 1}.`
        );
      } else {
        setGuestFeedback('success', `Acceso registrado para ${updatedGuest.name}.`);
      }

      return updatedGuest;
    } catch (error) {
      setGuestFeedback(
        'error',
        `No pudimos registrar la asistencia en la base para ${previousGuest.name}. ${getErrorMessage(error, 'No se aplicaron cambios locales fuera del servidor.')}`
      );
      return null;
    }
  };

  const clearEventPanelSession = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(EVENT_ACTIVE_CODE_STORAGE_KEY);
      window.location.hash = '#mi-evento';
    }

    scrollPageViewportToTop('smooth');

    activeEventCodeRef.current = '';
    setActiveEventRecord(null);
    setActiveInvitationProject(null);
    setEventAccessCode('');
    setEventAccessError(null);
    setGuestFeedback('neutral', null);
    setInvitationProjectFeedback('neutral', null);
    setIsInvitationProjectBusy(false);
    setCurrentPage('mi-evento');
  };

  const attemptOpenEventPanelByCode = async (rawCode: string) => {
    const normalizedCode = normalizeAccessCode(rawCode);
    if (!normalizedCode) {
      setEventAccessError('Ingresa el codigo de tu invitacion.');
      setActiveEventRecord(null);
      return;
    }

    setIsEventAccessBusy(true);
    const cachedRecord = eventPortalRecords[normalizedCode] ?? null;
    const fallback = resolveCachedEventRecord(normalizedCode, cachedRecord);

    try {
      if (normalizedCode === DEMO_EVENT_ACCESS_CODE) {
        openEventPanel(createDemoEventPortalRecord(), {
          cacheSnapshot: true,
        });
        return;
      }

      if (fallback.record) {
        openEventPanel(fallback.record, {
          preferSnapshot: fallback.hasSnapshot,
          cacheSnapshot: fallback.hasSnapshot,
        });
        if (!fallback.hasSnapshot) {
          setGuestFeedback('neutral', 'Actualizando invitados del evento...');
        }
        return;
      }

      const remoteRecord = await fetchEventPortalRecord(normalizedCode, {
        includeGuests: false,
      });

      if (!remoteRecord) {
        setEventAccessCode(normalizedCode);
        setEventAccessError('No encontramos ese codigo. Revisa el acceso que se te compartio.');
        setActiveEventRecord(null);
        return;
      }

      openEventPanel(hydrateEventPortalRecord(remoteRecord, normalizedCode), {
        cacheSnapshot: false,
      });
      setGuestFeedback('neutral', 'Actualizando invitados del evento...');
    } catch (error) {
      if (fallback.record) {
        openEventPanel(fallback.record, {
          preferSnapshot: fallback.hasSnapshot,
          cacheSnapshot: fallback.hasSnapshot,
        });
        setGuestFeedback('error', buildGuestConsultFallbackMessage(fallback.hasSnapshot));
        return;
      }

      setEventAccessCode(normalizedCode);
      setEventAccessError(
        error instanceof TypeError
          ? 'No pudimos conectar con la base de datos. Verifica que la API local este disponible.'
          : getErrorMessage(error, 'No pudimos consultar la base de datos para este evento.')
      );
      setActiveEventRecord(null);
    } finally {
      setIsEventAccessBusy(false);
    }
  };

  const handleEventAccessSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    await attemptOpenEventPanelByCode(eventAccessCode);
  };

  const eventMetrics = activeEventRecord
    ? activeEventRecord.guests.reduce(
        (acc, guest) => {
          acc.totalGuests += 1;
          acc.totalSeats += guest.companions;

          if (guest.status === 'confirmado') {
            acc.confirmedGuests += 1;
            acc.confirmedSeats += guest.companions;
          } else if (guest.status === 'pendiente') {
            acc.pendingGuests += 1;
          } else {
            acc.declinedGuests += 1;
          }

          if (guest.checkedInAt) {
            acc.checkedInGuests += 1;
            acc.checkedInSeats += guest.companions;
          }

          return acc;
        },
        {
          totalGuests: 0,
          totalSeats: 0,
          confirmedGuests: 0,
          confirmedSeats: 0,
          checkedInGuests: 0,
          checkedInSeats: 0,
          pendingGuests: 0,
          declinedGuests: 0
        }
      )
    : null;

  const adminWorkspaceItems = sortEventRecordsByUpdatedAt(
    (Object.values(eventPortalRecords) as EventPortalRecord[]).filter((record) => record.code !== DEMO_EVENT_ACCESS_CODE)
  ).map(buildEventAdminWorkspaceItem);

  const navigateTo = (page: AppPage, sectionId?: string) => {
    if (typeof window === 'undefined') return;
    setMobileNavOpen(false);

    // Al salir del registro se limpia el ?pago= que deja Mercado Pago al regresar.
    if (page !== 'registro' && window.location.search.includes('pago=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }

    if (page === 'registro') {
      setCurrentPage('registro');
      window.location.hash = sectionId ? `#registro/${encodeURIComponent(sectionId)}` : '#registro';
      scrollPageViewportToTop('auto');
      return;
    }

    if (page === 'mi-evento') {
      if (activeEventRecord) {
        setCurrentPage('panel-evento');
        window.location.hash = '#panel-evento';
        scrollPageViewportToTop('smooth');
        return;
      }

      setCurrentPage('mi-evento');
      window.location.hash = '#mi-evento';
      scrollPageViewportToTop('smooth');
      return;
    }

    if (page === 'editar-invitacion') {
      if (!activeEventRecord) {
        setCurrentPage('mi-evento');
        window.location.hash = '#mi-evento';
        scrollPageViewportToTop('smooth');
        return;
      }

      setCurrentPage('editar-invitacion');
      window.location.hash = '#editar-invitacion';
      scrollPageViewportToTop('smooth');
      return;
    }

    if (page === 'precios' || page === 'por-que-elegirnos' || page === 'panel-evento') {
      setCurrentPage(page);
      window.location.hash = `#${page}`;
      scrollPageViewportToTop('smooth');
      return;
    }

    setCurrentPage('inicio');

    if (sectionId && sectionId !== 'inicio') {
      setIsBelowFoldReady(true);
      window.location.hash = `#${sectionId}`;
      scrollPageViewportToSection(sectionId, 'smooth');
      return;
    }

    window.location.hash = '#inicio';
    scrollPageViewportToTop('smooth');
  };

  const isNavItemActive = (item: NavItem) =>
    item.id === 'mi-evento'
      ? currentPage === 'mi-evento' || currentPage === 'panel-evento' || currentPage === 'editar-invitacion'
      : item.page !== 'inicio'
      ? currentPage === item.page
      : currentPage === 'inicio' &&
        ((item.id === 'inicio' && (activeHash === '' || activeHash === '#inicio')) ||
          (!!item.sectionId && activeHash === `#${item.sectionId}`));

  const eventPortalLocalCodes = Array.from(
    new Set([
      DEMO_EVENT_ACCESS_CODE,
      ...Object.keys(eventPortalRecords),
    ])
  ).slice(0, 5);

  const eventPortalVariant =
    currentPage === 'mi-evento' ? (activeEventRecord ? 'overview' : 'access') : activeEventRecord ? 'overview' : 'gate';
  const invitationEditorLocalPreviewUrl =
    typeof window !== 'undefined' && activeEventRecord?.code?.trim()
      ? new URL(`/db/invitaciones/${encodeURIComponent(activeEventRecord.code.trim())}/dist/index.html`, window.location.origin).toString()
      : '';
  const invitationEditorProjectPreviewUrl = activeInvitationProject?.previewUrl?.trim() ?? '';
  const invitationEditorPreviewBaseUrl =
    invitationEditorLocalPreviewUrl
    || invitationEditorProjectPreviewUrl
    || invitationEditorLocalPreviewUrl
    || '';
  const navbarPrimaryTarget: AppPage = currentPage === 'editar-invitacion'
    ? 'mi-evento'
    : currentPage === 'mi-evento' || currentPage === 'panel-evento'
      ? 'inicio'
      : 'mi-evento';
  const navbarPrimaryLabel = currentPage === 'editar-invitacion'
    ? 'Volver al panel'
    : currentPage === 'mi-evento' || currentPage === 'panel-evento'
      ? 'Volver al inicio'
      : 'Mi evento';

  const handleQuickEventCode = async (code: string) => {
    setEventAccessCode(code);
    await attemptOpenEventPanelByCode(code);
  };

  const pageViewportClasses = isAppShellPage ? 'flex flex-1 min-h-0 overflow-hidden' : 'flex-1';

  return (
    <main
      className={`relative isolate flex w-full flex-col transition-colors duration-500 ${
        isAppShellPage ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh] overflow-x-clip'
      } ${pageClasses}`}
    >

      <div className={`pointer-events-none inset-0 overflow-hidden ${isAppShellPage ? 'absolute' : 'fixed'}`}>
        {isInvitationEditorPage ? (
          <>
            <div className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_58%)]" />
            <div className="absolute left-[4%] top-[8%] h-40 w-40 rounded-full bg-sky-200/20 blur-3xl" />
            <div className="absolute right-[6%] top-[10%] h-32 w-32 rounded-full bg-blue-200/20 blur-3xl" />
          </>
        ) : (
          <>
            <AmbientBackdrop />
          </>
        )}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {isAppShellPage ? (
          <header className={navbarWrapperClasses}>
            <div className={navbarPaddingClasses}>
              <div className={navbarPanelClasses}>
                {!isInicioPage ? <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={navbarOverlayStyle} /> : null}
                {!isInicioPage ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-90" style={navbarGlowStyle} /> : null}
                <button
                  type="button"
                  onClick={() => navigateTo('inicio')}
                  className={`relative z-10 justify-self-start text-left transition-opacity hover:opacity-90 ${
                    isEventPortalPage ? 'rounded-[16px] px-1 py-0' : 'rounded-[18px] px-1 py-0.5'
                  }`}
                >
                  <div className={`flex items-center ${isEventPortalPage ? 'gap-2 sm:gap-2.5' : 'gap-2.5 sm:gap-3'}`}>
                    <div className={`flex items-center justify-center ${isEventPortalPage ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-14 w-14 sm:h-16 sm:w-16'}`}>
                      <OptimizedImage
                        src={CONTROL_IMAGES.landingSlots.navbarLogo}
                        alt="Logo INViTARTE"
                        className="h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.34)]"
                        loading="eager"
                        fetchPriority="high"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      {!isInicioPage ? (
                        <p className={`hidden text-[9px] font-black uppercase tracking-[0.24em] sm:block ${tertiaryTextClasses}`}>
                          Control de invitados
                        </p>
                      ) : null}
                      <p
                        className={`font-black tracking-[0.22em] ${isEventPortalPage ? 'text-[0.78rem] sm:mt-0.5 sm:text-[0.88rem]' : 'text-[0.9rem] sm:mt-1 sm:text-[1rem]'} ${
                          isNavbarOnDarkSurface ? 'text-white' : 'text-zinc-950'
                        }`}
                      >
                        INViTARTE
                      </p>
                      {isEventPortalPage && activeEventRecord ? (
                        <p className={`mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.14em] ${tertiaryTextClasses}`}>
                          {currentPage === 'editar-invitacion' ? 'Editor' : 'Panel'} {activeEventRecord.code}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>

                <nav className="relative z-10 hidden min-w-0 items-center justify-center lg:flex">
                  <div
                    className={`inline-flex items-center gap-1 ${
                      isInicioPage ? '' : `border ${navbarSoftBorderClasses} ${isEventPortalPage ? 'rounded-[16px] p-0.5' : 'rounded-[18px] p-1'}`
                    }`}
                  >
                    {NAV_ITEMS.map((item) => {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateTo(item.page, item.sectionId)}
                          aria-current={isNavItemActive(item) ? 'page' : undefined}
                          className={`whitespace-nowrap border font-bold uppercase tracking-[0.12em] transition-colors ${
                            isEventPortalPage ? 'rounded-[12px] px-3 py-2 text-[10px]' : 'rounded-full px-3 py-2 text-[11px] xl:px-4'
                          } ${
                            isNavItemActive(item) ? navbarNavActiveClasses : navbarNavChipClasses
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>

                <div className="relative z-10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen((prev) => !prev)}
                    className={`flex items-center justify-center rounded-full transition-colors lg:hidden ${
                      isEventPortalPage ? 'h-9 w-9' : 'h-10 w-10'
                    } ${navbarSecondaryButtonClasses}`}
                    aria-label={mobileNavOpen ? 'Cerrar menu' : 'Abrir menu'}
                    title={mobileNavOpen ? 'Cerrar menu' : 'Abrir menu'}
                  >
                    {mobileNavOpen ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 6L18 18M18 6L6 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7H20M4 12H20M4 17H20" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(navbarPrimaryTarget)}
                    className={`hidden font-black uppercase tracking-[0.16em] transition-colors lg:inline-flex ${
                      isEventPortalPage ? 'rounded-[12px] px-3 py-2 text-[10px]' : 'rounded-full px-5 py-2.5 text-[11px]'
                    } ${navbarPrimaryButtonClasses}`}
                  >
                    {navbarPrimaryLabel}
                  </button>
                </div>

                {mobileNavOpen ? (
                  <div className={`relative z-10 col-span-2 grid gap-2 pt-3 lg:hidden ${isInicioPage ? '' : `border-t ${navbarSoftBorderClasses}`}`}>
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={`mobile-${item.id}`}
                        type="button"
                        onClick={() => navigateTo(item.page, item.sectionId)}
                        className={`justify-start border text-left font-black uppercase tracking-[0.16em] transition-colors ${
                          isEventPortalPage ? 'rounded-[14px] px-3 py-3 text-[11px]' : 'rounded-[16px] px-4 py-3 text-[11px]'
                        } ${
                          isNavItemActive(item) ? navbarNavActiveClasses : navbarNavChipClasses
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </header>
        ) : (
          <PublicNavbar
            items={NAV_ITEMS}
            logoSrc={CONTROL_IMAGES.landingSlots.navbarLogo}
            hasScrolled={hasScrolledNav}
            mobileOpen={mobileNavOpen}
            onToggleMobile={() => setMobileNavOpen((prev) => !prev)}
            onNavigate={(item) => navigateTo('inicio', item.sectionId)}
            onOpenEvents={() => navigateTo('mi-evento')}
            onHome={() => navigateTo('inicio')}
          />
        )}

        <div ref={pageViewportRef} className={pageViewportClasses} data-scroll-root={isAppShellPage ? true : undefined}>
          {currentPage === 'inicio' ? (
            <>
              <HeroSection
                fadeInUp={fadeInUp}
                staggerGroup={staggerGroup}
              />

              {isBelowFoldReady ? (
              <Suspense fallback={<PageSectionFallback />}>
                <LandingBelowFold
                  benefits={LANDING_BENEFITS}
                  processItems={LANDING_PROCESS}
                  displayFont={displayFont}
                  fadeInUp={fadeInUp}
                  staggerGroup={staggerGroup}
                  renderAccentBadge={renderAccentBadge}
                  price={SINGLE_PRICE_AMOUNT}
                  invitationFeatures={INVITATION_FEATURES}
                  onStart={() => navigateTo('registro')}
                  onUseTemplate={(templateId) => navigateTo('registro', templateId)}
                />
              </Suspense>
              ) : (
                <div className="min-h-[60vh]" aria-hidden="true" />
              )}
            </>
          ) : currentPage === 'registro' ? (
            <Suspense fallback={<PageSectionFallback />}>
              <RegistrationPage
                key={getRegistrationTemplateFromHash() ?? 'registro'}
                initialTemplateId={getRegistrationTemplateFromHash()}
                price={SINGLE_PRICE_AMOUNT}
                displayFont={displayFont}
                onExit={() => navigateTo('inicio')}
              />
            </Suspense>
          ) : currentPage === 'editar-invitacion' ? (
            adminWorkspaceSession ? (
              <Suspense fallback={<WorkspacePageLoader />}>
                <AdminPanel
                  currentUser={adminWorkspaceSession}
                  initialTab="create"
                  onUpdateSession={setAdminWorkspaceSession}
                  onLogout={() => {
                    setAdminWorkspaceSession(null);
                    navigateTo('mi-evento');
                  }}
                  mode="event-admin"
                  eventItems={adminWorkspaceItems}
                  isEventWorkspaceBusy={isAdminWorkspaceBusy}
                  eventWorkspaceError={adminWorkspaceError}
                  isEventCreating={isEventEditorBusy}
                  onRefreshEvents={loadAdminWorkspaceRecords}
                  onCreateEvent={handleCreateEventFromAdminWorkspace}
                  onOpenEventPanel={openEventPanel}
                  onOpenInvitationProject={handleOpenInvitationProjectFromAdminWorkspace}
                  forcedEventCode={activeEventRecord?.code ?? null}
                  livePreviewBaseUrl={invitationEditorPreviewBaseUrl}
                  hideWorkspaceSidebar
                />
              </Suspense>
            ) : (
              <WorkspacePageLoader />
            )
          ) : (
            <Suspense fallback={<PageSectionFallback tone="light" />}>
              <EventPortalPage
                variant={eventPortalVariant}
                activeEventRecord={activeEventRecord}
                activeInvitationProject={activeInvitationProject}
                eventMetrics={eventMetrics}
                eventAccessCode={eventAccessCode}
                eventAccessError={eventAccessError}
                isEventAccessBusy={isEventAccessBusy}
                isEventEditorBusy={isEventEditorBusy}
                isAdminWorkspaceBusy={isAdminWorkspaceBusy}
                isInvitationProjectBusy={isInvitationProjectBusy}
                guestSyncMessage={guestSyncMessage}
                guestSyncTone={guestSyncTone}
                invitationProjectMessage={invitationProjectMessage}
                invitationProjectTone={invitationProjectTone}
                demoAccessCode={DEMO_EVENT_ACCESS_CODE}
                isGuestSyncBusy={isGuestSyncBusy}
                localAccessCodes={eventPortalLocalCodes}
                panelContentRef={panelContentRef}
                isDark={isDark}
                surfaceClasses={surfaceClasses}
                surfaceStrongClasses={surfaceStrongClasses}
                shadowClasses={shadowClasses}
                mutedTextClasses={mutedTextClasses}
                tertiaryTextClasses={tertiaryTextClasses}
                primaryButtonClasses={primaryButtonClasses}
                panelShellClasses={panelShellClasses}
                panelSurfaceStrongClasses={panelSurfaceStrongClasses}
                panelMutedTextClasses={panelMutedTextClasses}
                panelTertiaryTextClasses={panelTertiaryTextClasses}
                panelPrimaryButtonClasses={panelPrimaryButtonClasses}
                renderAccentBadge={renderAccentBadge}
                renderTitle={renderTitle}
                onEventAccessCodeChange={setEventAccessCode}
                onSubmitAccess={handleEventAccessSubmit}
                onCreateEvent={handleCreateEvent}
                onOpenPanel={openEventPanel}
                onClearSession={clearEventPanelSession}
                onSaveEventDetails={handleSaveEventDetails}
                onAddManualGuest={handleAddManualGuest}
                onDownloadGuestTemplate={handleGuestTemplateDownload}
                onDeleteGuests={handleDeleteGuests}
                onExportGuestLinks={handleGuestLinksExport}
                onExportGuestAdminList={handleGuestAdminExport}
                onImportGuestFile={handleGuestFileImport}
                onRegisterGuestCheckIn={handleGuestCheckIn}
                onPreviewInvitationProject={handlePreviewInvitationProject}
                onEditInvitationProject={handleEditInvitationProject}
                onOpenAdminWorkspace={handleOpenAdminWorkspace}
                onNavigateAccess={() => navigateTo('mi-evento')}
                onQuickCode={handleQuickEventCode}
              />
            </Suspense>
          )}

          {currentPage === 'inicio' && isBelowFoldReady ? (
            <Suspense fallback={null}>
              <FooterSection
                displayFont={displayFont}
                footerBrandLogo={CONTROL_IMAGES.landingSlots.footerBrandLogo}
                footerCreatorLogo={CONTROL_IMAGES.landingSlots.footerCreatorLogo}
                footerSocials={FOOTER_SOCIALS}
                navItems={NAV_ITEMS}
                price={SINGLE_PRICE_AMOUNT}
                renderIcon={renderIcon}
                onNavigate={(item) => navigateTo('inicio', item.sectionId)}
                onStart={() => navigateTo('registro')}
                onOpenEvents={() => navigateTo('mi-evento')}
              />
            </Suspense>
          ) : null}
        </div>
      </div>

      {isAdminWorkspaceOpen && adminWorkspaceSession ? (
        <div className="fixed inset-0 z-[160] bg-[#eef3f7]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(251,146,60,0.12), transparent 22%), radial-gradient(circle at top left, rgba(20,184,166,0.08), transparent 28%)'
            }}
          />
          <button
            type="button"
            onClick={closeAdminWorkspace}
            className="absolute right-4 top-4 z-[170] flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition hover:border-slate-300 hover:text-slate-950"
            aria-label="Cerrar laboratorio"
            title="Cerrar laboratorio"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6L18 18M18 6L6 18" />
            </svg>
          </button>
          <div className="relative z-10 h-full w-full">
            <Suspense fallback={<WorkspacePageLoader />}>
              <AdminPanel
                currentUser={adminWorkspaceSession}
                initialTab="dashboard"
                onUpdateSession={setAdminWorkspaceSession}
                onLogout={() => {
                  setAdminWorkspaceSession(null);
                  closeAdminWorkspace();
                }}
                mode="event-admin"
                eventItems={adminWorkspaceItems}
                isEventWorkspaceBusy={isAdminWorkspaceBusy}
                eventWorkspaceError={adminWorkspaceError}
                isEventCreating={isEventEditorBusy}
                onRefreshEvents={loadAdminWorkspaceRecords}
                onCreateEvent={handleCreateEventFromAdminWorkspace}
                onOpenEventPanel={handleOpenEventPanelFromAdminWorkspace}
                onOpenInvitationProject={handleOpenInvitationProjectFromAdminWorkspace}
              />
            </Suspense>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default App;
