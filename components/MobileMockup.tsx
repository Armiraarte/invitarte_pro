
import React from 'react';

interface MobileMockupProps {
  children: React.ReactNode;
  showGuides?: boolean;
  mode?: 'mobile' | 'tablet' | 'desktop';
}

export const MobileMockup: React.FC<MobileMockupProps> = ({ children, showGuides, mode = 'mobile' }) => {
  const isMobile = mode === 'mobile';
  const isTablet = mode === 'tablet';
  const isDesktop = mode === 'desktop';

  return (
    <div 
      className={`relative mx-auto bg-white transition-all duration-500 ease-in-out ${
        isMobile 
          ? 'w-[375px] h-[800px] rounded-[3rem] border-[14px] border-gray-900 shadow-2xl' 
          : isTablet
            ? 'w-[768px] h-[1024px] rounded-[2rem] border-[14px] border-gray-900 shadow-2xl'
            : 'w-full h-full shadow-md rounded-lg border border-gray-200'
      }`}
      style={{
        transform: isTablet ? 'scale(0.7)' : isMobile ? 'scale(0.9)' : 'none',
        transformOrigin: 'top center',
        ['--mockup-height' as any]: isMobile ? '800px' : isTablet ? '1024px' : '100%',
        ['--mockup-safe-top' as any]: isMobile || isTablet ? '56px' : '0px'
      }}
    >
      {/* Device Frame Elements (Mobile & Tablet only) */}
      {(isMobile || isTablet) && (
        <>
          {/* Notch / Camera */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[30px] w-[150px] bg-gray-900 rounded-b-[1rem] z-50 flex justify-center items-center">
             <div className="w-16 h-4 bg-gray-800 rounded-full mb-1"></div>
          </div>

          {/* Side Buttons */}
          <div className="absolute top-[100px] -right-[17px] h-[60px] w-[4px] bg-gray-800 rounded-r-md shadow-sm"></div>
          <div className="absolute top-[180px] -right-[17px] h-[60px] w-[4px] bg-gray-800 rounded-r-md shadow-sm"></div>
          <div className="absolute top-[100px] -left-[17px] h-[40px] w-[4px] bg-gray-800 rounded-l-md shadow-sm"></div>
        </>
      )}

      {/* Visual Guides Overlay (Fixed to viewport) */}
      {showGuides && (
        <div className={`absolute inset-0 pointer-events-none z-40 overflow-hidden ${isMobile || isTablet ? 'rounded-[2.5rem]' : ''}`}>
          {/* Vertical Center Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/50 transform -translate-x-1/2">
            <div className="absolute top-2 left-1 text-[8px] text-cyan-600 font-mono bg-white/80 px-1 rounded">CENTER</div>
          </div>
          
          {/* Horizontal Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/50 transform -translate-y-1/2">
             <div className="absolute left-2 top-1 text-[8px] text-cyan-600 font-mono bg-white/80 px-1 rounded">MIDDLE</div>
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-30" 
               style={{ 
                 backgroundImage: 'linear-gradient(to right, rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.3) 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
               }} 
          />
        </div>
      )}

      {/* Screen Content */}
      <div className={`h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar relative z-0 bg-white ${isMobile || isTablet ? 'rounded-[2.2rem] pt-14' : ''}`}>
        {children}
      </div>
    </div>
  );
};
