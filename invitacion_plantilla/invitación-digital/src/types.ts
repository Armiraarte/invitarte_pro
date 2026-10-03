export type ThemeType = 'elegant' | 'boho' | 'minimalist' | 'festive' | 'classic';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string; // Key of lucide-react icons
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
  dressCodeColor?: string; // Optional hex or description
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
  coverImage?: string; // Optional custom background
  theme: ThemeType;
}

export interface ThemeConfig {
  name: string;
  fontTitle: string;    // CSS Class style for titles
  fontBody: string;     // CSS Class style for descriptions
  bgColor: string;      // Mobile/inside backdrop
  textColor: string;    // Main text
  accentColor: string;  // Active buttons, borders
  overlayColor: string; // Translucent card background
  borderColor: string;  // Border styles
  decoratorSvg?: string; // Predefined SVGs or designs
  patternClass: string; // CSS pattern classes
  desktopBorderBg: string; // Ambient desktop background border color
}
