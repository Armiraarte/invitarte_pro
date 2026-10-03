import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500 pb-10">
      <div className="mb-2">
        <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Resumen general</h2>
        <p className="text-[10px] text-gray-500 mt-0.5 uppercase">Monitorea el estado de tus proyectos y actividad reciente.</p>
      </div>

      <div className="p-6 border border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-12 h-12 bg-gray-50 rounded-none flex items-center justify-center mb-3 text-xs font-black text-gray-600 uppercase">
          RS
        </div>
        <h3 className="text-sm font-black text-gray-900 mb-1 uppercase">Panel de resumen</h3>
        <p className="text-[10px] text-gray-500 max-w-md uppercase">
          Aqui veras el rendimiento de tus invitaciones una vez que comiences a crearlas.
        </p>
      </div>
    </div>
  );
};
