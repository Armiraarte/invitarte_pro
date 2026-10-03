import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type {
  EventAdminWorkspaceItem,
  EventPortalEventDraft,
  EventPortalRecord,
  InvitationProjectRecord,
} from '../components/event-portal/types';
import {
  PackageType,
  InvitationData,
  SavedDesign,
  Section,
  SectionElement,
  SectionAnimationType,
  UserSession,
} from './types';
import { PACKAGES, TEMPLATE_PRESETS } from './constants';
import { signOut, updateCurrentUserProfile } from './services/localAuth';
import {
  downloadInvitationProjectArchive,
  fetchInvitationProjectSource,
  fetchInvitationProjectBuilderState,
  saveInvitationProjectBuilderState,
  saveInvitationProjectSource,
  uploadInvitationProjectArchive,
} from '../services/eventPortalApi';

import { Sidebar } from './components/Sidebar';
import { CountdownDisplay } from './components/CountdownDisplay';
import { getImagePresentationStyle } from './components/dashboard/imagePresentation';
import { ItineraryTimeline } from './components/dashboard/itinerary';
import { getSectionContainerStyle, getSectionElementAnimation, getSectionElementById, getSectionElementLayer, getSectionElements, getSectionImageStyle, getSectionTextStyle, syncSectionElements } from './components/dashboard/sectionElements';
import {
  getCountdownParts,
  getGoogleMapsEmbedUrl,
  getGoogleMapsOpenUrl,
  getRevealButtonLabel,
} from './components/dashboard/sectionInteractive';
import { buildLegacyInvitationProjectSource, isLegacyInvitationProjectSource } from './services/legacyInvitationSource';
import { buildStaticInvitationProjectSource } from './services/staticInvitationSource';

const { Suspense, lazy } = React;
const Dashboard = lazy(() => import('./components/Dashboard').then((module) => ({ default: module.Dashboard })));
const ActionPanel = lazy(() => import('./components/ActionPanel').then((module) => ({ default: module.ActionPanel })));
const VisualBuilder = lazy(() => import('./components/dashboard/VisualBuilder').then((module) => ({ default: module.VisualBuilder })));
const DesignHistory = lazy(() => import('./components/DesignHistory').then((module) => ({ default: module.DesignHistory })));
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then((module) => ({ default: module.SettingsPanel })));
const TemplateSidebar = lazy(() => import('./components/TemplateSidebar').then((module) => ({ default: module.TemplateSidebar })));

const STORAGE_KEY_PREFIX = 'laboratorio_invitaciones_saved_designs_';
const EVENT_ADMIN_EDITOR_STATE_KEY_PREFIX = 'laboratorio_event_admin_editor_';
type InvitationEditorSectionKind =
  | 'hero'
  | 'countdown'
  | 'story'
  | 'location'
  | 'timeline'
  | 'gallery'
  | 'details'
  | 'logistics'
  | 'messages'
  | 'music'
  | 'rsvp';

type InvitationSourceItineraryItem = {
  id?: string;
  time?: string;
  title?: string;
  icon?: string;
};

type InvitationSourcePhotoItem = {
  id?: string;
  title?: string;
  url?: string;
};

type InvitationSourceHonorPerson = {
  role?: string;
  names?: string;
};

type InvitationSourceGiftTable = {
  storeName?: string;
  link?: string;
  accountNumber?: string;
  notes?: string;
};

type InvitationSourceRecommendedStay = {
  name?: string;
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

type InvitationSourceOrganizerContact = {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  whatsappUrl?: string;
};

type InvitationSourceConfig = {
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
  timeline?: InvitationSourceItineraryItem[];
  honorPeople?: InvitationSourceHonorPerson[];
  giftTables?: InvitationSourceGiftTable[];
  gallery?: InvitationSourcePhotoItem[];
  specialNotes?: string[];
  recommendedStays?: InvitationSourceRecommendedStay[];
  transportInfo?: InvitationSourceTransportInfo;
  photoShareUrl?: string;
  photoShareMessage?: string;
  organizerContacts?: InvitationSourceOrganizerContact[];
  musicRequested?: boolean;
  coverImage?: string;
};

type InvitationEditorSectionSeed = {
  id: string;
  label: string;
  kind: InvitationEditorSectionKind;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  contentImageUrl?: string;
  audioUrl?: string;
  locationMapUrl?: string;
  countdownTargetDate?: string;
  height?: Section['height'];
  bgValue?: string;
  textColor?: string;
  itineraryItems?: InvitationSourceItineraryItem[];
};

type InvitationSourceModule = {
  INVITATION_CONFIG?: InvitationSourceConfig;
  buildInvitationEditorSeed?: (details: InvitationSourceConfig) => InvitationEditorSectionSeed[];
};

type LoadedInvitationSource = {
  config: InvitationSourceConfig;
  sections: InvitationEditorSectionSeed[];
};

const invitationSourceModuleLoaders = import.meta.glob('../invitaciones/*/src/App.tsx') as Record<string, () => Promise<InvitationSourceModule>>;
const invitationSourceCache = new Map<string, Promise<LoadedInvitationSource | null>>();

const WorkspaceLoader: React.FC = () => (
  <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
    <div className="h-4 w-28 rounded-full bg-slate-200" />
    <div className="mt-4 h-10 w-3/4 rounded-2xl bg-slate-100" />
    <div className="mt-6 grid gap-3">
      <div className="h-28 rounded-[24px] bg-slate-100" />
      <div className="h-28 rounded-[24px] bg-slate-100" />
    </div>
  </div>
);

const PageLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div className="w-full max-w-xl rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <div className="h-4 w-32 rounded-full bg-slate-200" />
      <div className="mt-4 h-12 w-2/3 rounded-2xl bg-slate-100" />
      <div className="mt-6 h-44 rounded-[28px] bg-slate-100" />
    </div>
  </div>
);

const createEmptyFormData = (): InvitationData => ({
  hostName: '',
  eventTitle: '',
  globalBg: { type: 'color', value: '#ffffff' },
  sections: []
});

const normalizeInvitationDataPayload = (value: unknown): InvitationData => {
  const formData = value && typeof value === 'object' ? value as Record<string, any> : {};

  return {
    hostName: typeof formData.hostName === 'string' ? formData.hostName : '',
    eventTitle: typeof formData.eventTitle === 'string' ? formData.eventTitle : '',
    sections: Array.isArray(formData.sections) ? formData.sections : [],
    aiMessage: typeof formData.aiMessage === 'string' ? formData.aiMessage : undefined,
    globalBg: formData.globalBg && typeof formData.globalBg === 'object'
      ? {
          type: formData.globalBg.type === 'image' ? 'image' : 'color',
          value: typeof formData.globalBg.value === 'string' ? formData.globalBg.value : '#ffffff',
        }
      : { type: 'color', value: '#ffffff' },
  };
};

const hasDraftContent = (data: InvitationData) => {
  return data.eventTitle.trim().length > 0 || data.hostName.trim().length > 0 || data.sections.length > 0;
};

