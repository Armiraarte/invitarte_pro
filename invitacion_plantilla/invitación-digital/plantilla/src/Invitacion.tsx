import React, { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence, LazyMotion, domAnimation } from 'motion/react';
import { 
  MapPin, Calendar, Clock, Shirt, Copy, Check, Music4, Heart, 
  HelpCircle, Church, GlassWater, Utensils, Music, Sparkles, Cake, 
  Smile, Gift, CheckCircle2, ChevronRight, X, AlertCircle, Timer,
  BookOpen, Camera, Car, Hotel, MessageCircle, Volume2, VolumeX,
  ChevronLeft, Moon, Sun, RefreshCw, Menu, Ticket
} from 'lucide-react';

// ==========================================
// 1. TIPOS DE TypeScript (TYPES)
// ==========================================

export type ThemeType = 'elegant' | 'boho' | 'minimalist' | 'festive' | 'classic';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}

export interface GiftTable {
  storeName: string;
  link?: string;
  accountNumber?: string;
  notes?: string;
}

export interface HonorPerson {
  role: string;
  names: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  url: string;
}

export interface RecommendedStay {
  name: string;
  address?: string;
  phone?: string;
  link?: string;
  notes?: string;
}

export interface TransportInfo {
  parking?: string;
  shuttle?: string;
  notes?: string;
}

export interface OrganizerContact {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  whatsappUrl?: string;
}

export interface RSVPResponse {
  id: string;
  name: string;
  confirmed: boolean;
  guestsCount: number;
  message?: string;
  musicSelection?: string;
  createdAt: string;
}

export interface InvitationDetails {
  id: string;
  title: string;
  subtitle: string;
  hosts: string;
  mainMessage: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  venueName: string;
  venueAddress: string;
  venueMapsUrl?: string;
  dressCode: 'formal' | 'gala' | 'casual' | 'cocktail' | 'beach';
  dressCodeColor?: string;
  story?: string;
  honorPeople?: HonorPerson[];
  giftTables: GiftTable[];
  timeline: TimelineItem[];
  gallery?: PhotoItem[];
  specialNotes?: string[];
  recommendedStays?: RecommendedStay[];
  transportInfo?: TransportInfo;
  photoShareUrl?: string;
  photoShareMessage?: string;
  organizerContacts?: OrganizerContact[];
  shareTitle?: string;
  shareText?: string;
  rsvpList: RSVPResponse[];
  guestbookList?: RSVPResponse[];
  backgroundMusicUrl?: string;
  musicPlaylistUrl?: string;
  musicRequested: boolean;
  coverImage?: string;
  theme: ThemeType;
}

interface PersonalizedEventAccess {
  event: {
    code: string;
    eventTitle: string;
    hostName: string;
    eventDate: string;
    eventDateValue: string;
    venue: string;
    venueMapsUrl?: string;
    shareUrl: string;
  };
  guest: {
    id: string;
    name: string;
    companions: number;
    group: string;
    tableLabel?: string | null;
    guestCode: string;
    guestUrl: string;
    status: 'confirmado' | 'pendiente' | 'declinado';
    checkedInAt?: string | null;
    checkInCount?: number;
    note?: string | null;
  };
}

type GuestAccessApiResponse = {
  success: boolean;
  message?: string;
  guestAccess?: PersonalizedEventAccess;
};

export interface ThemeConfig {
  name: string;
  fontTitle: string;    
  fontBody: string;     
  bgColor: string;      
  textColor: string;    
  accentColor: string;  
  overlayColor: string; 
  borderColor: string;  
  patternClass: string; 
  desktopBorderBg: string; 
}

// ==========================================
// 2. CONFIGURACIÓN DEL TEMA (THEMES)
// ==========================================

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  elegant: {
    name: 'Boda Oro Champagne',
    fontTitle: 'font-script text-6xl md:text-7xl tracking-wide font-normal',
    fontBody: 'font-serif text-base tracking-normal text-stone-600',
    bgColor: 'pattern-floral-light',
    textColor: 'text-stone-800',
    accentColor: '#B88A2E',
    overlayColor: 'bg-white/88 backdrop-blur-[4px]',
    borderColor: 'border-yellow-600/25',
    patternClass: 'pattern-floral-light',
    desktopBorderBg: 'bg-white'
  },
  boho: {
    name: 'Boho & Orgánico',
    fontTitle: 'font-serif text-4xl md:text-5xl font-medium tracking-tight uppercase',
    fontBody: 'font-sans text-sm font-light tracking-wide text-amber-900',
    bgColor: 'pattern-boho',
    textColor: 'text-amber-950',
    accentColor: '#B68D5D',
    overlayColor: 'bg-[#FDFBF7]/90 backdrop-blur-[2px]',
    borderColor: 'border-amber-100',
    patternClass: 'pattern-boho',
    desktopBorderBg: 'bg-amber-50'
  },
  classic: {
    name: 'Clásico & Real',
    fontTitle: 'font-classic text-3xl md:text-4xl font-semibold tracking-widest',
    fontBody: 'font-serif text-sm tracking-normal text-slate-700',
    bgColor: 'pattern-classic-marbled',
    textColor: 'text-slate-900',
    accentColor: '#C5A059',
    overlayColor: 'bg-white/90 backdrop-blur-[4px]',
    borderColor: 'border-stone-200',
    patternClass: 'pattern-classic-marbled',
    desktopBorderBg: 'bg-slate-100'
  },
  festive: {
    name: 'Fiesta & Noche',
    fontTitle: 'font-sans text-4xl md:text-5xl font-black tracking-tighter uppercase italic',
    fontBody: 'font-sans text-sm tracking-normal text-slate-300',
    bgColor: 'pattern-stars',
    textColor: 'text-white',
    accentColor: '#8B5CF6',
    overlayColor: 'bg-slate-950/85 backdrop-blur-[5px]',
    borderColor: 'border-slate-800',
    patternClass: 'pattern-stars',
    desktopBorderBg: 'bg-[#05070f]'
  },
  minimalist: {
    name: 'Sofisticación Minimalista',
    fontTitle: 'font-sans text-3xl md:text-4xl font-light tracking-[0.18em] uppercase',
    fontBody: 'font-sans text-xs tracking-[0.1em] text-neutral-500 uppercase',
    bgColor: 'bg-[#FCFCFC]',
    textColor: 'text-neutral-900',
    accentColor: '#171717',
    overlayColor: 'bg-[#FCFCFC]/95 backdrop-blur-[1px]',
    borderColor: 'border-neutral-200',
    patternClass: 'bg-[#FCFCFC]',
    desktopBorderBg: 'bg-neutral-50'
  }
};

// ==========================================
// 3. PLANTILLA ACTIVA EN BLANCO
// ==========================================

const buildInvitationAssetPath = (relativePath: string) => {
  const normalizedPath = relativePath.replace(/^\/+/, '');
  const basePath = (import.meta.env.BASE_URL?.trim() || '/').replace(/\/+$/, '/');
  return `${basePath}${normalizedPath}`;
};

export const INVITATION_CONFIG: InvitationDetails = {
  id: 'nuevo-evento',

  // Tema activo para la invitacion.
  theme: 'elegant',

  title: 'Titulo del evento',
  subtitle: 'SUBTITULO DEL EVENTO',
  hosts: 'Anfitriones por definir',
  mainMessage: 'Escribe aqui el mensaje principal de la invitacion.',

  date: '2026-12-31',
  time: '18:00',

  venueName: 'Lugar por definir',
  venueAddress: 'Direccion por definir',
  // venueMapsUrl: 'https://maps.google.com/?q=tu+evento',

  dressCode: 'formal',
  dressCodeColor: 'Codigo de vestimenta por definir',

  giftTables: [],
  timeline: [],
  rsvpList: [],
  guestbookList: [],
  backgroundMusicUrl: '',
  musicPlaylistUrl: '',
  musicRequested: false,

  // Activa portada y galeria cuando ya tengas material visual.
  // coverImage: '/invitacion/portada.png',
  // gallery: [
  //   { id: 'g1', title: 'Portada', url: '/invitacion/portada.png' }
  // ],

  // Activa esta seccion cuando ya tengas historia y nombres.
  // story: 'Cuenta aqui la historia del evento o de la pareja.',
  // honorPeople: [
  //   { role: 'Padres', names: 'Nombre 1 y Nombre 2' }
  // ],

  // Activa esta seccion cuando ya tengas horarios cerrados.
  // timeline: [
  //   { id: '1', time: '18:00', title: 'Recepcion', description: 'Descripcion breve', icon: 'sparkles' }
  // ],

  // Activa esta seccion cuando aplique mesa de regalos.
  // giftTables: [
  //   { storeName: 'Liverpool', notes: 'Codigo de evento o instrucciones' }
  // ],

  // Activa esta seccion cuando ya tengas informacion logistica.
  // specialNotes: ['Nota 1', 'Nota 2'],
  // recommendedStays: [
  //   { name: 'Hotel sugerido', address: 'Direccion', phone: '+52 55 0000 0000', link: 'https://...', notes: 'Detalle extra' }
  // ],
  // transportInfo: {
  //   parking: 'Indicaciones de estacionamiento',
  //   shuttle: 'Horario o punto de salida',
  //   notes: 'Notas adicionales'
  // },

  // Activa esta seccion cuando quieras recibir fotos o mensajes.
  // photoShareUrl: 'https://...',
  // photoShareMessage: 'Comparte tus fotos aqui.',
  // guestbookList: [],

  // Activa esta seccion cuando ya tengas contactos y texto para compartir.
  // organizerContacts: [
  //   { name: 'Coordinacion', role: 'Planner', phone: '+52 55 0000 0000', whatsappUrl: 'https://wa.me/525500000000' }
  // ],
  // shareTitle: 'Invitacion digital',
  // shareText: 'Te comparto nuestra invitacion digital.'
};

