import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PackageType, InvitationData, SavedDesign, SectionAnimationType, normalizePackageType } from './types';
import { PACKAGES } from './constants';
import { generateCreativeMessage } from './services/geminiService';

import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ActionPanel } from './components/ActionPanel';
import { VisualBuilder } from './components/dashboard/VisualBuilder';
import { DesignHistory } from './components/DesignHistory';

const STORAGE_KEY = 'invitapro_saved_designs_v1';
const DEFAULT_PACKAGE_ID = PACKAGES[0]?.id ?? PackageType.ORO;

const createEmptyFormData = (): InvitationData => ({
  hostName: '',
  eventTitle: '',
  globalBg: { type: 'color', value: '#ffffff' },
  sections: []
});

const hasDraftContent = (data: InvitationData) => {
  return data.eventTitle.trim().length > 0 || data.hostName.trim().length > 0 || data.sections.length > 0;
};

const sortByUpdatedAt = (designs: SavedDesign[]) => {
  return [...designs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

const getSectionPreviewAnimation = (type?: SectionAnimationType) => {
  const resolvedType = type || 'none';

  switch (resolvedType) {
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case 'slide-up':
      return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
    case 'slide-down':
      return { initial: { opacity: 0, y: -24 }, animate: { opacity: 1, y: 0 } };
    case 'slide-left':
      return { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } };
    case 'slide-right':
      return { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } };
    case 'zoom':
      return { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 } };
    default:
      return { initial: false as const, animate: undefined };
  }
};