const sortByUpdatedAt = (designs: SavedDesign[]) => {
  return [...designs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

const getSectionPreviewAnimation = (type?: SectionAnimationType) => {
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

const getElementPreviewMotion = (element: SectionElement, previewRefreshToken: number, delay = 0) => {
  const elementAnimation = getSectionElementAnimation(element);
  const animationType = elementAnimation.type || 'none';
  const animationDuration = Math.max(0.2, Math.min(2, elementAnimation.duration ?? 0.6));
  const previewAnimation = getSectionPreviewAnimation(animationType);

  return {
    replayKey: `${element.id}:${animationType}:${animationDuration}:${previewRefreshToken}`,
    initial: previewAnimation.initial,
    animate: previewAnimation.animate,
    transition: animationType === 'none'
      ? undefined
      : { duration: animationDuration, ease: 'easeOut' as const, delay },
  };
};

const PREVIEW_MAIN_IMAGE_BOX = { width: 260, height: 300 };
const PREVIEW_CONTENT_IMAGE_BOX = { width: 220, height: 200 };
type PreviewPositionKey = 'title' | 'subtitle' | 'content' | 'image' | 'contentImage' | 'container' | 'countdown' | 'guests' | 'location' | 'music';

const getPreviewBasePosition = (
  key: PreviewPositionKey
) => {
  if (key === 'title') return { x: 24, y: 22 };
  if (key === 'subtitle') return { x: 24, y: 72 };
  if (key === 'image') return { x: 28, y: 28 };
  if (key === 'contentImage') return { x: 36, y: 214 };
  if (key === 'container') return { x: 24, y: 120 };
  if (key === 'location') return { x: 38, y: 170 };
  if (key === 'countdown' || key === 'guests' || key === 'music') return { x: 24, y: 170 };
  return { x: 24, y: 126 };
};

const getPreviewPositionOffset = (
  section: InvitationData['sections'][number],
  key: PreviewPositionKey
) => {
  if (key === 'image') {
    return section.positions?.image || section.positions?.extra || { x: 0, y: 0 };
  }

  if (key === 'countdown') {
    return section.positions?.countdown || section.positions?.extra || { x: 0, y: 0 };
  }

  if (key === 'guests') {
    return section.positions?.guests || section.positions?.extra || { x: 0, y: 0 };
  }

  if (key === 'music') {
    return section.positions?.music || section.positions?.extra || { x: 0, y: 0 };
  }

  return section.positions?.[key] || { x: 0, y: 0 };
};

const getPreviewPosition = (
  section: InvitationData['sections'][number],
  key: PreviewPositionKey
) => {
  const base = getPreviewBasePosition(key);
  const offset = getPreviewPositionOffset(section, key);
  return {
    left: base.x + offset.x,
    top: base.y + offset.y,
  };
};

const getPreviewElementPosition = (
  key: PreviewPositionKey,
  offset?: { x: number; y: number }
) => {
  const base = getPreviewBasePosition(key);
  const safeOffset = offset || { x: 0, y: 0 };
  return {
    left: base.x + safeOffset.x,
    top: base.y + safeOffset.y,
  };
};

const isPackageType = (value: unknown): value is PackageType => {
  return Object.values(PackageType).includes(value as PackageType);
};

const resolveEventWorkspacePackageId = (value: unknown, fallback: PackageType): PackageType => {
  if (isPackageType(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'ORO' || normalized === 'ELEGANT') return PackageType.ELEGANT;
  if (normalized === 'PLATINO' || normalized === 'PARTY') return PackageType.PARTY;
  if (normalized === 'DIAMANTE' || normalized === 'BABY') return PackageType.BABY;
  if (normalized === 'MODERN') return PackageType.MODERN;

  return fallback;
};

const serializeEventProjectBuilderSnapshot = (packageId: PackageType | null, formData: InvitationData) => (
  JSON.stringify({
    packageId: packageId ?? '',
    formData: normalizeInvitationDataPayload(formData),
  })
);

const parseSavedDesigns = (raw: string | null): SavedDesign[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = new Date().toISOString();

    const normalized: SavedDesign[] = parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        return {
          id: typeof item.id === 'string' ? item.id : '',
          packageId: isPackageType(item.packageId) ? item.packageId : PackageType.ELEGANT,
          formData: normalizeInvitationDataPayload(item.formData),
          step: item.step === 3 ? 3 : 2,
          invitationId: typeof item.invitationId === 'string' ? item.invitationId : null,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : now,
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now,
        } as SavedDesign;
      })
      .filter((item) => item.id.length > 0);

    return sortByUpdatedAt(normalized);
  } catch {
    return [];
  }
};

const createSectionId = () => Math.random().toString(36).slice(2, 11);

const createSection = (overrides: Partial<Section> & Pick<Section, 'type'>): Section => ({
  id: createSectionId(),
  type: overrides.type,
  title: undefined,
  subtitle: undefined,
  content: undefined,
  imageUrl: undefined,
  contentImageUrl: undefined,
  audioUrl: undefined,
  alignment: 'center',
  bgType: 'color',
  bgValue: '#ffffff',
  height: '100',
  textColor: '#1f2937',
  positions: {},
  animation: {
    type: 'fade',
    duration: 0.7,
  },
  ...overrides,
});

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const createTemplateDraft = (templateId: string, hostName: string) => {
  const template = TEMPLATE_PRESETS.find((item) => item.id === templateId);
  const templateAliases: Record<string, string> = {
    'wedding-night': 'wedding-editorial',
    'xv-luxe': 'xv-festiva',
    'xv-bloom': 'xv-festiva',
  };

  if (!template) {
    return {
      packageId: PACKAGES[0]?.id ?? PackageType.ELEGANT,
      formData: createEmptyFormData(),
    };
  }

  const formDataByTemplate: Record<string, InvitationData> = {
    'wedding-editorial': {
      hostName,
      eventTitle: 'Boda de Camila y Diego',
      globalBg: { type: 'color', value: '#fff7f1' },
      sections: [
        createSection({
          type: 'HERO',
          title: 'Camila y Diego',
          subtitle: 'Nos casamos',
          content: 'Una celebracion elegante para compartir nuestra historia.',
          bgValue: '#fff3ea',
          textColor: '#7c2d12',
        }),
        createSection({
          type: 'DETAILS',
          title: 'Sabado 24 de octubre de 2026',
          subtitle: '5:00 PM',
          content: 'Hacienda San Javier, Morelia, Michoacán',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'COUNTDOWN',
          title: 'Cuenta regresiva',
          subtitle: 'Falta poco para celebrar juntos',
          bgValue: '#fffaf5',
          countdownTargetDate: daysFromNow(120),
          height: '50',
        }),
        createSection({
          type: 'GUESTS',
          title: 'Confirma tu asistencia',
          subtitle: 'RSVP',
          content: 'Queremos preparar cada detalle contigo.',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'LOCATION',
          title: 'Cómo llegar',
          subtitle: 'Ubicación del evento',
          content: 'Abre el mapa para llegar directo al lugar.',
          bgValue: '#f8fafc',
          locationMapUrl: 'Hacienda San Javier Morelia Michoacán',
        }),
        createSection({
          type: 'MESSAGE',
          title: 'Mensaje principal',
          subtitle: 'Gracias por acompañarnos',
          content: 'Preparamos esta invitación para que tengas fecha, lugar y confirmación en un solo sitio.',
          bgValue: '#fff7ed',
          height: '75',
        }),
      ],
    },
    'xv-festiva': {
      hostName,
      eventTitle: 'XV de Valeria',
      globalBg: { type: 'color', value: '#fff1f7' },
      sections: [
        createSection({
          type: 'HERO',
          title: 'Valeria XV',
          subtitle: 'Una noche para brillar',
          content: 'Color, música y una celebración pensada para compartir en digital.',
          bgValue: '#ffe4ef',
          textColor: '#9d174d',
        }),
        createSection({
          type: 'DETAILS',
          title: 'Viernes 14 de agosto de 2026',
          subtitle: '8:00 PM',
          content: 'Salón Bosques del Lago, Guadalajara',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'MUSIC',
          title: 'Playlist oficial',
          subtitle: 'Agrega una canción de bienvenida',
          content: 'El editor permite subir una pista para ambientar la invitación.',
          bgValue: '#fff7fb',
          height: '50',
        }),
        createSection({
          type: 'GUESTS',
          title: 'Confirmación',
          subtitle: 'Reserva tu lugar',
          content: 'Queremos saber si vienes para prepararlo todo.',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'LOCATION',
          title: 'Ubicación',
          subtitle: 'Mapa de acceso',
          content: 'Comparte la dirección exacta desde la misma invitación.',
          bgValue: '#f8fafc',
          locationMapUrl: 'Salón Bosques del Lago Guadalajara',
        }),
      ],
    },
    'baby-soft': {
      hostName,
      eventTitle: 'Baby Shower de Sofía',
      globalBg: { type: 'color', value: '#f1f8ff' },
      sections: [
        createSection({
          type: 'HERO',
          title: 'Baby Shower',
          subtitle: 'Sofía está por llegar',
          content: 'Una invitación suave y cercana para familia y amigos.',
          bgValue: '#e6f3ff',
          textColor: '#1d4ed8',
        }),
        createSection({
          type: 'DETAILS',
          title: 'Domingo 9 de noviembre de 2026',
          subtitle: '11:30 AM',
          content: 'Casa de la familia Martínez, Monterrey',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'LOCATION',
          title: 'Cómo llegar',
          subtitle: 'Todo claro para la reunión',
          content: 'El mapa evita llamadas de última hora.',
          bgValue: '#f8fbff',
          locationMapUrl: 'Casa de la familia Martínez Monterrey',
        }),
        createSection({
          type: 'MESSAGE',
          title: 'Mesa de regalos',
          subtitle: 'Sugerencias',
          content: 'Agrega mensajes especiales o instrucciones previas al evento.',
          bgValue: '#ffffff',
          height: '75',
        }),
      ],
    },
    'birthday-bold': {
      hostName,
      eventTitle: 'Cumpleaños de Mateo',
      globalBg: { type: 'color', value: '#f7f2ff' },
      sections: [
        createSection({
          type: 'HERO',
          title: 'Mateo 30',
          subtitle: 'Fiesta de cumpleaños',
          content: 'Una portada intensa para una celebración con energía.',
          bgValue: '#ede9fe',
          textColor: '#5b21b6',
        }),
        createSection({
          type: 'DETAILS',
          title: 'Sabado 18 de julio de 2026',
          subtitle: '9:00 PM',
          content: 'Terraza Norte, CDMX',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'COUNTDOWN',
          title: 'Nos vemos pronto',
          subtitle: 'Activa el conteo para crear expectativa',
          bgValue: '#faf5ff',
          countdownTargetDate: daysFromNow(45),
          height: '50',
        }),
        createSection({
          type: 'GUESTS',
          title: 'RSVP rápido',
          subtitle: 'Confirma asistencia',
          content: 'Conoce cuántas confirmaciones llegan antes del evento.',
          bgValue: '#ffffff',
          height: '50',
        }),
      ],
    },
    'corporate-clean': {
      hostName,
      eventTitle: 'Lanzamiento de marca',
      globalBg: { type: 'color', value: '#f4f7f7' },
      sections: [
        createSection({
          type: 'HERO',
          title: 'Evento corporativo',
          subtitle: 'Presentación oficial',
          content: 'Ideal para aperturas, networking y lanzamientos de negocio.',
          bgValue: '#e9f5f3',
          textColor: '#115e59',
        }),
        createSection({
          type: 'DETAILS',
          title: 'Jueves 3 de septiembre de 2026',
          subtitle: '7:00 PM',
          content: 'Hotel Ejecutivo Reforma, CDMX',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'LOCATION',
          title: 'Venue',
          subtitle: 'Ubicación del evento',
          content: 'Comparte el mapa y evita fricciones en la llegada.',
          bgValue: '#f8fafc',
          locationMapUrl: 'Hotel Ejecutivo Reforma Ciudad de México',
        }),
        createSection({
          type: 'MESSAGE',
          title: 'Agenda',
          subtitle: 'Programa del encuentro',
          content: 'Usa esta sección para agenda, dress code, ponentes o instrucciones.',
          bgValue: '#ffffff',
          height: '75',
        }),
      ],
    },
    'intimate-minimal': {
      hostName,
      eventTitle: 'Cena especial',
      globalBg: { type: 'color', value: '#fff8f3' },
      sections: [
        createSection({
          type: 'HERO',
          title: 'Noche especial',
          subtitle: 'Celebración íntima',
          content: 'Una base corta y limpia para reuniones pequeñas pero cuidadas.',
          bgValue: '#ffefe3',
          textColor: '#9a3412',
        }),
        createSection({
          type: 'DETAILS',
          title: 'Viernes 11 de diciembre de 2026',
          subtitle: '8:30 PM',
          content: 'Casa Azul, Puebla',
          bgValue: '#ffffff',
          height: '50',
        }),
        createSection({
          type: 'LOCATION',
          title: 'Ubicación',
          subtitle: 'Abre el mapa en un toque',
          content: 'Formato práctico para reuniones familiares o privadas.',
          bgValue: '#fffaf7',
          locationMapUrl: 'Casa Azul Puebla',
        }),
      ],
    },
  };

  return {
    packageId: template.packageId,
    formData: formDataByTemplate[templateAliases[templateId] || templateId] || createEmptyFormData(),
  };
};

const resolveEventCountdownDate = (record: EventPortalRecord) => {
  const rawValue = record.eventDateValue?.trim() ?? '';
  if (rawValue !== '') {
    const parsed = new Date(rawValue);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return daysFromNow(45);
};

const normalizeWorkspaceImportPath = (value: string) => (
  value
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
);

const buildWorkspacePublicUrl = (relativePath: string) => {
  const normalizedPath = normalizeWorkspaceImportPath(relativePath);
  const relativeUrl = normalizedPath ? `/${normalizedPath}` : '/';

  if (typeof window === 'undefined') {
    return relativeUrl;
  }

  return new URL(relativeUrl, window.location.origin).toString();
};

const isExternalWorkspaceUrl = (value: string) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value);

const resolveInvitationProjectAssetUrl = (item: EventAdminWorkspaceItem, value?: string | null) => {
  const trimmed = value?.trim() ?? '';
  if (trimmed === '') {
    return '';
  }

  if (
    trimmed.startsWith('data:')
    || trimmed.startsWith('blob:')
    || trimmed.startsWith('mailto:')
    || trimmed.startsWith('tel:')
    || isExternalWorkspaceUrl(trimmed)
  ) {
    return trimmed;
  }

  const normalizedValue = normalizeWorkspaceImportPath(trimmed);
  const normalizedProjectPath = normalizeWorkspaceImportPath(item.projectPath).replace(/\/+$/, '');
  const normalizedAppEntry = normalizeWorkspaceImportPath(item.appEntry || '');
  const isStaticProject = normalizedAppEntry.endsWith('/script.js') || normalizedAppEntry === 'script.js';

  if (normalizedProjectPath === '') {
    return buildWorkspacePublicUrl(normalizedValue);
  }

  if (
    normalizedValue.startsWith(`${normalizedProjectPath}/`)
    || normalizedValue.startsWith('invitaciones/')
  ) {
    return buildWorkspacePublicUrl(normalizedValue);
  }

  if (normalizedValue.startsWith('public/') || normalizedValue.startsWith('dist/')) {
    return buildWorkspacePublicUrl(`${normalizedProjectPath}/${normalizedValue}`);
  }

  if (normalizedValue.startsWith('invitacion/')) {
    if (isStaticProject) {
      return buildWorkspacePublicUrl(`${normalizedProjectPath}/${normalizedValue}`);
    }
    return buildWorkspacePublicUrl(`${normalizedProjectPath}/public/${normalizedValue}`);
  }

  return buildWorkspacePublicUrl(`${normalizedProjectPath}/public/${normalizedValue}`);
};

const normalizeInvitationSourceConfigForWorkspace = (
  item: EventAdminWorkspaceItem,
  config: InvitationSourceConfig
): InvitationSourceConfig => ({
  ...config,
  coverImage: resolveInvitationProjectAssetUrl(item, config.coverImage) || config.coverImage,
  backgroundMusicUrl: resolveInvitationProjectAssetUrl(item, config.backgroundMusicUrl) || config.backgroundMusicUrl,
  gallery: (config.gallery ?? []).map((photo) => ({
    ...photo,
    url: resolveInvitationProjectAssetUrl(item, photo.url) || photo.url,
  })),
});

const normalizeInvitationEditorSeedForWorkspace = (
  item: EventAdminWorkspaceItem,
  seed: InvitationEditorSectionSeed
): InvitationEditorSectionSeed => ({
  ...seed,
  imageUrl: resolveInvitationProjectAssetUrl(item, seed.imageUrl) || seed.imageUrl,
  contentImageUrl: resolveInvitationProjectAssetUrl(item, seed.contentImageUrl) || seed.contentImageUrl,
  audioUrl: resolveInvitationProjectAssetUrl(item, seed.audioUrl) || seed.audioUrl,
});

const compactWorkspaceInvitationText = (values: Array<string | null | undefined>) => (
  values
    .map((value) => value?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n')
);

const buildWorkspaceInvitationBulletList = (items: Array<string | null | undefined>) => (
  items
    .map((item) => item?.trim() ?? '')
    .filter(Boolean)
    .map((item) => `• ${item}`)
    .join('\n')
);

const WORKSPACE_INVITATION_THEME_PALETTES = {
  elegant: {
    heroBg: '#fff2e4',
    softBg: '#fff9f2',
    solidBg: '#ffffff',
    accentText: '#9a3412',
    baseText: '#4b5563',
  },
  boho: {
    heroBg: '#f4e7d8',
    softBg: '#fcf7f0',
    solidBg: '#fffdf9',
    accentText: '#8a5a3c',
    baseText: '#5b4636',
  },
  classic: {
    heroBg: '#ece6da',
    softBg: '#f8f5ef',
    solidBg: '#ffffff',
    accentText: '#7c5a2b',
    baseText: '#374151',
  },
  festive: {
    heroBg: '#1e1b4b',
    softBg: '#172554',
    solidBg: '#111827',
    accentText: '#f5f3ff',
    baseText: '#e2e8f0',
  },
  minimalist: {
    heroBg: '#fafaf9',
    softBg: '#f5f5f4',
    solidBg: '#ffffff',
    accentText: '#171717',
    baseText: '#525252',
  },
} as const;

const resolveWorkspaceInvitationThemePalette = (theme?: string) => {
  const normalizedTheme = theme?.trim().toLowerCase() ?? 'elegant';
  return WORKSPACE_INVITATION_THEME_PALETTES[
    normalizedTheme as keyof typeof WORKSPACE_INVITATION_THEME_PALETTES
  ] ?? WORKSPACE_INVITATION_THEME_PALETTES.elegant;
};

const resolveWorkspaceInvitationCountdownTarget = (config: InvitationSourceConfig) => {
  const rawDate = config.date?.trim() ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return undefined;
  }

  const rawTime = config.time?.trim() || '00:00';
  const parsed = new Date(`${rawDate}T${rawTime}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
};

const buildWorkspaceInvitationEditorSeed = (config: InvitationSourceConfig): InvitationEditorSectionSeed[] => {
  const palette = resolveWorkspaceInvitationThemePalette(config.theme);
  const gallery = (config.gallery ?? []).filter((photo) => photo?.url?.trim());
  const honorPeopleSummary = buildWorkspaceInvitationBulletList(
    (config.honorPeople ?? []).map((person) => [person.role, person.names].filter(Boolean).join(': '))
  );
  const giftSummary = buildWorkspaceInvitationBulletList(
    (config.giftTables ?? []).map((gift) => compactWorkspaceInvitationText([
      gift.storeName,
      gift.accountNumber ? `Cuenta: ${gift.accountNumber}` : '',
      gift.notes,
      gift.link,
    ]))
  );
  const logisticsSummary = buildWorkspaceInvitationBulletList([
    ...(config.specialNotes ?? []),
    ...(config.recommendedStays ?? []).map((stay) => compactWorkspaceInvitationText([
      `Hospedaje: ${stay.name}`,
      stay.address,
      stay.phone,
      stay.notes,
      stay.link,
    ])),
    config.transportInfo?.parking ? `Estacionamiento: ${config.transportInfo.parking}` : '',
    config.transportInfo?.shuttle ? `Transporte: ${config.transportInfo.shuttle}` : '',
    config.transportInfo?.notes ? `Notas: ${config.transportInfo.notes}` : '',
    ...(config.organizerContacts ?? []).map((contact) => compactWorkspaceInvitationText([
      `Contacto: ${contact.name}`,
      contact.role,
      contact.phone,
      contact.email,
      contact.whatsappUrl,
    ])),
  ]);
  const messagesSummary = compactWorkspaceInvitationText([
    config.photoShareMessage,
    config.photoShareUrl ? `Carpeta compartida: ${config.photoShareUrl}` : '',
  ]);
  const timelineItems = (config.timeline ?? []).map((item) => ({
    id: item.id,
    time: item.time,
    title: item.title,
    icon: item.icon,
  }));

  const sections: InvitationEditorSectionSeed[] = [
    {
      id: 'inicio',
      label: 'Portada',
      kind: 'hero',
      title: config.title,
      subtitle: config.subtitle || config.hosts,
      content: compactWorkspaceInvitationText([config.hosts, config.mainMessage]),
      contentImageUrl: config.coverImage || gallery[0]?.url,
      height: '100',
      bgValue: palette.heroBg,
      textColor: palette.accentText,
    },
    {
      id: 'cuenta',
      label: 'Cuenta regresiva',
      kind: 'countdown',
      title: 'Cuenta regresiva',
      subtitle: compactWorkspaceInvitationText([config.date, config.time ? `${config.time} hrs` : '']),
      content: 'Reproduce la llegada al evento desde esta sección.',
      countdownTargetDate: resolveWorkspaceInvitationCountdownTarget(config),
      height: '50',
      bgValue: palette.softBg,
      textColor: palette.baseText,
    },
  ];

  if (config.story || honorPeopleSummary) {
    sections.push({
      id: 'historia',
      label: 'Historia',
      kind: 'story',
      title: 'Nuestra historia',
      subtitle: 'Texto principal y personas especiales',
      content: compactWorkspaceInvitationText([config.story, honorPeopleSummary]),
      contentImageUrl: gallery[1]?.url,
      height: '100',
      bgValue: palette.solidBg,
      textColor: palette.baseText,
    });
  }

  sections.push({
    id: 'ubicacion',
    label: 'Ubicación',
    kind: 'location',
    title: config.venueName,
    subtitle: 'Ubicación del evento',
    content: compactWorkspaceInvitationText([config.venueAddress, config.venueMapsUrl]),
    locationMapUrl: config.venueMapsUrl || [config.venueName, config.venueAddress].filter(Boolean).join(', '),
    height: '75',
    bgValue: palette.solidBg,
    textColor: palette.baseText,
  });

  if (timelineItems.length > 0) {
    sections.push({
      id: 'itinerario',
      label: 'Programa',
      kind: 'timeline',
      title: 'Programa del día',
      subtitle: 'Timeline editable',
      content: 'Cada parada del evento se puede ajustar desde el itinerario.',
      itineraryItems: timelineItems,
      height: '100',
      bgValue: palette.softBg,
      textColor: palette.baseText,
    });
  }

  if (gallery.length > 0) {
    sections.push({
      id: 'galeria',
      label: 'Galería',
      kind: 'gallery',
      title: 'Galería',
      subtitle: `${gallery.length} recuerdos visuales`,
      content: buildWorkspaceInvitationBulletList(gallery.map((photo) => photo.title || 'Foto de la invitación')),
      imageUrl: gallery[0]?.url,
      contentImageUrl: gallery[1]?.url || config.coverImage,
      height: '100',
      bgValue: palette.solidBg,
      textColor: palette.baseText,
    });
  }

  sections.push({
    id: 'detalles',
    label: 'Detalles',
    kind: 'details',
    title: 'Detalles del evento',
    subtitle: compactWorkspaceInvitationText([
      config.dressCode ? `Código: ${config.dressCode}` : '',
      config.dressCodeColor,
    ]),
    content: compactWorkspaceInvitationText([giftSummary]),
    height: '100',
    bgValue: palette.softBg,
    textColor: palette.baseText,
  });

  if (logisticsSummary) {
    sections.push({
      id: 'logistica',
      label: 'Logística',
      kind: 'logistics',
      title: 'Logística y apoyo',
      subtitle: 'Hospedaje, transporte y notas',
      content: logisticsSummary,
      height: '100',
      bgValue: palette.solidBg,
      textColor: palette.baseText,
    });
  }

  if (messagesSummary) {
    sections.push({
      id: 'mensajes',
      label: 'Fotos',
      kind: 'messages',
      title: 'Fotos y mensajes',
      subtitle: 'Carpeta compartida y libro de mensajes',
      content: messagesSummary,
      height: '75',
      bgValue: palette.softBg,
      textColor: palette.baseText,
    });
  }

  if (config.backgroundMusicUrl || config.musicPlaylistUrl) {
    sections.push({
      id: 'musica',
      label: 'Música',
      kind: 'music',
      title: 'Música del evento',
      subtitle: config.musicRequested ? 'Los invitados pueden proponer canciones.' : 'Sección musical del evento.',
      content: compactWorkspaceInvitationText([
        config.backgroundMusicUrl ? 'Audio principal cargado.' : '',
        config.musicPlaylistUrl ? `Playlist: ${config.musicPlaylistUrl}` : '',
      ]),
      audioUrl: config.backgroundMusicUrl,
      height: '50',
      bgValue: palette.solidBg,
      textColor: palette.baseText,
    });
  }

  return sections;
};

const buildLoadedInvitationSource = (
  item: EventAdminWorkspaceItem,
  sourceConfig: InvitationSourceConfig,
  buildEditorSeed?: (details: InvitationSourceConfig) => InvitationEditorSectionSeed[]
): LoadedInvitationSource | null => {
  const normalizedConfig = normalizeInvitationSourceConfigForWorkspace(item, sourceConfig);
  const rawSections = typeof buildEditorSeed === 'function'
    ? buildEditorSeed(normalizedConfig)
    : buildWorkspaceInvitationEditorSeed(normalizedConfig);
  const sections = rawSections
    .map((seed) => normalizeInvitationEditorSeedForWorkspace(item, seed))
    .filter((section) => section && section.id && section.kind);

  if (sections.length === 0) {
    return null;
  }

  return {
    config: normalizedConfig,
    sections,
  };
};

const extractInvitationConfigObjectLiteral = (rawSource: string) => {
  const source = rawSource.replace(/^\uFEFF/, '');
  const markerIndex = [
    'export const INVITATION_CONFIG',
    'const INVITATION_CONFIG',
    'window.INVITATION_CONFIG =',
  ]
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
        return source.slice(objectStart, index + 1);
      }
    }
  }

  return null;
};

const parseInvitationProjectSourceConfig = (item: EventAdminWorkspaceItem, source: string) => {
  const configLiteral = extractInvitationConfigObjectLiteral(source);
  if (!configLiteral) {
    return null;
  }

  try {
    const evaluateConfig = new Function(
      'buildInvitationAssetPath',
      `"use strict"; return (${configLiteral});`
    ) as (buildInvitationAssetPath: (relativePath: string) => string) => InvitationSourceConfig;

    const parsedConfig = evaluateConfig((relativePath: string) => resolveInvitationProjectAssetUrl(item, relativePath));
    if (!parsedConfig || typeof parsedConfig !== 'object') {
      return null;
    }

    return normalizeInvitationSourceConfigForWorkspace(item, parsedConfig);
  } catch (error) {
    console.error('No se pudo interpretar la configuracion de la invitacion desde el codigo fuente.', error);
    return null;
  }
};

const resolveInvitationSourceCacheKey = (item: EventAdminWorkspaceItem) => (
  item.record.code?.trim().toUpperCase()
  || normalizeWorkspaceImportPath(item.projectPath || item.appEntry || '')
);

const clearEventWorkspaceInvitationSourceCache = (item: EventAdminWorkspaceItem) => {
  const cacheKey = resolveInvitationSourceCacheKey(item);
  if (cacheKey) {
    invitationSourceCache.delete(cacheKey);
  }
};

const resolveInvitationSourceModuleKey = (item: EventAdminWorkspaceItem) => {
  const candidates = [
    item.appEntry ? `../${normalizeWorkspaceImportPath(item.appEntry)}` : '',
    item.projectPath ? `../${normalizeWorkspaceImportPath(item.projectPath).replace(/\/+$/, '')}/src/App.tsx` : '',
    item.record.code?.trim() ? `../invitaciones/${item.record.code.trim()}/src/App.tsx` : '',
  ].filter(Boolean);

  return candidates.find((candidate) => !!invitationSourceModuleLoaders[candidate]) ?? null;
};

const loadEventWorkspaceInvitationSource = (item: EventAdminWorkspaceItem) => {
  const cacheKey = resolveInvitationSourceCacheKey(item);

  if (invitationSourceCache.has(cacheKey)) {
    return invitationSourceCache.get(cacheKey)!;
  }

  const sourcePromise = (async (): Promise<LoadedInvitationSource | null> => {
    const moduleKey = resolveInvitationSourceModuleKey(item);
    if (moduleKey) {
      try {
        const invitationModule = await invitationSourceModuleLoaders[moduleKey]();
        const loadedSource = invitationModule.INVITATION_CONFIG
          ? buildLoadedInvitationSource(item, invitationModule.INVITATION_CONFIG, invitationModule.buildInvitationEditorSeed)
          : null;
        if (loadedSource) {
          return loadedSource;
        }
      } catch (error) {
        console.error('No se pudo cargar la configuracion del editor para la invitacion del evento.', error);
      }
    }

    try {
      const sourceRecord = await fetchInvitationProjectSource(item.record.code);
      const parsedConfig = parseInvitationProjectSourceConfig(item, sourceRecord.source);
      if (!parsedConfig) {
        return null;
      }

      return buildLoadedInvitationSource(item, parsedConfig);
    } catch (error) {
      console.error('No se pudo recuperar la configuracion de la invitacion desde la API.', error);
      return null;
    }
  })();

  invitationSourceCache.set(cacheKey, sourcePromise);
  void sourcePromise.then((result) => {
    if (!result) {
      invitationSourceCache.delete(cacheKey);
    }
  });
  return sourcePromise;
};

const normalizeEventWorkspaceSectionAssets = (item: EventAdminWorkspaceItem, section: Section): Section => {
  const normalizedSectionBase: Section = {
    ...section,
    imageUrl: resolveInvitationProjectAssetUrl(item, section.imageUrl) || section.imageUrl,
    contentImageUrl: resolveInvitationProjectAssetUrl(item, section.contentImageUrl) || section.contentImageUrl,
    audioUrl: resolveInvitationProjectAssetUrl(item, section.audioUrl) || section.audioUrl,
    bgValue: section.bgType === 'image'
      ? resolveInvitationProjectAssetUrl(item, section.bgValue) || section.bgValue
      : section.bgValue,
  };
  const sectionElements = getSectionElements(normalizedSectionBase);

  if (sectionElements.length === 0) {
    return normalizedSectionBase;
  }

  const normalizedElements = sectionElements.map((element) => (
    element.kind === 'image' || element.kind === 'contentImage'
      ? {
          ...element,
          value: resolveInvitationProjectAssetUrl(item, element.value) || element.value,
        }
      : element
  ));

  return {
    ...normalizedSectionBase,
    ...syncSectionElements(normalizedSectionBase, normalizedElements),
  };
};

const normalizeEventWorkspaceInvitationDataAssets = (
  item: EventAdminWorkspaceItem,
  source: InvitationData | null
) => {
  if (!source) {
    return null;
  }

  const normalizedSource = normalizeInvitationDataPayload(source);
  return {
    ...normalizedSource,
    globalBg: normalizedSource.globalBg?.type === 'image'
      ? {
          ...normalizedSource.globalBg,
          value: resolveInvitationProjectAssetUrl(item, normalizedSource.globalBg.value) || normalizedSource.globalBg.value,
        }
      : normalizedSource.globalBg,
    sections: normalizedSource.sections.map((section) => normalizeEventWorkspaceSectionAssets(item, section)),
  };
};

const resolveInvitationSourceCountdownDate = (config: InvitationSourceConfig, record: EventPortalRecord) => {
  const rawDate = config.date?.trim() ?? '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const rawTime = config.time?.trim() || '00:00';
    const parsed = new Date(`${rawDate}T${rawTime}:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return resolveEventCountdownDate(record);
};

const resolveInvitationWorkspaceGlobalBg = (theme?: string) => {
  const normalizedTheme = theme?.trim().toLowerCase() ?? '';
  if (normalizedTheme === 'festive') return '#0f172a';
  if (normalizedTheme === 'boho') return '#f6efe5';
  if (normalizedTheme === 'classic') return '#f2efe9';
  if (normalizedTheme === 'minimalist') return '#f5f5f4';
  return '#f8f1e8';
};

const mapInvitationTimelineIcon = (value?: string): NonNullable<Section['itineraryItems']>[number]['icon'] => {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (normalized === 'church') return 'church';
  if (normalized === 'glass-water' || normalized === 'toast') return 'toast';
  if (normalized === 'utensils') return 'calendarNote';
  if (normalized === 'music') return 'party';
  if (normalized === 'moon') return 'moon';
  if (normalized === 'sparkles') return 'sparkles';
  return 'calendar';
};

type InvitationEditorTextDescriptor = {
  id: string;
  kind: SectionElement['kind'];
  value?: string | null;
  position?: SectionElement['position'];
  style?: SectionElement['style'];
  layer?: number;
};

const splitInvitationTextBlocks = (value?: string) => (
  (value ?? '')
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
);

const buildInvitationEditorElements = (descriptors: InvitationEditorTextDescriptor[]): SectionElement[] => {
  let textIndex = 0;

  return descriptors.reduce<SectionElement[]>((elements, descriptor, index) => {
    const rawValue = descriptor.value ?? (descriptor.kind === 'container' ? descriptor.id : '');
    const value = rawValue.trim();
    if (value === '' && descriptor.kind !== 'container') {
      return elements;
    }

    const currentTextIndex = textIndex;
    if (
      descriptor.position === undefined
      && (descriptor.kind === 'title' || descriptor.kind === 'subtitle' || descriptor.kind === 'content')
    ) {
      textIndex += 1;
    }

    elements.push({
      id: descriptor.id,
      kind: descriptor.kind,
      value,
      position: descriptor.position ?? {
        x: 0,
        y: currentTextIndex * 26,
      },
      layer: descriptor.layer ?? (index + 1) * 100,
      style: descriptor.style,
    });

    return elements;
  }, []);
};

const resolveInvitationDressCodeCopy = (dressCode?: string) => {
  const normalized = dressCode?.trim().toLowerCase() ?? '';

  switch (normalized) {
    case 'gala':
      return { name: 'Gala / Rigurosa Etiqueta', desc: 'Vestido largo de noche y smoking o traje oscuro.' };
    case 'formal':
      return { name: 'Formal', desc: 'Vestido formal largo o midi y traje de gala.' };
    case 'cocktail':
      return { name: 'Coctel', desc: 'Vestidos cortos o midi elegantes, traje casual o saco elegante.' };
    case 'casual':
      return { name: 'Casual Elegante', desc: 'Ropa comoda pero sofisticada, colores frescos, sin mezclilla.' };
    case 'beach':
      return { name: 'Guayabera o Playa', desc: 'Lino fresco, colores claros, vestidos vaporosos y calzado comodo.' };
    default:
      return { name: 'Formal', desc: '' };
  }
};

const buildEventWorkspaceInvitationSectionElements = (
  seed: InvitationEditorSectionSeed,
  source: LoadedInvitationSource
) => {
  const config = source.config;
  const seedContentBlocks = splitInvitationTextBlocks(seed.content);
  const heroHosts = config.hosts?.trim() || seedContentBlocks[0] || '';
  const heroMainMessage = config.mainMessage?.trim() || seedContentBlocks.slice(1).join('\n\n') || '';
  const storyBody = config.story?.trim() || seedContentBlocks[0] || seed.content?.trim() || '';
  const locationAddress = config.venueAddress?.trim() || seedContentBlocks[0] || '';
  const dressCopy = resolveInvitationDressCodeCopy(config.dressCode);

  switch (seed.id) {
    case 'cuenta':
      return buildInvitationEditorElements([
        { id: 'cuenta-title', kind: 'title', value: seed.title || 'Cuenta regresiva' },
        {
          id: 'cuenta-panel',
          kind: 'container',
          value: 'Panel cuenta regresiva',
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: 'rgba(255,255,255,0.64)',
            borderColor: '#e8d6ad',
            borderWidth: 1,
            borderRadius: 32,
            shadow: true,
          },
        },
        ...(['Dias', 'Horas', 'Minutos', 'Segundos'].map((label, index) => ({
          id: `cuenta-tile-${index + 1}`,
          kind: 'container' as const,
          value: `Tarjeta ${label}`,
          position: { x: 0, y: 0 },
          style: {
            width: 66,
            height: 76,
            backgroundColor: 'rgba(255,255,255,0.78)',
            borderColor: '#f1e2bd',
            borderWidth: 1,
            borderRadius: 24,
            shadow: true,
          },
        }))),
      ]);
    case 'inicio':
      return buildInvitationEditorElements([
        { id: 'inicio-subtitle', kind: 'subtitle', value: config.subtitle || seed.subtitle },
        { id: 'inicio-title', kind: 'title', value: config.title || seed.title },
        { id: 'inicio-hosts', kind: 'content', value: heroHosts },
        { id: 'inicio-message', kind: 'content', value: heroMainMessage },
      ]);
    case 'historia':
      return buildInvitationEditorElements([
        { id: 'historia-title', kind: 'title', value: seed.title || 'Nuestra Historia' },
        {
          id: 'historia-card-main',
          kind: 'container',
          value: 'Tarjeta historia',
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: 'rgba(255,255,255,0.88)',
            borderColor: '#ecd8aa',
            borderWidth: 1,
            borderRadius: 28,
            shadow: true,
          },
        },
        { id: 'historia-story', kind: 'content', value: storyBody },
        ...((config.honorPeople ?? []).flatMap((person, index) => ([
          {
            id: `historia-card-honor-${index + 1}`,
            kind: 'container' as const,
            value: `Tarjeta honor ${index + 1}`,
            position: { x: 0, y: 0 },
            style: {
              backgroundColor: 'rgba(255,255,255,0.80)',
              borderColor: '#f8f1df',
              borderWidth: 1,
              borderRadius: 20,
              shadow: true,
            },
          },
          { id: `historia-honor-${index + 1}-role`, kind: 'content' as const, value: person.role },
          { id: `historia-honor-${index + 1}-names`, kind: 'content' as const, value: person.names },
        ]))),
      ]);
    case 'ubicacion':
      return buildInvitationEditorElements([
        { id: 'ubicacion-title', kind: 'title', value: config.venueName || seed.title },
        { id: 'ubicacion-address', kind: 'content', value: locationAddress },
      ]);
    case 'itinerario':
      return buildInvitationEditorElements([
        { id: 'itinerario-title', kind: 'title', value: seed.title || 'Programa del Dia' },
        ...((config.timeline ?? []).flatMap((item, index) => ([
          {
            id: `itinerario-card-${index + 1}`,
            kind: 'container' as const,
            value: `Tarjeta itinerario ${index + 1}`,
            position: { x: 0, y: 0 },
            style: {
              backgroundColor: 'rgba(255,255,255,0.54)',
              borderColor: '#f8f1df',
              borderWidth: 1,
              borderRadius: 28,
              shadow: true,
            },
          },
          {
            id: `itinerario-node-${index + 1}`,
            kind: 'container' as const,
            value: `Icono itinerario ${index + 1}`,
            position: { x: 0, y: 0 },
            style: {
              width: 28,
              height: 28,
              backgroundColor: '#ffffff',
              borderColor: '#d8b567',
              borderWidth: 1,
              borderRadius: 999,
              shadow: true,
            },
          },
        ]))),
      ]);
    case 'galeria':
      return buildInvitationEditorElements([
        { id: 'galeria-title', kind: 'title', value: seed.title || 'Galeria de Fotos' },
      ]);
    case 'detalles':
      return buildInvitationEditorElements([
        { id: 'detalles-title', kind: 'title', value: seed.title || 'Detalles del Evento' },
        { id: 'detalles-dress-name', kind: 'content', value: dressCopy.name },
        { id: 'detalles-dress-desc', kind: 'content', value: dressCopy.desc },
        { id: 'detalles-dress-extra', kind: 'content', value: config.dressCodeColor },
        ...((config.giftTables ?? []).flatMap((table, index) => ([
          { id: `detalles-gift-${index + 1}-name`, kind: 'content' as const, value: table.storeName },
          { id: `detalles-gift-${index + 1}-notes`, kind: 'content' as const, value: table.notes },
          { id: `detalles-gift-${index + 1}-account`, kind: 'content' as const, value: table.accountNumber },
        ]))),
      ]);
    case 'logistica':
      return buildInvitationEditorElements([
        { id: 'logistica-title', kind: 'title', value: seed.title || 'Logistica' },
        ...((config.specialNotes ?? []).map((note, index) => ({
          id: `logistica-note-${index + 1}`,
          kind: 'content' as const,
          value: note,
        }))),
        ...((config.recommendedStays ?? []).flatMap((stay, index) => ([
          { id: `logistica-stay-${index + 1}-name`, kind: 'content' as const, value: stay.name },
          { id: `logistica-stay-${index + 1}-address`, kind: 'content' as const, value: stay.address },
          { id: `logistica-stay-${index + 1}-notes`, kind: 'content' as const, value: stay.notes },
        ]))),
        { id: 'logistica-parking', kind: 'content', value: config.transportInfo?.parking },
        { id: 'logistica-shuttle', kind: 'content', value: config.transportInfo?.shuttle },
        { id: 'logistica-transport-notes', kind: 'content', value: config.transportInfo?.notes },
      ]);
    case 'mensajes':
      return buildInvitationEditorElements([
        { id: 'mensajes-title', kind: 'title', value: seed.title || 'Fotos y Buenos Deseos' },
        { id: 'mensajes-share-message', kind: 'content', value: config.photoShareMessage },
      ]);
    case 'musica':
      return buildInvitationEditorElements([
        { id: 'musica-title', kind: 'title', value: seed.title || 'Musica del evento' },
        { id: 'musica-subtitle', kind: 'subtitle', value: seed.subtitle },
        { id: 'musica-content', kind: 'content', value: seed.content },
      ]);
    case 'rsvp':
      return buildInvitationEditorElements([
        { id: 'rsvp-title', kind: 'title', value: seed.title || 'Confirma tu asistencia' },
        { id: 'rsvp-subtitle', kind: 'subtitle', value: seed.subtitle },
        { id: 'rsvp-content', kind: 'content', value: seed.content },
      ]);
    default:
      return [];
  }
};

