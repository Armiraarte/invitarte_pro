import React from 'react';

/*
  Piezas visuales de fiesta compartidas por todo el sitio:
  figuras (petalos, coronas, globos...) y la pantalla de invitacion dibujada en codigo.
*/

export type ShapeKind = 'petal' | 'sparkle' | 'heart' | 'star' | 'confetti' | 'balloon' | 'cap' | 'crown' | 'ring';

export type InviteDesign = {
  eyebrow: string;
  name: string;
  date: string;
  place: string;
  ornament: ShapeKind;
  screen: string;
  text: string;
  muted: string;
  accent: string;
  buttonText: string;
  decor: ShapeKind[];
  nameFont?: string;
};

export const SERIF = "'Cormorant Garamond', Georgia, serif";

export const Shape: React.FC<{ kind: ShapeKind; color: string; className?: string; style?: React.CSSProperties }> = ({
  kind,
  color,
  className,
  style
}) => {
  const common = { className, style, 'aria-hidden': true as const };

  switch (kind) {
    case 'petal':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2C7 7 6 14 12 22c6-8 5-15 0-20Z" fill={color} />
        </svg>
      );
    case 'sparkle':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12C7 11 11 7 12 0Z" fill={color} />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21Z" fill={color} />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="m12 2 2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17l-6 3.3 1.3-6.7-5-4.6 6.8-.8L12 2Z" fill={color} />
        </svg>
      );
    case 'confetti':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="8" y="3" width="8" height="18" rx="2" fill={color} />
        </svg>
      );
    case 'balloon':
      return (
        <svg viewBox="0 0 24 32" {...common}>
          <ellipse cx="12" cy="10" rx="9" ry="10" fill={color} />
          <path d="M10.5 19.6h3l-1.5 2.2-1.5-2.2Z" fill={color} />
          <path d="M12 22c-2 3 2 5 0 9" stroke={color} strokeWidth="0.9" fill="none" opacity="0.8" />
          <ellipse cx="8.5" cy="6.5" rx="2" ry="3" fill="#fff" opacity="0.35" />
        </svg>
      );
    case 'cap':
      return (
        <svg viewBox="0 0 32 24" {...common}>
          <path d="M16 3 1 9.5 16 16l15-6.5L16 3Z" fill={color} />
          <path d="M7 12.5v5.2c0 1.8 4 3.3 9 3.3s9-1.5 9-3.3v-5.2L16 16.4 7 12.5Z" fill={color} opacity="0.85" />
          <path d="M28 10.5v7" stroke={color} strokeWidth="1.3" />
          <circle cx="28" cy="18.5" r="1.4" fill={color} />
        </svg>
      );
    case 'crown':
      return (
        <svg viewBox="0 0 32 24" {...common}>
          <path d="M3 19 1.5 6.5l8 6L16 2l6.5 10.5 8-6L29 19H3Z" fill={color} />
          <rect x="3" y="20" width="26" height="2.6" rx="1.3" fill={color} />
          <circle cx="16" cy="12.5" r="1.8" fill="#fff" opacity="0.7" />
        </svg>
      );
    case 'ring':
      return (
        <svg viewBox="0 0 40 24" {...common}>
          <circle cx="15" cy="13" r="8" fill="none" stroke={color} strokeWidth="2.2" />
          <circle cx="25" cy="13" r="8" fill="none" stroke={color} strokeWidth="2.2" />
          <path d="m15 2.5 1.8 2.3L15 7l-1.8-2.2L15 2.5Z" fill={color} />
        </svg>
      );
  }
};

/* Pseudoaleatorio determinista para que las partículas no cambien entre renders */
export const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};


