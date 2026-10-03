import type { InviteDesign } from './partyDesign';

export type TemplateCategory = 'bodas' | 'xv' | 'graduacion' | 'cumpleanos' | 'bautizo' | 'corporativo';

export type InvitationTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  palette: string[];
  badge?: string;
  design: InviteDesign;
};

export const TEMPLATE_CATEGORIES: { id: TemplateCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'bodas', label: 'Bodas' },
  { id: 'xv', label: 'XV años' },
  { id: 'graduacion', label: 'Graduación' },
  { id: 'cumpleanos', label: 'Cumpleaños' },
  { id: 'bautizo', label: 'Bautizo y baby shower' },
  { id: 'corporativo', label: 'Corporativo' }
];

export const categoryLabel = (category: TemplateCategory) =>
  TEMPLATE_CATEGORIES.find((item) => item.id === category)?.label ?? '';

const SANS = "'Bricolage Grotesque Variable', 'Bricolage Grotesque', sans-serif";

export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: 'olivo',
    name: 'Olivo',
    category: 'bodas',
    description: 'Natural y luminosa, con tonos salvia para bodas de jardín.',
    palette: ['#f7f4ec', '#557a48', '#2f3a2a'],
    badge: 'Más elegida',
    design: {
      eyebrow: 'Nos casamos',
      name: 'Ana & Carlos',
      date: '17 · May · 2026',
      place: 'Jardín Los Encinos',
      ornament: 'ring',
      screen: 'linear-gradient(180deg, #f7f4ec 0%, #e3e9d8 100%)',
      text: '#2f3a2a',
      muted: '#6f7c64',
      accent: '#557a48',
      buttonText: '#ffffff',
      decor: ['petal', 'sparkle']
    }
  },
  {
    id: 'noche-dorada',
    name: 'Noche dorada',
    category: 'bodas',
    description: 'Negro y oro para una boda de noche, elegante y dramática.',
    palette: ['#0e0d0b', '#d4af6a', '#f5ecd7'],
    design: {
      eyebrow: 'Nos casamos',
      name: 'Sofía & Mateo',
      date: '14 · Nov · 2026',
      place: 'Hacienda Los Olivos',
      ornament: 'ring',
      screen: 'linear-gradient(180deg, #0e0d0b 0%, #1d1a14 100%)',
      text: '#f5ecd7',
      muted: '#b9a881',
      accent: '#d4af6a',
      buttonText: '#1a160f',
      decor: ['sparkle', 'star']
    }
  },
  {
    id: 'princesa',
    name: 'Princesa',
    category: 'xv',
    description: 'Rosa y lila con corona, pensada para unos XV inolvidables.',
    palette: ['#fff0f8', '#a31f72', '#4a1d4f'],
    badge: 'Nueva',
    design: {
      eyebrow: 'Mis XV años',
      name: 'Valentina',
      date: '22 · Ago · 2026',
      place: 'Salón Versalles',
      ornament: 'crown',
      screen: 'linear-gradient(180deg, #fff0f8 0%, #f1dcff 100%)',
      text: '#4a1d4f',
      muted: '#9a6a9c',
      accent: '#a31f72',
      buttonText: '#ffffff',
      decor: ['sparkle', 'heart']
    }
  },
  {
    id: 'esmeralda',
    name: 'Esmeralda',
    category: 'xv',
    description: 'Verde profundo con detalles dorados, sofisticada y moderna.',
    palette: ['#062a22', '#e7c46a', '#eafff6'],
    design: {
      eyebrow: 'Mis XV años',
      name: 'Renata',
      date: '09 · Oct · 2026',
      place: 'Quinta Real',
      ornament: 'crown',
      screen: 'linear-gradient(180deg, #062a22 0%, #0d4436 100%)',
      text: '#eafff6',
      muted: '#9fd1bd',
      accent: '#e7c46a',
      buttonText: '#062a22',
      decor: ['sparkle', 'star']
    }
  },
  {
    id: 'toga',
    name: 'Toga',
    category: 'graduacion',
    description: 'Azul marino y oro para celebrar el gran logro.',
    palette: ['#0c1d40', '#f5c451', '#ffffff'],
    design: {
      eyebrow: 'Graduación 2026',
      name: 'Daniela Ruiz',
      date: '10 · Jul · 2026',
      place: 'Auditorio Central',
      ornament: 'cap',
      screen: 'linear-gradient(180deg, #0c1d40 0%, #16336a 100%)',
      text: '#ffffff',
      muted: '#a9bde3',
      accent: '#f5c451',
      buttonText: '#0c1d40',
      decor: ['star', 'confetti']
    }
  },
  {
    id: 'fiesta',
    name: 'Fiesta',
    category: 'cumpleanos',
    description: 'Colores vivos y globos para un cumpleaños con toda la energía.',
    palette: ['#ff8a8a', '#8f5cff', '#fff3a0'],
    badge: 'Popular',
    design: {
      eyebrow: '¡Vamos a celebrar!',
      name: 'Lucas cumple 30',
      date: '05 · Dic · 2026',
      place: 'Terraza Nova',
      ornament: 'balloon',
      screen: 'linear-gradient(180deg, #ff8a8a 0%, #ff5f9e 45%, #8f5cff 100%)',
      text: '#ffffff',
      muted: 'rgba(255,255,255,0.8)',
      accent: '#fff3a0',
      buttonText: '#5a1a7a',
      decor: ['confetti', 'star']
    }
  },
  {
    id: 'neon',
    name: 'Neón',
    category: 'cumpleanos',
    description: 'Fondo oscuro con brillos neón para fiestas nocturnas.',
    palette: ['#0b0620', '#22d3ee', '#b9a6ff'],
    design: {
      eyebrow: 'Party time',
      name: 'Mía cumple 18',
      date: '31 · Oct · 2026',
      place: 'Club Aurora',
      ornament: 'star',
      screen: 'linear-gradient(180deg, #0b0620 0%, #1a0b3a 100%)',
      text: '#ffffff',
      muted: '#b9a6ff',
      accent: '#22d3ee',
      buttonText: '#0b0620',
      decor: ['sparkle', 'confetti'],
      nameFont: SANS
    }
  },
  {
    id: 'nube',
    name: 'Nube',
    category: 'bautizo',
    description: 'Azul cielo, suave y tierno para un bautizo.',
    palette: ['#eef6ff', '#60a5fa', '#1e3a5f'],
    design: {
      eyebrow: 'Mi bautizo',
      name: 'Emiliano',
      date: '19 · Abr · 2026',
      place: 'Parroquia San José',
      ornament: 'heart',
      screen: 'linear-gradient(180deg, #eef6ff 0%, #dbeafe 100%)',
      text: '#1e3a5f',
      muted: '#5b7ca3',
      accent: '#60a5fa',
      buttonText: '#0b2545',
      decor: ['heart', 'sparkle']
    }
  },
  {
    id: 'dulce-espera',
    name: 'Dulce espera',
    category: 'bautizo',
    description: 'Tonos durazno y globos para un baby shower cálido.',
    palette: ['#fff7ed', '#e8a87c', '#5b3a24'],
    design: {
      eyebrow: 'Baby shower',
      name: 'Bebé Martínez',
      date: '07 · Jun · 2026',
      place: 'Casa Jacarandas',
      ornament: 'balloon',
      screen: 'linear-gradient(180deg, #fff7ed 0%, #fde7d3 100%)',
      text: '#5b3a24',
      muted: '#a07a5c',
      accent: '#e8a87c',
      buttonText: '#4a2a14',
      decor: ['heart', 'star']
    }
  },
  {
    id: 'ejecutivo',
    name: 'Ejecutivo',
    category: 'corporativo',
    description: 'Grafito y azul para galas, lanzamientos y eventos de empresa.',
    palette: ['#0f1115', '#38bdf8', '#f1f5f9'],
    design: {
      eyebrow: 'Evento corporativo',
      name: 'Gala Anual 2026',
      date: '28 · Nov · 2026',
      place: 'Centro de Convenciones',
      ornament: 'star',
      screen: 'linear-gradient(180deg, #0f1115 0%, #1c2330 100%)',
      text: '#f1f5f9',
      muted: '#94a3b8',
      accent: '#38bdf8',
      buttonText: '#0f1115',
      decor: ['star', 'sparkle'],
      nameFont: SANS
    }
  }
];

export const findTemplate = (id: string | null | undefined) => INVITATION_TEMPLATES.find((template) => template.id === id) ?? null;
