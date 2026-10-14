import React, { useEffect, useRef, useState } from 'react';

/*
  Pantalla "en vivo" para los mockups: carga la invitacion real (una pagina HTML) dentro de un iframe.
  La pagina se renderiza a ancho de celular real (VIEWPORT_WIDTH) y se escala para caber en el telefono,
  asi se ve su version movil y se puede desplazar con el dedo o la rueda del mouse.
  Mientras carga se muestra `fallback` (el diseño dibujado en codigo).
*/

const VIEWPORT_WIDTH = 390;

type LiveInviteScreenProps = {
  src: string;
  title: string;
  fallback?: React.ReactNode;
  /* false = solo se ve (sin scroll ni clics), util para telefonos decorativos */
  interactive?: boolean;
  /* Espera a que la pagina principal termine de cargar antes de pedir el iframe (no afecta el LCP) */
  deferUntilLoad?: boolean;
  /* Se llama cuando el visitante toca, desplaza o hace clic dentro de la invitacion */
  onInteract?: () => void;
};

const useAfterWindowLoad = (enabled: boolean) => {
  const [ready, setReady] = useState(!enabled);
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => setReady(true), 300);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      window.clearTimeout(timer);
    };
  }, [enabled]);
  return ready;
};

export const LiveInviteScreen: React.FC<LiveInviteScreenProps> = ({
  src,
  title,
  fallback,
  interactive = true,
  deferUntilLoad = false,
  onInteract
}) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const onInteractRef = useRef(onInteract);
  const [size, setSize] = useState({ scale: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);
  const canMount = useAfterWindowLoad(deferUntilLoad);

  onInteractRef.current = onInteract;

  // Escala el viewport de 390px al ancho real de la pantalla del mockup
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => {
      const { width, height } = box.getBoundingClientRect();
      if (!width) return;
      const scale = width / VIEWPORT_WIDTH;
      setSize({ scale, height: height / scale });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => setLoaded(false), [src]);

  // Las invitaciones viven en el mismo dominio, asi que podemos escuchar sus eventos (p. ej. para pausar el carrusel)
  const handleLoad = () => {
    setLoaded(true);
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    try {
      const notify = () => onInteractRef.current?.();
      ['pointerdown', 'wheel', 'touchstart', 'scroll', 'keydown'].forEach((type) => win.addEventListener(type, notify, { passive: true }));
    } catch {
      // Pagina de otro dominio: no se pueden leer sus eventos, simplemente no pausamos
    }
  };

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      {fallback ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`} aria-hidden={loaded}>
          {fallback}
        </div>
      ) : null}
      {canMount && size.scale > 0 ? (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          loading="lazy"
          onLoad={handleLoad}
          tabIndex={interactive ? 0 : -1}
          aria-hidden={interactive ? undefined : true}
          className={`absolute left-0 top-0 origin-top-left border-0 bg-transparent transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${
            interactive ? '' : 'pointer-events-none'
          }`}
          style={{ width: VIEWPORT_WIDTH, height: size.height, transform: `scale(${size.scale})` }}
        />
      ) : null}
    </div>
  );
};