const resolveEventWorkspaceTemplateElementValue = (
  section: Section,
  templateSection: Section,
  elementId: string,
  fallbackValue: string
) => {
  const contentBlocks = splitInvitationTextBlocks(section.content);

  if (elementId === `${templateSection.id}-title`) {
    return section.title?.trim() || fallbackValue;
  }

  if (elementId === `${templateSection.id}-subtitle`) {
    return section.subtitle?.trim() || fallbackValue;
  }

  if (elementId === 'inicio-hosts') {
    return contentBlocks[0] || fallbackValue;
  }

  if (elementId === 'inicio-message') {
    return contentBlocks.slice(1).join('\n\n') || fallbackValue;
  }

  if (elementId === 'historia-story') {
    return contentBlocks[0] || section.content?.trim() || fallbackValue;
  }

  if (elementId === 'ubicacion-address') {
    return contentBlocks[0] || section.content?.trim() || fallbackValue;
  }

  if (elementId === 'mensajes-share-message') {
    return section.content?.trim() || fallbackValue;
  }

  return fallbackValue;
};

const mergeEventWorkspaceInvitationSection = (
  section: Section,
  templateSection?: Section
): Section => {
  if (!templateSection) {
    return section;
  }

  const mergedSectionBase: Section = {
    ...templateSection,
    ...section,
    countdownTargetDate: section.countdownTargetDate ?? templateSection.countdownTargetDate,
    locationMapUrl: section.locationMapUrl || templateSection.locationMapUrl,
    audioUrl: section.audioUrl || templateSection.audioUrl,
    itineraryItems: section.itineraryItems?.length ? section.itineraryItems : templateSection.itineraryItems,
  };
  const templateElements = getSectionElements(templateSection);

  if (templateElements.length === 0) {
    return mergedSectionBase;
  }

  const existingElements = getSectionElements(section);
  const existingElementsById = new Map(existingElements.map((element) => [element.id, element]));
  const existingElementsByKind = new Map<SectionElement['kind'], SectionElement[]>();
  const consumedElementIndexes = new Map<SectionElement['kind'], number>();

  existingElements.forEach((element) => {
    const current = existingElementsByKind.get(element.kind) ?? [];
    current.push(element);
    existingElementsByKind.set(element.kind, current);
  });

  const resolvedTemplateElements = templateElements.map((templateElement) => {
    const directMatch = existingElementsById.get(templateElement.id);
    const sameKindElements = existingElementsByKind.get(templateElement.kind) ?? [];
    const nextKindIndex = consumedElementIndexes.get(templateElement.kind) ?? 0;
    const kindFallback = directMatch ? null : sameKindElements[nextKindIndex] ?? null;

    consumedElementIndexes.set(templateElement.kind, nextKindIndex + 1);

    return {
      ...templateElement,
      ...(kindFallback ? {
        position: kindFallback.position,
        layer: kindFallback.layer,
        style: kindFallback.style,
      } : {}),
      ...(directMatch ?? {}),
      value: directMatch?.value ?? resolveEventWorkspaceTemplateElementValue(
        section,
        templateSection,
        templateElement.id,
        templateElement.value
      ),
    };
  });

  const templateElementIds = new Set(templateElements.map((element) => element.id));
  const extraElements = existingElements.filter((element) => !templateElementIds.has(element.id) && !element.id.startsWith('legacy-'));

  return {
    ...mergedSectionBase,
    ...syncSectionElements(mergedSectionBase, [...resolvedTemplateElements, ...extraElements]),
  };
};

