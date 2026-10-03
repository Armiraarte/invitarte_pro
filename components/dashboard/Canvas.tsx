import React from 'react';
import { Section, PackageDefinition } from '../../types';
import { SectionItem } from './SectionItem';

type ActiveTextElement = 'title' | 'subtitle' | 'content' | 'image' | 'contentImage' | null;

interface CanvasProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeTextElement: ActiveTextElement;
  onSelectTextElement: (element: ActiveTextElement) => void;
  onUpdate: (id: string, updates: Partial<Section>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  pkg: PackageDefinition;
}

export const Canvas: React.FC<CanvasProps> = ({
  sections,
  selectedId,
  onSelect,
  activeTextElement,
  onSelectTextElement,
  onUpdate,
  onDelete,
  onMove,
  pkg
}) => {
  const canvasClassName = sections.length === 0
    ? 'flex flex-col min-h-full relative'
    : 'flex flex-col relative';

  return (
    <div className={canvasClassName}>
      {sections.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-300 text-sm uppercase tracking-widest font-bold">Lienzo vacio</p>
        </div>
      )}

      {sections.map((section, index) => (
        <SectionItem
          key={section.id}
          section={section}
          isSelected={selectedId === section.id}
          activeTextElement={selectedId === section.id ? activeTextElement : null}
          onSelect={() => onSelect(section.id)}
          onSelectTextElement={onSelectTextElement}
          onUpdate={(updates) => onUpdate(section.id, updates)}
          onDelete={() => onDelete(section.id)}
          onMove={(dir) => onMove(section.id, dir)}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
          pkg={pkg}
        />
      ))}
    </div>
  );
};
