import React from 'react';
import { Section, PackageDefinition } from '../../types';
import { SectionItem } from './SectionItem';

type ActiveTextElement =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'image'
  | 'contentImage'
  | 'container'
  | 'backgroundImage'
  | 'countdown'
  | 'guests'
  | 'location'
  | 'music'
  | null;

interface CanvasProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showGuides: boolean;
  canvasScale?: number;
  activeTextElement: ActiveTextElement;
  selectedElementId?: string | null;
  onSelectTextElement: (element: ActiveTextElement, elementId?: string | null) => void;
  onUpdate: (id: string, updates: Partial<Section>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  pkg: PackageDefinition;
  previewRefreshToken?: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  sections,
  selectedId,
  onSelect,
  showGuides,
  canvasScale = 1,
  activeTextElement,
  selectedElementId,
  onSelectTextElement,
  onUpdate,
  onDelete,
  onMove,
  pkg,
  previewRefreshToken = 0,
}) => {
  const canvasClassName = sections.length === 0
    ? 'flex flex-col min-h-full relative'
    : 'flex flex-col relative';

  return (
    <div className={canvasClassName}>
      {sections.length > 0 && <div className="h-2 shrink-0" aria-hidden="true" />}
      {sections.map((section, index) => (
        <SectionItem
          key={section.id}
          section={section}
          isSelected={selectedId === section.id}
          showGuides={showGuides}
          canvasScale={canvasScale}
          activeTextElement={selectedId === section.id ? activeTextElement : null}
          selectedElementId={selectedId === section.id ? selectedElementId : null}
          onSelect={() => onSelect(section.id)}
          onSelectTextElement={onSelectTextElement}
          onUpdate={(updates) => onUpdate(section.id, updates)}
          onDelete={() => onDelete(section.id)}
          onMove={(dir) => onMove(section.id, dir)}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
          pkg={pkg}
          previewRefreshToken={previewRefreshToken}
        />
      ))}
    </div>
  );
};
