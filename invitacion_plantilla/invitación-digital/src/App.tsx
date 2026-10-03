import React, { useState, useEffect } from 'react';
import { m as motion, LazyMotion, domAnimation } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { InvitationDetails, RSVPResponse } from './types';
import { DEFAULT_INVITATIONS, THEME_CONFIGS } from './data/defaultData';
import InvitationPreview from './components/InvitationPreview';

const LOCAL_STORAGE_KEY = 'invitarte_blank_template_v1';
const TEMPLATE_DEFAULT_KEY = 'plantillaBase';

export default function App() {
  const [details, setDetails] = useState<InvitationDetails | null>(null);

  // Load from LocalStorage or fallback to default Wedding preset
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultInvitation = DEFAULT_INVITATIONS[TEMPLATE_DEFAULT_KEY] || DEFAULT_INVITATIONS.boda;
        const shouldUseUploadedImages = !parsed.coverImage || parsed.gallery?.some((item: { url?: string }) => item.url?.includes('images.unsplash.com'));
        setDetails({
          ...defaultInvitation,
          ...parsed,
          coverImage: shouldUseUploadedImages ? defaultInvitation.coverImage : parsed.coverImage,
          gallery: shouldUseUploadedImages ? defaultInvitation.gallery : parsed.gallery || defaultInvitation.gallery,
          backgroundMusicUrl: parsed.backgroundMusicUrl === 'https://open.spotify.com'
            ? defaultInvitation.backgroundMusicUrl
            : parsed.backgroundMusicUrl || defaultInvitation.backgroundMusicUrl
        });
      } else {
        setDetails(DEFAULT_INVITATIONS[TEMPLATE_DEFAULT_KEY] || DEFAULT_INVITATIONS.boda);
      }
    } catch (e) {
      console.warn('Failed to load invitation state from localStorage', e);
      setDetails(DEFAULT_INVITATIONS[TEMPLATE_DEFAULT_KEY] || DEFAULT_INVITATIONS.boda);
    }
  }, []);

  // Save changes to LocalStorage on modification
  const handleDetailsChange = (newDetails: InvitationDetails) => {
    setDetails(newDetails);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDetails));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // Submit RSVP handler
  const handleRsvpSubmit = (newResponse: RSVPResponse) => {
    if (!details) return;
    const updatedRsvps = [newResponse, ...details.rsvpList];
    handleDetailsChange({
      ...details,
      rsvpList: updatedRsvps
    });
  };

  if (!details) {
    return (
      <div className="invitation-viewport w-full bg-stone-50 flex items-center justify-center px-6 text-stone-600">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#B88A2E] animate-spin" />
          <p className="text-sm font-medium tracking-wide">Cargando la invitación digital...</p>
        </div>
      </div>
    );
  }

  const config = THEME_CONFIGS[details.theme] || THEME_CONFIGS.elegant;

  // Background decoration based on active theme for desktop margins (costados difuminados)
  const getAmbientBackdrop = () => {
    switch (details.theme) {
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
      {/* 1. Dynamic background for desktops borders */}
      {getAmbientBackdrop()}

      {/* Glassmorphism Side Panels (Only Desktop) */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-[calc(50%-220px)] bg-white/20 backdrop-blur-xl border-r border-white/40 z-10" />
      <div className="hidden md:block absolute inset-y-0 right-0 w-[calc(50%-220px)] bg-white/20 backdrop-blur-xl border-l border-white/40 z-10" />

      {/* 2. Invitation Card Container */}
      {/* On mobile, it adjusts perfectly to fill the screen or scrolls as normal view (w-full min-h-screen).
          On desktop/wider screens, it centers with beautiful shadows, smooth rounded edges and border layouts (md:max-w-[440px] md:my-8 md:rounded-3xl md:shadow-2xl). */}
      <div className="invitation-shell flex items-center justify-center relative z-15">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 95 }}
          className="invitation-card-frame w-full h-full md:rounded-3xl bg-white shadow-md md:shadow-2xl flex flex-col overflow-hidden relative border-t-4 md:border border-stone-200"
          style={{ borderTopColor: config.accentColor }}
        >
          {/* Scrollable Digital Flyer Card */}
          <div className="flex-1 overflow-hidden">
            <InvitationPreview 
              details={details} 
              onRsvpSubmit={handleRsvpSubmit}
              isStandalone={true}
            />
          </div>
        </motion.div>
      </div>
    </div>
    </LazyMotion>
  );
}
