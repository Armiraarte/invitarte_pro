import React, { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Calendar, Clock, Shirt, Copy, Check, Music4, Heart, 
  HelpCircle, Church, GlassWater, Utensils, Music, Sparkles, Cake, 
  Smile, Gift, CheckCircle2, ChevronRight, X, AlertCircle, Users, Menu, Timer,
  BookOpen, Camera, Car, Hotel, MessageCircle, Phone, Share2, Volume2, VolumeX,
  ChevronLeft, Moon, Sun
} from 'lucide-react';
import { InvitationDetails, RSVPResponse } from '../types';
import { THEME_CONFIGS } from '../data/defaultData';

type SectionId = 'inicio' | 'cuenta' | 'historia' | 'ubicacion' | 'itinerario' | 'galeria' | 'detalles' | 'logistica' | 'mensajes' | 'contacto' | 'rsvp';

// Map icon names from data to dynamic Lucide components safely
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

interface InvitationPreviewProps {
  details: InvitationDetails;
  onRsvpSubmit?: (response: RSVPResponse) => void;
  isStandalone?: boolean; // If rendered full screen or inside desktop simulator
}

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
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

export default function InvitationPreview({ details, onRsvpSubmit, isStandalone = false }: InvitationPreviewProps) {
  const {
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
    honorPeople,
    giftTables,
    timeline,
    gallery,
    specialNotes,
    recommendedStays,
    transportInfo,
    photoShareUrl,
    photoShareMessage,
    organizerContacts,
    shareTitle,
    shareText,
    guestbookList,
    backgroundMusicUrl,
    musicPlaylistUrl,
    musicRequested,
    theme
  } = details;

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.elegant;

  // Active Tab State for the new multi-section structure
  const [activeTab, setActiveTab] = useState<SectionId>('inicio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Local reference to content container so we can scroll back to top on tab change
  const contentRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const activeTabRef = useRef<SectionId>('inicio');
  const scrollFrameRef = useRef<number | null>(null);
  
  // RSVP Form State
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpConfirmed, setRsvpConfirmed] = useState<boolean | null>(null);
  const [guestsCount, setGuestsCount] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [musicIdea, setMusicIdea] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Music Suggester Toast
  const [musicSubmitted, setMusicSubmitted] = useState(false);
  const [tempSongName, setTempSongName] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [guestbookEntries, setGuestbookEntries] = useState<RSVPResponse[]>(guestbookList || []);
  const [guestbookName, setGuestbookName] = useState('');
  const [guestbookMessage, setGuestbookMessage] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [gallerySlideIndex, setGallerySlideIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasStorySection = Boolean(story || (honorPeople && honorPeople.length > 0));
  const hasGallerySection = Boolean(gallery && gallery.length > 0);
  const hasLogisticsSection = Boolean(
    (specialNotes && specialNotes.length > 0) ||
    (recommendedStays && recommendedStays.length > 0) ||
    transportInfo
  );
  const hasMessagesSection = Boolean(photoShareUrl || photoShareMessage || guestbookEntries.length > 0);
  const hasContactSection = Boolean((organizerContacts && organizerContacts.length > 0) || shareTitle || shareText);
  const coverPhoto = details.coverImage || gallery?.[0]?.url;

  const sessionPhotos = (gallery || []).filter((photo) => photo.url.includes('sesion'));
  const orderedSessionPhotos = coverPhoto
    ? [
        ...sessionPhotos.filter((photo) => photo.url === coverPhoto),
        ...sessionPhotos.filter((photo) => photo.url !== coverPhoto)
      ]
    : sessionPhotos;
  const heroPhotos = orderedSessionPhotos.length > 0
    ? orderedSessionPhotos
    : coverPhoto
      ? [{ id: 'cover', title: title || 'Portada', url: coverPhoto }]
      : [];

  useEffect(() => {
    if (heroPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroPhotos.length);
    }, 4200);

    return () => clearInterval(interval);
  }, [heroPhotos.length]);

  const galleryCount = gallery?.length || 0;

  useEffect(() => {
    if (galleryCount === 0 || gallerySlideIndex < galleryCount) return;
    setGallerySlideIndex(0);
  }, [galleryCount, gallerySlideIndex]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => () => {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (galleryCount <= 1 || activePhotoIndex !== null) return;

    const interval = setInterval(() => {
      setGallerySlideIndex((current) => (current + 1) % galleryCount);
    }, 5200);

    return () => clearInterval(interval);
  }, [galleryCount, activePhotoIndex]);

  const getGalleryPosition = (index: number) => {
    if (!galleryCount) return 'hidden';
    const offset = (index - gallerySlideIndex + galleryCount) % galleryCount;
    if (offset === 0) return 'active';
    if (offset === 1) return 'next';
    if (offset === galleryCount - 1) return 'prev';
    return 'hidden';
  };

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
    if (!canPlayInlineMusic) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.42;
    try {
      await audio.play();
      setMusicEnabled(true);
    } catch (error) {
      console.warn('La música requiere interacción del usuario para iniciar', error);
      setMusicEnabled(false);
    }
  };

  const handleEnterInvitation = () => {
    void startBackgroundMusic();
    scrollToSection('cuenta');
  };

  const closeGalleryViewer = () => setActivePhotoIndex(null);
  const showPreviousPhoto = () => {
    if (!gallery || activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex - 1 + gallery.length) % gallery.length);
  };
  const showNextPhoto = () => {
    if (!gallery || activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex + 1) % gallery.length);
  };

  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGalleryViewer();
      if (event.key === 'ArrowLeft') showPreviousPhoto();
      if (event.key === 'ArrowRight') showNextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, gallery]);

  // Smooth scroll method acting like a real website navbar
  const scrollToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = contentRef.current;
    if (!container) return;
    const el = container.querySelector(`#sec-${id}`) as HTMLElement;
    if (el) {
      isScrollingProgrammatically.current = true;
      activeTabRef.current = id;
      setActiveTab(id);
      container.scrollTo({
        top: el.offsetTop,
        behavior: 'smooth'
      });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 750);
    }
  };

  // Scroll event observer to update active navbar item dynamically
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingProgrammatically.current || scrollFrameRef.current !== null) return;
    const container = e.currentTarget;

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const scrollPosition = container.scrollTop;

      const availableSections = [
        'inicio',
        'cuenta',
        ...(hasStorySection ? ['historia'] : []),
        'ubicacion',
        ...(timeline && timeline.length > 0 ? ['itinerario'] : []),
        ...(hasGallerySection ? ['galeria'] : []),
        'detalles',
        ...(hasLogisticsSection ? ['logistica'] : []),
        ...(hasMessagesSection ? ['mensajes'] : []),
        ...(hasContactSection ? ['contacto'] : []),
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

  // Handle Copy Account Number/Registry info
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Submit RSVP
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || rsvpConfirmed === null) return;

    const newResponse: RSVPResponse = {
      id: 'r_user_' + Date.now(),
      name: rsvpName,
      confirmed: rsvpConfirmed,
      guestsCount: rsvpConfirmed ? guestsCount : 0,
      message: rsvpMessage.trim() || undefined,
      musicSelection: musicIdea.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    if (onRsvpSubmit) {
      onRsvpSubmit(newResponse);
    }
    setFormSubmitted(true);
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

  const handleShareInvitation = async () => {
    const url = window.location.href;
    const payload = {
      title: shareTitle || title || 'Invitación digital',
      text: shareText || mainMessage || 'Te comparto esta invitación digital.',
      url
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch (error) {
      console.warn('No se pudo compartir la invitación', error);
    }
  };

  // Human date formatting (es-ES)
  const getFormattedDate = () => {
    if (!date) return '';
    const parts = date.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const splitDate = () => {
    if (!date) return { dayNum: '', monthStr: '', yearStr: '' };
    const parts = date.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayNum = d.getDate().toString();
    const monthStr = d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
    const yearStr = d.getFullYear().toString();
    const weekdayStr = d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    return { dayNum, monthStr, yearStr, weekdayStr };
  };

  const { dayNum, monthStr, yearStr, weekdayStr } = splitDate();

  // Color mappings for dress code
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

  useEffect(() => {
    if (!canPlayInlineMusic || musicEnabled) return;

    const unlockAudio = () => {
      void startBackgroundMusic();
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [canPlayInlineMusic, musicEnabled, backgroundMusicUrl]);

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    if (!date) return '#';
    const eventTitle = encodeURIComponent(title || "Invitación Especial");
    const eventDetails = encodeURIComponent(mainMessage || "¡Te esperamos para celebrar este momento inolvidable!");
    const eventLocation = encodeURIComponent(`${venueName || ''}, ${venueAddress || ''}`);
    const dateClean = date.replace(/-/g, '');
    const startTime = time ? time.replace(/:/g, '') + '00' : '170000';
    // set duration to 5 hours as estimate
    const endTime = time ? (parseInt(time.split(':')[0]) + 5).toString().padStart(2, '0') + time.split(':')[1] + '00' : '220000';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dateClean}T${startTime}/${dateClean}T${endTime}&details=${eventDetails}&location=${eventLocation}`;
  };

  // Define tabs listing dynamically based on details
  const tabs = [
    { id: 'inicio' as SectionId, label: 'Inicio', icon: Heart },
    { id: 'cuenta' as SectionId, label: 'Conteo', icon: Timer },
    ...(hasStorySection ? [{ id: 'historia' as SectionId, label: 'Historia', icon: BookOpen }] : []),
    { id: 'ubicacion' as SectionId, label: 'Dónde', icon: MapPin },
    ...(timeline && timeline.length > 0 ? [{ id: 'itinerario' as SectionId, label: 'Programa', icon: Clock }] : []),
    ...(hasGallerySection ? [{ id: 'galeria' as SectionId, label: 'Galería', icon: Camera }] : []),
    { id: 'detalles' as SectionId, label: 'Detalles', icon: Shirt },
    ...(hasLogisticsSection ? [{ id: 'logistica' as SectionId, label: 'Logística', icon: Car }] : []),
    ...(hasMessagesSection ? [{ id: 'mensajes' as SectionId, label: 'Fotos', icon: MessageCircle }] : []),
    ...(hasContactSection ? [{ id: 'contacto' as SectionId, label: 'Contacto', icon: Phone }] : []),
    { id: 'rsvp' as SectionId, label: 'Asistencia', icon: CheckCircle2 }
  ];
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  const sectionProgress = tabs.length > 1 ? (activeIndex / (tabs.length - 1)) * 100 : 0;
  const quickActions = [
    {
      label: 'Guardar fecha',
      icon: Calendar,
      action: () => window.open(getGoogleCalendarUrl(), '_blank', 'noopener,noreferrer')
    },
    {
      label: 'Mapa',
      icon: MapPin,
      action: () => venueMapsUrl && window.open(venueMapsUrl, '_blank', 'noopener,noreferrer'),
      disabled: !venueMapsUrl
    },
    {
      label: 'Compartir',
      icon: Share2,
      action: handleShareInvitation
    },
    {
      label: 'RSVP',
      icon: CheckCircle2,
      action: () => scrollToSection('rsvp')
    }
  ];
  const activePhoto = activePhotoIndex !== null && gallery ? gallery[activePhotoIndex] : null;

  return (
    <div 
      id="invitation-mobile-card"
      className={`invitation-experience ${isNightMode ? 'invitation-night' : ''} w-full h-full ${config.bgColor} ${config.textColor} flex flex-col relative selection:bg-yellow-200 selection:text-stone-900 overflow-hidden`}
    >
      {/* Floating Menu Bubble */}
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
                      <TabIcon 
                        className="w-4.5 h-4.5 shrink-0" 
                        style={{ color: isActive ? '#ffffff' : config.accentColor }}
                      />
                      <span 
                        className={`text-sm font-sans tracking-wide ${
                          isActive ? 'font-bold text-white' : 'font-medium text-stone-600'
                        }`}
                      >
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
              if (musicEnabled) {
                setMusicEnabled(false);
              } else {
                void startBackgroundMusic();
              }
            }}
          className="floating-control relative h-[52px] w-[52px] rounded-full bg-white/90 backdrop-blur-xl border border-white/70 flex items-center justify-center transition active:scale-95 cursor-pointer"
            style={{ color: config.accentColor }}
            aria-label="Música de fondo"
          >
            {musicEnabled ? <VolumeX className="h-[22px] w-[22px]" /> : <Volume2 className="h-[22px] w-[22px]" />}
          </button>
        </div>
      )}

      <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2">
        <button
          type="button"
          onClick={() => setIsNightMode(!isNightMode)}
          className="floating-control day-night-toggle relative flex h-[52px] items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 text-[10px] font-bold uppercase tracking-widest text-stone-700 backdrop-blur-xl transition active:scale-95"
          aria-label={isNightMode ? 'Activar modo día' : 'Activar modo noche'}
          title={isNightMode ? 'Modo día' : 'Modo noche'}
        >
          {isNightMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          <span>{isNightMode ? 'Día' : 'Noche'}</span>
        </button>
      </div>

      <div className="quick-dock absolute left-1/2 bottom-9 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-white/72 px-2.5 py-2 backdrop-blur-2xl">
        {quickActions.map((item) => {
          const QuickIcon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              disabled={item.disabled}
              aria-label={item.label}
              title={item.label}
              className="quick-action flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/78 text-stone-700 transition hover:bg-[#B88A2E] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: item.disabled ? '#a8a29e' : undefined }}
            >
              <QuickIcon className="relative z-10 h-[18px] w-[18px]" />
            </button>
          );
        })}
      </div>

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

      {/* Main Continuous Page View with CSS snap points */}
      <div 
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 relative overflow-y-auto z-10 scroll-smooth snap-y snap-mandatory h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* SECTION 1: INICIO */}
        <div 
          id="sec-inicio" 
          className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-7 relative overflow-hidden"
        >
          {heroPhotos.length > 0 && (
            <div className="hero-carousel" aria-hidden="true">
              {heroPhotos.map((photo, index) => {
                const offset = (index - heroSlideIndex + heroPhotos.length) % heroPhotos.length;
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
          )}

          <motion.div
            className="hero-content relative z-10 w-full flex flex-col items-center justify-center space-y-4"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
          {/* Header Subtitle */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/72 backdrop-blur-xl border border-white/70 px-4 py-2 uppercase tracking-[0.25em] text-[10px] font-bold text-stone-600/95 luxury-card relative">
            <Sparkles className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
            {subtitle || 'Te invitamos a celebrar'}
          </div>

          {/* Theme Flourishes Logos */}
          {theme === 'elegant' && (
            <div className="flex justify-center text-stone-400">
              <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                <path d="M30 2C24 2 20 8 15 12C10 16 4 17 0 17C4 17 8 18 12 21C16 24 20 22 25 18C30 14 30 14 35 18C40 22 44 24 48 21C52 18 56 17 60 17C56 17 50 16 45 12C40 8 36 2 30 2Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="30" cy="12" r="3" fill="currentColor" fillOpacity="0.4"/>
              </svg>
            </div>
          )}
          {theme === 'classic' && (
            <div className="flex justify-center text-amber-500/80">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1"/>
                <rect x="12" y="12" width="16" height="16" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
              </svg>
            </div>
          )}
          {theme === 'boho' && (
            <div className="flex justify-center text-amber-600/70 space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
              <div className="w-4 h-1.5 rounded-full border border-amber-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
            </div>
          )}

          {/* Event Main Title */}
          <h1 className={`hero-title leading-tight font-medium tracking-wide w-full select-none ${config.fontTitle}`}>
            {title || 'Título de Evento'}
          </h1>

          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-stone-400/70 to-transparent w-3/4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.9, ease: 'easeOut' }}
          />

          {/* Hosts Info */}
          {hosts && (
            <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-600 max-w-xs leading-relaxed px-4">
              {hosts}
            </p>
          )}

          {/* Welcoming Message */}
          <div className="luxury-card relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 px-6 py-5 font-serif italic text-stone-700 text-[15px] md:text-base leading-relaxed max-w-[350px]">
            " {mainMessage || 'Mensaje de bienvenida afectuoso aquí...' } "
          </div>

          <button
            onClick={handleEnterInvitation}
            className="living-pill inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg cursor-pointer"
            style={{ backgroundColor: config.accentColor }}
          >
            Ver invitación
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          </motion.div>
        </div>

        {/* SECTION 1.5: CUENTA REGRESIVA */}
        <div 
          id="sec-cuenta" 
          className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-7 relative"
        >
          <InvitationCountdown
            date={date}
            time={time}
            accentColor={config.accentColor}
            borderColor={config.borderColor}
          />
        </div>

        {(story || (honorPeople && honorPeople.length > 0)) && (
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
                  <motion.div
                    key={`${person.role}-${index}`}
                    className="luxury-card relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-4"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <p className="text-[9px] text-stone-400 font-sans font-bold uppercase tracking-widest">
                      {person.role}
                    </p>
                    <p className="font-serif text-sm font-bold text-stone-800 mt-0.5">
                      {person.names}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: DÓNDE Y CUÁNDO */}
        <div 
          id="sec-ubicacion" 
          className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-7 relative"
        >
          <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800 mb-2">Fecha y Ubicación</h2>

          {/* Chic Styled Calendar Card */}
          <div className={`luxury-card relative w-full py-6 px-5 rounded-3xl border ${config.borderColor} ${config.overlayColor} flex flex-col items-center`}>
            <Calendar className="w-6 h-6 mb-3 text-stone-500 animate-pulse" style={{ color: config.accentColor }} />
            
            <div className="flex items-center justify-center space-x-4 my-2">
              <div className="text-right border-r border-stone-300 pr-4">
                <p className="text-[10px] tracking-wider text-stone-500 font-sans uppercase font-bold">{weekdayStr || 'SÁB'}</p>
                <p className="text-[10px] tracking-widest text-stone-400 font-sans">{monthStr || 'OCT'}</p>
              </div>
              <div className="text-5xl font-serif font-bold tracking-tight" style={{ color: config.accentColor }}>
                {dayNum || '18'}
              </div>
              <div className="text-left border-l border-stone-300 pl-4">
                <p className="text-[10px] tracking-widest text-stone-500 font-sans">{yearStr || '2026'}</p>
                <div className="flex items-center text-[10px] text-stone-500 font-bold">
                  <Clock className="w-3 h-3 mr-1 text-stone-400" />
                  {time || '17:00'} hrs
                </div>
              </div>
            </div>

            <p className="text-xs mt-3 text-stone-500 font-semibold tracking-wide text-center">
              {getFormattedDate()}
            </p>

            {/* Direct Google Calendar synchronization */}
            <a 
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="living-pill mt-4 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-300/40 rounded-lg text-[10.5px] font-sans font-bold text-white inline-flex items-center space-x-1.5 transition active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-red-700" />
              <span>Guardar en Google Calendar</span>
            </a>
          </div>

          {/* Venue Details Map pin card */}
          <div className={`luxury-card relative w-full p-7 rounded-3xl border ${config.borderColor} ${config.overlayColor} text-center flex flex-col items-center space-y-4`}>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center" style={{ backgroundColor: `${config.accentColor}15` }}>
              <MapPin className="w-5 h-5 animate-bounce" style={{ color: config.accentColor }} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-800">{venueName || 'Lugar del Evento'}</h3>
              <p className="text-xs text-stone-600 font-serif leading-relaxed mt-1 px-1">{venueAddress || 'Dirección completa del evento...'}</p>
            </div>
            
            {venueMapsUrl && (
              <a 
                href={venueMapsUrl}
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

        {/* SECTION 3: PROGRAMA DEL DÍA (Timeline) */}
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
                  <motion.div 
                    key={item.id} 
                    className="relative rounded-3xl bg-white/54 backdrop-blur-xl border border-white/70 p-4 -ml-1 luxury-card"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                  >
                    {/* Timeline Dot/Icon */}
                    <span className="absolute -left-[37px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border shadow-xs" style={{ borderColor: config.accentColor }}>
                      <NodeIcon className="h-3.5 w-3.5" style={{ color: config.accentColor }} />
                    </span>
                    {/* Details */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono tracking-wider font-bold text-stone-400 bg-stone-100 py-0.2 px-1.5 rounded-full inline-block">
                        {item.time} hrs
                      </span>
                      <h4 className="font-serif text-sm font-bold text-stone-800">{item.title}</h4>
                      <p className="text-xs text-stone-500 font-sans">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {gallery && gallery.length > 0 && (
          <div
            id="sec-galeria"
            className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-6 relative"
          >
            <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Galería de Fotos</h2>

            <div className="gallery-carousel" aria-label="Carrusel de fotos">
              {gallery.map((photo, index) => {
                const position = getGalleryPosition(index);
                return (
                  <motion.button
                    type="button"
                    key={photo.id}
                    onClick={() => {
                      if (position === 'active') {
                        setActivePhotoIndex(index);
                        return;
                      }
                      setGallerySlideIndex(index);
                    }}
                    className={`gallery-carousel-card gallery-carousel-card-${position}`}
                    aria-label={`${position === 'active' ? 'Ampliar' : 'Centrar'} foto: ${photo.title}`}
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

            {gallery.length > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setGallerySlideIndex((current) => (current - 1 + gallery.length) % gallery.length)}
                  className="gallery-nav-button"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(gallerySlideIndex)}
                  className="gallery-open-button"
                >
                  <Camera className="h-4 w-4" />
                  <span>Ver foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGallerySlideIndex((current) => (current + 1) % gallery.length)}
                  className="gallery-nav-button"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: DETALLES EXTRA (Dress code, mesa de regalos, música) */}
        <div 
          id="sec-detalles" 
          className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-6 relative"
        >
          <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800 mb-1">Detalles del Evento</h2>

          {/* Dress Code Section */}
          <div className={`luxury-card relative w-full p-6 rounded-3xl border ${config.borderColor} ${config.overlayColor} text-center flex flex-col items-center space-y-2`}>
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center" style={{ backgroundColor: `${config.accentColor}12` }}>
              <Shirt className="w-6 h-6" style={{ color: config.accentColor }} />
            </div>
            <h3 className="font-serif text-[11px] font-semibold text-stone-500 tracking-widest uppercase">Código de Vestimenta</h3>
            <p className="text-base font-serif font-bold text-stone-800" style={{ color: config.accentColor }}>{currentDress.name}</p>
            <p className="text-xs text-stone-500 leading-relaxed max-w-[320px]">{currentDress.desc}</p>
            {dressCodeColor && (
              <div className="mt-1 text-[10px] font-sans border-t border-stone-200/50 pt-1.5 text-stone-500 italic max-w-xs mx-auto">
                {dressCodeColor}
              </div>
            )}
          </div>

          {/* Gift Registries Table options */}
          {giftTables && giftTables.length > 0 && (
            <div className="w-full space-y-2">
              <h3 className="font-serif text-xs font-bold text-stone-800 mb-1 flex items-center justify-center select-none uppercase tracking-widest">
                Mesa de Regalos
              </h3>
              
              <div className="space-y-2">
                {giftTables.map((table, index) => (
                  <div key={index} className="luxury-card bg-white/80 backdrop-blur-xl border border-white/70 p-3 rounded-xl text-left relative overflow-hidden">
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
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                      
                      {table.accountNumber && (
                        <button 
                          onClick={() => handleCopy(table.accountNumber || '', index)}
                          className="px-2 py-0.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-md text-[10px] font-medium inline-flex items-center transition active:scale-95"
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

          {/* Music Suggester */}
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
                  className="living-pill px-3 py-1 bg-stone-850 hover:bg-stone-900 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
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

        {((specialNotes && specialNotes.length > 0) || (recommendedStays && recommendedStays.length > 0) || transportInfo) && (
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
              <div className="w-full space-y-2">
                <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
                  Hospedaje recomendado
                </h3>
                {recommendedStays.map((stay, index) => (
                  <div key={`${stay.name}-${index}`} className="luxury-card relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-xl p-3 text-left">
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

        {(photoShareUrl || photoShareMessage || guestbookEntries.length > 0) && (
          <div
            id="sec-mensajes"
            className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-4 relative"
          >
            <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Fotos y Buenos Deseos</h2>

            {(photoShareUrl || photoShareMessage) && (
              <div className={`luxury-card relative w-full p-4 rounded-2xl border ${config.borderColor} ${config.overlayColor} text-center`}>
                <Camera className="w-5 h-5 mx-auto mb-2" style={{ color: config.accentColor }} />
                <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">Compartir fotos del evento</h3>
                {photoShareMessage && <p className="text-[10px] text-stone-500 leading-relaxed mt-1.5">{photoShareMessage}</p>}
                {photoShareUrl && (
                  <a href={photoShareUrl} target="_blank" rel="noopener noreferrer" className="living-pill mt-3 inline-flex items-center px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: config.accentColor }}>
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
                    <p className="text-[10px] font-bold text-stone-800">{entry.name}</p>
                    {entry.message && <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5">{entry.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {((organizerContacts && organizerContacts.length > 0) || shareTitle || shareText) && (
          <div
            id="sec-contacto"
            className="section-stage w-full min-h-full h-max shrink-0 snap-start flex flex-col items-center justify-center px-7 py-16 text-center space-y-4 relative"
          >
            <h2 className="font-serif text-center text-lg font-bold tracking-wide text-stone-800">Contacto y Compartir</h2>

            {organizerContacts && organizerContacts.length > 0 && (
              <div className="w-full space-y-2">
                <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">Organizadores</h3>
                {organizerContacts.map((contact, index) => (
                  <div key={`${contact.name}-${index}`} className="luxury-card relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-xl p-3 text-left">
                    <p className="font-serif text-xs font-bold text-stone-800">{contact.name}</p>
                    {contact.role && <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-0.5">{contact.role}</p>}
                    <div className="flex gap-1.5 mt-2">
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="px-2 py-0.5 bg-stone-100 rounded-md text-[10px] font-medium text-stone-700">
                          Teléfono
                        </a>
                      )}
                      {contact.whatsappUrl && (
                        <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-medium">
                          WhatsApp
                        </a>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-md text-[10px] font-medium text-stone-700">
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={`luxury-card relative w-full p-4 rounded-2xl border ${config.borderColor} ${config.overlayColor} text-center`}>
              <Share2 className="w-5 h-5 mx-auto mb-2" style={{ color: config.accentColor }} />
              <h3 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-widest">Compartir invitación</h3>
              <p className="text-[10px] text-stone-500 leading-relaxed mt-1.5">
                Envía este enlace a quien deba recibir la invitación.
              </p>
              <button onClick={handleShareInvitation} className="living-pill mt-3 inline-flex items-center px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer" style={{ backgroundColor: config.accentColor }}>
                {shareCopied ? 'Enlace copiado' : 'Compartir'}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 5: CONFIRMACIÓN DE ASISTENCIA (RSVP) */}
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
                {/* Full Name Input */}
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

                {/* Attendance Selection radio toggles */}
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

                {/* Conditional guest count */}
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
                          onClick={() => setGuestsCount(Math.min(12, guestsCount + 1))}
                          className="w-6 h-6 rounded bg-white hover:bg-stone-100 flex items-center justify-center font-bold text-stone-750 transition"
                        >
                          +
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Greeting/Message Special details */}
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

          {/* Mini Footer / Signature */}
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

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="absolute inset-0 z-[80] flex items-center justify-center bg-stone-950/78 px-5 py-8 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGalleryViewer}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ampliada: ${activePhoto.title}`}
          >
            <button
              type="button"
              onClick={closeGalleryViewer}
              className="floating-control absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-800 backdrop-blur-xl"
              aria-label="Cerrar foto"
            >
              <X className="h-5 w-5" />
            </button>

            {gallery && gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPreviousPhoto();
                  }}
                  className="floating-control absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-800 backdrop-blur-xl"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextPhoto();
                  }}
                  className="floating-control absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-stone-800 backdrop-blur-xl"
                  aria-label="Foto siguiente"
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
              onClick={(event) => event.stopPropagation()}
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
  );
}