// ==========================================
// 3. DATOS DE TU INVITACIÓN (EDÍTAME AQUÍ)
// ==========================================

const INVITATION_REFERENCE_CONFIG: InvitationDetails = {
  id: 'nuevo-evento',
  
  // Tema a usar: 'elegant' | 'boho' | 'classic' | 'festive' | 'minimalist'
  theme: 'elegant',

  title: 'Titulo del evento',
  subtitle: 'SUBTITULO DEL EVENTO',
  hosts: 'Anfitriones por definir',
  mainMessage: 'Escribe aqui el mensaje principal de la invitacion.',
  
  date: '2026-12-31', // AAAA-MM-DD
  time: '18:00',      // HH:MM

  venueName: 'Lugar por definir',
  venueAddress: 'Direccion por definir',
  venueMapsUrl: '',

  // 'formal' | 'gala' | 'casual' | 'cocktail' | 'beach'
  dressCode: 'formal',
  dressCodeColor: 'Codigo de vestimenta por definir',

  story: 'Nos conocimos entre cafés largos, playlists compartidas y viajes improvisados. Con el tiempo descubrimos que nuestro lugar favorito siempre era donde estábamos juntos. Hoy queremos celebrar ese camino con las personas que han sido parte de nuestra historia.',

  honorPeople: [
    { role: 'Padres de la novia', names: 'Laura Martínez & Roberto Salazar' },
    { role: 'Padres del novio', names: 'Claudia Herrera & Miguel Torres' },
    { role: 'Padrinos de velación', names: 'Ana Paula Ríos & Javier Montes' }
  ],

  giftTables: [
    {
      storeName: 'Liverpool (Mesa de Regalos)',
      link: 'https://www.liverpool.com.mx',
      notes: 'Código de evento: 50920491'
    },
    {
      storeName: 'Lluvia de Sobres',
      notes: 'En la recepción tendremos un buzón para sobres de obsequios en efectivo/transferencia.'
    }
  ],

  timeline: [
    { id: '1', time: '16:30', title: 'Ceremonia Religiosa', description: 'Capilla Principal de la Hacienda', icon: 'church' },
    { id: '2', time: '18:00', title: 'Coctel de Bienvenida', description: 'Jardín de los Arcos', icon: 'glass-water' },
    { id: '3', time: '19:00', title: 'Recepción & Banquete', description: 'Gran Salón Virreinal', icon: 'utensils' },
    { id: '4', time: '21:30', title: 'Apertura de Pista & Baile', description: 'Música en vivo hasta el amanecer', icon: 'music' }
  ],

  gallery: [
    { id: 'g1', title: 'La propuesta', url: buildInvitationAssetPath('invitacion/propuesta.webp') },
    { id: 'g2', title: 'Nuestro sí', url: buildInvitationAssetPath('invitacion/sesion1.webp') },
    { id: 'g3', title: 'Atardecer juntos', url: buildInvitationAssetPath('invitacion/sesion2.webp') },
    { id: 'g4', title: 'Complicidad', url: buildInvitationAssetPath('invitacion/sesion3.webp') },
    { id: 'g5', title: 'Siempre nosotros', url: buildInvitationAssetPath('invitacion/sesion4.webp') }
  ],

  specialNotes: [
    'Evento exclusivo para adultos.',
    'Te pedimos confirmar asistencia antes del 18 de septiembre de 2026.',
    'Por logística del venue, agradecemos llegar 20 minutos antes de la ceremonia.'
  ],

  recommendedStays: [
    {
      name: 'Hotel Boutique Real del Monte',
      address: 'Centro de Tepotzotlán, Edo. de México',
      phone: '+52 55 0000 0000',
      link: 'https://maps.google.com/?q=hotel+tepotzotlan',
      notes: 'A 12 minutos de la hacienda. Pregunta por la tarifa especial para invitados.'
    }
  ],

  transportInfo: {
    parking: 'La hacienda cuenta con valet parking incluido para invitados.',
    shuttle: 'Habrá transporte de regreso al hotel sugerido a las 00:30 y 02:00 hrs.',
    notes: 'Si requieres apoyo especial de movilidad, avísanos al confirmar tu asistencia.'
  },

  photoShareUrl: 'https://drive.google.com',
  photoShareMessage: 'Después del evento podrás subir tus fotos y videos a nuestra carpeta compartida.',

  organizerContacts: [
    { name: 'Mariana López', role: 'Wedding planner', phone: '+52 55 1234 5678', whatsappUrl: 'https://wa.me/525512345678' },
    { name: 'Daniel Torres', role: 'Coordinación de invitados', phone: '+52 55 8765 4321', email: 'invitados@example.com' }
  ],

  shareTitle: 'Boda de Nombre 1 & Nombre 2',
  shareText: 'Te comparto la invitación digital de Nombre 1 & Nombre 2.',
  
  rsvpList: [],
  guestbookList: [],
  backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  musicPlaylistUrl: 'https://spotify.com',
  musicRequested: true,
  coverImage: buildInvitationAssetPath('invitacion/sesion4.webp')
};

// ==========================================
// 4. LOGICA Y VISTAS DE LA APLICACIÓN (UI)
// ==========================================

type SectionId = 'inicio' | 'pases' | 'cuenta' | 'historia' | 'ubicacion' | 'itinerario' | 'galeria' | 'detalles' | 'logistica' | 'mensajes' | 'rsvp';

const RSVP_STORAGE_KEY = 'mi_invitacion_rsvps';
const MAX_GENERIC_GUEST_COUNT = 12;

const normalizeEventPortalApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

const pushEventPortalApiBaseCandidate = (bucket: string[], value?: string | null) => {
  const normalizedValue = normalizeEventPortalApiBaseUrl(value?.trim() ?? '');
  if (normalizedValue === '' || bucket.includes(normalizedValue)) {
    return;
  }

  bucket.push(normalizedValue);
};

const appendEventPortalApiBaseVariants = (bucket: string[], value?: string | null) => {
  const normalizedValue = normalizeEventPortalApiBaseUrl(value?.trim() ?? '');
  if (normalizedValue === '') {
    return;
  }

  pushEventPortalApiBaseCandidate(bucket, normalizedValue);
  pushEventPortalApiBaseCandidate(
    bucket,
    /\/db$/i.test(normalizedValue) ? normalizedValue.replace(/\/db$/i, '') : `${normalizedValue}/db`
  );
};

const resolveEventPortalApiBaseUrlCandidates = () => {
  const candidates: string[] = [];
  const configuredBase = import.meta.env.VITE_EVENT_PORTAL_API_BASE_URL?.trim();
  if (configuredBase) {
    appendEventPortalApiBaseVariants(candidates, configuredBase);
  }

  if (typeof window !== 'undefined') {
    const { origin, protocol, hostname, port } = window.location;
    const sameHostPhpBaseUrl = `${protocol}//${hostname}:8000`;
    const prefersPhpPort = ['3000', '4173', '5173'].includes(port);

    if (prefersPhpPort) {
      appendEventPortalApiBaseVariants(candidates, sameHostPhpBaseUrl);
      appendEventPortalApiBaseVariants(candidates, origin);
    } else {
      appendEventPortalApiBaseVariants(candidates, origin);
      appendEventPortalApiBaseVariants(candidates, sameHostPhpBaseUrl);
    }

    if (hostname === 'localhost') {
      appendEventPortalApiBaseVariants(candidates, `${protocol}//127.0.0.1:8000`);
      appendEventPortalApiBaseVariants(candidates, `${protocol}//127.0.0.1${port ? `:${port}` : ''}`);
    } else if (hostname === '127.0.0.1') {
      appendEventPortalApiBaseVariants(candidates, `${protocol}//localhost:8000`);
      appendEventPortalApiBaseVariants(candidates, `${protocol}//localhost${port ? `:${port}` : ''}`);
    }
  }

  if (candidates.length === 0) {
    appendEventPortalApiBaseVariants(candidates, 'http://localhost:8000');
  }

  return candidates;
};

const buildEventPortalRequestHeaders = (includeContentType = false) => {
  const headers = new Headers();
  const apiKey = import.meta.env.VITE_EVENT_PORTAL_API_KEY?.trim();

  if (includeContentType) {
    headers.set('Content-Type', 'application/json');
  }

  if (apiKey) {
    headers.set('X-API-KEY', apiKey);
  }

  return headers;
};

const requestEventPortalApi = async (
  configureEndpoint: (endpoint: URL) => void,
  init?: RequestInit
): Promise<GuestAccessApiResponse> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const candidateBaseUrls = resolveEventPortalApiBaseUrlCandidates();
  let lastError: unknown = null;

  for (let index = 0; index < candidateBaseUrls.length; index += 1) {
    const endpoint = new URL(`${candidateBaseUrls[index]}/event_portal.php`, origin);
    configureEndpoint(endpoint);

    try {
      const response = await fetch(endpoint.toString(), {
        ...init,
        headers: init?.headers ?? buildEventPortalRequestHeaders(init?.body !== undefined),
      });
      const payload = (await response.json()) as GuestAccessApiResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message?.trim() || 'No pudimos completar la solicitud del evento.');
      }

      return payload;
    } catch (error) {
      lastError = error;
      const canRetry = error instanceof TypeError || error instanceof SyntaxError;
      if (!canRetry || index === candidateBaseUrls.length - 1) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No pudimos completar la solicitud del evento.');
};

