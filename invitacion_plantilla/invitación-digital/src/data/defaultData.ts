import { InvitationDetails, ThemeConfig, ThemeType } from '../types';

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
    accentColor: '#B68D5D', // Ochre / Gold
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
    accentColor: '#C5A059', // Classic Gold
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
    accentColor: '#8B5CF6', // Dynamic Violet
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
    accentColor: '#171717', // Neutral Dark
    overlayColor: 'bg-[#FCFCFC]/95 backdrop-blur-[1px]',
    borderColor: 'border-neutral-200',
    patternClass: 'bg-[#FCFCFC]',
    desktopBorderBg: 'bg-neutral-50'
  }
};

export const DEFAULT_INVITATIONS: Record<string, InvitationDetails> = {
  plantillaBase: {
    id: 'nuevo-evento',
    title: 'Titulo del evento',
    subtitle: 'SUBTITULO DEL EVENTO',
    hosts: 'Anfitriones por definir',
    mainMessage: 'Escribe aqui el mensaje principal de la invitacion.',
    date: '2026-12-31',
    time: '18:00',
    venueName: 'Lugar por definir',
    venueAddress: 'Direccion por definir',
    dressCode: 'formal',
    dressCodeColor: 'Codigo de vestimenta por definir',
    giftTables: [],
    timeline: [],
    rsvpList: [],
    guestbookList: [],
    backgroundMusicUrl: '',
    musicPlaylistUrl: '',
    musicRequested: false,
    theme: 'elegant',

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

    // Activa esta seccion cuando ya exista informacion de ubicacion extendida.
    // venueMapsUrl: 'https://maps.google.com/?q=tu+evento',

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
  },
  boda: {
    id: 'boda-sofia-felipe',
    title: 'Sofía & Felipe',
    subtitle: 'NUESTRA BODA',
    hosts: 'Con la bendición de nuestros padres',
    mainMessage: 'Hay momentos en la vida que son especiales por sí solos, pero compartirlos con las personas que amamos los hace inolvidables. Te esperamos para celebrar nuestra unión.',
    date: '2026-10-18',
    time: '16:30',
    venueName: 'Hacienda San José',
    venueAddress: 'Km 12.5 Carretera Real del Monte, Tepotzotlán, Edo. de México',
    venueMapsUrl: 'https://maps.google.com/?q=Hacienda+San+Jose+Tepotzotlan',
    dressCode: 'formal',
    dressCodeColor: 'Rigurosa Etiqueta (Hombres de Traje Oscuro / Mujeres Vestido Largo)',
    coverImage: '/invitacion/sesion4.webp',
    story: 'Nos conocimos entre cafés largos, playlists compartidas y viajes improvisados. Con el tiempo descubrimos que nuestro lugar favorito siempre era donde estábamos juntos. Hoy queremos celebrar ese camino con las personas que han sido parte de nuestra historia.',
    honorPeople: [
      {
        role: 'Padres de la novia',
        names: 'Laura Martínez & Roberto Salazar'
      },
      {
        role: 'Padres del novio',
        names: 'Claudia Herrera & Miguel Torres'
      },
      {
        role: 'Padrinos de velación',
        names: 'Ana Paula Ríos & Javier Montes'
      }
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
      {
        id: '1',
        time: '16:30',
        title: 'Ceremonia Religiosa',
        description: 'Capilla Principal de la Hacienda',
        icon: 'church'
      },
      {
        id: '2',
        time: '18:00',
        title: 'Coctel de Bienvenida',
        description: 'Jardín de los Arcos',
        icon: 'glass-water'
      },
      {
        id: '3',
        time: '19:00',
        title: 'Recepción & Banquete',
        description: 'Gran Salón Virreinal',
        icon: 'utensils'
      },
      {
        id: '4',
        time: '21:30',
        title: 'Apertura de Pista & Baile',
        description: 'Música en vivo y diversión hasta el amanecer',
        icon: 'music'
      }
    ],
    gallery: [
      {
        id: 'g1',
        title: 'La propuesta',
        url: '/invitacion/propuesta.webp'
      },
      {
        id: 'g2',
        title: 'Nuestro sí',
        url: '/invitacion/sesion1.webp'
      },
      {
        id: 'g3',
        title: 'Atardecer juntos',
        url: '/invitacion/sesion2.webp'
      },
      {
        id: 'g4',
        title: 'Complicidad',
        url: '/invitacion/sesion3.webp'
      },
      {
        id: 'g5',
        title: 'Siempre nosotros',
        url: '/invitacion/sesion4.webp'
      },
      {
        id: 'g6',
        title: 'Aventuras',
        url: '/invitacion/vacaiones.webp'
      },
      {
        id: 'g7',
        title: 'Con la familia',
        url: '/invitacion/familia.webp'
      },
      {
        id: 'g8',
        title: 'Nuestro equipo',
        url: '/invitacion/estadio.webp'
      },
      {
        id: 'g9',
        title: 'Lo cotidiano',
        url: '/invitacion/supermercado.webp'
      },
      {
        id: 'g10',
        title: 'Rutina compartida',
        url: '/invitacion/gym.webp'
      }
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
      {
        name: 'Mariana López',
        role: 'Wedding planner',
        phone: '+52 55 1234 5678',
        whatsappUrl: 'https://wa.me/525512345678'
      },
      {
        name: 'Daniel Torres',
        role: 'Coordinación de invitados',
        phone: '+52 55 8765 4321',
        email: 'invitados@example.com'
      }
    ],
    shareTitle: 'Boda de Sofía & Felipe',
    shareText: 'Te comparto la invitación digital de Sofía & Felipe.',
    rsvpList: [
      {
        id: 'r1',
        name: 'Familia Ramírez Gómez',
        confirmed: true,
        guestsCount: 4,
        message: '¡Muchas felicidades! Ahí estaremos para celebrar con ustedes.',
        createdAt: '2026-06-08T18:30:00Z'
      },
      {
        id: 'r2',
        name: 'Carlos Mendoza',
        confirmed: true,
        guestsCount: 1,
        musicSelection: 'La Chona - Los Tucanes de Tijuana',
        createdAt: '2026-06-09T01:15:00Z'
      },
      {
        id: 'r3',
        name: 'Mariana De Jesús',
        confirmed: false,
        guestsCount: 0,
        message: 'Lo lamento mucho, no estaré en el país en esa fecha. ¡Les deseo lo mejor!',
        createdAt: '2026-06-09T03:40:00Z'
      }
    ],
    guestbookList: [
      {
        id: 'gb1',
        name: 'Tía Lupita',
        confirmed: true,
        guestsCount: 1,
        message: 'Que esta nueva etapa esté llena de paciencia, ternura y muchas aventuras.',
        createdAt: '2026-06-10T16:20:00Z'
      }
    ],
    backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    musicPlaylistUrl: 'https://spotify.com',
    musicRequested: true,
    theme: 'elegant'
  },
  cumpleanos: {
    id: 'cumple-liam-30',
    title: 'Mis 30 Primaveras',
    subtitle: 'CELEBRA CONMIGO',
    hosts: 'Host: Liam García',
    mainMessage: 'Dicen susurrando por ahí que los 30 son los mejores, los nuevos 20... ¡Así que hay que celebrarlo en grande con buenos tragos, rica comida y excelente compañía!',
    date: '2026-07-25',
    time: '20:00',
    venueName: 'Estudio Terraza 8',
    venueAddress: 'Calle Reforma #452, Col. Americana, Guadalajara, Jal.',
    venueMapsUrl: 'https://maps.google.com/?q=Terraza+Americana',
    dressCode: 'casual',
    dressCodeColor: 'Boho Chic / Casual de Noche (Siéntete libre y cómodo)',
    giftTables: [
      {
        storeName: 'Amazon Wishlist',
        link: 'https://amazon.com',
        notes: '¡Tu presencia es el regalo más grande, pero si deseas obsequiarme algo, aquí hay algunas ideas!'
      }
    ],
    timeline: [
      {
        id: '1',
        time: '20:00',
        title: 'Acceso & Copa de Bienvenida',
        description: 'Dj Set Chill',
        icon: 'sparkles'
      },
      {
        id: '2',
        time: '21:30',
        title: 'Tacos de Pastor & Antojitos',
        description: 'Barra libre de drinks y barra gourmet',
        icon: 'utensils'
      },
      {
        id: '3',
        time: '23:00',
        title: 'Brindis & Pastel',
        description: 'Momento de soplar las velas y fotos de grupo',
        icon: 'cake'
      },
      {
        id: '4',
        time: '23:30',
        title: 'La Gran Fiesta',
        description: 'Baile y Shots sorpresa',
        icon: 'glass-water'
      }
    ],
    rsvpList: [
      {
        id: '1',
        name: 'Alberto y Valeria',
        confirmed: true,
        guestsCount: 2,
        message: '¡No podíamos faltar a este hito hermano! Abrazo.',
        createdAt: '2026-06-08T22:00:00Z'
      }
    ],
    musicPlaylistUrl: '',
    musicRequested: true,
    theme: 'boho'
  },
  babyshower: {
    id: 'babyshower-emma',
    title: 'Baby Shower Emma',
    subtitle: 'NUESTRA DULCE ESPERA',
    hosts: 'Los futuros papás: Andrea & Diego',
    mainMessage: 'Una nueva estrellita está por iluminar nuestras vidas con su ternura. Te invitamos a celebrar con nosotros el próximo nacimiento de nuestra amada Emma.',
    date: '2026-09-05',
    time: '14:30',
    venueName: 'Salón Jardín Girasoles',
    venueAddress: 'Avenida Vallarta #8900, Zapopan, Jalisco',
    venueMapsUrl: 'https://maps.google.com/?q=Zapopan+Girasoles',
    dressCode: 'cocktail',
    dressCodeColor: 'Tonos Pastel (Beige, menta, rosa pálido, lavanda)',
    giftTables: [
      {
        storeName: 'Mesa de Regalos Baby Creysi / Liverpool',
        notes: 'Mesa número: 395910283 "Baby Emma"'
      },
      {
        storeName: 'Sugerencia de pañales',
        notes: 'Agradecemos apoyo con pañales de la etapa 2 y 3.'
      }
    ],
    timeline: [
      {
        id: '1',
        time: '14:30',
        title: 'Llegada de Invitados',
        description: 'Mesa de snack y dulces abierta',
        icon: 'gift'
      },
      {
        id: '2',
        time: '15:15',
        title: 'Comida Buffet',
        description: 'Tartas saladas, postres caseros y cocteles sin alcohol',
        icon: 'utensils'
      },
      {
        id: '3',
        time: '16:30',
        title: 'Juegos & Risas',
        description: 'Premios divertidos para todos los ganadores',
        icon: 'sparkles'
      },
      {
        id: '4',
        time: '18:00',
        title: 'Agradecimientos & Despedida',
        description: 'Entrega de recuerditos y agradecimientos',
        icon: 'smile'
      }
    ],
    rsvpList: [],
    musicPlaylistUrl: '',
    musicRequested: false,
    theme: 'classic'
  }
};
