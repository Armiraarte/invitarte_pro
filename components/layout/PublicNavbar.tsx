import React, { useEffect, useState } from 'react';
import { AnimatePresence, m as motion } from 'motion/react';

export type PublicNavItem = {
  id: string;
  label: string;
  sectionId?: string;
};

type PublicNavbarProps = {
  items: readonly PublicNavItem[];
  logoSrc: string;
  hasScrolled: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onNavigate: (item: PublicNavItem) => void;
  onOpenEvents: () => void;
  onHome: () => void;
};

/*
  Marca la seccion visible con IntersectionObserver: no mide nada durante el scroll,
  el navegador avisa solo cuando una seccion cruza la franja al 40% de la pantalla.
*/
const useActiveSection = (items: readonly PublicNavItem[]) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const visible = new Set<string>();
    const observed = new Set<string>();
    const idBySection = new Map<Element, string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idBySection.get(entry.target);
          if (!id) continue;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const current = items.find((item) => visible.has(item.id))?.id ?? '';
        setActiveId((prev) => (prev === current ? prev : current));
      },
      { rootMargin: '-40% 0px -59% 0px' }
    );

    // Las secciones inferiores se montan despues del hero: se enganchan conforme aparecen.
    const attach = () => {
      for (const item of items) {
        if (observed.has(item.id)) continue;
        const section = document.getElementById(item.sectionId ?? item.id);
        if (!section) continue;
        observed.add(item.id);
        idBySection.set(section, item.id);
        observer.observe(section);
      }
      return observed.size === items.length;
    };

    let attempts = 0;
    const timer = attach()
      ? 0
      : window.setInterval(() => {
          attempts += 1;
          if (attach() || attempts > 20) window.clearInterval(timer);
        }, 700);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [items]);

  return activeId;
};

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  items,
  logoSrc,
  hasScrolled,
  mobileOpen,
  onToggleMobile,
  onNavigate,
  onOpenEvents,
  onHome
}) => {
  const activeId = useActiveSection(items);
  const isSolid = hasScrolled || mobileOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`relative mx-auto flex max-w-[76rem] items-center justify-between gap-3 rounded-full border py-2 pl-3 pr-2 transition-[background-color,border-color,box-shadow] duration-500 sm:pl-4 ${
          isSolid
            ? 'border-white/[0.09] bg-[#08080c]/95'
            : 'border-white/[0.06] bg-[#0b0b10]/40'
        }`}
      >
        {/* Brillo fino en el borde superior */}
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden="true" />

        <button type="button" onClick={onHome} className="flex items-center gap-2.5 rounded-full pr-2" aria-label="Ir al inicio">
          <img src={logoSrc} alt="" className="h-9 w-9 object-contain" width={36} height={36} />
          <span className="text-[13px] font-bold tracking-[0.22em] text-white">INViTARTE</span>
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                  isActive ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
                {isActive ? (
                  <span
                    className="absolute inset-x-4 -bottom-[3px] h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #22d3ee, #a78bfa, #f472b6)' }}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onOpenEvents} className="hidden rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-zinc-950 transition hover:bg-white/85 sm:inline-flex">
            Mi evento
          </button>
          <button
            type="button"
            onClick={onToggleMobile}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white lg:hidden"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-auto mt-2 max-w-[76rem] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#08080c] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.6)] lg:hidden"
          >
            <nav className="grid" aria-label="Principal móvil">
              {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[1.05rem] font-medium transition-colors ${
                      isActive ? 'bg-white/[0.07] text-white' : 'text-zinc-300'
                    }`}
                  >
                    {item.label}
                    {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </nav>
            <div className="mt-2 border-t border-white/[0.07] pt-3">
              <button type="button" onClick={onOpenEvents} className="w-full rounded-full bg-white py-3 text-[14px] font-semibold text-zinc-950">
                Entrar a mi evento
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
