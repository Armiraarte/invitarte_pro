
import React from 'react';
import { InvitationData, Section, SectionHeight, TextAlignment } from '../types';

interface InvitationFormProps {
  data: InvitationData;
  updateSection: (id: string, updates: Partial<Section>) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
  packageName: string;
  onMainDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InvitationForm: React.FC<InvitationFormProps> = ({ 
  data, updateSection, onGenerate, onBack, isGenerating, packageName, onMainDataChange 
}) => {
  return (
    <div className="w-full space-y-6 animate-in slide-in-from-left-8 duration-500">
      {/* Botón de regreso */}
      <button onClick={onBack} className="text-xs font-bold text-gray-400 hover:text-indigo-600 flex items-center transition-colors uppercase tracking-widest">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Cambiar Estilo
      </button>

      {/* Info General */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
         <h3 className="text-lg font-black text-gray-900 mb-4">Datos Generales</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="hostName"
              value={data.hostName}
              onChange={onMainDataChange}
              placeholder="Nombre del Anfitrión"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
         </div>
      </div>

      {/* Constructor de Secciones */}
      <div className="space-y-4">
        {data.sections.map((section, index) => (
          <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sección {index + 1}: {section.type}</span>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Títulos y Contenido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="Título de sección"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                />
                <input 
                  value={section.subtitle || ''}
                  onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                  placeholder="Subtítulo (opcional)"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                {section.type !== 'HERO' && (
                  <textarea 
                    value={section.content || ''}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Contenido o dirección..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:col-span-2 resize-none"
                  />
                )}
              </div>

              {/* Controles Visuales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                {/* Alineación */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Alineación</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                      <button
                        key={align}
                        onClick={() => updateSection(section.id, { alignment: align })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${section.alignment === align ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                      >
                        {align === 'left' && 'Izq'}
                        {align === 'center' && 'Cent'}
                        {align === 'right' && 'Der'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Altura % */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Altura Pantalla</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(['25', '50', '75', '100'] as SectionHeight[]).map((h) => (
                      <button
                        key={h}
                        onClick={() => updateSection(section.id, { height: h })}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${section.height === h ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                      >
                        {h}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fondo */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Fondo (Color/URL)</label>
                  <input 
                    type="text"
                    value={section.bgValue}
                    onChange={(e) => updateSection(section.id, { bgValue: e.target.value, bgType: e.target.value.startsWith('http') ? 'image' : 'color' })}
                    placeholder="#ffffff o https://..."
                    className="w-full px-3 py-1.5 rounded-xl bg-gray-50 border-none text-[10px] font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-black py-5 px-6 rounded-3xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-3 text-lg"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generando con Gemini...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Generar Invitación Completa</span>
          </>
        )}
      </button>
    </div>
  );
};
