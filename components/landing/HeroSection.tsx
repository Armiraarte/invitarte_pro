import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  m as motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue
} from 'motion/react';
import { FloatingParticle, InviteScreen, PhoneShell, seeded, type InviteDesign, type ShapeKind } from './partyDesign';
import { LiveInviteScreen } from './LiveInviteScreen';
import type { MotionVariants } from './shared';

type HeroSectionProps = {
  fadeInUp: MotionVariants;
  staggerGroup: MotionVariants;
};

type GuestNoteIcon = 'check' | 'qr' | 'users';

type GuestNote = {
  icon: GuestNoteIcon;
  title: string;
  detail: string;
};

type PartyTheme = {
  id: string;
  label: string;
  background: string;
  glows: [string, string];
  titleGradient: string;
  particles: ShapeKind[];
  particleColors: string[];
  invite: InviteDesign;
  /* Invitacion real para el telefono principal (ej. '/demos/boda/index.html'). Sin ella se dibuja `invite`. */
  previewUrl?: string;
  notes: [GuestNote, GuestNote];
};

const ROTATE_EVERY_MS = 5200;
const HOLD_AFTER_INTERACTION_MS = 12000;

const PARTY_THEMES: PartyTheme[] = [
  {
    id: 'boda',
    label: 'Boda',
    background: 'linear-gradient(160deg, #1a130c 0%, #2c2016 45%, #120d08 100%)',
    glows: ['rgba(232,196,140,0.32)', 'rgba(255,236,210,0.14)'],
    titleGradient: 'linear-gradient(90deg, #f7e7c6 0%, #e2b877 55%, #fff5e4 100%)',
    particles: ['petal', 'sparkle', 'petal', 'heart'],
    particleColors: ['#f4dcc0', '#e8c48c', '#fff4e2', '#d9a86b'],
    invite: {
      eyebrow: 'Nos casamos',
      name: 'Sofía & Mateo',
      date: '14 · Nov · 2026',
      place: 'Hacienda Los Olivos',
      ornament: 'ring',
      screen: 'linear-gradient(180deg, #fbf6ee 0%, #f3e6d0 100%)',
      text: '#3b2f22',
      muted: '#8a7560',
      accent: '#b8925a',
      buttonText: '#1f1609',
      decor: ['petal', 'sparkle']
    },
    notes: [
      { icon: 'check', title: 'Ana y Luis confirmaron', detail: '2 lugares · Mesa 7' },
      { icon: 'qr', title: 'Acceso con QR', detail: 'Invitado 86 de 120' }
    ]
  },
  {
    id: 'xv',
    label: 'XV años',
    background: 'linear-gradient(160deg, #1d0a22 0%, #3a0f3d 48%, #14061a 100%)',
    glows: ['rgba(236,120,200,0.32)', 'rgba(196,160,255,0.2)'],
    titleGradient: 'linear-gradient(90deg, #ffd1ec 0%, #f08ad0 50%, #cdb2ff 100%)',
    particles: ['sparkle', 'heart', 'crown', 'sparkle'],
    particleColors: ['#ffc6e8', '#f08ad0', '#d9c2ff', '#ffffff'],
    invite: {
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
    },
    notes: [
      { icon: 'check', title: 'Mariana confirmó', detail: '3 lugares · Mesa 4' },
      { icon: 'users', title: 'Confirmados', detail: '142 de 180 invitados' }
    ]
  },
  {
    id: 'graduacion',
    label: 'Graduación',
    background: 'linear-gradient(160deg, #050d1f 0%, #0d2250 50%, #040a18 100%)',
    glows: ['rgba(245,196,81,0.26)', 'rgba(90,150,255,0.22)'],
    titleGradient: 'linear-gradient(90deg, #fff1c2 0%, #f5c451 55%, #ffe39a 100%)',
    particles: ['star', 'cap', 'confetti', 'star'],
    particleColors: ['#f5c451', '#ffe39a', '#9cc0ff', '#ffffff'],
    invite: {
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
    },
    notes: [
      { icon: 'check', title: 'Familia Ruiz confirmó', detail: '4 lugares · Fila B' },
      { icon: 'qr', title: 'QR validado', detail: 'Entrada 58 de 90' }
    ]
  },
  {
    id: 'cumpleanos',
    label: 'Cumpleaños',
    background: 'linear-gradient(160deg, #150834 0%, #34105a 48%, #0e0624 100%)',
    glows: ['rgba(255,110,160,0.3)', 'rgba(90,220,255,0.22)'],
    titleGradient: 'linear-gradient(90deg, #7ee8fa 0%, #ff8ad8 50%, #ffd36e 100%)',
    particles: ['confetti', 'balloon', 'confetti', 'star'],
    particleColors: ['#ff6fa8', '#7ee8fa', '#ffd36e', '#a98bff', '#7dffb2'],
    invite: {
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
    },
    notes: [
      { icon: 'check', title: 'Diego confirmó', detail: '+1 acompañante' },
      { icon: 'users', title: 'Confirmados', detail: '46 de 60 invitados' }
    ]
  }
];


