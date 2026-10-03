import React from 'react';
import { FloatingParticle, seeded, type ParticleSpec, type ShapeKind } from './partyDesign';
import { BRAND_SWATCHES } from './palette';

/*
  Fondo vivo de todo el sitio publico.
  Rendimiento: las auroras son UNA sola capa estatica (se pinta una vez y no cuesta nada al hacer scroll);
  el movimiento lo dan pocas figuras de fiesta animadas solo con transform/opacity en la GPU.
*/

const KINDS: ShapeKind[] = ['sparkle', 'heart', 'star', 'balloon', 'crown', 'confetti', 'cap', 'petal'];
const COUNT = 8;

const PARTICLES: ParticleSpec[] = Array.from({ length: COUNT }, (_, i) => {
  const seed = i * 7 + 3;
  return {
    kind: KINDS[i % KINDS.length],
    color: BRAND_SWATCHES[i % BRAND_SWATCHES.length],
    left: 6 + ((i * 12 + seeded(seed) * 8) % 88),
    size: 12 + seeded(seed + 1) * 12,
    duration: 22 + seeded(seed + 2) * 14,
    delay: -seeded(seed + 3) * 30,
    drift: (seeded(seed + 4) - 0.5) * 140,
    spin: (seeded(seed + 5) - 0.5) * 360,
    opacity: 0.35,
    restTop: 8 + seeded(seed + 6) * 84
  };
});

const AURORA =
  'radial-gradient(60vmax 60vmax at 0% 0%, rgba(167,139,250,0.16), transparent 70%), ' +
  'radial-gradient(55vmax 55vmax at 100% 35%, rgba(244,114,182,0.12), transparent 70%), ' +
  'radial-gradient(60vmax 60vmax at 40% 110%, rgba(34,211,238,0.1), transparent 70%)';

const AmbientBackdropComponent: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0" style={{ background: AURORA }} />
    {PARTICLES.map((particle, index) => (
      <FloatingParticle key={index} particle={particle} className="hidden md:block" />
    ))}
  </div>
);

export const AmbientBackdrop = React.memo(AmbientBackdropComponent);