const parseSavedDesigns = (raw: string | null): SavedDesign[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = new Date().toISOString();

    const normalized: SavedDesign[] = parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const formData = item.formData || {};
        const cleanFormData: InvitationData = {
          hostName: typeof formData.hostName === 'string' ? formData.hostName : '',
          eventTitle: typeof formData.eventTitle === 'string' ? formData.eventTitle : '',
          sections: Array.isArray(formData.sections) ? formData.sections : [],
          aiMessage: typeof formData.aiMessage === 'string' ? formData.aiMessage : undefined,
          globalBg:
            formData.globalBg && typeof formData.globalBg === 'object'
              ? {
                  type: formData.globalBg.type === 'image' ? 'image' : 'color',
                  value: typeof formData.globalBg.value === 'string' ? formData.globalBg.value : '#ffffff'
                }
              : { type: 'color', value: '#ffffff' }
        };

        return {
          id: typeof item.id === 'string' ? item.id : '',
          packageId: normalizePackageType(item.packageId) ?? DEFAULT_PACKAGE_ID,
          formData: cleanFormData,
          step: item.step === 3 ? 3 : 2,
          invitationId: typeof item.invitationId === 'string' ? item.invitationId : null,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : now,
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now
        } as SavedDesign;
      })
      .filter((item) => item.id.length > 0);

    return sortByUpdatedAt(normalized);
  } catch {
    return [];
  }
};

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const defaultPackage = PACKAGES[0] ?? null;
  const [step, setStep] = useState<2 | 3>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

  const [formData, setFormData] = useState<InvitationData>(createEmptyFormData());

  useEffect(() => {
    const saved = parseSavedDesigns(window.localStorage.getItem(STORAGE_KEY));
    setSavedDesigns(saved);
  }, []);

  const saveCurrentDesign = useCallback(
    (force = false) => {
      if (!defaultPackage) return;
      if (!force && !hasDraftContent(formData)) return;

      const now = new Date().toISOString();
      const designId = currentDesignId ?? Math.random().toString(36).slice(2, 11);

      if (!currentDesignId) {
        setCurrentDesignId(designId);
      }

      setSavedDesigns((prev) => {
        const existing = prev.find((item) => item.id === designId);

        const nextDesign: SavedDesign = {
          id: designId,
          packageId: DEFAULT_PACKAGE_ID,
          formData: JSON.parse(JSON.stringify(formData)) as InvitationData,
          step,
          invitationId,
          createdAt: existing?.createdAt || now,
          updatedAt: now
        };

        const next = sortByUpdatedAt([nextDesign, ...prev.filter((item) => item.id !== designId)]);

        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage errors
        }

        return next;
      });
    },
    [currentDesignId, defaultPackage, formData, invitationId, step]
  );

  useEffect(() => {
    if (activeTab !== 'create') return;
    if (!defaultPackage || !hasDraftContent(formData)) return;

    const timer = window.setTimeout(() => {
      saveCurrentDesign(false);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activeTab, defaultPackage, formData, saveCurrentDesign]);

  const handleGenerate = async () => {
    if (!defaultPackage) return;
    setIsGenerating(true);

    try {
      const hero = formData.sections.find((s) => s.type === 'HERO');
      const details = formData.sections.find((s) => s.type === 'DETAILS');

      const promptData = {
        eventTitle: formData.eventTitle || hero?.title || '',
        hostName: formData.hostName,
        date: details?.subtitle || '',
        venue: details?.content || '',
        additionalInfo: ''
      };

      const message = await generateCreativeMessage(promptData);

      setFormData((prev) => ({
        ...prev,
        aiMessage: message,
        sections: prev.sections.map((s) => (s.type === 'MESSAGE' ? { ...s, content: message } : s))
      }));

      setInvitationId(Math.random().toString(36).slice(2, 11));
      setStep(3);
    } catch {
      alert('Hubo un error generando tu invitacion.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetCreator = () => {
    setCurrentDesignId(null);
    setStep(2);
    setInvitationId(null);
    setFormData(createEmptyFormData());
  };

  const handleOpenSavedDesign = (designId: string) => {
    const design = savedDesigns.find((item) => item.id === designId);
    if (!design) return;

    setCurrentDesignId(design.id);
    setFormData(JSON.parse(JSON.stringify(design.formData)) as InvitationData);
    setStep(design.step === 3 ? 3 : 2);
    setInvitationId(design.invitationId);
    setActiveTab('create');
  };

  const handleDeleteSavedDesign = (designId: string) => {
    const confirmed = window.confirm('Eliminar este diseno guardado?');
    if (!confirmed) return;

    setSavedDesigns((prev) => {
      const next = prev.filter((item) => item.id !== designId);

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }

      return next;
    });

    if (currentDesignId === designId) {
      resetCreator();
    }
  };

  const currentPackage = defaultPackage;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'create') {
            resetCreator();
          }
          setActiveTab(tab);
        }}
      />

      <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-5xl">
          {activeTab === 'dashboard' && <Dashboard />}

          {activeTab === 'history' && (
            <DesignHistory
              designs={savedDesigns}
              onOpenDesign={handleOpenSavedDesign}
              onDeleteDesign={handleDeleteSavedDesign}
            />
          )}

          {activeTab === 'create' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-2">
                <h2 className="text-sm font-black uppercase tracking-tighter text-gray-900">Estudio Creativo Modular</h2>
                <p className="text-[8px] uppercase text-gray-500">Disena tu invitacion por elementos movibles.</p>
              </div>

              {step === 2 && currentPackage && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end">
                    <div className="flex-1">
                      <label className="mb-1 block text-[8px] font-black uppercase tracking-widest text-gray-500">
                        Titulo del proyecto
                      </label>
                      <input
                        type="text"
                        value={formData.eventTitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, eventTitle: e.target.value }))}
                        placeholder="Ej. Boda de Ana y Luis"
                        className="w-full border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-bold uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <p className="mt-1 text-[8px] uppercase text-gray-400">
                        {currentDesignId ? 'Guardado en Mis Disenos' : 'Borrador nuevo'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveCurrentDesign(true)}
                        className="rounded-none border border-gray-200 bg-white px-4 py-1.5 text-[9px] font-bold uppercase text-gray-700 transition-all hover:bg-gray-50"
                      >
                        Guardar Borrador
                      </button>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="rounded-none bg-indigo-600 px-4 py-1.5 text-[9px] font-bold uppercase text-white shadow-none transition-all hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isGenerating ? 'Generando...' : 'Finalizar Proyecto'}
                      </button>
                    </div>
                  </div>

                  <VisualBuilder
                    sections={formData.sections}
                    onUpdateSections={(newSections) => setFormData((prev) => ({ ...prev, sections: newSections }))}
                    pkg={currentPackage}
                    projectTitle={formData.eventTitle}
                    globalBg={formData.globalBg}
                    onUpdateGlobalBg={(bg) => setFormData((prev) => ({ ...prev, globalBg: bg }))}
                  />
                </div>
              )}

              {step === 3 && currentPackage && (
                <div className="animate-in zoom-in-95 grid grid-cols-1 items-start gap-10 duration-500 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <ActionPanel invitationId={invitationId} onEdit={() => setStep(2)} />
                  </div>
                  <div className="flex flex-col items-center justify-center lg:col-span-5">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-green-500">Vista Final</p>
                    <div className="relative aspect-[9/19] w-full max-w-[320px] overflow-hidden rounded-none border-[12px] border-gray-900 bg-white shadow-2xl">
                      <div className="custom-scrollbar h-full overflow-y-auto">
                        <div
                          className={formData.sections.length === 0 ? 'min-h-full' : ''}
                          style={{
                            backgroundColor: formData.globalBg?.type === 'color' ? formData.globalBg.value : 'transparent',
                            backgroundImage: formData.globalBg?.type === 'image' ? `url(${formData.globalBg.value})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {formData.sections.map((section, index) => {
                            const sectionAnimationType = section.animation?.type || 'none';
                            const sectionAnimationDuration = Math.max(0.2, Math.min(2, section.animation?.duration ?? 0.6));
                            const sectionPreviewAnimation = getSectionPreviewAnimation(sectionAnimationType);

                            return (
                              <motion.div
                                key={section.id}
                                initial={sectionPreviewAnimation.initial}
                                animate={sectionPreviewAnimation.animate}
                                transition={
                                  sectionAnimationType === 'none'
                                    ? undefined
                                    : { duration: sectionAnimationDuration, ease: 'easeOut', delay: index * 0.08 }
                                }
                                className={`relative flex flex-col justify-center p-6 ${currentPackage.fontClass}`}
                                style={{
                                  backgroundColor: section.bgType === 'color' ? section.bgValue : 'transparent',
                                  backgroundImage:
                                    section.imageStyle?.asSectionBackground && section.imageUrl
                                      ? `url(${section.imageUrl})`
                                      : section.bgType === 'image'
                                        ? `url(${section.bgValue})`
                                        : 'none',
                                  backgroundSize: section.imageStyle?.asSectionBackground
                                    ? section.imageStyle?.fit === 'cover'
                                      ? 'cover'
                                      : 'contain'
                                    : 'cover',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  color: section.textColor || '#1a1a1a',
                                  fontFamily: section.fontFamily || 'inherit',
                                  textAlign: section.alignment || 'center',
                                  minHeight:
                                    section.height === '25'
                                      ? '25%'
                                      : section.height === '50'
                                        ? '50%'
                                        : section.height === '75'
                                          ? '75%'
                                          : '100%'
                                }}
                              >
                                {section.type === 'IMAGE' && !section.imageStyle?.asSectionBackground && (
                                  <div
                                    style={{
                                      transform: `translate(${section.positions?.content?.x || 0}px, ${section.positions?.content?.y || 0}px)`
                                    }}
                                    className="mb-3 flex justify-center"
                                  >
                                    <img
                                      src={section.imageUrl || 'https://via.placeholder.com/300'}
                                      alt="Imagen de seccion"
                                      className={`h-[300px] w-[85%] rounded-sm shadow-sm origin-center ${
                                        section.imageStyle?.fit === 'cover' ? 'object-cover' : 'object-contain'
                                      }`}
                                      style={{
                                        transform: `scale(${Math.max(20, Math.min(300, section.imageStyle?.scale ?? 100)) / 100})`
                                      }}
                                    />
                                  </div>
                                )}

                                <div
                                  style={{
                                    transform: `translate(${section.positions?.title?.x || 0}px, ${section.positions?.title?.y || 0}px)`
                                  }}
                                >
                                  <h4
                                    className="font-black uppercase"
                                    style={{
                                      fontSize: section.fontSize ? `${section.fontSize}px` : '14px',
                                      fontWeight: section.fontWeight || '900',
                                      fontStyle: section.fontStyle || 'normal',
                                      color: section.textColor || 'inherit',
                                      fontFamily: section.fontFamily || 'inherit',
                                      textAlign: section.alignment || 'center'
                                    }}
                                  >
                                    {section.title}
                                  </h4>
                                </div>
                                {section.subtitle && (
                                  <div
                                    style={{
                                      transform: `translate(${section.positions?.subtitle?.x || 0}px, ${section.positions?.subtitle?.y || 0}px)`
                                    }}
                                  >
                                    <p
                                      className="mt-1 opacity-70 uppercase"
                                      style={{
                                        fontSize: section.fontSize ? `${section.fontSize}px` : '14px',
                                        fontWeight: section.fontWeight || '900',
                                        fontStyle: section.fontStyle || 'normal',
                                        color: section.textColor || 'inherit',
                                        fontFamily: section.fontFamily || 'inherit',
                                        textAlign: section.alignment || 'center'
                                      }}
                                    >
                                      {section.subtitle}
                                    </p>
                                  </div>
                                )}
                                {section.content && (
                                  <div
                                    style={{
                                      transform: `translate(${section.positions?.content?.x || 0}px, ${section.positions?.content?.y || 0}px)`
                                    }}
                                  >
                                    <p
                                      className="mt-4 opacity-80 uppercase"
                                      style={{
                                        fontSize: section.fontSize ? `${section.fontSize}px` : '14px',
                                        fontWeight: section.fontWeight || '900',
                                        fontStyle: section.fontStyle || 'normal',
                                        color: section.textColor || 'inherit',
                                        fontFamily: section.fontFamily || 'inherit',
                                        textAlign: section.alignment || 'center'
                                      }}
                                    >
                                      {section.content}
                                    </p>
                                  </div>
                                )}
                                {section.contentImageUrl && (
                                  <div
                                    style={{
                                      transform: `translate(${section.positions?.contentImage?.x || 0}px, ${section.positions?.contentImage?.y || 0}px)`
                                    }}
                                    className="mb-4 flex justify-center"
                                  >
                                    <img
                                      src={section.contentImageUrl}
                                      alt="Imagen de contenido"
                                      className={`h-[200px] w-[80%] rounded-sm shadow-sm origin-center ${
                                        section.contentImageStyle?.fit === 'cover' ? 'object-cover' : 'object-contain'
                                      }`}
                                      style={{
                                        transform: `scale(${Math.max(20, Math.min(300, section.contentImageStyle?.scale ?? 100)) / 100})`
                                      }}
                                    />
                                  </div>
                                )}
                                {section.type === 'MUSIC' && section.audioUrl && (
                                  <div
                                    style={{
                                      transform: `translate(${section.positions?.extra?.x || 0}px, ${section.positions?.extra?.y || 0}px)`
                                    }}
                                    className="mb-4 flex justify-center"
                                  >
                                    <audio controls preload="metadata" src={section.audioUrl} className="w-[90%]" />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