const buildEventWorkspaceInvitationSection = (
  seed: InvitationEditorSectionSeed,
  source: LoadedInvitationSource,
  record: EventPortalRecord
): Section => {
  const sharedSection = {
    id: seed.id,
    title: seed.title,
    subtitle: seed.subtitle,
    content: seed.content,
    bgValue: seed.bgValue || '#ffffff',
    textColor: seed.textColor || '#1f2937',
    height: seed.height || '100',
  };

  let nextSection: Section;

  switch (seed.kind) {
    case 'hero':
      nextSection = createSection({
        ...sharedSection,
        type: 'HERO',
        contentImageUrl: seed.contentImageUrl || seed.imageUrl,
        imageUrl: seed.imageUrl,
      });
      break;
    case 'countdown':
      nextSection = createSection({
        ...sharedSection,
        type: 'COUNTDOWN',
        countdownTargetDate: seed.countdownTargetDate || resolveInvitationSourceCountdownDate(source.config, record),
      });
      break;
    case 'location':
      nextSection = createSection({
        ...sharedSection,
        type: 'LOCATION',
        locationMapUrl: seed.locationMapUrl || source.config.venueMapsUrl || record.venueMapsUrl || record.venue || '',
      });
      break;
    case 'timeline':
      nextSection = createSection({
        ...sharedSection,
        type: 'ITINERARY',
        itineraryItems: (seed.itineraryItems ?? []).map((item, index) => ({
          id: item.id?.trim() || `${seed.id}-${index + 1}`,
          time: item.time?.trim() || '',
          title: item.title?.trim() || `Paso ${index + 1}`,
          icon: mapInvitationTimelineIcon(item.icon),
        })),
      });
      break;
    case 'gallery':
      nextSection = createSection({
        ...sharedSection,
        type: 'IMAGE',
        imageUrl: seed.imageUrl,
        contentImageUrl: seed.contentImageUrl,
      });
      break;
    case 'details':
      nextSection = createSection({
        ...sharedSection,
        type: 'DETAILS',
      });
      break;
    case 'music':
      nextSection = createSection({
        ...sharedSection,
        type: 'MUSIC',
        audioUrl: seed.audioUrl || source.config.backgroundMusicUrl,
      });
      break;
    case 'rsvp':
      nextSection = createSection({
        ...sharedSection,
        type: 'GUESTS',
      });
      break;
    case 'story':
    case 'logistics':
    case 'messages':
    default:
      nextSection = createSection({
        ...sharedSection,
        type: 'MESSAGE',
      });
      break;
  }

  const sectionElements = buildEventWorkspaceInvitationSectionElements(seed, source);
  if (sectionElements.length === 0) {
    return nextSection;
  }

  return {
    ...nextSection,
    ...syncSectionElements(nextSection, sectionElements),
  };
};

const buildEventWorkspaceInvitationData = (
  item: EventAdminWorkspaceItem,
  invitationSource?: LoadedInvitationSource | null
): InvitationData => {
  const record = item.record;
  const hostName = record.hostName?.trim() || 'Anfitrion por definir';
  const eventTitle = record.eventTitle?.trim() || 'Invitacion sin titulo';
  const venue = record.venue?.trim() || 'Lugar por confirmar';
  const eventDate = record.eventDate?.trim() || 'Fecha pendiente';

  if (invitationSource && invitationSource.sections.length > 0) {
    return {
      hostName: hostName || invitationSource.config.hosts?.trim() || 'Anfitrion por definir',
      eventTitle: eventTitle || invitationSource.config.title?.trim() || 'Invitacion sin titulo',
      globalBg: { type: 'color', value: resolveInvitationWorkspaceGlobalBg(invitationSource.config.theme) },
      sections: invitationSource.sections.map((seed) => buildEventWorkspaceInvitationSection(seed, invitationSource, record)),
    };
  }

  return {
    hostName,
    eventTitle,
    globalBg: { type: 'color', value: '#fff8f1' },
    sections: [
      createSection({
        type: 'HERO',
        title: eventTitle,
        subtitle: hostName,
        content: 'Edita esta portada con la identidad final del evento.',
        bgValue: '#fff1e6',
        textColor: '#9a3412',
      }),
      createSection({
        type: 'DETAILS',
        title: eventDate,
        subtitle: 'Datos principales',
        content: venue,
        bgValue: '#ffffff',
        height: '50',
      }),
      createSection({
        type: 'COUNTDOWN',
        title: 'Cuenta regresiva',
        subtitle: 'Falta poco para el evento',
        bgValue: '#fffaf5',
        countdownTargetDate: resolveEventCountdownDate(record),
        height: '50',
      }),
      createSection({
        type: 'LOCATION',
        title: 'Ubicacion',
        subtitle: 'Mapa del evento',
        content: venue,
        bgValue: '#ffffff',
        locationMapUrl: record.venueMapsUrl || venue,
      }),
      createSection({
        type: 'MESSAGE',
        title: 'Mensaje principal',
        subtitle: 'Texto editable',
        content: 'Aqui puedes pulir indicaciones, mensaje de bienvenida y notas finales antes de publicar.',
        bgValue: '#fff7ed',
        height: '75',
      }),
    ],
  };
};

const mergeEventWorkspaceInvitationData = (
  item: EventAdminWorkspaceItem,
  source: InvitationData | null,
  invitationSource?: LoadedInvitationSource | null
): InvitationData => {
  const baseData = buildEventWorkspaceInvitationData(item, invitationSource);
  if (!source) {
    return baseData;
  }

  const normalizedSource = normalizeEventWorkspaceInvitationDataAssets(item, source);
  if (!normalizedSource) {
    return baseData;
  }
  const baseSectionsById = new Map(baseData.sections.map((section) => [section.id, section]));
  const normalizedSections = normalizedSource.sections.length > 0
    ? normalizedSource.sections.map((section) => mergeEventWorkspaceInvitationSection(section, baseSectionsById.get(section.id)))
    : baseData.sections;
  const missingBaseSections = baseData.sections.filter((section) => !normalizedSections.some((current) => current.id === section.id));

  return {
    ...normalizedSource,
    hostName: normalizedSource.hostName.trim() || baseData.hostName,
    eventTitle: normalizedSource.eventTitle.trim() || baseData.eventTitle,
    sections: [...normalizedSections, ...missingBaseSections],
    globalBg: normalizedSource.globalBg?.value ? normalizedSource.globalBg : baseData.globalBg,
  };
};

