import React from 'react';
import { UserSession } from '../types';

type MainWorkspaceTab = 'dashboard' | 'create' | 'history' | 'settings';

interface SidebarProps {
  activeTab: MainWorkspaceTab;
  currentUser: UserSession;
  collapsed: boolean;
  templatesOpen: boolean;
  onSelectTab: (tab: MainWorkspaceTab) => void;
  onToggleCollapsed: () => void;
  onToggleTemplates: () => void;
}

const primaryMenuItems = [
  {
    id: 'dashboard' as const,
    label: 'Inicio',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 6.75A1.75 1.75 0 015.75 5h4.5A1.75 1.75 0 0112 6.75v4.5A1.75 1.75 0 0110.25 13h-4.5A1.75 1.75 0 014 11.25v-4.5zm8 0A1.75 1.75 0 0113.75 5h4.5A1.75 1.75 0 0120 6.75v4.5A1.75 1.75 0 0118.25 13h-4.5A1.75 1.75 0 0112 11.25v-4.5zm-8 8A1.75 1.75 0 015.75 13h4.5A1.75 1.75 0 0112 14.75v4.5A1.75 1.75 0 0110.25 21h-4.5A1.75 1.75 0 014 19.25v-4.5zm8 0A1.75 1.75 0 0113.75 13h4.5A1.75 1.75 0 0120 14.75v4.5A1.75 1.75 0 0118.25 21h-4.5A1.75 1.75 0 0112 19.25v-4.5z"
      />
    ),
  },
  {
    id: 'templates',
    label: 'Plantillas',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 4.75h10A2.25 2.25 0 0119.25 7v10A2.25 2.25 0 0117 19.25H7A2.25 2.25 0 014.75 17V7A2.25 2.25 0 017 4.75zm0 0v14.5m5-14.5v14.5m5-9.5H4.75m14.5 5H4.75"
      />
    ),
  },
  {
    id: 'create' as const,
    label: 'Editor',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m7-7H5" />
    ),
  },
  {
    id: 'history' as const,
    label: 'Proyectos',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7.25 6.75h9.5A1.75 1.75 0 0118.5 8.5v9A1.75 1.75 0 0116.75 19h-9.5A1.75 1.75 0 015.5 17.5v-9A1.75 1.75 0 017.25 6.75zm2.25-2h5A1.25 1.25 0 0115.75 6v.75h-7.5V6A1.25 1.25 0 019.5 4.75z"
      />
    ),
  },
];

const settingsItem = {
  id: 'settings' as const,
  label: 'Ajustes',
  icon: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M11.983 5.158a1.25 1.25 0 012.034 0l.663.903a1.25 1.25 0 001.384.458l1.08-.34a1.25 1.25 0 011.572 1.255l-.035 1.12a1.25 1.25 0 00.72 1.198l1.015.486a1.25 1.25 0 01.393 1.987l-.72.86a1.25 1.25 0 000 1.606l.72.86a1.25 1.25 0 01-.393 1.987l-1.015.486a1.25 1.25 0 00-.72 1.198l.035 1.12a1.25 1.25 0 01-1.572 1.255l-1.08-.34a1.25 1.25 0 00-1.384.458l-.663.903a1.25 1.25 0 01-2.034 0l-.663-.903a1.25 1.25 0 00-1.384-.458l-1.08.34a1.25 1.25 0 01-1.572-1.255l.035-1.12a1.25 1.25 0 00-.72-1.198l-1.015-.486a1.25 1.25 0 01-.393-1.987l.72-.86a1.25 1.25 0 000-1.606l-.72-.86a1.25 1.25 0 01.393-1.987l1.015-.486a1.25 1.25 0 00.72-1.198l-.035-1.12A1.25 1.25 0 016.8 6.179l1.08.34a1.25 1.25 0 001.384-.458l.719-.903z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  currentUser,
  collapsed,
  templatesOpen,
  onSelectTab,
  onToggleCollapsed,
  onToggleTemplates,
}) => {
  const initials = currentUser.name
    .split(' ')
    .map((part) => part.slice(0, 1))
    .join('')
    .slice(0, 2);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-black/5 bg-white px-2 py-3 transition-all duration-300 ${
        collapsed ? 'w-[44px]' : 'w-[128px]'
      }`}
    >
      <div className={`mb-5 flex ${collapsed ? 'justify-center' : 'items-center justify-between'}`}>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          title={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>

        {!collapsed && (
          <div className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-orange-700">
            Workspace
          </div>
        )}
      </div>

      <div className="mb-5 flex justify-center rounded-[18px] bg-slate-950 p-2.5 text-white">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 text-[10px] font-black uppercase"
          style={{ backgroundColor: currentUser.avatarColor }}
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              width={36}
              height={36}
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>

      <nav className="space-y-1.5">
        {primaryMenuItems.map((item) => {
          const isTemplatesItem = item.id === 'templates';
          const isActive = isTemplatesItem ? templatesOpen : activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (isTemplatesItem ? onToggleTemplates() : onSelectTab(item.id))}
              className={`flex w-full items-center rounded-xl px-2.5 py-2 text-left transition ${
                isActive
                  ? 'bg-orange-50 text-orange-700 shadow-[0_14px_34px_rgba(199,106,61,0.12)]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
              } ${collapsed ? 'justify-center' : 'gap-2'}`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {!collapsed && (
                <span className="text-[10px] font-black uppercase tracking-[0.08em]">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-3">
        <button
          type="button"
          onClick={() => onSelectTab(settingsItem.id)}
          className={`flex w-full items-center rounded-xl px-2.5 py-2 text-left transition ${
            activeTab === settingsItem.id
              ? 'bg-orange-50 text-orange-700 shadow-[0_14px_34px_rgba(199,106,61,0.12)]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
          } ${collapsed ? 'justify-center' : 'gap-2'}`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {settingsItem.icon}
          </svg>
          {!collapsed && (
            <span className="text-[10px] font-black uppercase tracking-[0.08em]">{settingsItem.label}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