const resolvePersonalizedGuestParams = () => {
  if (typeof window === 'undefined') {
    return { eventCode: '', guestCode: '' };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    eventCode: (params.get('event') || params.get('code') || '').trim().toUpperCase(),
    guestCode: (params.get('guest') || params.get('guestCode') || '').trim()
  };
};

const fetchPersonalizedGuestAccess = async (eventCode: string, guestCode: string): Promise<PersonalizedEventAccess> => {
  const payload = await requestEventPortalApi((endpoint) => {
    endpoint.searchParams.set('action', 'guest-access');
    endpoint.searchParams.set('code', eventCode);
    endpoint.searchParams.set('guestCode', guestCode);
  });

  if (!payload.guestAccess) {
    throw new Error('No pudimos cargar los pases personalizados.');
  }

  return payload.guestAccess;
};

const resolvePersonalizedGuestRsvp = (status: PersonalizedEventAccess['guest']['status']) => {
  if (status === 'confirmado') return true;
  if (status === 'declinado') return false;
  return null;
};

const getIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'church': return Church;
    case 'glass-water': return GlassWater;
    case 'utensils': return Utensils;
    case 'music': return Music;
    case 'sparkles': return Sparkles;
    case 'cake': return Cake;
    case 'smile': return Smile;
    case 'gift': return Gift;
    default: return HelpCircle;
  }
};

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};

type GalleryPosition = 'active' | 'next' | 'prev' | 'hidden';

let qrCodeModulePromise: Promise<typeof import('qrcode')> | null = null;

const loadQrCodeModule = () => {
  if (!qrCodeModulePromise) {
    qrCodeModulePromise = import('qrcode');
  }

  return qrCodeModulePromise;
};

const buildCountdownState = (date: string, time?: string): CountdownState => {
  const eventDate = new Date(`${date}T${time || '00:00'}:00`);
  const now = new Date();
  const difference = eventDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isOver: false
  };
};