const PARTICLE_COUNT = 18;

const PartyBackdrop: React.FC<{ theme: PartyTheme }> = ({ theme }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const seed = i + theme.id.length * 31;
        return {
          kind: theme.particles[i % theme.particles.length],
          color: theme.particleColors[i % theme.particleColors.length],
          left: seeded(seed) * 100,
          size: 10 + seeded(seed + 1) * 22,
          duration: 10 + seeded(seed + 2) * 9,
          delay: -seeded(seed + 3) * 18,
          drift: (seeded(seed + 4) - 0.5) * 160,
          spin: (seeded(seed + 5) - 0.5) * 540,
          opacity: 0.45 + seeded(seed + 6) * 0.5,
          restTop: 10 + seeded(seed + 7) * 80
        };
      }),
    [theme]
  );

  return (
    <div className="absolute inset-0" style={{ background: theme.background }}>
      <div
        className="absolute -left-[10%] top-[8%] h-[60%] w-[60%] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${theme.glows[0]}, transparent)` }}
      />
      <div
        className="absolute -right-[8%] bottom-[4%] h-[65%] w-[55%] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${theme.glows[1]}, transparent)` }}
      />
      {particles.map((particle, i) => (
        <FloatingParticle key={i} particle={particle} className={i >= 10 ? 'hidden sm:block' : ''} />
      ))}
    </div>
  );
};


const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const PhoneMockup: React.FC<{ theme: PartyTheme; className?: string; sheen?: boolean; live?: boolean; onInteract?: () => void }> = ({
  theme,
  className = '',
  sheen = false,
  live = false,
  onInteract
}) => (
  <PhoneShell className={className}>
    <AnimatePresence initial={false}>
      <motion.div
        key={theme.id}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Solo el telefono principal carga la invitacion real; los laterales siguen dibujados (mas ligeros) */}
        {live && theme.previewUrl ? (
          <LiveInviteScreen
            src={theme.previewUrl}
            title={`Invitación de ejemplo: ${theme.label}`}
            fallback={<InviteScreen invite={theme.invite} />}
            deferUntilLoad
            onInteract={onInteract}
          />
        ) : (
          <InviteScreen invite={theme.invite} />
        )}
      </motion.div>
    </AnimatePresence>
    {/* Destello de luz que cruza la pantalla en cada cambio de tema */}
    {sheen ? <span key={`sheen-${theme.id}`} className="hero-sheen" aria-hidden="true" /> : null}
  </PhoneShell>
);

