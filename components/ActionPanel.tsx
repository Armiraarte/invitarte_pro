
import React from 'react';

interface ActionPanelProps {
  invitationId: string | null;
  onEdit: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ invitationId, onEdit }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-none p-4 shadow-none border border-gray-100">
        <h2 className="text-sm font-black text-gray-900 mb-1 uppercase">¡Lista para compartir!</h2>
        <p className="text-[10px] text-gray-500 mb-4 uppercase">Tu invitación digital ha sido generada con éxito.</p>
        
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-none border border-gray-100">
            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">ID de Invitación</label>
            <code className="text-indigo-600 font-mono text-[10px]">{invitationId}</code>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-none border border-gray-100">
            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Vínculo Compartible</label>
            <div className="flex items-center text-gray-600 text-[10px] overflow-hidden text-ellipsis whitespace-nowrap">
              https://invitapro.app/v/{invitationId}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-none transition-all text-[10px] uppercase"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir</span>
          </button>
          <button 
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-none transition-all shadow-none text-[10px] uppercase"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412 0 12.049c0 2.12.54 4.19 1.563 6.02L0 24l6.15-1.612a11.77 11.77 0 005.891 1.569h.005c6.636 0 12.048-5.412 12.052-12.05a11.82 11.82 0 00-3.483-8.43" />
            </svg>
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-none p-4 border border-indigo-100">
        <h4 className="text-indigo-900 font-bold mb-1 flex items-center text-[10px] uppercase">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tip Pro
        </h4>
        <p className="text-indigo-700 text-[9px] uppercase">
          ¿No te convence el mensaje? Puedes editar los detalles para que la IA genere una nueva propuesta.
        </p>
        <button 
          onClick={onEdit}
          className="mt-2 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
        >
          Editar detalles de nuevo →
        </button>
      </div>
    </div>
  );
};