function InvitationCountdown({
  date,
  time,
  accentColor,
  borderColor
}: {
  date: string;
  time?: string;
  accentColor: string;
  borderColor: string;
}) {
  const [timeLeft, setTimeLeft] = useState<CountdownState>(() => buildCountdownState(date, time));

  useEffect(() => {
    setTimeLeft(buildCountdownState(date, time));
    const interval = window.setInterval(() => {
      setTimeLeft(buildCountdownState(date, time));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [date, time]);

  return (
    <motion.div
      className="w-full pt-4 text-center"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.45 }}
      transition={{ duration: 0.55 }}
    >
      <div className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500">
        <Timer className="h-3.5 w-3.5" style={{ color: accentColor }} />
        {timeLeft.isOver ? 'LLEGO EL DIA' : 'CUENTA REGRESIVA'}
      </div>
      {timeLeft.isOver ? (
        <div className="inline-block rounded-full border border-stone-200 bg-white/60 px-5 py-2.5 text-xs font-serif italic text-stone-700">
          El evento ha comenzado o ya se llevo a cabo.
        </div>
      ) : (
        <div className="luxury-card relative flex w-full items-center justify-center space-x-3 rounded-[2rem] border border-yellow-700/15 bg-white/64 px-3 py-5 backdrop-blur-xl">
          {[
            { value: timeLeft.days, label: 'Dias' },
            { value: timeLeft.hours, label: 'Hrs' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Seg' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.45 }}
            >
              <div
                className={`countdown-tile flex h-[76px] w-[66px] items-center justify-center rounded-3xl border bg-white/78 font-serif text-[24px] font-semibold text-stone-800 backdrop-blur-xl ${borderColor}`}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <span className="mt-2 text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-stone-400">{item.label}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function HeroCarousel({ photos }: { photos: PhotoItem[] }) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      setSlideIndex((current) => (current + 1) % photos.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="hero-carousel" aria-hidden="true">
      {photos.map((photo, index) => {
        const offset = (index - slideIndex + photos.length) % photos.length;
        const position = offset === 0 ? 'active' : 'hidden';

        return (
          <motion.div
            key={photo.id}
            className={`hero-slide hero-slide-${position}`}
            initial={false}
            animate={position}
            variants={{
              active: { opacity: 1, scale: 1.04, zIndex: 2 },
              hidden: { opacity: 0, scale: 1.08, zIndex: 1 }
            }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={photo.url}
              alt=""
              loading={position === 'active' ? 'eager' : 'lazy'}
              fetchPriority={position === 'active' ? 'high' : 'low'}
              decoding="async"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function GalleryCarousel({
  photos,
  isPaused,
  onOpenPhoto,
}: {
  photos: PhotoItem[];
  isPaused: boolean;
  onOpenPhoto: (index: number) => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      setSlideIndex((current) => (current + 1) % photos.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [photos.length, isPaused]);

  const getPosition = (index: number): GalleryPosition => {
    if (!photos.length) return 'hidden';
    const offset = (index - slideIndex + photos.length) % photos.length;
    if (offset === 0) return 'active';
    if (offset === 1) return 'next';
    if (offset === photos.length - 1) return 'prev';
    return 'hidden';
  };

  return (
    <>
      <div className="gallery-carousel" aria-label="Carrusel de fotos">
        {photos.map((photo, index) => {
          const position = getPosition(index);

          return (
            <motion.button
              type="button"
              key={photo.id}
              onClick={() => {
                if (position === 'active') {
                  onOpenPhoto(index);
                  return;
                }

                setSlideIndex(index);
              }}
              className={`gallery-carousel-card gallery-carousel-card-${position}`}
              initial={false}
              animate={position}
              variants={{
                active: { opacity: 1, x: 0, scale: 1, rotate: 0, zIndex: 4 },
                next: { opacity: 0.62, x: 118, scale: 0.78, rotate: 5, zIndex: 3 },
                prev: { opacity: 0.62, x: -118, scale: 0.78, rotate: -5, zIndex: 3 },
                hidden: { opacity: 0, x: 0, scale: 0.62, rotate: 0, zIndex: 1 }
              }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                loading={position === 'active' ? 'eager' : 'lazy'}
                fetchPriority={position === 'active' ? 'high' : 'low'}
                decoding="async"
              />
              <figcaption className="gallery-carousel-caption">
                <span>{photo.title}</span>
                <small>{position === 'active' ? 'Toca para ampliar' : 'Toca para centrar'}</small>
              </figcaption>
            </motion.button>
          );
        })}
      </div>

      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSlideIndex((current) => (current - 1 + photos.length) % photos.length)}
            className="gallery-nav-button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onOpenPhoto(slideIndex)}
            className="gallery-open-button"
          >
            <Camera className="h-4 w-4" />
            <span>Ver foto</span>
          </button>
          <button
            type="button"
            onClick={() => setSlideIndex((current) => (current + 1) % photos.length)}
            className="gallery-nav-button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}

export default function Invitacion() {
  const [details, setDetails] = useState<InvitationDetails | null>(null);

  // Estados del visualizador
  const [activeTab, setActiveTab] = useState<SectionId>('inicio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpConfirmed, setRsvpConfirmed] = useState<boolean | null>(null);
  const [guestsCount, setGuestsCount] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [musicIdea, setMusicIdea] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [musicSubmitted, setMusicSubmitted] = useState(false);
  const [tempSongName, setTempSongName] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [guestbookEntries, setGuestbookEntries] = useState<RSVPResponse[]>([]);
  const [guestbookName, setGuestbookName] = useState('');
  const [guestbookMessage, setGuestbookMessage] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [personalizedAccess, setPersonalizedAccess] = useState<PersonalizedEventAccess | null>(null);
  const [isPersonalizedAccessLoading, setIsPersonalizedAccessLoading] = useState(false);
  const [personalizedAccessError, setPersonalizedAccessError] = useState<string | null>(null);
  const [isGuestQrVisible, setIsGuestQrVisible] = useState(false);
  const [isGuestQrLoading, setIsGuestQrLoading] = useState(false);
  const [guestQrMarkup, setGuestQrMarkup] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const activeTabRef = useRef<SectionId>('inicio');
  const scrollFrameRef = useRef<number | null>(null);

  // Carga inicial y combinación con LocalStorage
  useEffect(() => {
    try {
      document.title = INVITATION_CONFIG.shareTitle || INVITATION_CONFIG.title;
      const savedRsvps = localStorage.getItem(RSVP_STORAGE_KEY);
      const parsedRsvps = savedRsvps ? JSON.parse(savedRsvps) : [];
      setDetails({
        ...INVITATION_CONFIG,
        rsvpList: [...parsedRsvps, ...INVITATION_CONFIG.rsvpList]
      });
      setGuestbookEntries(INVITATION_CONFIG.guestbookList || []);
    } catch (e) {
      console.warn('Failed to load local RSVPs', e);
      setDetails(INVITATION_CONFIG);
    }
  }, []);

  useEffect(() => {
    const { eventCode, guestCode } = resolvePersonalizedGuestParams();
    if (!eventCode || !guestCode) {
      return;
    }

    let isCancelled = false;
    setIsPersonalizedAccessLoading(true);
    setPersonalizedAccessError(null);

    void fetchPersonalizedGuestAccess(eventCode, guestCode)
      .then((access) => {
        if (isCancelled) return;
        const persistedRsvp = resolvePersonalizedGuestRsvp(access.guest.status);
        setPersonalizedAccess(access);
        setRsvpName(access.guest.name);
        setGuestsCount(Math.max(1, access.guest.companions));
        setRsvpConfirmed(persistedRsvp);
        setFormSubmitted(persistedRsvp !== null);
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        setPersonalizedAccess(null);
        setPersonalizedAccessError(error instanceof Error ? error.message : 'No pudimos cargar los pases personalizados.');
      })
      .finally(() => {
        if (!isCancelled) {
          setIsPersonalizedAccessLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isGuestQrVisible || !personalizedAccess) {
      setGuestQrMarkup('');
      setIsGuestQrLoading(false);
      return;
    }

    let isCancelled = false;
    setIsGuestQrLoading(true);
    setGuestQrMarkup('');

    void loadQrCodeModule()
      .then((qrCodeModule) => qrCodeModule.toString(personalizedAccess.guest.guestCode, {
        type: 'svg',
        margin: 1,
        width: 220,
        color: {
          dark: '#18181b',
          light: '#ffffff'
        }
      }))
      .then((markup) => {
        if (!isCancelled) {
          setGuestQrMarkup(markup);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setGuestQrMarkup('');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsGuestQrLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isGuestQrVisible, personalizedAccess]);

  /* Temporizador de cuenta regresiva
  useEffect(() => {
    if (!details) return;
    const calculateTime = () => {
      const eventDate = new Date(`${details.date}T${details.time || '00:00'}:00`);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [details]); */

  // Carrusel de Hero automático
  const heroPhotos = details?.gallery && details.gallery.length > 0
    ? (details.coverImage ? [{ id: 'cover', title: details.title, url: details.coverImage }, ...details.gallery.filter(g => g.url !== details.coverImage)] : details.gallery)
    : (details?.coverImage ? [{ id: 'cover', title: details.title, url: details.coverImage }] : []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => () => {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }
  }, []);

  // Reproductor de audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicEnabled) {
      audio.volume = 0.42;
      audio.play().catch(() => setMusicEnabled(false));
    } else {
      audio.pause();
    }
  }, [musicEnabled]);

  const startBackgroundMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.42;
    try {
      await audio.play();
      setMusicEnabled(true);
    } catch {
      setMusicEnabled(false);
    }
  };

  const handleEnterInvitation = () => {
    void startBackgroundMusic();
    scrollToSection('cuenta');
  };

  // Desplazamiento suave (Scroll)
  const scrollToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = contentRef.current;
    if (!container) return;
    const el = container.querySelector(`#sec-${id}`) as HTMLElement;
    if (el) {
      isScrollingProgrammatically.current = true;
      activeTabRef.current = id;
      setActiveTab(id);
      container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      setTimeout(() => { isScrollingProgrammatically.current = false; }, 750);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingProgrammatically.current || !details || scrollFrameRef.current !== null) return;
    const container = e.currentTarget;

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const scrollPosition = container.scrollTop;

      const availableSections = [
        'inicio',
        ...(hasGuestPassSection ? ['pases'] : []),
        'cuenta',
        ...(details.story || (details.honorPeople && details.honorPeople.length > 0) ? ['historia'] : []),
        'ubicacion',
        ...(details.timeline && details.timeline.length > 0 ? ['itinerario'] : []),
        ...(details.gallery && details.gallery.length > 0 ? ['galeria'] : []),
        'detalles',
        ...(details.specialNotes || details.recommendedStays || details.transportInfo ? ['logistica'] : []),
        ...(details.photoShareUrl || guestbookEntries.length > 0 ? ['mensajes'] : []),
        'rsvp'
      ] as SectionId[];

      let detectedTab = activeTabRef.current;
      let minDiff = Infinity;

      availableSections.forEach((id) => {
        const el = container.querySelector(`#sec-${id}`) as HTMLElement;
        if (el) {
          const diff = Math.abs(el.offsetTop - scrollPosition);
          if (diff < minDiff) {
            minDiff = diff;
            detectedTab = id;
          }
        }
      });

      if (detectedTab !== activeTabRef.current) {
        activeTabRef.current = detectedTab;
        setActiveTab(detectedTab);
      }
    });
  };

  // Acciones y Formularios
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedName = rsvpName.trim() || personalizedAccess?.guest.name || '';
    if (!details || !resolvedName || rsvpConfirmed === null) return;
    const allowedGuests = personalizedAccess?.guest.companions ?? MAX_GENERIC_GUEST_COUNT;

    const newResponse: RSVPResponse = {
      id: 'r_user_' + Date.now(),
      name: resolvedName,
      confirmed: rsvpConfirmed,
      guestsCount: rsvpConfirmed ? Math.min(Math.max(1, guestsCount), allowedGuests) : 0,
      message: rsvpMessage.trim() || undefined,
      musicSelection: musicIdea.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem(RSVP_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify([newResponse, ...parsed]));
      setDetails({
        ...details,
        rsvpList: [newResponse, ...details.rsvpList]
      });
      setFormSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMusicSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSongName.trim()) return;
    setMusicSubmitted(true);
    setTimeout(() => {
      setMusicSubmitted(false);
      setTempSongName('');
    }, 4000);
  };

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestbookName.trim() || !guestbookMessage.trim()) return;
    setGuestbookEntries([
      {
        id: 'gb_user_' + Date.now(),
        name: guestbookName.trim(),
        confirmed: true,
        guestsCount: 1,
        message: guestbookMessage.trim(),
        createdAt: new Date().toISOString()
      },
      ...guestbookEntries
    ]);
    setGuestbookName('');
    setGuestbookMessage('');
  };

  const handleOpenGuestPasses = () => {
    setIsGuestQrVisible(true);
    scrollToSection('pases');
  };

  // Formateador de Fechas
  const getFormattedDate = () => {
    if (!details?.date) return '';
    const parts = details.date.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const splitDate = () => {
    if (!details?.date) return { dayNum: '', monthStr: '', yearStr: '', weekdayStr: '' };
    const parts = details.date.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return {
      dayNum: d.getDate().toString(),
      monthStr: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', ''),
      yearStr: d.getFullYear().toString(),
      weekdayStr: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
    };
  };

  if (!details) {
    return (
      <div className="invitation-viewport w-full bg-stone-50 flex items-center justify-center px-6 text-stone-600">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#B88A2E] animate-spin" />
          <p className="text-sm font-medium tracking-wide">Cargando tu invitación...</p>
        </div>
      </div>
    );
  }

  // Desestructuración y variables derivadas
  const {
    title, subtitle, hosts, mainMessage, venueName, venueAddress, venueMapsUrl,
    dressCode, dressCodeColor, story, honorPeople, giftTables, timeline,
    gallery, specialNotes, recommendedStays, transportInfo, photoShareUrl,
    photoShareMessage, backgroundMusicUrl, musicPlaylistUrl,
    musicRequested, theme
  } = details;
  const personalizedGuest = personalizedAccess?.guest ?? null;
  const hasGuestPassSection =
    isPersonalizedAccessLoading || Boolean(personalizedAccess) || Boolean(personalizedAccessError);
  const maxSelectableGuests = personalizedGuest?.companions ?? MAX_GENERIC_GUEST_COUNT;
  const personalizedGuestStatusLabel =
    personalizedGuest?.status === 'confirmado'
      ? 'Confirmado'
      : personalizedGuest?.status === 'declinado'
        ? 'Declinó'
        : 'Pendiente';
  const personalizedGuestStatusClasses =
    personalizedGuest?.status === 'confirmado'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : personalizedGuest?.status === 'declinado'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';
  const resolvedVenueMapsUrl = personalizedAccess?.event.venueMapsUrl || venueMapsUrl;

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.elegant;
  const { dayNum, monthStr, yearStr, weekdayStr } = splitDate();
  
  const getDressCodeDisplay = (type: string) => {
    switch (type) {
      case 'gala': return { name: 'Gala / Rigurosa Etiqueta', desc: 'Vestido largo de noche y smoking o traje oscuro.' };
      case 'formal': return { name: 'Formal', desc: 'Vestido formal largo o midi y traje de gala.' };
      case 'cocktail': return { name: 'Coctel', desc: 'Vestidos cortos o midi elegantes, traje casual o saco elegante.' };
      case 'casual': return { name: 'Casual Elegante', desc: 'Ropa cómoda pero sofisticada, colores frescos, sin mezclilla.' };
      case 'beach': return { name: 'Guayabera o Playa', desc: 'Lino fresco, colores claros, vestidos vaporosos y calzado cómodo.' };
      default: return { name: 'Formal', desc: '' };
    }
  };
  const currentDress = getDressCodeDisplay(dressCode);
  const canPlayInlineMusic = Boolean(backgroundMusicUrl && /\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(backgroundMusicUrl));

  const getGoogleCalendarUrl = () => {
    if (!details.date) return '#';
    const eventTitle = encodeURIComponent(title || "Invitación Especial");
    const eventDetails = encodeURIComponent(mainMessage || "¡Te esperamos para celebrar este momento!");
    const eventLocation = encodeURIComponent(`${venueName || ''}, ${venueAddress || ''}`);
    const dateClean = details.date.replace(/-/g, '');
    const startTime = details.time ? details.time.replace(/:/g, '') + '00' : '170000';
    const endTime = details.time ? (parseInt(details.time.split(':')[0]) + 5).toString().padStart(2, '0') + details.time.split(':')[1] + '00' : '220000';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dateClean}T${startTime}/${dateClean}T${endTime}&details=${eventDetails}&location=${eventLocation}`;
  };

  // Secciones condicionales
  const hasStorySection = Boolean(story || (honorPeople && honorPeople.length > 0));
  const hasGallerySection = Boolean(gallery && gallery.length > 0);
  const hasLogisticsSection = Boolean((specialNotes && specialNotes.length > 0) || (recommendedStays && recommendedStays.length > 0) || transportInfo);
  const hasMessagesSection = Boolean(photoShareUrl || photoShareMessage || guestbookEntries.length > 0);

  const tabs = [
    { id: 'inicio' as SectionId, label: 'Inicio', icon: Heart },
    ...(hasGuestPassSection ? [{ id: 'pases' as SectionId, label: 'Pases', icon: Ticket }] : []),
    { id: 'cuenta' as SectionId, label: 'Conteo', icon: Timer },
    ...(hasStorySection ? [{ id: 'historia' as SectionId, label: 'Historia', icon: BookOpen }] : []),
    { id: 'ubicacion' as SectionId, label: 'Dónde', icon: MapPin },
    ...(timeline && timeline.length > 0 ? [{ id: 'itinerario' as SectionId, label: 'Programa', icon: Clock }] : []),
    ...(hasGallerySection ? [{ id: 'galeria' as SectionId, label: 'Galería', icon: Camera }] : []),
    { id: 'detalles' as SectionId, label: 'Detalles', icon: Shirt },
    ...(hasLogisticsSection ? [{ id: 'logistica' as SectionId, label: 'Logística', icon: Car }] : []),
    ...(hasMessagesSection ? [{ id: 'mensajes' as SectionId, label: 'Fotos', icon: MessageCircle }] : []),
    { id: 'rsvp' as SectionId, label: 'Asistencia', icon: CheckCircle2 }
  ];

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  const sectionProgress = tabs.length > 1 ? (activeIndex / (tabs.length - 1)) * 100 : 0;
  
  const quickActions = [
    ...(hasGuestPassSection ? [{ label: 'Pases', icon: Ticket, action: handleOpenGuestPasses }] : []),
    { label: 'Guardar fecha', icon: Calendar, action: () => window.open(getGoogleCalendarUrl(), '_blank') },
    { label: 'Mapa', icon: MapPin, action: () => resolvedVenueMapsUrl && window.open(resolvedVenueMapsUrl, '_blank'), disabled: !resolvedVenueMapsUrl },
    { label: 'RSVP', icon: CheckCircle2, action: () => scrollToSection('rsvp') }
  ];

  const activePhoto = activePhotoIndex !== null && gallery ? gallery[activePhotoIndex] : null;

  // Fondo del escritorio adaptativo
  const getAmbientBackdrop = () => {
    if (isNightMode) {
      return (
        <div className="absolute inset-0 bg-[#090805] overflow-hidden pointer-events-none transition-colors duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(184,138,46,0.15),transparent_42%)]" />
        </div>
      );
    }
    switch (theme) {
      case 'festive':
        return (
          <div className="absolute inset-0 bg-[#070a13] overflow-hidden pointer-events-none transition-colors duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(124,58,237,0.16),transparent_32%,rgba(217,70,239,0.14)_70%,transparent),repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_54px)]" />
          </div>
        );
      case 'elegant':
        return (
          <div className="absolute inset-0 bg-[#fffdf8] overflow-hidden pointer-events-none transition-colors duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(184,138,46,0.12),transparent_34%,rgba(238,213,150,0.16)_70%,transparent),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,243,226,0.52))]" />
          </div>
        );
      case 'boho':
        return (
          <div className="absolute inset-0 bg-[#faf5ed] overflow-hidden pointer-events-none transition-colors duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(182,141,93,0.14),transparent_38%,rgba(217,119,6,0.1)_76%,transparent),repeating-linear-gradient(0deg,rgba(120,53,15,0.04)_0_1px,transparent_1px_46px)]" />
          </div>
        );
      case 'classic':
        return (
          <div className="absolute inset-0 bg-[#f3f3f5] overflow-hidden pointer-events-none transition-colors duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(197,160,89,0.12),transparent_36%,rgba(100,116,139,0.12)_76%,transparent),repeating-linear-gradient(90deg,rgba(15,23,42,0.04)_0_1px,transparent_1px_58px)]" />
          </div>
        );
      case 'minimalist':
      default:
        return (
          <div className="absolute inset-0 bg-[#f7f7f7] overflow-hidden pointer-events-none transition-colors duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(23,23,23,0.06),transparent_34%,rgba(255,255,255,0.8)_70%,transparent),repeating-linear-gradient(90deg,rgba(0,0,0,0.04)_0_1px,transparent_1px_48px)]" />
          </div>
        );
    }
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="invitation-stage w-full relative flex flex-col items-center justify-center overflow-x-hidden font-sans">
      {/* 1. Fondo dinámico decorativo para escritorio */}
      {getAmbientBackdrop()}

      {/* Paneles laterales difuminados (Solo Escritorio) */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-[calc(50%-220px)] bg-white/20 backdrop-blur-xl border-r border-white/40 z-10" />
      <div className="hidden md:block absolute inset-y-0 right-0 w-[calc(50%-220px)] bg-white/20 backdrop-blur-xl border-l border-white/40 z-10" />

      {/* 2. Contenedor de la Invitación */}
      <div className="invitation-shell flex items-center justify-center relative z-15">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 95 }}
          className="invitation-card-frame w-full h-full md:rounded-3xl bg-white shadow-md md:shadow-2xl flex flex-col overflow-hidden relative border-t-4 md:border border-stone-200"
          style={{ borderTopColor: config.accentColor }}
        >
          {/* Tarjeta Digital */}
          <div 
            id="invitation-mobile-card"
            className={`invitation-experience ${isNightMode ? 'invitation-night' : ''} w-full h-full ${config.bgColor} ${config.textColor} flex flex-col relative selection:bg-yellow-200 selection:text-stone-900 overflow-hidden`}
          >
            {/* Control Flotante Menú */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="floating-control relative h-[52px] w-[52px] rounded-full bg-white/90 backdrop-blur-xl border border-white/70 flex items-center justify-center transition active:scale-95 cursor-pointer"
                style={{ color: config.accentColor }}
              >
                {isMenuOpen ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="menu-glass absolute top-[60px] right-0 mt-2 w-52 max-h-[72vh] overflow-y-auto bg-white/88 backdrop-blur-2xl border border-white/70 rounded-2xl"
                  >
                    <div className="py-2 flex flex-col">
                      {tabs.map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => scrollToSection(tab.id)}
                            className={`flex items-center space-x-3 px-4 py-3 text-left transition cursor-pointer ${
                              isActive ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'
                            }`}
                          >
                            <TabIcon className="w-4.5 h-4.5 shrink-0" style={{ color: isActive ? '#ffffff' : config.accentColor }} />
                            <span className={`text-sm font-sans tracking-wide ${isActive ? 'font-bold text-white' : 'font-medium text-stone-600'}`}>
                              {tab.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Música Flotante */}
            {backgroundMusicUrl && (
              <div className="absolute top-4 left-4 z-50">
                {canPlayInlineMusic && (
                  <audio ref={audioRef} src={backgroundMusicUrl} loop preload="metadata" playsInline />
                )}
                <button
                  onClick={() => {
                    if (!canPlayInlineMusic) {
                      window.open(backgroundMusicUrl, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    if (musicEnabled) setMusicEnabled(false);
                    else void startBackgroundMusic();
                  }}
                  className="floating-control relative h-[52px] w-[52px] rounded-full bg-white/90 backdrop-blur-xl border border-white/70 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  style={{ color: config.accentColor }}
                  aria-label="Música de fondo"
                >
                  {musicEnabled ? <VolumeX className="h-[22px] w-[22px]" /> : <Volume2 className="h-[22px] w-[22px]" />}
                </button>
              </div>
            )}

            {/* Alternar Día/Noche */}
            <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2">
              <button
                type="button"
                onClick={() => setIsNightMode(!isNightMode)}
                className="floating-control day-night-toggle relative flex h-[52px] items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 text-[10px] font-bold uppercase tracking-widest text-stone-700 backdrop-blur-xl transition active:scale-95"
              >
                {isNightMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                <span>{isNightMode ? 'Día' : 'Noche'}</span>
              </button>
            </div>

            {/* Dock de Acciones Rápidas */}
            <div className="quick-dock absolute left-1/2 bottom-9 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-white/72 px-2.5 py-2 backdrop-blur-2xl">
              {quickActions.map((item) => {
                const QuickIcon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    disabled={item.disabled}
                    className="quick-action flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/78 text-stone-700 transition hover:bg-[#B88A2E] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ color: item.disabled ? '#a8a29e' : undefined }}
                  >
                    <QuickIcon className="relative z-10 h-[18px] w-[18px]" />
                  </button>
                );
              })}
            </div>

            {/* Barra de Progreso */}
            <div className="absolute left-5 right-5 bottom-4 z-40 pointer-events-none">
              <div className="progress-rail h-1.5 rounded-full bg-white/65 backdrop-blur-xl overflow-hidden border border-white/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                  initial={false}
                  animate={{ width: `${sectionProgress}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 24 }}
                />
              </div>
            </div>

            {/* Scrollable Container */}
            <div 
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 relative overflow-y-auto z-10 scroll-smooth snap-y snap-mandatory h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* SECTION: INICIO */}
              <div 
                id="sec-inicio" 
                className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-7 relative overflow-hidden"
              >
                {heroPhotos.length > 0 && <HeroCarousel photos={heroPhotos} />}

                <motion.div
                  className="hero-content relative z-10 w-full flex flex-col items-center justify-center space-y-4"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/72 backdrop-blur-xl border border-white/70 px-4 py-2 uppercase tracking-[0.25em] text-[10px] font-bold text-stone-600/95 luxury-card relative">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
                    {subtitle || 'Te invitamos a celebrar'}
                  </div>

                  {theme === 'elegant' && (
                    <div className="flex justify-center text-stone-400">
                      <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                        <path d="M30 2C24 2 20 8 15 12C10 16 4 17 0 17C4 17 8 18 12 21C16 24 20 22 25 18C30 14 30 14 35 18C40 22 44 24 48 21C52 18 56 17 60 17C56 17 50 16 45 12C40 8 36 2 30 2Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <circle cx="30" cy="12" r="3" fill="currentColor" fillOpacity="0.4"/>
                      </svg>
                    </div>
                  )}

                  <h1 className={`hero-title leading-tight font-medium tracking-wide w-full select-none ${config.fontTitle}`}>
                    {title}
                  </h1>

                  <motion.div
                    className="h-px bg-gradient-to-r from-transparent via-stone-400/70 to-transparent w-3/4"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.35, duration: 0.9 }}
                  />

                  {hosts && (
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-600 max-w-xs leading-relaxed px-4">
                      {hosts}
                    </p>
                  )}
                  {hasGuestPassSection && (
                    <div className="luxury-card relative w-full max-w-[350px] rounded-3xl border border-white/80 bg-white/78 px-5 py-4 text-left backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                        <Ticket className="h-3.5 w-3.5" style={{ color: config.accentColor }} />
                        Acceso personalizado
                      </div>
                      {isPersonalizedAccessLoading ? (
                        <p className="mt-3 text-[12px] leading-6 text-stone-600">Estamos cargando tus pases asignados...</p>
                      ) : personalizedGuest ? (
                        <>
                          <p className="mt-3 font-serif text-[22px] font-bold leading-tight text-stone-800">{personalizedGuest.name}</p>
                          <p className="mt-2 text-[11px] leading-5 text-stone-500">
                            {personalizedGuest.companions} pase(s) · {personalizedGuest.tableLabel || 'Mesa por asignar'}
                          </p>
                        </>
                      ) : personalizedAccessError ? (
                        <p className="mt-3 text-[12px] leading-6 text-rose-600">{personalizedAccessError}</p>
                      ) : null}
                    </div>
                  )}

                  <div className="luxury-card relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 px-6 py-5 font-serif italic text-stone-700 text-[15px] md:text-base leading-relaxed max-w-[350px]">
                    " {mainMessage} "
                  </div>

                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <button
                      onClick={handleEnterInvitation}
                      className="living-pill inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg cursor-pointer"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      Ver invitación
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {hasGuestPassSection && (
                      <button
                        type="button"
                        onClick={handleOpenGuestPasses}
                        className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-stone-800 shadow-lg backdrop-blur-xl cursor-pointer"
                      >
                        Obtener pases
                        <Ticket className="h-3.5 w-3.5" style={{ color: config.accentColor }} />
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>

              {hasGuestPassSection && (
                <div
                  id="sec-pases"
                  className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-6 relative"
                >
                  <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Tus pases</h2>

                  {isPersonalizedAccessLoading ? (
                    <div className={`luxury-card relative w-full rounded-3xl border p-6 ${config.borderColor} ${config.overlayColor}`}>
                      <RefreshCw className="mx-auto h-7 w-7 animate-spin" style={{ color: config.accentColor }} />
                      <p className="mt-4 text-[13px] leading-6 text-stone-600">Estamos preparando tus datos personalizados.</p>
                    </div>
                  ) : personalizedGuest ? (
                    <>
                      <div className={`luxury-card relative w-full rounded-3xl border p-6 ${config.borderColor} ${config.overlayColor} text-left`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Invitación individual</p>
                            <h3 className="mt-2 font-serif text-[28px] font-bold leading-tight text-stone-800">{personalizedGuest.name}</h3>
                            <p className="mt-2 text-[12px] leading-6 text-stone-500">
                              Esta entrada está vinculada a {personalizedGuest.companions} pase(s) para tu grupo.
                            </p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${personalizedGuestStatusClasses}`}>
                            {personalizedGuestStatusLabel}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                          <div className="rounded-2xl border border-white/80 bg-white/82 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Pases</p>
                            <p className="mt-2 font-serif text-[26px] font-bold text-stone-800">{personalizedGuest.companions}</p>
                          </div>
                          <div className="rounded-2xl border border-white/80 bg-white/82 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Mesa</p>
                            <p className="mt-2 font-serif text-[18px] font-bold text-stone-800">{personalizedGuest.tableLabel || 'Por asignar'}</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/80 bg-white/82 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Grupo y código</p>
                          <p className="mt-2 text-[12px] font-semibold text-stone-700">{personalizedGuest.group}</p>
                          <p className="mt-2 break-all font-mono text-[11px] leading-5 text-stone-600">{personalizedGuest.guestCode}</p>
                        </div>
                      </div>

                      <div className={`luxury-card relative w-full rounded-3xl border p-5 ${config.borderColor} ${config.overlayColor} text-left`}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Tu pase digital</p>
                        <p className="mt-3 text-[12px] leading-6 text-stone-600">
                          Genera tu QR para mostrarlo directamente en el acceso del evento.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setIsGuestQrVisible((current) => !current)}
                            className="living-pill inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer"
                            style={{ backgroundColor: config.accentColor }}
                          >
                            {isGuestQrVisible ? 'Ocultar pase' : 'Generar pase'}
                            <Ticket className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {isGuestQrVisible && (
                          <div className="mt-4 rounded-[28px] border border-white/80 bg-white/92 p-5 text-center">
                            {isGuestQrLoading ? (
                              <div className="py-6">
                                <RefreshCw className="mx-auto h-6 w-6 animate-spin" style={{ color: config.accentColor }} />
                                <p className="mt-3 text-[12px] text-stone-500">Generando tu QR...</p>
                              </div>
                            ) : guestQrMarkup ? (
                              <>
                                <div
                                  className="mx-auto flex w-full max-w-[220px] items-center justify-center rounded-[24px] bg-white p-3 shadow-sm"
                                  dangerouslySetInnerHTML={{ __html: guestQrMarkup }}
                                />
                                <p className="mt-4 text-[12px] leading-6 text-stone-500">
                                  Presenta este QR al ingresar. Contiene tu código único de acceso.
                                </p>
                              </>
                            ) : (
                              <p className="py-6 text-[12px] leading-6 text-rose-600">No pudimos generar el QR en este momento.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : personalizedAccessError ? (
                    <div className={`luxury-card relative w-full rounded-3xl border p-6 ${config.borderColor} ${config.overlayColor}`}>
                      <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
                      <p className="mt-4 text-[13px] leading-6 text-rose-600">{personalizedAccessError}</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* SECTION: CUENTA REGRESIVA */}
              <div 
                id="sec-cuenta" 
                className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-7 relative"
              >
                <InvitationCountdown
                  date={details.date}
                  time={details.time}
                  accentColor={config.accentColor}
                  borderColor={config.borderColor}
                />
                {/* <motion.div
                  className="w-full pt-4 text-center"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.55 }}
                >
                  <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-stone-500 font-bold mb-6">
                    <Timer className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
                    {timeLeft.isOver ? '¡LLEGÓ EL DÍA!' : 'CUENTA REGRESIVA'}
                  </div>
                  {timeLeft.isOver ? (
                    <div className="text-xs font-serif italic text-stone-700 bg-white/60 py-2.5 px-5 rounded-full inline-block border border-stone-200">
                      ¡El evento ha comenzado! 🎉
                    </div>
                  ) : (
                    <div className="luxury-card relative flex w-full justify-center items-center space-x-3 rounded-[2rem] border border-yellow-700/15 bg-white/64 px-3 py-5 backdrop-blur-xl">
                      {[
                        { value: timeLeft.days, label: 'Días' },
                        { value: timeLeft.hours, label: 'Hrs' },
                        { value: timeLeft.minutes, label: 'Min' },
                        { value: timeLeft.seconds, label: 'Seg' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div 
                            className="countdown-tile h-[76px] w-[66px] rounded-3xl border border-white/80 bg-white/78 backdrop-blur-xl flex items-center justify-center font-serif text-[24px] font-semibold text-stone-805"
                            style={{ borderColor: config.borderColor }}
                          >
                            {String(item.value).padStart(2, '0')}
                          </div>
                          <span className="text-[10px] text-stone-400 font-sans uppercase tracking-[0.1em] mt-2 font-semibold">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div> */}
              </div>

              {/* SECTION: HISTORIA */}
              {hasStorySection && (
                <div
                  id="sec-historia"
                  className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-6 relative"
                >
                  <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Nuestra Historia</h2>

                  {story && (
                    <div className={`luxury-card relative w-full p-6 rounded-3xl border ${config.borderColor} ${config.overlayColor}`}>
                      <BookOpen className="w-6 h-6 mx-auto mb-4" style={{ color: config.accentColor }} />
                      <p className="font-serif italic text-[15px] leading-relaxed text-stone-600">
                        {story}
                      </p>
                    </div>
                  )}

                  {honorPeople && honorPeople.length > 0 && (
                    <div className="w-full space-y-2">
                      <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">
                        Padres y Padrinos
                      </h3>
                      {honorPeople.map((person, index) => (
                        <div
                          key={`${person.role}-${index}`}
                          className="luxury-card relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-4"
                        >
                          <p className="text-[9px] text-stone-400 font-sans font-bold uppercase tracking-widest">
                            {person.role}
                          </p>
                          <p className="font-serif text-sm font-bold text-stone-800 mt-0.5">
                            {person.names}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: FECHA Y MAPA */}
              <div 
                id="sec-ubicacion" 
                className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-7 relative"
              >
                <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800 mb-2">Fecha y Ubicación</h2>

                <div className={`luxury-card relative w-full py-6 px-5 rounded-3xl border ${config.borderColor} ${config.overlayColor} flex flex-col items-center`}>
                  <Calendar className="w-6 h-6 mb-3" style={{ color: config.accentColor }} />
                  
                  <div className="flex items-center justify-center space-x-4 my-2">
                    <div className="text-right border-r border-stone-300 pr-4">
                      <p className="text-[10px] tracking-wider text-stone-500 font-sans uppercase font-bold">{weekdayStr}</p>
                      <p className="text-[10px] tracking-widest text-stone-400 font-sans">{monthStr}</p>
                    </div>
                    <div className="text-5xl font-serif font-bold tracking-tight" style={{ color: config.accentColor }}>
                      {dayNum}
                    </div>
                    <div className="text-left border-l border-stone-300 pl-4">
                      <p className="text-[10px] tracking-widest text-stone-500 font-sans">{yearStr}</p>
                      <div className="flex items-center text-[10px] text-stone-500 font-bold">
                        <Clock className="w-3 h-3 mr-1 text-stone-400" />
                        {details.time} hrs
                      </div>
                    </div>
                  </div>

                  <p className="text-xs mt-3 text-stone-500 font-semibold tracking-wide text-center">
                    {getFormattedDate()}
                  </p>

                  <a 
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="living-pill mt-4 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-300/40 rounded-lg text-[10.5px] font-sans font-bold text-white inline-flex items-center space-x-1.5 transition active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-red-650" />
                    <span>Guardar en Google Calendar</span>
                  </a>
                </div>

                <div className={`luxury-card relative w-full p-7 rounded-3xl border ${config.borderColor} ${config.overlayColor} text-center flex flex-col items-center space-y-4`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${config.accentColor}15` }}>
                    <MapPin className="w-5 h-5" style={{ color: config.accentColor }} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-800">{venueName}</h3>
                    <p className="text-xs text-stone-600 font-serif leading-relaxed mt-1 px-1">{venueAddress}</p>
                  </div>
                  
                  {resolvedVenueMapsUrl && (
                    <a 
                      href={resolvedVenueMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="living-pill inline-flex items-center px-5 py-2.5 rounded-full text-[10.5px] font-bold tracking-widest uppercase text-white shadow-xs transition hover:opacity-90 active:scale-95 cursor-pointer mt-2"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      Ver en Google Maps
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION: PROGRAMA DEL DÍA (Timeline) */}
              {timeline && timeline.length > 0 && (
                <div 
                  id="sec-itinerario" 
                  className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 relative"
                >
                  <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800 mb-6">Programa del Día</h2>
                  
                  <div className="relative pl-7 border-l-2 border-stone-200/80 ml-5 space-y-7 pt-1.5 text-left w-full max-w-[340px]">
                    {timeline.map((item, index) => {
                      const NodeIcon = getIcon(item.icon);
                      return (
                        <div 
                          key={item.id} 
                          className="relative rounded-3xl bg-white/54 backdrop-blur-xl border border-white/70 p-4 -ml-1 luxury-card"
                        >
                          <span className="absolute -left-[37px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border shadow-xs" style={{ borderColor: config.accentColor }}>
                            <NodeIcon className="h-3.5 w-3.5" style={{ color: config.accentColor }} />
                          </span>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono tracking-wider font-bold text-stone-400 bg-stone-100 py-0.2 px-1.5 rounded-full inline-block">
                              {item.time} hrs
                            </span>
                            <h4 className="font-serif text-sm font-bold text-stone-800">{item.title}</h4>
                            <p className="text-xs text-stone-500 font-sans">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: GALERÍA */}
              {hasGallerySection && (
                <div
                  id="sec-galeria"
                  className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-6 relative"
                >
                  <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Galería de Fotos</h2>

                  <GalleryCarousel
                    photos={gallery!}
                    isPaused={activePhotoIndex !== null}
                    onOpenPhoto={setActivePhotoIndex}
                  />
                </div>
              )}

              {/* SECTION: DETALLES (Dress Code, mesa de regalos, música) */}
              <div 
                id="sec-detalles" 
                className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-6 relative"
              >
                <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800 mb-1">Detalles del Evento</h2>

                <div className={`luxury-card relative w-full p-6 rounded-3xl border ${config.borderColor} ${config.overlayColor} text-center flex flex-col items-center space-y-2`}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${config.accentColor}12` }}>
                    <Shirt className="w-6 h-6" style={{ color: config.accentColor }} />
                  </div>
                  <h3 className="font-serif text-[11px] font-semibold text-stone-500 tracking-widest uppercase">Código de Vestimenta</h3>
                  <p className="text-base font-serif font-bold text-stone-805" style={{ color: config.accentColor }}>{currentDress.name}</p>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-[320px]">{currentDress.desc}</p>
                  {dressCodeColor && (
                    <div className="mt-1 text-[10px] font-sans border-t border-stone-200/50 pt-1.5 text-stone-500 italic max-w-xs mx-auto">
                      {dressCodeColor}
                    </div>
                  )}
                </div>

                {giftTables && giftTables.length > 0 && (
                  <div className="w-full space-y-2">
                    <h3 className="font-serif text-xs font-bold text-stone-800 mb-1 flex items-center justify-center uppercase tracking-widest">
                      Mesa de Regalos
                    </h3>
                    
                    <div className="space-y-2 text-left">
                      {giftTables.map((table, index) => (
                        <div key={index} className="luxury-card bg-white/80 backdrop-blur-xl border border-white/70 p-3 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: config.accentColor }} />
                          <h4 className="font-serif text-xs font-bold text-stone-800 mb-0.5">{table.storeName}</h4>
                          {table.notes && <p className="text-[10px] text-stone-500 font-sans leading-relaxed mb-1">{table.notes}</p>}
                          
                          <div className="flex items-center space-x-1.5 mt-1">
                            {table.link && (
                              <a 
                                href={table.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[10px] font-medium inline-flex items-center transition cursor-pointer"
                              >
                                Ir a tienda
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </a>
                            )}
                            
                            {table.accountNumber && (
                              <button 
                                onClick={() => handleCopy(table.accountNumber || '', index)}
                                className="px-2 py-0.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-md text-[10px] font-medium inline-flex items-center transition active:scale-95 cursor-pointer"
                              >
                                {copiedIndex === index ? (
                                  <>
                                    <Check className="w-3 h-3 mr-0.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 mr-0.5 text-stone-400" />
                                    <span>Copiar Cuenta</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {musicRequested && (
                  <div className={`luxury-card relative w-full p-4 rounded-2xl border ${config.borderColor} ${config.overlayColor} text-center flex flex-col items-center space-y-1.5`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Music4 className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <h3 className="font-serif text-xs font-bold text-stone-800 tracking-wide uppercase">Sugerir Canción</h3>
                    <p className="text-[10px] text-stone-500 max-w-[270px]">¿Qué canción hará que no salgas de la pista?</p>
                    
                    <form onSubmit={handleMusicSuggest} className="flex gap-1 w-full max-w-[270px]">
                      <input 
                        type="text" 
                        value={tempSongName}
                        onChange={(e) => setTempSongName(e.target.value)}
                        placeholder="Artista - Nombre de canción..."
                        className="flex-1 px-2.5 py-1 text-[10px] bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-800"
                      />
                      <button 
                        type="submit" 
                        className="living-pill px-3 py-1 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                        style={{ backgroundColor: config.accentColor }}
                      >
                        Enviar
                      </button>
                    </form>

                    <AnimatePresence>
                      {musicSubmitted && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[10px] font-sans font-medium text-emerald-600"
                        >
                          ¡Sugerencia agregada! 💃
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* SECTION: LOGÍSTICA */}
              {hasLogisticsSection && (
                <div
                  id="sec-logistica"
                  className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-4 relative"
                >
                  <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Logística</h2>

                  {specialNotes && specialNotes.length > 0 && (
                    <div className={`luxury-card relative w-full p-4 rounded-2xl border ${config.borderColor} ${config.overlayColor} text-left`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4" style={{ color: config.accentColor }} />
                        <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">Notas especiales</h3>
                      </div>
                      <div className="space-y-2">
                        {specialNotes.map((note, index) => (
                          <p key={index} className="text-[11px] text-stone-600 leading-relaxed font-sans">
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendedStays && recommendedStays.length > 0 && (
                    <div className="w-full space-y-2 text-left">
                      <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Hotel className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
                        Hospedaje recomendado
                      </h3>
                      {recommendedStays.map((stay, index) => (
                        <div key={`${stay.name}-${index}`} className="luxury-card relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-xl p-3">
                          <h4 className="font-serif text-xs font-bold text-stone-800">{stay.name}</h4>
                          {stay.address && <p className="text-[10px] text-stone-500 mt-1">{stay.address}</p>}
                          {stay.notes && <p className="text-[10px] text-stone-500 leading-relaxed mt-1">{stay.notes}</p>}
                          <div className="flex gap-1.5 mt-2">
                            {stay.link && (
                              <a href={stay.link} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-stone-100 rounded-md text-[10px] font-medium text-stone-700 inline-flex items-center">
                                Ver hotel
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </a>
                            )}
                            {stay.phone && (
                              <a href={`tel:${stay.phone}`} className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-md text-[10px] font-medium text-stone-700">
                                Llamar
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {transportInfo && (
                    <div className={`luxury-card relative w-full p-4 rounded-2xl border ${config.borderColor} ${config.overlayColor} text-left`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4" style={{ color: config.accentColor }} />
                        <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">Transporte y estacionamiento</h3>
                      </div>
                      {transportInfo.parking && <p className="text-[11px] text-stone-600 leading-relaxed mb-1.5">{transportInfo.parking}</p>}
                      {transportInfo.shuttle && <p className="text-[11px] text-stone-600 leading-relaxed mb-1.5">{transportInfo.shuttle}</p>}
                      {transportInfo.notes && <p className="text-[10px] text-stone-500 leading-relaxed italic">{transportInfo.notes}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: FOTOS Y LIBRO DE MENSAJES */}
              {hasMessagesSection && (
                <div
                  id="sec-mensajes"
                  className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-4 relative"
                >
                  <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Fotos y Buenos Deseos</h2>

                  {(photoShareUrl || photoShareMessage) && (
                    <div className={`luxury-card relative w-full p-4 rounded-2xl border ${config.borderColor} ${config.overlayColor} text-center`}>
                      <Camera className="w-5 h-5 mx-auto mb-2" style={{ color: config.accentColor }} />
                      <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">Fotos del evento</h3>
                      {photoShareMessage && <p className="text-[10px] text-stone-500 leading-relaxed mt-1.5">{photoShareMessage}</p>}
                      {photoShareUrl && (
                        <a href={photoShareUrl} target="_blank" rel="noopener noreferrer" className="living-pill mt-3 inline-flex items-center px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer" style={{ backgroundColor: config.accentColor }}>
                          Subir fotos
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="luxury-card relative bg-white/82 backdrop-blur-xl border rounded-2xl p-4 w-full text-left" style={{ borderColor: config.borderColor }}>
                    <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest text-center mb-3">Libro de mensajes</h3>
                    <form onSubmit={handleGuestbookSubmit} className="space-y-2 mb-3">
                      <input
                        type="text"
                        value={guestbookName}
                        onChange={(e) => setGuestbookName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50/50 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
                      />
                      <textarea
                        value={guestbookMessage}
                        onChange={(e) => setGuestbookMessage(e.target.value)}
                        placeholder="Escribe un buen deseo..."
                        rows={2}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50/50 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400 resize-none"
                      />
                      <button type="submit" className="living-pill w-full py-2 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest cursor-pointer" style={{ backgroundColor: config.accentColor }}>
                        Publicar mensaje
                      </button>
                    </form>

                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {guestbookEntries.map((entry) => (
                        <div key={entry.id} className="bg-stone-50/80 border border-white rounded-xl p-2.5">
                          <p className="text-[10px] font-bold text-stone-805">{entry.name}</p>
                          {entry.message && <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5">{entry.message}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CONFIRMACIÓN RSVP */}
              <div 
                id="sec-rsvp" 
                className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-4 relative"
              >
                <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800 mb-1">Confirmar Asistencia</h2>

                <div className="luxury-card bg-white/84 backdrop-blur-xl border rounded-2xl p-4 w-full relative text-left" style={{ borderColor: config.borderColor, borderTop: `4px solid ${config.accentColor}` }}>
                  <div className="absolute top-3 right-3 text-rose-500">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  </div>

                  <p className="text-[10px] text-stone-500 font-sans mb-3 text-center">Agradecemos confirmar antes de la fecha límite para preparar tu lugar.</p>

                  {formSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-4 text-center flex flex-col items-center space-y-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-stone-800 text-xs">¡Confirmación enviada!</h4>
                        <p className="text-[10px] text-stone-500 mt-1 max-w-[220px] leading-relaxed mx-auto">
                          Tus detalles se han guardado. ¡Nos entusiasma mucho acompañarte!
                        </p>
                      </div>
                      <button 
                        onClick={() => setFormSubmitted(false)}
                        className="text-[10px] font-semibold text-stone-500 hover:text-stone-850 underline transition cursor-pointer pt-1"
                      >
                        Editar confirmación
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRsvpSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-1">Nombre o Familia</label>
                        <input 
                          type="text" 
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder="Ej. Familia Martínez Salas"
                          required
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50/50 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-1">¿Asistirás?</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRsvpConfirmed(true)}
                            className={`py-1.5 px-2 text-[10px] font-semibold rounded-lg border text-center transition flex items-center justify-center cursor-pointer ${
                              rsvpConfirmed === true 
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' 
                                : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            Sí, asistiré
                          </button>
                          <button
                            type="button"
                            onClick={() => setRsvpConfirmed(false)}
                            className={`py-1.5 px-2 text-[10px] font-semibold rounded-lg border text-center transition flex items-center justify-center cursor-pointer ${
                              rsvpConfirmed === false 
                                ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold' 
                                : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            No podré
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {rsvpConfirmed === true && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 overflow-hidden"
                          >
                            <label className="block text-[9px] font-sans font-bold text-stone-400 uppercase tracking-widest">Número de Personas</label>
                            <div className="flex items-center space-x-2 bg-stone-50 rounded-lg p-0.5 border border-stone-200 max-w-[124px]">
                              <button
                                type="button"
                                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                                className="w-6 h-6 rounded bg-white hover:bg-stone-100 flex items-center justify-center font-bold text-stone-750 transition"
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-mono text-xs font-bold text-stone-850">
                                {guestsCount}
                              </span>
                              <button
                                type="button"
                                onClick={() => setGuestsCount(Math.min(maxSelectableGuests, guestsCount + 1))}
                                className="w-6 h-6 rounded bg-white hover:bg-stone-100 flex items-center justify-center font-bold text-stone-750 transition"
                              >
                                +
                              </button>
                            </div>
                            {personalizedGuest && (
                              <p className="text-[10px] leading-5 text-stone-500">Tienes {personalizedGuest.companions} pase(s) asignados para esta invitación.</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="block text-[9px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-1">Mensaje (Opcional)</label>
                        <textarea 
                          value={rsvpMessage}
                          onChange={(e) => setRsvpMessage(e.target.value)}
                          placeholder="Ej. Felicitaciones o alergias..."
                          rows={1}
                          className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded-lg bg-stone-50/50 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400 focus:bg-white transition resize-none"
                        />
                      </div>

                      {musicRequested && rsvpConfirmed === true && (
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-1">Canción sugerida</label>
                          <input 
                            type="text" 
                            value={musicIdea}
                            onChange={(e) => setMusicIdea(e.target.value)}
                            placeholder="Tema preferido..."
                            className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded-lg bg-stone-50/50 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400 focus:bg-white transition"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="living-pill w-full py-2.5 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest transition shadow-xs cursor-pointer active:scale-[0.99] mt-2 text-center"
                        style={{ backgroundColor: config.accentColor }}
                      >
                        Enviar Confirmación
                      </button>
                    </form>
                  )}
                </div>

                {/* Footer Firma */}
                <div className="w-full flex flex-col items-center justify-center pt-8 pb-4 opacity-70">
                  <div className="flex items-center space-x-1.5 text-stone-400">
                    <span className="text-[9px] font-sans font-medium uppercase tracking-widest">Creado con</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-serif font-bold text-stone-600 mt-0.5 tracking-wide">
                    INViTARTE
                  </span>
                </div>
              </div>
            </div>

            {/* Visualizador de Foto Ampliada */}
            <AnimatePresence>
              {activePhoto && (
                <motion.div
                  className="absolute inset-0 z-[80] flex items-center justify-center bg-stone-950/78 px-5 py-8 backdrop-blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActivePhotoIndex(null)}
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    type="button"
                    onClick={() => setActivePhotoIndex(null)}
                    className="floating-control absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-800 backdrop-blur-xl cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {gallery && gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIndex((activePhotoIndex! - 1 + gallery!.length) % gallery!.length);
                        }}
                        className="floating-control absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-800 backdrop-blur-xl cursor-pointer"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIndex((activePhotoIndex! + 1) % gallery!.length);
                        }}
                        className="floating-control absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-800 backdrop-blur-xl cursor-pointer"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <motion.figure
                    className="luxury-card relative w-full max-w-[360px] overflow-hidden rounded-3xl border border-white/50 bg-white/92 p-2"
                    initial={{ scale: 0.92, y: 18, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.96, y: 12, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 170 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={activePhoto.url}
                      alt={activePhoto.title}
                      loading="eager"
                      decoding="async"
                      className="max-h-[68vh] w-full rounded-2xl object-cover"
                    />
                    <figcaption className="px-3 py-3 text-center">
                      <p className="font-serif text-base font-bold text-stone-800">{activePhoto.title}</p>
                      {gallery && gallery.length > 1 && activePhotoIndex !== null && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          {activePhotoIndex + 1} / {gallery.length}
                        </p>
                      )}
                    </figcaption>
                  </motion.figure>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </div>
    </LazyMotion>
  );
}