/* Capa que se desplaza con el puntero; mas profundidad = mas movimiento (efecto 3D) */
const ParallaxLayer: React.FC<{
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  depth: number;
  className?: string;
  children: React.ReactNode;
}> = ({ pointerX, pointerY, depth, className, children }) => {
  const x = useTransform(pointerX, (value: number) => value * depth);
  const y = useTransform(pointerY, (value: number) => value * depth);
  return (
    <motion.div className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
};

const NOTE_ICONS: Record<GuestNoteIcon, string> = {
  check: 'M20 6 9 17l-5-5',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'
};

/* Aviso flotante que muestra el control de invitados "en vivo" junto a los telefonos */
const GuestNoteChip: React.FC<{ note: GuestNote; accent: string; themeId: string; delay: number }> = ({ note, accent, themeId, delay }) => (
  <AnimatePresence initial={true}>
    <motion.div
      key={themeId}
      className="absolute flex items-center gap-2.5 whitespace-nowrap rounded-2xl border border-white/12 bg-[rgba(14,11,22,0.86)] py-2 pl-2 pr-3.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)] sm:gap-3 sm:py-2.5 sm:pl-2.5 sm:pr-4"
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { delay, duration: 0.6, ease: EASE_OUT_EXPO } }}
      exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.25, ease: 'easeIn' } }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
        style={{ background: `${accent}24`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={NOTE_ICONS[note.icon]} />
        </svg>
      </span>
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[11.5px] font-semibold text-white sm:text-[13px]">{note.title}</span>
        <span className="mt-0.5 text-[10.5px] text-white/60 sm:text-[12px]">{note.detail}</span>
      </span>
    </motion.div>
  </AnimatePresence>
);

const HeroSectionComponent: React.FC<HeroSectionProps> = ({ fadeInUp, staggerGroup }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOnScreen, setIsOnScreen] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const total = PARTY_THEMES.length;

  // Fuera de pantalla el hero deja de rotar temas y pausa sus particulas: el scroll queda libre.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting), { threshold: 0 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Si el visitante esta desplazando la invitacion del telefono, el tema no cambia hasta que deje de tocarla un rato.
  const [holdTick, setHoldTick] = useState(0);
  const lastHold = useRef(0);
  const holdRotation = () => {
    const now = Date.now();
    if (now - lastHold.current < 1000) return;
    lastHold.current = now;
    setHoldTick((tick) => tick + 1);
  };

  useEffect(() => {
    if (!isOnScreen) return;
    const delay = holdTick > 0 && Date.now() - lastHold.current < 1500 ? HOLD_AFTER_INTERACTION_MS : ROTATE_EVERY_MS;
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % total), delay);
    return () => window.clearTimeout(timer);
  }, [activeIndex, total, isOnScreen, holdTick]);

  // Parallax con el mouse: solo en escritorio con puntero fino y sin "reducir movimiento"
  const reduceMotion = useReducedMotion();
  const canParallax = useRef(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 70, damping: 20, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 70, damping: 20, mass: 0.6 });

  useEffect(() => {
    canParallax.current = !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, [reduceMotion]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canParallax.current || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const theme = PARTY_THEMES[activeIndex];
  const prevTheme = PARTY_THEMES[(activeIndex - 1 + total) % total];
  const nextTheme = PARTY_THEMES[(activeIndex + 1) % total];

  return (
    <MotionConfig reducedMotion="user">
    <section ref={sectionRef} className={`relative z-20 w-full ${isOnScreen ? '' : 'hero-offscreen'}`}>
      {/* Sin animacion de entrada: el titulo y el texto se pintan en el primer cuadro (mejor LCP) */}
      <motion.div initial={false} animate="visible" variants={staggerGroup} className="w-full">
        <div className="relative overflow-hidden bg-[#0a0712]" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
          <AnimatePresence initial={false}>
            <motion.div
              key={theme.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <PartyBackdrop theme={theme} />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,rgba(5,5,7,0.55)_45%,#050507_100%)]" />

          <div
            id="inicio"
            className="relative mx-auto grid max-w-[120rem] gap-10 px-5 pb-16 pt-28 sm:px-8 sm:pt-32 md:px-10 lg:min-h-[100svh] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8 lg:px-16 lg:pb-20 2xl:px-24"
          >
            <div className="relative z-10 flex w-full flex-col items-center text-center lg:items-start lg:text-left">
              <motion.h1
                variants={fadeInUp}
                className="text-[clamp(2.5rem,12.4vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-white lg:text-[clamp(4rem,6.1vw,6.4rem)]"
              >
                <span className="block">Control de</span>
                <span className="relative block">
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={theme.id}
                      className="absolute inset-0 bg-clip-text text-transparent"
                      style={{ backgroundImage: theme.titleGradient }}
                      // Revelado de izquierda a derecha con desenfoque que se aclara
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', filter: 'blur(6px)' }
                      }
                      animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)' }}
                      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
                      transition={{ duration: reduceMotion ? 0.8 : 1, ease: EASE_OUT_EXPO }}
                      aria-hidden="true"
                    >
                      Invitados
                    </motion.span>
                  </AnimatePresence>
                  {/* Texto invisible que reserva el espacio y queda para lectores de pantalla */}
                  <span className="text-transparent">Invitados</span>
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mt-6 max-w-[32rem] text-[1.05rem] leading-7 text-white/78 sm:text-[1.2rem] sm:leading-8"
              >
                Invitación digital, confirmaciones y acceso con QR en un solo sistema. Sabes quién viene, cuántos son y en qué mesa van, en tiempo real.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center"
              >
                <a
                  href="#registro"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-[1rem] font-semibold text-zinc-950 shadow-[0_20px_50px_-12px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Empieza por $389
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#proceso"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Ver cómo funciona
                </a>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="relative flex items-center justify-center lg:justify-end">
              <div className="relative flex w-full max-w-[22rem] items-center justify-center py-4 sm:max-w-[30rem] lg:max-w-[36rem]">
                {/* Resplandor del color del tema detras del telefono principal */}
                <ParallaxLayer pointerX={springX} pointerY={springY} depth={-18} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={theme.id}
                      className="absolute aspect-square w-[95%] rounded-full"
                      style={{ background: `radial-gradient(closest-side, ${theme.glows[0]}, transparent 72%)` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                    />
                  </AnimatePresence>
                </ParallaxLayer>

                {/* Entrada: los telefonos laterales se abren en abanico desde el centro */}
                <ParallaxLayer pointerX={springX} pointerY={springY} depth={14} className="absolute left-0 top-1/2 w-[38%] sm:left-2">
                  <motion.div
                    initial={{ opacity: 0, x: '42%', y: '-38%', rotate: 0, scale: 0.9 }}
                    animate={{ opacity: 0.8, x: '0%', y: '-44%', rotate: -9, scale: 1 }}
                    transition={{ duration: 1.1, delay: 0.45, ease: EASE_OUT_EXPO }}
                  >
                    <div className="hero-phone-float" style={{ animationDelay: '-2s' }}>
                      <PhoneMockup theme={prevTheme} className="w-full" />
                    </div>
                  </motion.div>
                </ParallaxLayer>
                <ParallaxLayer pointerX={springX} pointerY={springY} depth={14} className="absolute right-0 top-1/2 w-[38%] sm:right-2">
                  <motion.div
                    initial={{ opacity: 0, x: '-42%', y: '-34%', rotate: 0, scale: 0.9 }}
                    animate={{ opacity: 0.8, x: '0%', y: '-40%', rotate: 9, scale: 1 }}
                    transition={{ duration: 1.1, delay: 0.45, ease: EASE_OUT_EXPO }}
                  >
                    <div className="hero-phone-float" style={{ animationDelay: '-4s' }}>
                      <PhoneMockup theme={nextTheme} className="w-full" />
                    </div>
                  </motion.div>
                </ParallaxLayer>

                <ParallaxLayer pointerX={springX} pointerY={springY} depth={26} className="relative z-10 w-[56%]">
                  <motion.div
                    initial={{ opacity: 0, y: 56, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.1, ease: EASE_OUT_EXPO }}
                  >
                    <div className="hero-phone-float">
                      <PhoneMockup theme={theme} className="w-full" sheen live onInteract={holdRotation} />
                    </div>
                  </motion.div>
                </ParallaxLayer>

                {/* Avisos de confirmacion: muestran el control de invitados en tiempo real */}
                <ParallaxLayer
                  pointerX={springX}
                  pointerY={springY}
                  depth={40}
                  className="pointer-events-none absolute left-[-4%] top-[13%] z-20 sm:left-[-6%]"
                >
                  <div className="hero-phone-float" style={{ animationDelay: '-1.5s' }} aria-hidden="true">
                    <GuestNoteChip note={theme.notes[0]} accent={theme.particleColors[1]} themeId={theme.id} delay={0.9} />
                  </div>
                </ParallaxLayer>
                <ParallaxLayer
                  pointerX={springX}
                  pointerY={springY}
                  depth={34}
                  className="pointer-events-none absolute bottom-[17%] right-[-4%] z-20 sm:right-[-6%]"
                >
                  <div className="hero-phone-float flex justify-end" style={{ animationDelay: '-3.5s' }} aria-hidden="true">
                    <GuestNoteChip note={theme.notes[1]} accent={theme.particleColors[1]} themeId={theme.id} delay={1.7} />
                  </div>
                </ParallaxLayer>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
    </MotionConfig>
  );
};

export const HeroSection = React.memo(HeroSectionComponent);
