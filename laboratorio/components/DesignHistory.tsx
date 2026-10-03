import React from 'react';
import { SavedDesign } from '../types';

interface DesignHistoryProps {
  designs: SavedDesign[];
  onOpenDesign: (designId: string) => void;
  onDeleteDesign: (designId: string) => void;
}

const getCoverImage = (design: SavedDesign): string | null => {
  if (design.formData.globalBg?.type === 'image' && design.formData.globalBg.value) {
    return design.formData.globalBg.value;
  }

  for (const section of design.formData.sections) {
    if (section.type === 'IMAGE' && section.imageUrl) return section.imageUrl;
    if (section.contentImageUrl) return section.contentImageUrl;
    if (section.bgType === 'image' && section.bgValue) return section.bgValue;
  }

  return null;
};

const getEventDetails = (design: SavedDesign) => {
  const detailsSection = design.formData.sections.find((section) => section.type === 'DETAILS');
  return {
    title: design.formData.eventTitle || 'Proyecto sin título',
    host: design.formData.hostName || 'Anfitrión por definir',
    date: detailsSection?.subtitle || 'Fecha pendiente',
    venue: detailsSection?.content || 'Lugar pendiente',
  };
};

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const DesignHistory: React.FC<DesignHistoryProps> = ({
  designs,
  onOpenDesign,
  onDeleteDesign,
}) => {
  if (designs.length === 0) {
    return (
      <div className="animate-in fade-in duration-500">
        <h2 className="text-sm font-black text-gray-900 tracking-tighter uppercase mb-3">Mis Diseños</h2>
        <div className="p-6 border border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-12 h-12 bg-gray-50 rounded-none flex items-center justify-center mb-3 text-xl">MD</div>
          <h3 className="text-sm font-black text-gray-900 mb-1 uppercase">No tienes proyectos guardados</h3>
          <p className="text-[10px] text-gray-500 max-w-md uppercase">
            Cuando edites una invitación, se guardará aquí para continuar después.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-sm font-black text-gray-900 tracking-tighter uppercase mb-3">Mis Diseños</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designs.map((design) => {
          const coverImage = getCoverImage(design);
          const eventDetails = getEventDetails(design);

          return (
            <article
              key={design.id}
              className="bg-white border border-gray-100 rounded-none overflow-hidden shadow-none"
              style={{ contentVisibility: 'auto', contain: 'layout paint style' }}
            >
              <div
                className="h-36 relative border-b border-gray-100"
                style={{
                  backgroundColor:
                    coverImage
                      ? 'transparent'
                      : design.formData.globalBg?.type === 'color'
                        ? design.formData.globalBg.value
                        : '#eef2ff',
                  backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                      {eventDetails.title}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <h3 className="text-[11px] font-black text-gray-900 uppercase leading-tight">{eventDetails.title}</h3>
                <p className="text-[9px] text-gray-500 uppercase">Anfitrión: {eventDetails.host}</p>
                <p className="text-[9px] text-gray-500 uppercase">Fecha: {eventDetails.date}</p>
                <p className="text-[9px] text-gray-500 uppercase truncate">Lugar: {eventDetails.venue}</p>
                <p className="text-[9px] text-gray-500 uppercase">
                  Elementos: {design.formData.sections.length} - Actualizado: {formatDate(design.updatedAt)}
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onOpenDesign(design.id)}
                    className="flex-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => onDeleteDesign(design.id)}
                    className="px-2 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-[9px] font-black uppercase text-gray-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
