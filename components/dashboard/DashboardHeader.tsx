import React from 'react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="mb-2">
      <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Resumen General</h2>
      <p className="text-[10px] text-gray-500 mt-0.5 uppercase">Monitorea el estado de tus proyectos y actividad reciente.</p>
    </div>
  );
};
