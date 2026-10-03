import React from 'react';
import { Section } from '../../types';

interface ToolbarProps {
  onAdd: (type: Section['type']) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAdd }) => {
  const sectionTypes: { type: Section['type'], label: string, icon: string }[] = [
    { type: 'HERO', label: 'Texto Inicial', icon: '✨' },
    { type: 'GUESTS', label: 'Invitados', icon: '👥' },
    { type: 'LOCATION', label: 'Salón de Eventos', icon: '📍' },
    { type: 'COUNTDOWN', label: 'Contador', icon: '⏳' },
    { type: 'MESSAGE', label: 'Mensaje', icon: '✍️' },
    { type: 'MUSIC', label: 'Música', icon: '🎵' },
    { type: 'DETAILS', label: 'Detalles', icon: '📅' },
    { type: 'FOOTER', label: 'Pie de Página', icon: '🔚' },
  ];

  return (
    <div className="flex gap-0.5 p-0.5 bg-white rounded-none border border-gray-100 shadow-none overflow-x-auto whitespace-nowrap scrollbar-hide">
      {sectionTypes.map((item) => (
        <button
          key={item.type}
          onClick={() => onAdd(item.type)}
          className="flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 rounded-none transition-all group"
        >
          <span className="text-xs group-hover:scale-110 transition-transform">{item.icon}</span>
          <span className="text-[8px] font-black text-gray-600 group-hover:text-indigo-600 uppercase tracking-tighter">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};
