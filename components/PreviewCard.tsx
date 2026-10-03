
import React from 'react';
import { PackageDefinition, InvitationData, Section } from '../types';

interface PreviewCardProps {
  pkg: PackageDefinition;
  data: InvitationData;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ pkg, data }) => {
  return (
    <div className={`w-full min-h-full flex flex-col ${pkg.fontClass}`}>
      {data.sections.map((section) => {
        const heightPx = (parseInt(section.height) / 100) * 580; // 580 es la altura aprox del viewport movil
        
        const sectionStyle: React.CSSProperties = {
          minHeight: `${heightPx}px`,
          backgroundColor: section.bgType === 'color' ? section.bgValue : 'transparent',
          backgroundImage: section.bgType === 'image' ? `url(${section.bgValue})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: section.alignment === 'center' ? 'center' : section.alignment === 'right' ? 'flex-end' : 'flex-start',
          padding: '24px',
          textAlign: section.alignment,
          color: section.bgType === 'image' ? 'white' : 'inherit',
          position: 'relative'
        };

        return (
          <div key={section.id} style={sectionStyle} className="transition-all duration-500 border-b border-gray-100/10">
            {/* Overlay para legibilidad si es imagen */}
            {section.bgType === 'image' && <div className="absolute inset-0 bg-black/30 z-0"></div>}
            
            <div className="relative z-10 w-full">
               <span 
                className="text-[9px] font-black tracking-widest uppercase mb-2 block opacity-70"
                style={{ color: section.bgType === 'image' ? 'white' : pkg.primaryColor }}
              >
                {section.type === 'HERO' ? 'Bienvenido' : section.type === 'MESSAGE' ? 'Inspiración' : 'Evento'}
              </span>
              
              <h2 className={`text-2xl font-black mb-2 leading-tight ${section.type === 'HERO' ? 'text-3xl' : ''}`}>
                {section.title}
              </h2>
              
              {section.subtitle && (
                <p className="text-sm font-medium opacity-80 mb-4">{section.subtitle}</p>
              )}
              
              {section.content && (
                <p className={`text-sm leading-relaxed max-w-xs ${section.alignment === 'center' ? 'mx-auto' : ''}`}>
                  {section.content}
                </p>
              )}

              {/* Decoración según tipo */}
              {section.type === 'HERO' && (
                 <div className="mt-6 w-10 h-1 bg-current opacity-40 rounded-full"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
