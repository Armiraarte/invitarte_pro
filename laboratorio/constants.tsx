import React from 'react';
import { PackageType, PackageDefinition, TemplatePreset } from './types';

export const PACKAGES: PackageDefinition[] = [
  {
    id: PackageType.ELEGANT,
    name: 'Editorial',
    description: 'Líneas limpias, detalles finos y una presencia sobria para eventos memorables.',
    primaryColor: '#C76A3D',
    secondaryColor: '#FFF1E8',
    bgGradient: 'from-orange-50 via-amber-50 to-white',
    fontClass: 'font-serif',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 21a9.003 9.003 0 008.34-5.578 5.76 5.76 0 00-1.096-1.51l-3.9-3.9a1 1 0 00-1.414 0l-3.9 3.9a5.76 5.76 0 00-1.096 1.51A9.003 9.003 0 0012 21z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 21a9.003 9.003 0 01-8.34-5.578 5.76 5.76 0 011.096-1.51l3.9-3.9a1 1 0 011.414 0l3.9 3.9a5.76 5.76 0 011.096 1.51A9.003 9.003 0 0112 21z"
        />
      </svg>
    )
  },
  {
    id: PackageType.PARTY,
    name: 'Festiva',
    description: 'Colores vivos y energía alta para celebraciones sociales que necesitan impacto.',
    primaryColor: '#D9466E',
    secondaryColor: '#FFE6EF',
    bgGradient: 'from-rose-100 via-orange-50 to-yellow-50',
    fontClass: 'font-sans font-bold',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 15.5a5 5 0 11-7.47-4.27 1 1 0 00.11-1.01A5 5 0 0011 5.5a1 1 0 00-1-1 5 5 0 10-9.47 2.27 1 1 0 00.11 1.01A5 5 0 015 15.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5z"
        />
      </svg>
    )
  },
  {
    id: PackageType.BABY,
    name: 'Aura',
    description: 'Tonos suaves y composición moderna para una experiencia visual envolvente.',
    primaryColor: '#2B6CB0',
    secondaryColor: '#E7F1FF',
    bgGradient: 'from-sky-50 via-cyan-50 to-white',
    fontClass: 'font-script',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  }
];

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'wedding-editorial',
    name: 'Boda editorial',
    description: 'Presentación refinada con ceremonia, cuenta regresiva y confirmación integrada.',
    category: 'BODAS',
    eventScale: 'Grande',
    audience: 'Parejas que quieren una invitación premium y clara.',
    accent: '#C76A3D',
    packageId: PackageType.ELEGANT,
  },
  {
    id: 'wedding-night',
    name: 'Boda nocturna',
    description: 'Estética sobria para bodas con presencia elegante y tono de noche.',
    category: 'BODAS',
    eventScale: 'Grande',
    audience: 'Ceremonias formales con presencia visual intensa.',
    accent: '#7C4A2D',
    packageId: PackageType.ELEGANT,
  },
  {
    id: 'xv-festiva',
    name: 'XV festiva',
    description: 'Ideal para quinceañeras con portada intensa, música y secciones sociales.',
    category: 'XV ANOS',
    eventScale: 'Mediano',
    audience: 'Eventos juveniles con mucho color y movimiento.',
    accent: '#D9466E',
    packageId: PackageType.PARTY,
  },
  {
    id: 'xv-luxe',
    name: 'XV luxe',
    description: 'Versión glam para una presentación con más brillo y protagonismo visual.',
    category: 'XV ANOS',
    eventScale: 'Grande',
    audience: 'Quinceaneras con tono elegante y fotografico.',
    accent: '#B453C2',
    packageId: PackageType.PARTY,
  },
  {
    id: 'xv-bloom',
    name: 'XV bloom',
    description: 'Una base floral y ligera para invitaciones juveniles con aire romántico.',
    category: 'XV ANOS',
    eventScale: 'Mediano',
    audience: 'Eventos con color suave y foco en las fotos.',
    accent: '#EC4899',
    packageId: PackageType.PARTY,
  },
  {
    id: 'baby-soft',
    name: 'Baby shower aura',
    description: 'Visual suave, mensajes cálidos y flujo simple para reuniones familiares.',
    category: 'BABY SHOWER',
    eventScale: 'Pequeño',
    audience: 'Eventos íntimos con enfoque emocional.',
    accent: '#2B6CB0',
    packageId: PackageType.BABY,
  },
  {
    id: 'birthday-bold',
    name: 'Cumpleaños bold',
    description: 'Tarjeta dinámica para fiestas medianas con agenda, ubicación y RSVP rápido.',
    category: 'CUMPLEANOS',
    eventScale: 'Mediano',
    audience: 'Celebraciones activas con gestion digital.',
    accent: '#7C3AED',
    packageId: PackageType.PARTY,
  },
  {
    id: 'corporate-clean',
    name: 'Evento corporativo clean',
    description: 'Formato directo para lanzamientos, inauguraciones o networking profesional.',
    category: 'CORPORATIVO',
    eventScale: 'Grande',
    audience: 'Marcas o negocios que necesitan orden y formalidad.',
    accent: '#0F766E',
    packageId: PackageType.ELEGANT,
  },
  {
    id: 'intimate-minimal',
    name: 'Reunión íntima minimal',
    description: 'Plantilla compacta para cenas, pedidas o eventos pequeños con mucho detalle.',
    category: 'SOCIAL',
    eventScale: 'Pequeño',
    audience: 'Eventos personales con montaje rápido.',
    accent: '#9A3412',
    packageId: PackageType.ELEGANT,
  },
];
