
import React from 'react';

export enum PackageType {
  ORO = 'ORO',
  PLATINO = 'PLATINO',
  DIAMANTE = 'DIAMANTE'
}

const PACKAGE_TYPE_ALIASES: Record<string, PackageType> = {
  ORO: PackageType.ORO,
  ELEGANT: PackageType.ORO,
  PLATINO: PackageType.PLATINO,
  PARTY: PackageType.PLATINO,
  DIAMANTE: PackageType.DIAMANTE,
  BABY: PackageType.DIAMANTE,
  MODERN: PackageType.DIAMANTE
};

export const normalizePackageType = (value: unknown): PackageType | null => {
  if (typeof value !== 'string') return null;
  return PACKAGE_TYPE_ALIASES[value.trim().toUpperCase()] ?? null;
};

export type SectionHeight = '25' | '50' | '75' | '100';
export type TextAlignment = 'left' | 'center' | 'right';

export interface ElementPosition {
  x: number;
  y: number;
}


export interface ImageStyle {
  scale?: number; // porcentaje (100 = tamano original del bloque)
  fit?: 'contain' | 'cover';
  asSectionBackground?: boolean;
}

export type SectionAnimationType = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom';

export interface SectionAnimation {
  type?: SectionAnimationType;
  duration?: number; // segundos
}

export interface Section {
  id: string;
  type: 'HERO' | 'MESSAGE' | 'DETAILS' | 'LOCATION' | 'FOOTER' | 'GUESTS' | 'COUNTDOWN' | 'BLANK' | 'IMAGE' | 'MUSIC';
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string; // Background image or main image for IMAGE type
  contentImageUrl?: string; // Image inside the content area for any section
  audioUrl?: string; // Audio source for MUSIC type
  animation?: SectionAnimation;
  imageStyle?: ImageStyle;
  contentImageStyle?: ImageStyle;
  alignment: TextAlignment;
  bgType: 'color' | 'image';
  bgValue: string; // Color hex o URL de imagen
  height: SectionHeight;
  
  // Estilos de texto por seccion
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;


  positions?: {
    title?: ElementPosition;
    subtitle?: ElementPosition;
    content?: ElementPosition;
    extra?: ElementPosition;
    contentImage?: ElementPosition;
  };
}

export interface InvitationData {
  hostName: string;
  eventTitle: string;
  sections: Section[];
  aiMessage?: string;
  globalBg?: {
    type: 'color' | 'image';
    value: string;
  };
}

export interface SavedDesign {
  id: string;
  packageId: PackageType;
  formData: InvitationData;
  step: 2 | 3;
  invitationId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Added InvitationPromptData to resolve property access errors in geminiService.ts and parameter mismatch in App.tsx
export interface InvitationPromptData {
  hostName: string;
  eventTitle: string;
  date: string;
  venue: string;
  additionalInfo: string;
}

export interface PackageDefinition {
  id: PackageType;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  fontClass: string;
}

