import React from 'react';
import { PackageType, PackageDefinition } from './types';

export const PACKAGES: PackageDefinition[] = [
  {
    id: PackageType.ORO,
    name: 'Oro',
    description: 'La base ideal para una invitacion elegante con las secciones esenciales.',
    primaryColor: '#D4AF37',
    secondaryColor: '#FFF7DB',
    bgGradient: 'from-amber-50 via-[#fff8e6] to-white',
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
    id: PackageType.PLATINO,
    name: 'Platino',
    description: 'Mas secciones para informar mejor y una experiencia mas completa.',
    primaryColor: '#A8B3C7',
    secondaryColor: '#EEF2F7',
    bgGradient: 'from-slate-100 via-[#f7f9fc] to-white',
    fontClass: 'font-sans font-bold',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 4.75h10l2.75 4.5L12 19.25 4.25 9.25 7 4.75z"
        />
      </svg>
    )
  },
  {
    id: PackageType.DIAMANTE,
    name: 'Diamante',
    description: 'La experiencia mas robusta con extras premium y secciones avanzadas.',
    primaryColor: '#40C9FF',
    secondaryColor: '#E6FAFF',
    bgGradient: 'from-cyan-50 via-sky-50 to-white',
    fontClass: 'font-script',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3.5l6.5 7-6.5 10-6.5-10 6.5-7zm0 4.25l-3.35 3.6L12 17l3.35-5.65L12 7.75z"
        />
      </svg>
    )
  }
];