const INVITE_FEATURES = [
  { label: 'Ubicación', icon: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z' },
  { label: 'Fecha', icon: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4' },
  { label: 'Galería', icon: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 3-3L20 16M15.5 9a1 1 0 1 0 0-.01' }
];

/* Pantalla de invitación dibujada en código; todo en unidades cqw para escalar con el teléfono */
export const InviteScreen: React.FC<{ invite: InviteDesign }> = ({ invite }) => {

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: invite.screen, color: invite.text }}>
      <Shape kind={invite.decor[0]} color={invite.accent} className="absolute left-[8%] top-[16%] w-[9cqw] opacity-40" />
      <Shape kind={invite.decor[1]} color={invite.accent} className="absolute right-[10%] top-[24%] w-[6cqw] opacity-50" />
      <Shape kind={invite.decor[1]} color={invite.accent} className="absolute left-[12%] top-[58%] w-[5cqw] opacity-40" />
      <Shape kind={invite.decor[0]} color={invite.accent} className="absolute right-[8%] top-[64%] w-[8cqw] rotate-45 opacity-35" />

      <div className="relative flex h-full flex-col items-center px-[9cqw] pt-[17cqw] pb-[10cqw] text-center">
        <p className="text-[4cqw] font-semibold uppercase tracking-[0.3em]" style={{ color: invite.muted }}>
          {invite.eyebrow}
        </p>

        <Shape kind={invite.ornament} color={invite.accent} className="mt-[7cqw] h-[16cqw] w-[24cqw]" />

        <p
          className="mt-[5cqw] text-[12cqw] font-medium italic leading-[1.02]"
          style={{ fontFamily: invite.nameFont ?? SERIF, textWrap: 'balance' }}
        >
          {invite.name}
        </p>

        <div className="mt-[6cqw] flex w-full items-center gap-[3cqw]" style={{ color: invite.accent }}>
          <span className="h-px flex-1 bg-current opacity-50" />
          <Shape kind="sparkle" color="currentColor" className="w-[3.5cqw]" />
          <span className="h-px flex-1 bg-current opacity-50" />
        </div>

        <p className="mt-[5cqw] text-[5cqw] font-semibold uppercase tracking-[0.18em]">{invite.date}</p>
        <p className="mt-[2cqw] text-[4.2cqw]" style={{ color: invite.muted }}>
          {invite.place}
        </p>

        <div className="mt-[7cqw] grid w-full grid-cols-4 gap-[2.5cqw]">
          {[
            ['48', 'Días'],
            ['12', 'Hrs'],
            ['30', 'Min'],
            ['15', 'Seg']
          ].map(([value, unit]) => (
            <div
              key={unit}
              className="rounded-[3cqw] py-[2.5cqw]"
              style={{ background: 'rgba(255,255,255,0.22)', boxShadow: `inset 0 0 0 1px ${invite.accent}40` }}
            >
              <p className="text-[6cqw] font-bold leading-none">{value}</p>
              <p className="mt-[1cqw] text-[2.8cqw] uppercase tracking-wider" style={{ color: invite.muted }}>
                {unit}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-[7cqw] grid w-full grid-cols-3 gap-[2.5cqw]">
          {INVITE_FEATURES.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-[1.8cqw]">
              <span
                className="flex h-[11cqw] w-[11cqw] items-center justify-center rounded-full"
                style={{ background: `${invite.accent}26`, color: invite.accent }}
              >
                <svg viewBox="0 0 24 24" className="h-[5.5cqw] w-[5.5cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={feature.icon} />
                </svg>
              </span>
              <span className="text-[3.2cqw] font-semibold" style={{ color: invite.muted }}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-auto w-full rounded-full py-[3.6cqw] text-[4.2cqw] font-bold"
          style={{ background: invite.accent, color: invite.buttonText }}
        >
          Confirmar asistencia
        </div>
      </div>
    </div>
  );
};

export type ParticleSpec = {
  kind: ShapeKind;
  color: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
  opacity: number;
  restTop: number;
};

/*
  Figura flotante. Las keyframes son fijas (sin variables CSS), asi Chrome las anima
  en la GPU: subir, girar y desvanecer no ocupan el hilo principal ni frenan el scroll.
*/
export const FloatingParticle: React.FC<{ particle: ParticleSpec; className?: string }> = ({ particle, className = '' }) => (
  <span
    className={`hero-particle ${particle.drift < 0 ? 'drift-left' : 'drift-right'} ${className}`}
    style={
      {
        left: `${particle.left}%`,
        width: particle.size,
        height: particle.size,
        animationDuration: `${particle.duration}s`,
        animationDelay: `${particle.delay}s`,
        '--hero-rest-top': `${particle.restTop}%`
      } as React.CSSProperties
    }
  >
    <Shape
      kind={particle.kind}
      color={particle.color}
      className="hero-particle-spin block h-full w-full"
      style={{
        opacity: particle.opacity,
        animationDuration: `${Math.min(40, (particle.duration * 360) / Math.max(90, Math.abs(particle.spin)))}s`,
        animationDirection: particle.spin < 0 ? 'reverse' : 'normal'
      }}
    />
  </span>
);

/* Marco de telefono; el contenido escala con el ancho gracias a container queries */
export const PhoneShell: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`[container-type:inline-size] ${className}`}>
    <div className="relative aspect-[9/19] w-full rounded-[14cqw] bg-[#0b0b10] p-[3.2cqw] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.14)]">
      <div className="relative h-full w-full overflow-hidden rounded-[11cqw] [container-type:inline-size]">
        {children}
        <div className="absolute left-1/2 top-[3cqw] z-10 h-[7cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-[#0b0b10]" />
      </div>
    </div>
  </div>
);