const getWorkspaceHeader = (activeTab: string, step: 2 | 3, mode = 'default') => {
  if (mode === 'event-admin' && activeTab === 'dashboard') {
    return {
      eyebrow: 'Panel administrativo',
      title: 'Laboratorio interno por evento.',
      description: 'Carga eventos reales, entra a la base de cada invitacion y conserva el control interno separado del panel del cliente.',
    };
  }

  if (activeTab === 'templates') {
    return {
      eyebrow: 'Biblioteca de plantillas',
      title: 'Bases listas para vender rápido.',
      description: 'Abre una plantilla y manda al usuario directo al editor con una estructura ya armada.',
    };
  }

  if (activeTab === 'history') {
    return {
      eyebrow: 'Proyectos guardados',
      title: 'Continúa exactamente donde te quedaste.',
      description: 'Cada cuenta conserva sus borradores y piezas listas para compartir.',
    };
  }

  if (activeTab === 'settings') {
    return {
      eyebrow: 'Ajustes',
      title: 'Perfil y control de acceso.',
      description: 'Aquí se actualiza la foto circular del sidebar y los datos visibles del usuario.',
    };
  }

  if (activeTab === 'create') {
    return step === 3
      ? {
          eyebrow: 'Vista final',
          title: 'Revisión y salida de la invitación.',
          description: 'Confirma el resultado final, comparte el link y vuelve al editor si algo debe ajustarse.',
        }
      : {
          eyebrow: 'Editor modular',
          title: 'Arma la invitación seccion por seccion.',
          description: 'Mueve elementos, ajusta fondos, suma secciones y guarda borradores cuando lo necesites.',
        };
  }

  return {
    eyebrow: 'Resumen general',
    title: 'Tu nueva plataforma de invitaciones.',
    description: 'Administra plantillas, tutorial, acceso de usuarios y el constructor desde un solo dashboard.',
  };
};

const resolveWorkspaceErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return fallback;
};

const persistEventAdminEditorState = (
  storageKey: string,
  payload: {
    activeTab: string;
    activeCode: string | null;
  }
) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

