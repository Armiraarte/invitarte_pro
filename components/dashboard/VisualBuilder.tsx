import React, { useEffect, useState } from 'react';
import { Section, PackageDefinition, SectionHeight } from '../../types';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { MobileMockup } from '../MobileMockup';

type ActiveTextElement = 'title' | 'subtitle' | 'content' | 'image' | 'contentImage' | null;

interface VisualBuilderProps {
  sections: Section[];
  onUpdateSections: (sections: Section[]) => void;
  pkg: PackageDefinition;
  projectTitle?: string;
  globalBg?: { type: 'color' | 'image'; value: string };
  onUpdateGlobalBg?: (bg: { type: 'color' | 'image'; value: string }) => void;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  sections,
  onUpdateSections,
  pkg,
  projectTitle,
  globalBg,
  onUpdateGlobalBg
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(sections[0]?.id || null);
  const [activeTextElement, setActiveTextElement] = useState<ActiveTextElement>(null);
  const [showGuides, setShowGuides] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const addSection = (type: Section['type'], height?: SectionHeight) => {
    const isBlank = type === 'BLANK';
    const isImage = type === 'IMAGE';
    const isMusic = type === 'MUSIC';
    const resolvedHeight = height ?? (isBlank ? '100' : '50');

    const newSection: Section = {
      id: Math.random().toString(36).slice(2, 11),
      type,
      title: '',
      subtitle: isBlank ? undefined : '',
      content: isBlank ? undefined : '',
      imageUrl: isImage ? '' : undefined,
      audioUrl: isMusic ? '' : undefined,
      animation: {
        type: 'none',
        duration: 0.6
      },
      imageStyle: {
        scale: 100,
        fit: 'contain',
        asSectionBackground: false
      },
      contentImageStyle: {
        scale: 100,
        fit: 'contain',
        asSectionBackground: false
      },
      alignment: 'center',
      bgType: 'color',
      bgValue: 'transparent',
      height: resolvedHeight,
      textColor: '#1a1a1a',
      positions: isBlank
        ? {}
        : {
            title: { x: 0, y: 0 },
            subtitle: { x: 0, y: 0 },
            content: { x: 0, y: 0 }
          }
    };

    onUpdateSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    setActiveTextElement(null);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    onUpdateSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    const nextSections = sections.filter((s) => s.id !== id);
    onUpdateSections(nextSections);

    if (selectedSectionId === id) {
      const nextSelected = nextSections[0]?.id || null;
      setSelectedSectionId(nextSelected);
      setActiveTextElement(null);
    }
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    onUpdateSections(newSections);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key !== 'Delete') return;
      if (!selectedSectionId) return;

      const target = event.target as HTMLElement | null;
      const isTypingField = !!target && (
        target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'SELECT'
        || target.isContentEditable
      );

      if (isTypingField) return;

      const currentSection = sections.find((s) => s.id === selectedSectionId);
      if (!currentSection) return;

      event.preventDefault();

      if (activeTextElement === 'title') {
        onUpdateSections(sections.map((s) => (
          s.id === selectedSectionId
            ? { ...s, title: '' }
            : s
        )));
        return;
      }

      if (activeTextElement === 'subtitle' && currentSection.subtitle !== undefined) {
        onUpdateSections(sections.map((s) => (
          s.id === selectedSectionId
            ? { ...s, subtitle: undefined }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      if (activeTextElement === 'content' && currentSection.content !== undefined) {
        onUpdateSections(sections.map((s) => (
          s.id === selectedSectionId
            ? { ...s, content: undefined }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      if (activeTextElement === 'image') {
        if (currentSection.type === 'IMAGE') {
          onUpdateSections(sections.map((s) => (
            s.id === selectedSectionId
              ? {
                  ...s,
                  imageUrl: undefined,
                  imageStyle: {
                    ...s.imageStyle,
                    asSectionBackground: false,
                  },
                }
              : s
          )));
          setActiveTextElement(null);
          return;
        }

        if (currentSection.bgType === 'image') {
          onUpdateSections(sections.map((s) => (
            s.id === selectedSectionId
              ? { ...s, bgType: 'color', bgValue: 'transparent' }
              : s
          )));
          setActiveTextElement(null);
          return;
        }
      }

      if (activeTextElement === 'contentImage' && currentSection.contentImageUrl) {
        onUpdateSections(sections.map((s) => (
          s.id === selectedSectionId
            ? { ...s, contentImageUrl: undefined }
            : s
        )));
        setActiveTextElement(null);
        return;
      }

      const nextSections = sections.filter((s) => s.id !== selectedSectionId);
      onUpdateSections(nextSections);

      const nextSelected = nextSections[0]?.id || null;
      setSelectedSectionId(nextSelected);
      setActiveTextElement(null);
    };

    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [activeTextElement, onUpdateSections, sections, selectedSectionId]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)]">
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-200/30 rounded-none border-2 border-white shadow-inner custom-scrollbar relative">
          <div className={`min-h-full w-full flex justify-center items-center ${viewMode === 'mobile' ? 'p-8' : 'p-0'}`}>
            <MobileMockup showGuides={showGuides} mode={viewMode}>
              <div
                className={`${sections.length === 0 ? 'min-h-full ' : ''}w-full relative`}
                style={{
                  backgroundColor: globalBg?.type === 'color' ? globalBg.value : 'transparent',
                  backgroundImage: globalBg?.type === 'image' ? `url(${globalBg.value})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <Canvas
                  sections={sections}
                  selectedId={selectedSectionId}
                  onSelect={(id) => {
                    setSelectedSectionId(id);
                    setActiveTextElement(null);
                  }}
                  activeTextElement={activeTextElement}
                  onSelectTextElement={setActiveTextElement}
                  onUpdate={updateSection}
                  onDelete={deleteSection}
                  onMove={moveSection}
                  pkg={pkg}
                />
              </div>
            </MobileMockup>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <PropertyPanel
          section={selectedSection}
          onUpdate={(updates) => selectedSection && updateSection(selectedSection.id, updates)}
          onDelete={() => selectedSection && deleteSection(selectedSection.id)}
          onMove={(dir) => selectedSection && moveSection(selectedSection.id, dir)}
          onAdd={addSection}
          activeTextElement={activeTextElement}
          globalBg={globalBg}
          onUpdateGlobalBg={onUpdateGlobalBg}
          showGuides={showGuides}
          onToggleGuides={setShowGuides}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          canAddElements={sections.length > 0}
        />
      </div>
    </div>
  );
};




