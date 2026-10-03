
import React from 'react';

export enum PackageType {
  ELEGANT = 'ELEGANT',
  PARTY = 'PARTY',
  BABY = 'BABY',
  MODERN = 'MODERN'
}

export type SectionHeight = '25' | '50' | '75' | '100';
export type TextAlignment = 'left' | 'center' | 'right';

export interface ElementPosition {
  x: number;
  y: number;
}

export type SectionPositionKey =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'image'
  | 'contentImage'
  | 'countdown'
  | 'guests'
  | 'location'
  | 'music'
  | 'extra';

export interface SectionPositions {
  title?: ElementPosition;
  subtitle?: ElementPosition;
  content?: ElementPosition;
  image?: ElementPosition;
  contentImage?: ElementPosition;
  countdown?: ElementPosition;
  guests?: ElementPosition;
  location?: ElementPosition;
  music?: ElementPosition;
  extra?: ElementPosition; // fallback legacy para elementos que antes compartian la misma posicion
}

export interface ImageStyle {
  scale?: number; // porcentaje (100 = tamano original del bloque)
  fit?: 'contain' | 'cover';
  asSectionBackground?: boolean;
  width?: number;
  height?: number;
}

export type SectionAnimationType = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom';

export interface SectionAnimation {
  type?: SectionAnimationType;
  duration?: number; // segundos
}

export interface ContainerStyle {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number; // 0 - 100
  shadow?: boolean;
  animation?: SectionAnimation;
}

export interface SectionElementStyle extends ImageStyle, Partial<ContainerStyle> {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textColor?: string;
  textAlign?: TextAlignment;
}

export interface CountdownStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textColor?: string;
  scale?: number;
  itemGap?: number;
}

export type ItineraryIcon = 'church' | 'calendar' | 'calendarNote' | 'toast' | 'sparkles' | 'party' | 'moon';

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  icon: ItineraryIcon;
}

export interface ItineraryStyle {
  titleFontFamily?: string;
  titleFontSize?: number;
  timeFontFamily?: string;
  timeFontSize?: number;
  lineColor?: string;
  dotColor?: string;
  iconColor?: string;
}

export type RepeatableSectionElementKind = 'title' | 'subtitle' | 'content' | 'image' | 'contentImage' | 'container';

export interface SectionElement {
  id: string;
  kind: RepeatableSectionElementKind;
  value: string;
  position: ElementPosition;
  layer?: number;
  style?: SectionElementStyle;
}

export interface Section {
  id: string;
  type: 'HERO' | 'MESSAGE' | 'DETAILS' | 'LOCATION' | 'FOOTER' | 'GUESTS' | 'COUNTDOWN' | 'BLANK' | 'IMAGE' | 'MUSIC' | 'ITINERARY';
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string; // Background image or main image for IMAGE type
  contentImageUrl?: string; // Image inside the content area for any section
  audioUrl?: string; // Audio source for MUSIC type
  animation?: SectionAnimation;
  imageStyle?: ImageStyle;
  contentImageStyle?: ImageStyle;
  countdownStyle?: CountdownStyle;
  itineraryStyle?: ItineraryStyle;
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

  positions?: SectionPositions;
  elements?: SectionElement[];
  countdownTargetDate?: string;
  itineraryItems?: ItineraryItem[];
  locationMapUrl?: string;
  revealOnDemand?: boolean;
  revealButtonLabel?: string;
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

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  eventScale: 'Pequeño' | 'Mediano' | 'Grande';
  audience: string;
  accent: string;
  packageId: PackageType;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  provider: 'email' | 'google' | 'guest';
  avatarColor: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google' | 'guest';
  avatarColor: string;
  avatarUrl?: string;
}