interface AdminPanelProps {
  currentUser: UserSession;
  initialTab?: 'dashboard' | 'create' | 'history' | 'settings';
  onUpdateSession: (session: UserSession) => void;
  onLogout: () => void;
  mode?: 'default' | 'event-admin';
  eventItems?: EventAdminWorkspaceItem[];
  forcedEventCode?: string | null;
  livePreviewBaseUrl?: string | null;
  hideWorkspaceSidebar?: boolean;
  isEventWorkspaceBusy?: boolean;
  eventWorkspaceError?: string | null;
  isEventCreating?: boolean;
  onRefreshEvents?: () => void | Promise<void>;
  onCreateEvent?: (draft: EventPortalEventDraft) => Promise<EventPortalRecord>;
  onOpenEventPanel?: (record: EventPortalRecord) => void;
  onOpenInvitationProject?: (record: EventPortalRecord) => void | Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  initialTab = 'dashboard',
  onUpdateSession,
  onLogout,
  mode = 'default',
  eventItems = [],
  forcedEventCode = null,
  livePreviewBaseUrl = null,
  hideWorkspaceSidebar = false,
  isEventWorkspaceBusy = false,
  eventWorkspaceError = null,
  isEventCreating = false,
  onRefreshEvents,
  onCreateEvent,
  onOpenEventPanel,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(mode === 'event-admin');
  const defaultPackage = PACKAGES[0]?.id ?? PackageType.ELEGANT;
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(defaultPackage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [activeEventWorkspaceItem, setActiveEventWorkspaceItem] = useState<EventAdminWorkspaceItem | null>(null);
  const [activeEventProjectRecord, setActiveEventProjectRecord] = useState<InvitationProjectRecord | null>(null);
  const [savedEventProjectBuilderSnapshot, setSavedEventProjectBuilderSnapshot] = useState('');
  const [eventProjectBuilderUpdatedAt, setEventProjectBuilderUpdatedAt] = useState<string | null>(null);
  const [eventProjectBuilderError, setEventProjectBuilderError] = useState<string | null>(null);
  const [isEventProjectBuilderBusy, setIsEventProjectBuilderBusy] = useState(false);
  const [isEventProjectBuilderSaving, setIsEventProjectBuilderSaving] = useState(false);
  const [pendingArchiveItem, setPendingArchiveItem] = useState<EventAdminWorkspaceItem | null>(null);
  const [isEventProjectArchiveBusy, setIsEventProjectArchiveBusy] = useState(false);
  const [eventProjectArchiveTone, setEventProjectArchiveTone] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [eventProjectArchiveMessage, setEventProjectArchiveMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<InvitationData>(createEmptyFormData());
  const [countdownNow, setCountdownNow] = useState(() => Date.now());
  const [revealedSectionIds, setRevealedSectionIds] = useState<string[]>([]);
  const [previewRefreshToken, setPreviewRefreshToken] = useState(0);
  const previewSectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const finalPreviewViewportRef = React.useRef<HTMLDivElement | null>(null);
  const eventProjectBuilderRequestIdRef = React.useRef(0);
  const activeEventWorkspaceCodeRef = React.useRef<string | null>(null);
  const hasRestoredEventAdminStateRef = React.useRef(mode !== 'event-admin');
  const archiveInputRef = React.useRef<HTMLInputElement | null>(null);
  const storageKey = useMemo(() => `${STORAGE_KEY_PREFIX}${currentUser.id}`, [currentUser.id]);
  const eventAdminEditorStateKey = useMemo(
    () => `${EVENT_ADMIN_EDITOR_STATE_KEY_PREFIX}${currentUser.id}`,
    [currentUser.id]
  );
  const workspaceHeader = useMemo(() => getWorkspaceHeader(activeTab, step, mode), [activeTab, mode, step]);
  const completedDesigns = useMemo(
    () => savedDesigns.filter((design) => design.step === 3).length,
    [savedDesigns]
  );
  const normalizedForcedEventCode = useMemo(
    () => (typeof forcedEventCode === 'string' ? forcedEventCode.trim().toUpperCase() : ''),
    [forcedEventCode]
  );
  const normalizedLivePreviewBaseUrl = useMemo(
    () => (typeof livePreviewBaseUrl === 'string' ? livePreviewBaseUrl.trim() : ''),
    [livePreviewBaseUrl]
  );
  const isEventProjectEditorActive = mode === 'event-admin' && activeTab === 'create' && activeEventWorkspaceItem !== null;
  const isEmbeddedEventEditor = hideWorkspaceSidebar && isEventProjectEditorActive;
  const eventProjectBuilderSnapshot = useMemo(
    () => serializeEventProjectBuilderSnapshot(selectedPackage, formData),
    [formData, selectedPackage]
  );
  const hasUnsavedEventProjectBuilderChanges = isEventProjectEditorActive
    && eventProjectBuilderSnapshot !== savedEventProjectBuilderSnapshot;
  const resolvedEventProjectBuilderUpdatedAt = useMemo(() => (
    eventProjectBuilderUpdatedAt
      ? new Intl.DateTimeFormat('es-MX', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(eventProjectBuilderUpdatedAt))
      : null
  ), [eventProjectBuilderUpdatedAt]);
  const localEventProjectPreviewUrl = useMemo(() => {
    const activeCode = activeEventWorkspaceItem?.record.code?.trim() ?? '';
    if (activeCode === '' || typeof window === 'undefined') {
      return '';
    }

    return new URL(`/db/invitaciones/${encodeURIComponent(activeCode)}/dist/index.html`, window.location.origin).toString();
  }, [activeEventWorkspaceItem?.record.code]);
  const embeddedEditorStatusLabel = isEventProjectBuilderSaving
    ? 'Guardando...'
    : isEventProjectBuilderBusy
      ? 'Cargando diseño...'
      : isEventProjectArchiveBusy
        ? 'Procesando ZIP...'
        : hasUnsavedEventProjectBuilderChanges
          ? 'Cambios sin guardar'
          : resolvedEventProjectBuilderUpdatedAt
            ? `Guardado ${resolvedEventProjectBuilderUpdatedAt}`
            : 'Sin guardar';
  const embeddedEditorStatusClasses = isEventProjectBuilderSaving || isEventProjectBuilderBusy || isEventProjectArchiveBusy
    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
    : hasUnsavedEventProjectBuilderChanges
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  const eventProjectArchiveFeedbackClasses = eventProjectArchiveTone === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : eventProjectArchiveTone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-slate-200 bg-slate-50 text-slate-600';
  const resetEventProjectBuilderWorkspace = useCallback(() => {
    eventProjectBuilderRequestIdRef.current += 1;
    setActiveEventProjectRecord(null);
    setSavedEventProjectBuilderSnapshot('');
    setEventProjectBuilderUpdatedAt(null);
    setEventProjectBuilderError(null);
    setIsEventProjectBuilderBusy(false);
    setIsEventProjectBuilderSaving(false);
  }, []);

  const openEventProjectArchivePicker = useCallback((item: EventAdminWorkspaceItem) => {
    if (isEventProjectArchiveBusy) {
      return;
    }

    setPendingArchiveItem(item);
    archiveInputRef.current?.click();
  }, [isEventProjectArchiveBusy]);

  const handleDownloadEventProjectArchive = useCallback(async (item: EventAdminWorkspaceItem) => {
    if (isEventProjectArchiveBusy) {
      return;
    }

    setPendingArchiveItem(null);
    const targetCode = item.record.code;
    setIsEventProjectArchiveBusy(true);
    setEventProjectArchiveTone('neutral');
    setEventProjectArchiveMessage(`Preparando el ZIP editable de ${targetCode}...`);

    try {
      await downloadInvitationProjectArchive(targetCode);
      setEventProjectArchiveTone('success');
      setEventProjectArchiveMessage(`Se descargó el ZIP editable de ${targetCode}. Puedes modificar la carpeta y volverla a subir cuando quieras.`);
    } catch (error) {
      setEventProjectArchiveTone('error');
      setEventProjectArchiveMessage(resolveWorkspaceErrorMessage(error, 'No pudimos descargar el ZIP del proyecto.'));
    } finally {
      setIsEventProjectArchiveBusy(false);
    }
  }, [isEventProjectArchiveBusy]);

  const handleUploadEventProjectArchive = useCallback(async (item: EventAdminWorkspaceItem, file: File) => {
    if (isEventProjectArchiveBusy) {
      return;
    }

    const targetCode = item.record.code;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setPendingArchiveItem(null);
      setEventProjectArchiveTone('error');
      setEventProjectArchiveMessage('Sube un archivo ZIP con la carpeta del proyecto de la invitacion.');
      return;
    }

    setIsEventProjectArchiveBusy(true);
    setEventProjectArchiveTone('neutral');
    setEventProjectArchiveMessage(`Subiendo el ZIP de ${targetCode} y reemplazando su carpeta actual...`);

    try {
      const project = await uploadInvitationProjectArchive(targetCode, file);
      clearEventWorkspaceInvitationSourceCache(item);
      if (activeEventWorkspaceCodeRef.current === targetCode) {
        setActiveEventProjectRecord(project);
      }

      await onRefreshEvents?.();
      setPreviewRefreshToken((current) => current + 1);
      setEventProjectArchiveTone('success');
      setEventProjectArchiveMessage(`El ZIP de ${targetCode} ya sustituyó la carpeta ${project.projectPath} y dejó la vista previa compilada. Puedes seguir editando aquí o abrirla cuando quieras.`);
    } catch (error) {
      setEventProjectArchiveTone('error');
      setEventProjectArchiveMessage(resolveWorkspaceErrorMessage(error, 'No pudimos subir el ZIP del proyecto.'));
    } finally {
      setIsEventProjectArchiveBusy(false);
      setPendingArchiveItem(null);
    }
  }, [isEventProjectArchiveBusy, onRefreshEvents]);

  const handleEventProjectArchiveFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const targetItem = pendingArchiveItem;
    event.target.value = '';

    if (!file || !targetItem) {
      setPendingArchiveItem(null);
      return;
    }

    await handleUploadEventProjectArchive(targetItem, file);
  }, [handleUploadEventProjectArchive, pendingArchiveItem]);

  const loadEventProjectBuilderState = useCallback(async (item: EventAdminWorkspaceItem) => {
    const requestId = eventProjectBuilderRequestIdRef.current + 1;
    eventProjectBuilderRequestIdRef.current = requestId;
    setIsEventProjectBuilderBusy(true);
    setEventProjectBuilderError(null);

    try {
      const [builderStateRecord, invitationSource] = await Promise.all([
        fetchInvitationProjectBuilderState(item.record.code),
        loadEventWorkspaceInvitationSource(item),
      ]);
      if (eventProjectBuilderRequestIdRef.current !== requestId) {
        return;
      }

      const resolvedPackageId = resolveEventWorkspacePackageId(builderStateRecord.packageId, defaultPackage);
      const resolvedFormData = mergeEventWorkspaceInvitationData(
        item,
        builderStateRecord.hasBuilderState ? builderStateRecord.formData : null,
        invitationSource
      );

      setActiveEventProjectRecord(builderStateRecord.project);
      setSelectedPackage(resolvedPackageId);
      setFormData(resolvedFormData);
      setSavedEventProjectBuilderSnapshot(
        builderStateRecord.hasBuilderState
          ? serializeEventProjectBuilderSnapshot(resolvedPackageId, resolvedFormData)
          : ''
      );
      setEventProjectBuilderUpdatedAt(builderStateRecord.builderStateUpdatedAt);
    } catch (error) {
      if (eventProjectBuilderRequestIdRef.current !== requestId) {
        return;
      }

      setActiveEventProjectRecord(null);
      setFormData(buildEventWorkspaceInvitationData(item));
      setSavedEventProjectBuilderSnapshot('');
      setEventProjectBuilderUpdatedAt(null);
      setEventProjectBuilderError(resolveWorkspaceErrorMessage(error, 'No pudimos cargar el diseño del evento.'));
    } finally {
      if (eventProjectBuilderRequestIdRef.current === requestId) {
        setIsEventProjectBuilderBusy(false);
      }
    }
  }, [defaultPackage]);

  const handleSaveEventProjectBuilderState = useCallback(async () => {
    if (!activeEventWorkspaceItem) {
      return;
    }

    const targetCode = activeEventWorkspaceItem.record.code;
    const targetPackageId = selectedPackage ?? defaultPackage;
    if (!targetPackageId) {
      setEventProjectBuilderError('No encontramos el paquete visual para este evento.');
      return;
    }

    setIsEventProjectBuilderSaving(true);
    setEventProjectBuilderError(null);

    try {
      const [builderStateRecord, currentSourceRecord] = await Promise.all([
        saveInvitationProjectBuilderState(targetCode, targetPackageId, formData),
        fetchInvitationProjectSource(targetCode),
      ]);
      const nextSource = isLegacyInvitationProjectSource(currentSourceRecord.source)
        ? buildLegacyInvitationProjectSource(currentSourceRecord.source, formData, activeEventWorkspaceItem.record, targetPackageId)
        : buildStaticInvitationProjectSource(formData, activeEventWorkspaceItem.record, targetPackageId);
      const sourceRecord = await saveInvitationProjectSource(targetCode, nextSource);
      clearEventWorkspaceInvitationSourceCache(activeEventWorkspaceItem);
      const invitationSource = await loadEventWorkspaceInvitationSource(activeEventWorkspaceItem);
      if (activeEventWorkspaceCodeRef.current !== targetCode) {
        return;
      }

      const resolvedFormData = mergeEventWorkspaceInvitationData(
        activeEventWorkspaceItem,
        builderStateRecord.formData ?? formData,
        invitationSource
      );
      const resolvedPackageId = resolveEventWorkspacePackageId(builderStateRecord.packageId, targetPackageId);

      setActiveEventProjectRecord(sourceRecord.project);
      setSelectedPackage(resolvedPackageId);
      setFormData(resolvedFormData);
      setSavedEventProjectBuilderSnapshot(
        serializeEventProjectBuilderSnapshot(resolvedPackageId, resolvedFormData)
      );
      setEventProjectBuilderUpdatedAt(builderStateRecord.builderStateUpdatedAt);
      setPreviewRefreshToken((prev) => prev + 1);
    } catch (error) {
      if (activeEventWorkspaceCodeRef.current !== targetCode) {
        return;
      }

      setEventProjectBuilderError(resolveWorkspaceErrorMessage(error, 'No pudimos guardar el diseño del evento.'));
    } finally {
      if (activeEventWorkspaceCodeRef.current === targetCode) {
        setIsEventProjectBuilderSaving(false);
      }
    }
  }, [activeEventWorkspaceItem, defaultPackage, formData, selectedPackage]);

  useEffect(() => {
    if (mode === 'event-admin') {
      hasRestoredEventAdminStateRef.current = false;
    }
  }, [mode, currentUser.id]);

  useEffect(() => {
    activeEventWorkspaceCodeRef.current = activeEventWorkspaceItem?.record.code ?? null;
  }, [activeEventWorkspaceItem?.record.code]);

  useEffect(() => {
    const saved = parseSavedDesigns(window.localStorage.getItem(storageKey));
    setSavedDesigns(saved);
  }, [storageKey]);

  useEffect(() => {
    if (mode !== 'event-admin' || !hasRestoredEventAdminStateRef.current) {
      return;
    }

    persistEventAdminEditorState(eventAdminEditorStateKey, {
      activeTab,
      activeCode: activeEventWorkspaceItem?.record.code ?? null,
    });
  }, [activeEventWorkspaceItem?.record.code, activeTab, eventAdminEditorStateKey, mode]);

  useEffect(() => {
    if (mode !== 'event-admin') {
      return;
    }

    const activeCode = activeEventWorkspaceItem?.record.code;
    if (!activeCode) {
      return;
    }

    const refreshedItem = eventItems.find((item) => item.record.code === activeCode);
    if (!refreshedItem) {
      return;
    }

    if (refreshedItem.record.updatedAt === activeEventWorkspaceItem.record.updatedAt) {
      return;
    }

    setActiveEventWorkspaceItem(refreshedItem);
  }, [activeEventWorkspaceItem, eventItems, mode]);

  useEffect(() => {
    if (mode !== 'event-admin' || activeEventWorkspaceItem || eventItems.length === 0) {
      if (mode === 'event-admin' && eventItems.length > 0) {
        hasRestoredEventAdminStateRef.current = true;
      }
      return;
    }

    let parsedState: { activeTab?: string; activeCode?: string | null } | null = null;

    try {
      const raw = window.localStorage.getItem(eventAdminEditorStateKey);
      parsedState = raw ? JSON.parse(raw) as { activeTab?: string; activeCode?: string | null } : null;
    } catch {
      parsedState = null;
    }

    if (!parsedState) {
      hasRestoredEventAdminStateRef.current = true;
      return;
    }

    if (parsedState.activeTab === 'history' || parsedState.activeTab === 'settings' || parsedState.activeTab === 'dashboard') {
      setActiveTab(parsedState.activeTab);
    }

    if (parsedState.activeTab !== 'create' || !parsedState.activeCode) {
      hasRestoredEventAdminStateRef.current = true;
      return;
    }

    const restoredItem = eventItems.find((item) => item.record.code === parsedState?.activeCode);
    if (!restoredItem) {
      hasRestoredEventAdminStateRef.current = true;
      return;
    }

    resetEventProjectBuilderWorkspace();
    setActiveEventWorkspaceItem(restoredItem);
    setCurrentDesignId(null);
    setStep(2);
    setSelectedPackage(resolveEventWorkspacePackageId(restoredItem.record.packageId, defaultPackage));
    setInvitationId(restoredItem.record.invitationId ?? restoredItem.record.code);
    setFormData(createEmptyFormData());
    setTemplatesOpen(false);
    setActiveTab('create');
    hasRestoredEventAdminStateRef.current = true;
    void loadEventProjectBuilderState(restoredItem);
  }, [
    activeEventWorkspaceItem,
    defaultPackage,
    eventAdminEditorStateKey,
    eventItems,
    loadEventProjectBuilderState,
    mode,
    resetEventProjectBuilderWorkspace,
  ]);

  const saveCurrentDesign = useCallback((force = false) => {
    if (!selectedPackage) return;
    if (!force && !hasDraftContent(formData)) return;

    const now = new Date().toISOString();
    const designId = currentDesignId ?? Math.random().toString(36).slice(2, 11);

    if (!currentDesignId) {
      setCurrentDesignId(designId);
    }

    setSavedDesigns((prev) => {
      const existing = prev.find((item) => item.id === designId);

      const nextDesign: SavedDesign = {
        id: designId,
        packageId: selectedPackage,
        formData: JSON.parse(JSON.stringify(formData)) as InvitationData,
        step,
        invitationId,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      const next = sortByUpdatedAt([nextDesign, ...prev.filter((item) => item.id !== designId)]);

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }

      return next;
    });
  }, [currentDesignId, formData, invitationId, selectedPackage, step, storageKey]);

  useEffect(() => {
    if (activeTab !== 'create') return;
    if (isEventProjectEditorActive) return;
    if (!selectedPackage || !hasDraftContent(formData)) return;

    const timer = window.setTimeout(() => {
      saveCurrentDesign(false);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activeTab, formData, isEventProjectEditorActive, saveCurrentDesign, selectedPackage]);

  useEffect(() => {
    const hasCountdown = step === 3 && formData.sections.some((section) => section.type === 'COUNTDOWN');
    if (!hasCountdown) return;

    const timer = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [formData.sections, step]);

  useEffect(() => {
    setRevealedSectionIds([]);
  }, [step, formData.sections]);

  const handleGenerate = async () => {
    if (!selectedPackage) return;
    setIsGenerating(true);

    try {
      const { generateCreativeMessage } = await import('./services/geminiService');
      const hero = formData.sections.find((s) => s.type === 'HERO');
      const details = formData.sections.find((s) => s.type === 'DETAILS');

      const promptData = {
        eventTitle: formData.eventTitle || hero?.title || '',
        hostName: formData.hostName,
        date: details?.subtitle || '',
        venue: details?.content || '',
        additionalInfo: '',
      };

      const message = await generateCreativeMessage(promptData, selectedPackage);

      setFormData((prev) => ({
        ...prev,
        aiMessage: message,
        sections: prev.sections.map((s) => (s.type === 'MESSAGE' ? { ...s, content: message } : s)),
      }));

      setInvitationId(Math.random().toString(36).slice(2, 11));
      setStep(3);
    } catch {
      alert('Hubo un error generando tu invitación.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetCreator = () => {
    setCurrentDesignId(null);
    setStep(2);
    setSelectedPackage(defaultPackage);
    setInvitationId(null);
    setFormData(createEmptyFormData());
    setActiveEventWorkspaceItem(null);
    resetEventProjectBuilderWorkspace();
  };

  const removeSavedDesign = useCallback((designId: string) => {
    setSavedDesigns((prev) => {
      const next = prev.filter((item) => item.id !== designId);

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }

      return next;
    });
  }, [storageKey]);

  const handleOpenSavedDesign = (designId: string) => {
    const design = savedDesigns.find((item) => item.id === designId);
    if (!design) return;

    resetEventProjectBuilderWorkspace();
    setActiveEventWorkspaceItem(null);
    setCurrentDesignId(design.id);
    setSelectedPackage(design.packageId);
    setFormData(JSON.parse(JSON.stringify(design.formData)) as InvitationData);
    setStep(design.step === 3 ? 3 : 2);
    setInvitationId(design.invitationId);
    setActiveTab('create');
  };

  const handleDeleteSavedDesign = (designId: string) => {
    const confirmed = window.confirm('¿Eliminar este diseño guardado?');
    if (!confirmed) return;

    removeSavedDesign(designId);

    if (currentDesignId === designId) {
      resetCreator();
    }
  };

  const handleOpenBlankCreator = () => {
    resetCreator();
    setActiveTab('create');
    setTemplatesOpen(false);
  };

  const handleDeleteCurrentProject = () => {
    const hasCurrentContent = hasDraftContent(formData) || !!currentDesignId;
    if (!hasCurrentContent) {
      resetCreator();
      setTemplatesOpen(false);
      setActiveTab('history');
      return;
    }

    const confirmed = window.confirm('Estás a punto de borrar el proyecto. ¿Deseas continuar?');
    if (!confirmed) return;

    if (currentDesignId) {
      removeSavedDesign(currentDesignId);
    }

    resetCreator();
    setTemplatesOpen(false);
    setActiveTab('history');
  };

  const handleUseTemplate = (templateId: string) => {
    const draft = createTemplateDraft(templateId, currentUser.name);
    resetEventProjectBuilderWorkspace();
    setActiveEventWorkspaceItem(null);
    setCurrentDesignId(null);
    setStep(2);
    setSelectedPackage(draft.packageId);
    setInvitationId(null);
    setFormData(draft.formData);
    setActiveTab('create');
    setTemplatesOpen(false);
  };

  const handleUpdateProfile = (payload: { name: string; avatarUrl?: string }) => {
    const nextSession = updateCurrentUserProfile(payload);
    onUpdateSession(nextSession);
  };

  const handleEditEventInvitation = useCallback((item: EventAdminWorkspaceItem) => {
    hasRestoredEventAdminStateRef.current = true;
    persistEventAdminEditorState(eventAdminEditorStateKey, {
      activeTab: 'create',
      activeCode: item.record.code,
    });
    resetEventProjectBuilderWorkspace();
    setActiveEventWorkspaceItem(item);
    setCurrentDesignId(null);
    setStep(2);
    setSelectedPackage(resolveEventWorkspacePackageId(item.record.packageId, defaultPackage));
    setInvitationId(item.record.invitationId ?? item.record.code);
    setFormData(createEmptyFormData());
    setTemplatesOpen(false);
    setActiveTab('create');
    void loadEventProjectBuilderState(item);
  }, [defaultPackage, eventAdminEditorStateKey, loadEventProjectBuilderState, resetEventProjectBuilderWorkspace]);

  useEffect(() => {
    if (mode !== 'event-admin' || normalizedForcedEventCode === '' || eventItems.length === 0) {
      return;
    }

    const forcedItem = eventItems.find((item) => item.record.code === normalizedForcedEventCode);
    if (!forcedItem) {
      return;
    }

    if (activeTab === 'create' && activeEventWorkspaceItem?.record.code === normalizedForcedEventCode) {
      return;
    }

    handleEditEventInvitation(forcedItem);
  }, [
    activeEventWorkspaceItem?.record.code,
    activeTab,
    eventItems,
    handleEditEventInvitation,
    mode,
    normalizedForcedEventCode,
  ]);

  const currentPackage = useMemo(
    () => PACKAGES.find((p) => p.id === selectedPackage) ?? PACKAGES[0] ?? null,
    [selectedPackage]
  );

  const revealSectionInPreview = useCallback((sectionId: string) => {
    setRevealedSectionIds((prev) => (prev.includes(sectionId) ? prev : [...prev, sectionId]));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        previewSectionRefs.current[sectionId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  }, []);
  const refreshInvitationPreview = useCallback(() => {
    setPreviewRefreshToken((prev) => prev + 1);

    if (step !== 3) {
      return;
    }

    setRevealedSectionIds([]);

    window.requestAnimationFrame(() => {
      finalPreviewViewportRef.current?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, [step]);
  const resolvedLivePreviewBaseUrl = useMemo(() => {
    if (localEventProjectPreviewUrl !== '') {
      return localEventProjectPreviewUrl;
    }

    if (normalizedLivePreviewBaseUrl !== '') {
      return normalizedLivePreviewBaseUrl;
    }

    const projectPreviewUrl = activeEventProjectRecord?.previewUrl?.trim() ?? '';
    if (projectPreviewUrl !== '') {
      return projectPreviewUrl;
    }

    return localEventProjectPreviewUrl || null;
  }, [
    activeEventProjectRecord?.previewUrl,
    localEventProjectPreviewUrl,
    normalizedLivePreviewBaseUrl,
  ]);
  const hiddenSections = useMemo(
    () => formData.sections.filter((section) => section.revealOnDemand),
    [formData.sections]
  );
  const isCreateView = activeTab === 'create';
  const selectMainTab = (tab: 'dashboard' | 'create' | 'history' | 'settings') => {
    if (mode === 'event-admin') {
      hasRestoredEventAdminStateRef.current = true;
      persistEventAdminEditorState(eventAdminEditorStateKey, {
        activeTab: tab,
        activeCode: tab === 'create' ? activeEventWorkspaceItem?.record.code ?? null : null,
      });
    }

    setActiveTab(tab);
    setTemplatesOpen(false);
  };
  const toggleTemplatesSidebar = () => {
    setTemplatesOpen((current) => !current);
  };
  const openTemplatesSidebar = () => {
    setTemplatesOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[#f4f7fb]">
      {!hideWorkspaceSidebar ? (
        <Sidebar
          activeTab={activeTab}
          currentUser={currentUser}
          collapsed={isSidebarCollapsed}
          templatesOpen={templatesOpen}
          onSelectTab={selectMainTab}
          onToggleCollapsed={() => setIsSidebarCollapsed((prev) => !prev)}
          onToggleTemplates={toggleTemplatesSidebar}
        />
      ) : null}

      {!hideWorkspaceSidebar && templatesOpen && (
        <Suspense fallback={<div className="h-full w-[220px] shrink-0 border-r border-black/5 bg-white lg:w-[240px] xl:w-[280px]" />}>
          <TemplateSidebar
            onClose={() => setTemplatesOpen(false)}
            onUseTemplate={handleUseTemplate}
          />
        </Suspense>
      )}

      <main className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
        hideWorkspaceSidebar ? 'px-0 py-0 sm:px-2 sm:py-2 lg:px-3 lg:py-3' : 'px-3 py-3 lg:px-4'
      }`}>
        <input
          ref={archiveInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(event) => {
            void handleEventProjectArchiveFileChange(event);
          }}
        />
        <div className={`flex h-full w-full flex-col ${
          hideWorkspaceSidebar ? '' : 'mx-auto max-w-[1600px]'
        } ${isCreateView ? (isEmbeddedEventEditor ? 'gap-3' : 'gap-4') : 'gap-6'}`}>
          {!isCreateView && (
            <section className="rounded-[34px] border border-black/5 bg-white px-6 py-6 shadow-[0_16px_56px_rgba(15,23,42,0.05)] xl:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-600">{workspaceHeader.eyebrow}</p>
                  <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-950 lg:text-5xl">{workspaceHeader.title}</h1>
                  <p className="mt-4 text-sm leading-7 text-slate-600 lg:text-base">{workspaceHeader.description}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openTemplatesSidebar}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    Ver plantillas
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenBlankCreator}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
                  >
                    Nuevo proyecto
                  </button>
                </div>
              </div>
            </section>
          )}

          <Suspense fallback={<WorkspaceLoader />}>
            <div className={`${isCreateView ? 'flex h-full min-h-0 flex-col' : 'min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar'}`}>
              {eventProjectArchiveMessage ? (
                <div className={`mb-4 rounded-[22px] border px-4 py-3 text-sm ${eventProjectArchiveFeedbackClasses}`}>
                  {eventProjectArchiveMessage}
                </div>
              ) : null}
              {activeTab === 'dashboard' && (
                <Dashboard
                  currentUser={currentUser}
                  totalDesigns={savedDesigns.length}
                  completedDesigns={completedDesigns}
                  onOpenTemplates={openTemplatesSidebar}
                  onOpenCreator={handleOpenBlankCreator}
                  mode={mode}
                  eventItems={eventItems}
                  isEventWorkspaceBusy={isEventWorkspaceBusy}
                  eventWorkspaceError={eventWorkspaceError}
                  isEventCreating={isEventCreating}
                  onRefreshEvents={onRefreshEvents}
                  onCreateEvent={onCreateEvent}
                  onOpenEventPanel={onOpenEventPanel}
                  onEditEventInvitation={handleEditEventInvitation}
                  onDownloadEventArchive={handleDownloadEventProjectArchive}
                  onUploadEventArchive={openEventProjectArchivePicker}
                />
              )}

              {activeTab === 'history' && (
                <DesignHistory
                  designs={savedDesigns}
                  onOpenDesign={handleOpenSavedDesign}
                  onDeleteDesign={handleDeleteSavedDesign}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPanel
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={() => {
                    signOut();
                    onLogout();
                  }}
                />
              )}

              {activeTab === 'create' && (
                <div className={`animate-in fade-in duration-500 flex h-full min-h-0 flex-col ${isEmbeddedEventEditor ? 'space-y-2' : 'space-y-4'}`}>
                  {isEmbeddedEventEditor ? (
                    <div className="rounded-[24px] border border-black/5 bg-white px-3 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {activeEventWorkspaceItem ? (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
                                {activeEventWorkspaceItem.record.code}
                              </span>
                            ) : null}
                            <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${embeddedEditorStatusClasses}`}>
                              {embeddedEditorStatusLabel}
                            </span>
                          </div>
                          <input
                            type="text"
                            aria-label="Título del proyecto"
                            value={formData.eventTitle}
                            onChange={(e) => setFormData((prev) => ({ ...prev, eventTitle: e.target.value }))}
                            placeholder="Título principal de la invitación"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold tracking-tight text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white"
                          />
                        </div>

                        {activeEventWorkspaceItem ? (
                          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                            <button
                              type="button"
                              onClick={() => void loadEventProjectBuilderState(activeEventWorkspaceItem)}
                              disabled={isEventProjectBuilderBusy || isEventProjectBuilderSaving || isEventProjectArchiveBusy}
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Recargar
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleSaveEventProjectBuilderState()}
                              disabled={isEventProjectBuilderBusy || isEventProjectBuilderSaving || isEventProjectArchiveBusy || !hasUnsavedEventProjectBuilderChanges}
                              className="rounded-full bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isEventProjectBuilderSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDownloadEventProjectArchive(activeEventWorkspaceItem)}
                              disabled={isEventProjectArchiveBusy || isEventProjectBuilderBusy || isEventProjectBuilderSaving}
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              ZIP
                            </button>
                            <button
                              type="button"
                              onClick={() => openEventProjectArchivePicker(activeEventWorkspaceItem)}
                              disabled={isEventProjectArchiveBusy || isEventProjectBuilderBusy || isEventProjectBuilderSaving}
                              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Subir ZIP
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_16px_46px_rgba(15,23,42,0.05)]">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <h1 className="text-[1.7rem] font-black tracking-[-0.05em] text-slate-950 lg:text-[2rem]">
                            {workspaceHeader.title}
                          </h1>
                          <div className="mt-3 max-w-3xl">
                            <input
                              type="text"
                              aria-label="Título del proyecto"
                              value={formData.eventTitle}
                              onChange={(e) => setFormData((prev) => ({ ...prev, eventTitle: e.target.value }))}
                              placeholder={
                                isEventProjectEditorActive
                                  ? 'Título principal de la invitación'
                                  : 'Título del proyecto · Ej. Boda de Ana y Luis'
                              }
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold tracking-tight text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white"
                            />
                          </div>
                          {mode === 'event-admin' && activeEventWorkspaceItem ? (
                            <div className="mt-4 grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
                              <div className="rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Codigo</p>
                                <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-slate-950">{activeEventWorkspaceItem.record.code}</p>
                              </div>
                              <div className="rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Carpeta</p>
                                <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-slate-700">
                                  {activeEventProjectRecord?.projectPath ?? activeEventWorkspaceItem.projectPath}
                                </code>
                              </div>
                              <div className="rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Ultimo guardado</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {resolvedEventProjectBuilderUpdatedAt ?? 'Aun sin guardar en el laboratorio'}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                                <button
                                  type="button"
                                  onClick={() => void loadEventProjectBuilderState(activeEventWorkspaceItem)}
                                  disabled={isEventProjectBuilderBusy || isEventProjectBuilderSaving || isEventProjectArchiveBusy}
                                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isEventProjectBuilderBusy ? 'Cargando...' : 'Recargar diseño'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleSaveEventProjectBuilderState()}
                                  disabled={isEventProjectBuilderBusy || isEventProjectBuilderSaving || isEventProjectArchiveBusy || !hasUnsavedEventProjectBuilderChanges}
                                  className="rounded-full bg-slate-950 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isEventProjectBuilderSaving ? 'Guardando...' : 'Guardar diseño'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDownloadEventProjectArchive(activeEventWorkspaceItem)}
                                  disabled={isEventProjectArchiveBusy || isEventProjectBuilderBusy || isEventProjectBuilderSaving}
                                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isEventProjectArchiveBusy && pendingArchiveItem === null ? 'Procesando ZIP...' : 'Descargar ZIP'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEventProjectArchivePicker(activeEventWorkspaceItem)}
                                  disabled={isEventProjectArchiveBusy || isEventProjectBuilderBusy || isEventProjectBuilderSaving}
                                  className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isEventProjectArchiveBusy && pendingArchiveItem?.record.code === activeEventWorkspaceItem.record.code ? 'Subiendo ZIP...' : 'Subir ZIP'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenEventPanel?.(activeEventWorkspaceItem.record)}
                                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                                >
                                  Abrir panel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                          {isEventProjectEditorActive ? (
                            <p className="max-w-xs text-right text-[11px] font-semibold leading-5 text-slate-500">
                              Este evento ya se edita dentro del laboratorio principal. Mobile, tablet y web salen desde el mismo constructor, sin abrir un editor separado.
                            </p>
                          ) : (
                            <>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveCurrentDesign(true)}
                                  aria-label="Guardar borrador"
                                  title="Guardar borrador"
                                  className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-amber-100 bg-white text-amber-600 shadow-[0_8px_18px_rgba(217,119,6,0.10)] transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.85}
                                      d="M12 16V8m0 8l-3-3m3 3l3-3M6.75 19.25h10.5A1.75 1.75 0 0019 17.5v-11A1.75 1.75 0 0017.25 4.75H6.75A1.75 1.75 0 005 6.5v11a1.75 1.75 0 001.75 1.75z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleGenerate}
                                  disabled={isGenerating}
                                  aria-label="Finalizar proyecto"
                                  title="Finalizar proyecto"
                                  className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-emerald-100 bg-white text-emerald-600 shadow-[0_8px_18px_rgba(5,150,105,0.10)] transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isGenerating ? (
                                    <svg className="h-[18px] w-[18px] animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                                      <path
                                        className="opacity-90"
                                        fill="currentColor"
                                        d="M12 3a9 9 0 018.46 5.94l-2.35.78A6.5 6.5 0 0012 5.5V3z"
                                      />
                                    </svg>
                                  ) : (
                                    <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.85}
                                        d="M8.5 12.5l2.5 2.5 4.5-5m4 2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>

                              <div className="hidden h-8 w-px bg-slate-200/80 sm:block" aria-hidden="true" />

                              <button
                                type="button"
                                onClick={handleDeleteCurrentProject}
                                aria-label="Borrar proyecto"
                                title="Borrar proyecto"
                                className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-rose-100 bg-white text-rose-600 shadow-[0_8px_18px_rgba(225,29,72,0.08)] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.85}
                                    d="M9.25 9.25v6.5m5.5-6.5v6.5M4.75 6.75h14.5m-10-2h5.5m-7.25 2l.56 10.34A1.5 1.5 0 009.55 18.5h4.9a1.5 1.5 0 001.49-1.41l.56-10.34"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isEventProjectEditorActive && activeEventWorkspaceItem && currentPackage ? (
                    <div className={`grid min-h-0 flex-1 ${isEmbeddedEventEditor ? 'gap-2 lg:gap-3' : 'gap-3'}`}>
                      {eventProjectBuilderError ? (
                        <div className={`border border-rose-200 bg-rose-50 text-rose-700 ${
                          isEmbeddedEventEditor ? 'rounded-[20px] px-4 py-2.5 text-[13px]' : 'rounded-[22px] px-4 py-3 text-sm'
                        }`}>
                          {eventProjectBuilderError}
                        </div>
                      ) : null}
                      {!isEmbeddedEventEditor ? (
                        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          El ZIP siempre trabaja sobre la carpeta real del evento. Puedes descargarla, modificarla fuera del sistema y subirla de nuevo para sustituir ese proyecto sin volver a crear el evento.
                        </div>
                      ) : null}
                      {isEventProjectBuilderBusy && !isEmbeddedEventEditor ? (
                        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          Cargando el diseño guardado del evento dentro del laboratorio...
                        </div>
                      ) : null}
                      {!isEventProjectBuilderBusy && !eventProjectBuilderUpdatedAt && !isEmbeddedEventEditor ? (
                        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          Este evento todavía no tiene un diseño guardado en el laboratorio. Ya preparé la invitación real del proyecto en secciones editables para que ajustes cada bloque y lo guardes aquí.
                        </div>
                      ) : null}
                      <div className="animate-in slide-in-from-bottom-4 duration-500 flex min-h-0 flex-1 flex-col">
                        <VisualBuilder
                          sections={formData.sections}
                          onUpdateSections={(newSections) => setFormData((prev) => ({ ...prev, sections: newSections }))}
                          pkg={currentPackage}
                          onRefreshPreview={refreshInvitationPreview}
                          projectTitle={formData.eventTitle}
                          globalBg={formData.globalBg}
                          onUpdateGlobalBg={(bg) => setFormData((prev) => ({ ...prev, globalBg: bg }))}
                          previewRefreshToken={previewRefreshToken}
                          livePreviewBaseUrl={resolvedLivePreviewBaseUrl}
                          focusMode={isEmbeddedEventEditor}
                        />
                      </div>
                    </div>
                  ) : step === 2 && currentPackage ? (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 flex min-h-0 flex-1 flex-col">
                  <VisualBuilder
                    sections={formData.sections}
                    onUpdateSections={(newSections) => setFormData((prev) => ({ ...prev, sections: newSections }))}
                    pkg={currentPackage}
                    onRefreshPreview={refreshInvitationPreview}
                    projectTitle={formData.eventTitle}
                    globalBg={formData.globalBg}
                    onUpdateGlobalBg={(bg) => setFormData((prev) => ({ ...prev, globalBg: bg }))}
                    previewRefreshToken={previewRefreshToken}
                    livePreviewBaseUrl={resolvedLivePreviewBaseUrl}
                    focusMode={false}
                  />
                    </div>
                  ) : null}

                  {step === 3 && currentPackage && (
                    <div className="grid grid-cols-1 items-start gap-10 animate-in zoom-in-95 duration-500 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <ActionPanel invitationId={invitationId} onEdit={() => setStep(2)} />
                  </div>
                  <div className="flex flex-col items-center justify-center lg:col-span-5">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">Vista Final</p>
                    <div
                      className="relative aspect-[9/19] w-full max-w-[320px] overflow-hidden rounded-[34px] border-[12px] border-slate-950 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]"
                    >
                      <div ref={finalPreviewViewportRef} className="h-full overflow-y-auto custom-scrollbar">
                        <div
                          className={formData.sections.length === 0 ? 'min-h-full' : ''}
                          style={{
                            backgroundColor: formData.globalBg?.type === 'color' ? formData.globalBg.value : 'transparent',
                            backgroundImage: formData.globalBg?.type === 'image' ? `url(${formData.globalBg.value})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }}
                        >
                          {hiddenSections.length > 0 && (
                            <div className="sticky top-0 z-20 border-b border-black/5 bg-white px-3 py-3">
                              <p className="mb-2 text-[7px] font-black uppercase tracking-[0.18em] text-gray-400">Accesos rápidos</p>
                              <div className="flex flex-wrap gap-1.5">
                                {hiddenSections.map((hiddenSection) => {
                                  const isRevealed = revealedSectionIds.includes(hiddenSection.id);
                                  return (
                                    <button
                                      key={hiddenSection.id}
                                      type="button"
                                      onClick={() => revealSectionInPreview(hiddenSection.id)}
                                      className={`rounded-full px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.16em] transition-colors ${
                                        isRevealed
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                      }`}
                                    >
                                      {getRevealButtonLabel(hiddenSection)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {formData.sections.length > 0 && (
                            <div className="h-2 shrink-0" aria-hidden="true" />
                          )}

                          {formData.sections.map((section) => {
                            const isHiddenUntilReveal = !!section.revealOnDemand && !revealedSectionIds.includes(section.id);
                            if (isHiddenUntilReveal) {
                              return null;
                            }

                            const countdownParts = getCountdownParts(section.countdownTargetDate, countdownNow);
                            const countdownFontSize = Math.max(14, section.countdownStyle?.fontSize ?? section.fontSize ?? 16);
                            const countdownFontFamily = section.countdownStyle?.fontFamily ?? section.fontFamily ?? 'Inter';
                            const countdownFontWeight = section.countdownStyle?.fontWeight ?? section.fontWeight ?? '700';
                            const countdownFontStyle = section.countdownStyle?.fontStyle ?? section.fontStyle ?? 'normal';
                            const countdownTextColor = section.countdownStyle?.textColor ?? section.textColor ?? '#1a1a1a';
                            const countdownScale = Math.max(20, Math.min(300, section.countdownStyle?.scale ?? 100));
                            const countdownItemGap = section.countdownStyle?.itemGap !== undefined
                              ? Math.max(0, Math.min(96, section.countdownStyle.itemGap))
                              : undefined;
                            const locationEmbedUrl = getGoogleMapsEmbedUrl(section.locationMapUrl);
                            const locationOpenUrl = getGoogleMapsOpenUrl(section.locationMapUrl);
                            const previewCountdownPosition = getPreviewPosition(section, 'countdown');
                            const previewGuestsPosition = getPreviewPosition(section, 'guests');
                            const previewLocationPosition = getPreviewPosition(section, 'location');
                            const previewMusicPosition = getPreviewPosition(section, 'music');
                            const repeatableElements = getSectionElements(section);
                            const backgroundImageElement = repeatableElements.find((element) => element.kind === 'image' && element.style?.asSectionBackground && !!element.value) || null;
                            const mainImageElements = repeatableElements.filter((element) => element.kind === 'image' && element.value && !element.style?.asSectionBackground);
                            const containerElements = repeatableElements.filter((element) => element.kind === 'container');
                            const titleElements = repeatableElements.filter((element) => element.kind === 'title' && element.value !== '');
                            const subtitleElements = repeatableElements.filter((element) => element.kind === 'subtitle' && element.value !== '');
                            const contentElements = repeatableElements.filter((element) => element.kind === 'content' && element.value !== '');
                            const contentImageElements = repeatableElements.filter((element) => element.kind === 'contentImage' && element.value);
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
                            return (
                            <div
                              key={section.id}
                              ref={(node) => {
                                previewSectionRefs.current[section.id] = node;
                              }}
                              className={`relative overflow-visible ${currentPackage.fontClass}`}
                              style={{
                                backgroundColor: section.bgType === 'color' ? section.bgValue : 'transparent',
                                backgroundImage:
                                  backgroundImageElement
                                    ? `url(${backgroundImageElement.value})`
                                    : section.bgType === 'image'
                                      ? `url(${section.bgValue})`
                                      : 'none',
                                backgroundSize:
                                  backgroundImageElement
                                    ? (backgroundImageElement.style?.fit === 'cover' ? 'cover' : 'contain')
                                    : 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                color: section.textColor || '#1a1a1a',
                                fontFamily: section.fontFamily || 'inherit',
                                textAlign: section.alignment || 'center',
                                minHeight:
                                  section.height === '25'
                                    ? '25%'
                                    : section.height === '50'
                                      ? '50%'
                                      : section.height === '75'
                                        ? '75%'
                                        : '100%',
                              }}
                            >
                              <div className="relative h-full w-full min-h-full p-4">
                                {isItinerary && (
                                  <ItineraryTimeline
                                    items={section.itineraryItems}
                                    textColor={section.textColor || '#1a1a1a'}
                                    fontFamily={section.fontFamily || 'Inter'}
                                    fontSize={section.fontSize || 16}
                                    fontWeight={section.fontWeight || '600'}
                                    fontStyle={section.fontStyle || 'normal'}
                                    styleConfig={section.itineraryStyle}
                                    className="pb-4"
                                  />
                                )}

                                {section.type === 'COUNTDOWN' && (
                                  <div
                                    className="absolute"
                                    style={{ left: previewCountdownPosition.left, top: previewCountdownPosition.top, width: 'fit-content', zIndex: 10000 }}
                                  >
                                    <CountdownDisplay
                                      parts={countdownParts}
                                      fontSize={countdownFontSize}
                                      fontFamily={countdownFontFamily}
                                      fontWeight={countdownFontWeight}
                                      fontStyle={countdownFontStyle}
                                      textColor={countdownTextColor}
                                      scale={countdownScale}
                                      itemGap={countdownItemGap}
                                      title={countdownTitleValue}
                                      titleFontSize={countdownTitleFontSize}
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
                                        borderRadius: countdownPanelStyle.borderRadius,
                                        opacity: countdownPanelStyle.opacity,
                                        shadow: countdownPanelStyle.shadow,
                                      }}
                                      tileStyle={{
                                        width: countdownTileStyle.width,
                                        height: countdownTileStyle.height,
                                        backgroundColor: countdownTileStyle.backgroundColor,
                                        borderColor: countdownTileStyle.borderColor,
                                        borderWidth: countdownTileStyle.borderWidth,
                                        borderRadius: countdownTileStyle.borderRadius,
                                        opacity: countdownTileStyle.opacity,
                                        shadow: countdownTileStyle.shadow,
                                      }}
                                    />
                                  </div>
                                )}

                                {section.type === 'GUESTS' && (
                                  <div
                                    className="absolute w-[140px]"
                                    style={{ left: previewGuestsPosition.left, top: previewGuestsPosition.top, zIndex: 10000 }}
                                  >
                                    <div className="rounded-2xl border border-black/5 bg-black/5 p-2">
                                      <div className="mb-1 flex items-center justify-between">
                                        <span className="text-[7px] font-bold uppercase tracking-tighter opacity-70">Confirmar</span>
                                        <span className="text-[7px]">RSVP</span>
                                      </div>
                                      <div className="mb-1 h-3 rounded-md bg-white/50" />
                                      <div className="h-3 rounded-md bg-indigo-500/20" />
                                    </div>
                                  </div>
                                )}

                                {section.type === 'MUSIC' && section.audioUrl && (
                                  <div
                                    className="absolute w-[220px]"
                                    style={{ left: previewMusicPosition.left, top: previewMusicPosition.top, zIndex: 10000 }}
                                  >
                                    <audio controls preload="metadata" src={section.audioUrl} className="w-full" />
                                  </div>
                                )}

                                {containerElements.map((element) => {
                                  const previewContainerPosition = getPreviewElementPosition('container', element.position);
                                  const previewContainerStyle = getSectionContainerStyle(element);
                                  const previewContainerMotion = getElementPreviewMotion(element, previewRefreshToken);

                                  return (
                                    <motion.div
                                      key={previewContainerMotion.replayKey}
                                      initial={previewContainerMotion.initial}
                                      animate={previewContainerMotion.animate}
                                      transition={previewContainerMotion.transition}
                                      className="absolute"
                                      style={{
                                        left: previewContainerPosition.left,
                                        top: previewContainerPosition.top,
                                        zIndex: getSectionElementLayer(element),
                                        width: previewContainerStyle.width ?? 240,
                                        height: previewContainerStyle.height ?? 140,
                                        backgroundColor: previewContainerStyle.backgroundColor || 'transparent',
                                        borderColor: previewContainerStyle.borderColor || '#1f2937',
                                        borderStyle: 'solid',
                                        borderWidth: previewContainerStyle.borderWidth ?? 2,
                                        borderRadius: previewContainerStyle.borderRadius ?? 24,
                                        opacity: Math.max(0, Math.min(100, previewContainerStyle.opacity ?? 100)) / 100,
                                        boxShadow: previewContainerStyle.shadow
                                          ? '0 18px 40px rgba(15, 23, 42, 0.16)'
                                          : 'none',
                                      }}
                                    />
                                  );
                                })}

                                {mainImageElements.map((element) => {
                                  const previewImagePosition = getPreviewElementPosition('image', element.position);
                                  const previewMainImageStyle = getSectionImageStyle(element, section, 'image');
                                  const previewMainImageMotion = getElementPreviewMotion(element, previewRefreshToken);
                                  const previewMainImageBox = {
                                    width: previewMainImageStyle.width ?? PREVIEW_MAIN_IMAGE_BOX.width,
                                    height: previewMainImageStyle.height ?? PREVIEW_MAIN_IMAGE_BOX.height,
                                  };

                                  return (
                                    <motion.div
                                      key={previewMainImageMotion.replayKey}
                                      initial={previewMainImageMotion.initial}
                                      animate={previewMainImageMotion.animate}
                                      transition={previewMainImageMotion.transition}
                                      className="absolute overflow-hidden rounded-xl shadow-sm"
                                      style={{
                                        left: previewImagePosition.left,
                                        top: previewImagePosition.top,
                                        zIndex: getSectionElementLayer(element),
                                        width: previewMainImageBox.width,
                                        height: previewMainImageBox.height,
                                      }}
                                    >
                                      <img
                                        src={element.value || 'https://via.placeholder.com/600x700'}
                                        alt="Imagen de sección"
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        className={`h-full w-full ${previewMainImageStyle.fit === 'cover' ? 'object-cover' : 'object-contain'} origin-center`}
                                        style={getImagePresentationStyle(Math.max(20, Math.min(300, previewMainImageStyle.scale ?? 100)) / 100)}
                                      />
                                    </motion.div>
                                  );
                                })}

                                {!isItinerary && titleElements.map((element) => {
                                  const previewTitlePosition = getPreviewElementPosition('title', element.position);
                                  const previewTitleMotion = getElementPreviewMotion(element, previewRefreshToken);
                                  const previewTitleStyle = getSectionTextStyle(element);
                                  return (
                                    <motion.div
                                      key={previewTitleMotion.replayKey}
                                      initial={previewTitleMotion.initial}
                                      animate={previewTitleMotion.animate}
                                      transition={previewTitleMotion.transition}
                                      className="absolute"
                                      style={{ left: previewTitlePosition.left, top: previewTitlePosition.top, zIndex: getSectionElementLayer(element) }}
                                    >
                                      <h4
                                        className="font-black uppercase whitespace-pre-wrap"
                                        style={{
                                          fontSize: `${previewTitleStyle.fontSize ?? section.fontSize ?? 14}px`,
                                          fontWeight: previewTitleStyle.fontWeight ?? section.fontWeight ?? '900',
                                          fontStyle: previewTitleStyle.fontStyle ?? section.fontStyle ?? 'normal',
                                          color: previewTitleStyle.textColor ?? section.textColor ?? 'inherit',
                                          fontFamily: previewTitleStyle.fontFamily ?? section.fontFamily ?? 'inherit',
                                          textAlign: previewTitleStyle.textAlign ?? section.alignment ?? 'center',
                                        }}
                                      >
                                        {element.value}
                                      </h4>
                                    </motion.div>
                                  );
                                })}
                                {!isItinerary && subtitleElements.map((element) => {
                                  const previewSubtitlePosition = getPreviewElementPosition('subtitle', element.position);
                                  const previewSubtitleMotion = getElementPreviewMotion(element, previewRefreshToken);
                                  const previewSubtitleStyle = getSectionTextStyle(element);
                                  return (
                                    <motion.div
                                      key={previewSubtitleMotion.replayKey}
                                      initial={previewSubtitleMotion.initial}
                                      animate={previewSubtitleMotion.animate}
                                      transition={previewSubtitleMotion.transition}
                                      className="absolute"
                                      style={{ left: previewSubtitlePosition.left, top: previewSubtitlePosition.top, zIndex: getSectionElementLayer(element) }}
                                    >
                                      <p
                                        className="uppercase opacity-70 whitespace-pre-wrap"
                                        style={{
                                          fontSize: `${previewSubtitleStyle.fontSize ?? section.fontSize ?? 14}px`,
                                          fontWeight: previewSubtitleStyle.fontWeight ?? section.fontWeight ?? '900',
                                          fontStyle: previewSubtitleStyle.fontStyle ?? section.fontStyle ?? 'normal',
                                          color: previewSubtitleStyle.textColor ?? section.textColor ?? 'inherit',
                                          fontFamily: previewSubtitleStyle.fontFamily ?? section.fontFamily ?? 'inherit',
                                          textAlign: previewSubtitleStyle.textAlign ?? section.alignment ?? 'center',
                                        }}
                                      >
                                        {element.value}
                                      </p>
                                    </motion.div>
                                  );
                                })}
                                {!isItinerary && contentElements.map((element) => {
                                  const previewContentPosition = getPreviewElementPosition('content', element.position);
                                  const previewContentMotion = getElementPreviewMotion(element, previewRefreshToken);
                                  const previewContentStyle = getSectionTextStyle(element);
                                  return (
                                    <motion.div
                                      key={previewContentMotion.replayKey}
                                      initial={previewContentMotion.initial}
                                      animate={previewContentMotion.animate}
                                      transition={previewContentMotion.transition}
                                      className="absolute max-w-[260px]"
                                      style={{ left: previewContentPosition.left, top: previewContentPosition.top, zIndex: getSectionElementLayer(element) }}
                                    >
                                      <p
                                        className="uppercase opacity-80 whitespace-pre-wrap"
                                        style={{
                                          fontSize: `${previewContentStyle.fontSize ?? section.fontSize ?? 14}px`,
                                          fontWeight: previewContentStyle.fontWeight ?? section.fontWeight ?? '900',
                                          fontStyle: previewContentStyle.fontStyle ?? section.fontStyle ?? 'normal',
                                          color: previewContentStyle.textColor ?? section.textColor ?? 'inherit',
                                          fontFamily: previewContentStyle.fontFamily ?? section.fontFamily ?? 'inherit',
                                          textAlign: previewContentStyle.textAlign ?? section.alignment ?? 'center',
                                        }}
                                      >
                                        {element.value}
                                      </p>
                                    </motion.div>
                                  );
                                })}
                                {section.type === 'LOCATION' && (
                                  <div
                                    className="absolute w-full max-w-[270px] overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm"
                                    style={{ left: previewLocationPosition.left, top: previewLocationPosition.top, zIndex: 10000 }}
                                  >
                                      {locationEmbedUrl ? (
                                        <iframe
                                          src={locationEmbedUrl}
                                          title={`Mapa ${section.id}`}
                                          className="h-40 w-full border-0"
                                          loading="lazy"
                                          referrerPolicy="no-referrer-when-downgrade"
                                        />
                                      ) : (
                                        <div className="flex h-32 items-center justify-center px-4 text-center text-[8px] font-black uppercase tracking-[0.16em] text-gray-400">
                                          Agrega un link de Google Maps para mostrar el mapa.
                                        </div>
                                      )}
                                      {locationOpenUrl && (
                                        <div className="border-t border-black/5 p-2">
                                          <a
                                            href={locationOpenUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-xl bg-indigo-600 px-2 py-1.5 text-center text-[7px] font-black uppercase tracking-[0.16em] text-white"
                                          >
                                            Abrir en Google Maps
                                          </a>
                                        </div>
                                      )}
                                  </div>
                                )}
                                {contentImageElements.map((element) => {
                                  const previewContentImagePosition = getPreviewElementPosition('contentImage', element.position);
                                  const previewContentImageStyle = getSectionImageStyle(element, section, 'contentImage');
                                  const previewContentImageMotion = getElementPreviewMotion(element, previewRefreshToken);
                                  const previewContentImageBox = {
                                    width: previewContentImageStyle.width ?? PREVIEW_CONTENT_IMAGE_BOX.width,
                                    height: previewContentImageStyle.height ?? PREVIEW_CONTENT_IMAGE_BOX.height,
                                  };

                                  return (
                                    <motion.div
                                      key={previewContentImageMotion.replayKey}
                                      initial={previewContentImageMotion.initial}
                                      animate={previewContentImageMotion.animate}
                                      transition={previewContentImageMotion.transition}
                                      className="absolute overflow-hidden rounded-xl shadow-sm"
                                      style={{
                                        left: previewContentImagePosition.left,
                                        top: previewContentImagePosition.top,
                                        zIndex: getSectionElementLayer(element),
                                        width: previewContentImageBox.width,
                                        height: previewContentImageBox.height,
                                      }}
                                    >
                                      <img
                                        src={element.value}
                                        alt="Imagen de contenido"
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        className={`h-full w-full ${previewContentImageStyle.fit === 'cover' ? 'object-cover' : 'object-contain'} origin-center`}
                                        style={getImagePresentationStyle(Math.max(20, Math.min(300, previewContentImageStyle.scale ?? 100)) / 100)}
                                      />
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;


