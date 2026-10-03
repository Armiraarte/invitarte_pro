
import React from 'react';

interface MobileMockupProps {
  children: React.ReactNode;
  showGuides?: boolean;
  mode?: 'mobile' | 'tablet' | 'desktop';
  scale?: number;
  onOutsideContentClick?: () => void;
}

export const MobileMockup: React.FC<MobileMockupProps> = ({
  children,
  showGuides,
  mode = 'mobile',
  scale = 1,
  onOutsideContentClick,
}) => {
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const [desktopFrameHeight, setDesktopFrameHeight] = React.useState<number | null>(null);
  const isMobile = mode === 'mobile';
  const isTablet = mode === 'tablet';
  const isDesktop = mode === 'desktop';
  const frameWidth = isMobile ? 375 : isTablet ? 768 : 0;
  const frameHeight = isMobile ? 800 : isTablet ? 1024 : 0;
  const visualScale = isDesktop ? 1 : scale;

  React.useEffect(() => {
    if (!isDesktop) {
      setDesktopFrameHeight(null);
      return;
    }

    const frameElement = frameRef.current;
    if (!frameElement) return;

    const updateDesktopFrameHeight = () => {
      setDesktopFrameHeight(frameElement.clientHeight);
    };

    updateDesktopFrameHeight();

    const resizeObserver = new ResizeObserver(updateDesktopFrameHeight);
    resizeObserver.observe(frameElement);

    return () => resizeObserver.disconnect();
  }, [isDesktop]);

  return (
    <div
      className={`relative mx-auto ${isDesktop ? 'h-full w-full' : ''}`}
      style={isDesktop ? undefined : { width: frameWidth * visualScale, height: frameHeight * visualScale }}
    >
      <div
        ref={frameRef}
        onClick={() => onOutsideContentClick?.()}
        className={`relative bg-white ${
          isMobile
            ? 'w-[375px] h-[800px] rounded-[3rem] border-[14px] border-gray-900 shadow-2xl'
            : isTablet
              ? 'w-[768px] h-[1024px] rounded-[2rem] border-[14px] border-gray-900 shadow-2xl'
              : 'w-full h-full shadow-md rounded-lg border border-gray-200'
        }`}
        style={{
          transform: isDesktop ? 'none' : `scale(${visualScale})`,
          transformOrigin: isDesktop ? 'center center' : 'top left',
          ['--mockup-height' as any]: isMobile
            ? '800px'
            : isTablet
              ? '1024px'
              : desktopFrameHeight
                ? `${desktopFrameHeight}px`
                : '100%',
          ['--mockup-safe-top' as any]: '0px'
        }}
      >
        {/* Device Frame Elements (Mobile & Tablet only) */}
        {(isMobile || isTablet) && (
          <>
            {/* Notch / Camera */}
            <div className="pointer-events-none absolute top-0 left-1/2 transform -translate-x-1/2 h-[30px] w-[150px] bg-gray-900 rounded-b-[1rem] z-50 flex justify-center items-center">
               <div className="w-16 h-4 bg-gray-800 rounded-full mb-1"></div>
            </div>

            {/* Side Buttons */}
            <div className="pointer-events-none absolute top-[100px] -right-[17px] h-[60px] w-[4px] bg-gray-800 rounded-r-md shadow-sm"></div>
            <div className="pointer-events-none absolute top-[180px] -right-[17px] h-[60px] w-[4px] bg-gray-800 rounded-r-md shadow-sm"></div>
            <div className="pointer-events-none absolute top-[100px] -left-[17px] h-[40px] w-[4px] bg-gray-800 rounded-l-md shadow-sm"></div>
          </>
        )}

        {/* Visual Guides Overlay (Fixed to viewport) */}
        {showGuides && (
          <div className={`absolute inset-0 pointer-events-none z-40 overflow-hidden ${isMobile || isTablet ? 'rounded-[2.5rem]' : ''}`}>
            {/* Fine Grid */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(14,165,233,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,165,233,0.14) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Major Grid */}
            <div
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.2) 1px, transparent 1px)',
                backgroundSize: '96px 96px',
              }}
            />

            {/* Vertical Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-cyan-500/85 shadow-[0_0_0_1px_rgba(255,255,255,0.26),0_0_12px_rgba(6,182,212,0.3)]">
              <div className="absolute top-3 left-2 rounded-full border border-cyan-100/80 bg-white/92 px-2 py-0.5 text-[8px] font-mono text-cyan-700 shadow-sm backdrop-blur-[2px]">CENTER</div>
            </div>
            
            {/* Horizontal Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2 bg-cyan-500/85 shadow-[0_0_0_1px_rgba(255,255,255,0.26),0_0_12px_rgba(6,182,212,0.3)]">
               <div className="absolute left-3 top-2 rounded-full border border-cyan-100/80 bg-white/92 px-2 py-0.5 text-[8px] font-mono text-cyan-700 shadow-sm backdrop-blur-[2px]">MIDDLE</div>
            </div>

            <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-cyan-500/90 shadow-[0_0_0_4px_rgba(6,182,212,0.16)]" />
          </div>
        )}

        {/* Screen Content */}
        <div
          onClick={(event) => event.stopPropagation()}
          className={`h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar relative z-0 bg-white ${isMobile || isTablet ? 'rounded-[2.2rem]' : ''}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
