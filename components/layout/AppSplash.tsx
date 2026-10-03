import React from 'react';
import { m as motion } from 'motion/react';
import { OptimizedImage } from '../ui/OptimizedImage';

type AppSplashProps = {
  visible: boolean;
  fading: boolean;
  logoSrc: string;
};

export const AppSplash: React.FC<AppSplashProps> = ({ visible, fading, logoSrc }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black px-6"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[23rem] sm:max-w-[29rem] lg:max-w-[35rem]"
        >
          <OptimizedImage
            src={logoSrc}
            alt="Logo Invitarte"
            className="h-auto w-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 640px) 368px, (max-width: 1024px) 464px, 560px"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 text-[1.2rem] font-black uppercase tracking-[0.28em] text-white sm:text-[1.55rem]"
        >
          Cargando
        </motion.p>

        <div className="mt-7 flex items-center justify-center gap-3">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-3 w-3 rounded-full bg-white/90"
              animate={{
                opacity: [0.22, 1, 0.22],
                scale: [0.9, 1.18, 0.9],
                y: [0, -5, 0]
              }}
              transition={{
                duration: 0.95,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: dot * 0.16
              }}
            />
          ))}
        </div>

        <div className="mt-8 w-full max-w-xl">
          <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <motion.div
              className="absolute inset-y-[3px] left-[3px] w-[28%] rounded-full bg-gradient-to-r from-white/60 via-white to-white/70"
              animate={{ x: ['-12%', '260%'] }}
              transition={{
                duration: 1.55,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut'
              }}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/50 sm:text-sm"
        >
          Preparando la experiencia
        </motion.p>
      </div>
    </motion.div>
  );
};
