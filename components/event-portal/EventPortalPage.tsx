import React from 'react';
import { m as motion } from 'motion/react';
import { PACKAGES } from '../../constants';
import { buildEventCountdown } from '../../lib/eventPortal';
import { displayFont, fadeInUp, staggerGroup } from '../landing/landingMotion';
import { renderLandingIcon } from '../landing/LandingIcons';
import { GuestQrPreview } from './GuestQrPreview';
import type { AccentBadgeRenderer, IconName, TitleRenderer } from '../landing/shared';
import type {
  EventMetrics,
  EventPortalEventDraft,
  EventPortalGuestDraft,
  EventPortalStatus,
  EventPortalRecord,
  GuestStatus,
  InvitationProjectRecord
} from './types';

const renderLockIcon = (className = 'h-5 w-5') => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5.5" y="10.5" width="13" height="9" rx="2.5" />
    <path d="M8.5 10.5V8.5C8.5 6.29 10.29 4.5 12.5 4.5C14.71 4.5 16.5 6.29 16.5 8.5V10.5" />
    <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export type EventPortalPageProps = {
  variant: 'access' | 'gate' | 'overview';
  activeEventRecord: EventPortalRecord | null;
  activeInvitationProject: InvitationProjectRecord | null;
  eventMetrics: EventMetrics | null;
  eventAccessCode: string;
  eventAccessError: string | null;
  isEventAccessBusy: boolean;
  isEventEditorBusy: boolean;
  isAdminWorkspaceBusy: boolean;
  isInvitationProjectBusy: boolean;
  guestSyncMessage: string | null;
  guestSyncTone: 'success' | 'error' | 'neutral';
  invitationProjectMessage: string | null;
  invitationProjectTone: 'success' | 'error' | 'neutral';
  demoAccessCode: string;
  isGuestSyncBusy: boolean;
  localAccessCodes: string[];
  panelContentRef: React.RefObject<HTMLDivElement | null>;
  isDark: boolean;
  surfaceClasses: string;
  surfaceStrongClasses: string;
  shadowClasses: string;
  mutedTextClasses: string;
  tertiaryTextClasses: string;
  primaryButtonClasses: string;
  panelShellClasses: string;
  panelSurfaceStrongClasses: string;
  panelMutedTextClasses: string;
  panelTertiaryTextClasses: string;
  panelPrimaryButtonClasses: string;
  renderAccentBadge: AccentBadgeRenderer;
  renderTitle: TitleRenderer;
  onEventAccessCodeChange: (value: string) => void;
  onSubmitAccess: (event?: React.FormEvent<HTMLFormElement>) => void;
  onCreateEvent: (draft: EventPortalEventDraft) => Promise<EventPortalRecord>;
  onOpenPanel: (record: EventPortalRecord) => void;
  onClearSession: () => void;
  onSaveEventDetails: (draft: EventPortalEventDraft) => Promise<EventPortalRecord | null>;
  onAddManualGuest: (draft: EventPortalGuestDraft) => Promise<EventPortalRecord | null>;
  onDownloadGuestTemplate: () => void | Promise<void>;
  onDeleteGuests: () => void | Promise<void>;
  onExportGuestLinks: () => void | Promise<void>;
  onExportGuestAdminList: () => void | Promise<void>;
  onImportGuestFile: (file: File) => void | Promise<void>;
  onRegisterGuestCheckIn: (guestCode: string) => Promise<EventPortalRecord['guests'][number] | null>;
  onPreviewInvitationProject: () => Promise<void>;
  onEditInvitationProject: () => void | Promise<void>;
  onOpenAdminWorkspace: () => void | Promise<void>;
  onNavigateAccess: () => void;
  onQuickCode: (code: string) => void;
};

type ScanResult = {
  guest: EventPortalRecord['guests'][number];
  payload: string;
  isRepeatScan: boolean;
};

type BarcodeDetectorScan = {
  rawValue?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorScan[]>;
};

type BarcodeDetectorStatic = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
};

const EVENT_STATUS_OPTIONS: ReadonlyArray<{ value: GuestStatus; label: string }> = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'declinado', label: 'Declinado' }
];

const EVENT_PORTAL_STATUS_OPTIONS: ReadonlyArray<{ value: EventPortalStatus; label: string }> = [
  { value: 'activo', label: 'Activo' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'cancelado', label: 'Cancelado' }
];

const ADMIN_EVENT_FORM_PASSWORDS = ['ArMiRARTE2026!', 'ArMIRARTE2026!'] as const;

const isValidAdminEventFormPassword = (value: string) => {
  const normalizedValue = value.trim();
  if (normalizedValue === '') {
    return false;
  }

  const normalizedLowerValue = normalizedValue.toLowerCase();
  return ADMIN_EVENT_FORM_PASSWORDS.some((password) => {
    const normalizedPassword = password.trim();
    return normalizedValue === normalizedPassword || normalizedLowerValue === normalizedPassword.toLowerCase();
  });
};

const buildTodayDateInputValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const createEmptyEventDraft = (): EventPortalEventDraft => ({
  eventCode: '',
  eventTitle: '',
  hostName: '',
  eventDate: '',
  venue: '',
  venueMapsUrl: '',
  status: 'activo',
  createdDate: buildTodayDateInputValue(),
  packageId: PACKAGES[0].id
});

const createEventDraftFromRecord = (record: EventPortalRecord): EventPortalEventDraft => ({
  eventCode: record.code,
  eventTitle: record.eventTitle,
  hostName: record.hostName,
  eventDate: record.eventDateValue,
  venue: record.venue,
  venueMapsUrl: record.venueMapsUrl,
  status: record.status,
  createdDate: record.createdDate,
  packageId: record.packageId
});

const createEmptyGuestDraft = (): EventPortalGuestDraft => ({
  name: '',
  companions: 1,
  group: 'General',
  tableLabel: '',
  email: '',
  phone: '',
  status: 'pendiente',
  note: ''
});

const DEFAULT_GUEST_FILTERS: {
  query: string;
  table: string;
  group: string;
  status: GuestStatus | 'all';
} = {
  query: '',
  table: 'all',
  group: 'all',
  status: 'all'
};

const EventQuickCreatePanel: React.FC<
  Pick<
    EventPortalPageProps,
    'isEventEditorBusy' | 'panelPrimaryButtonClasses' | 'panelSurfaceStrongClasses' | 'panelTertiaryTextClasses' | 'panelMutedTextClasses' | 'onCreateEvent'
  >
> = (props) => {
  const [draft, setDraft] = React.useState<EventPortalEventDraft>(createEmptyEventDraft);
  const [error, setError] = React.useState<string | null>(null);

  const updateDraft = <K extends keyof EventPortalEventDraft>(key: K, value: EventPortalEventDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.eventTitle.trim()) {
      setError('Agrega al menos el nombre del evento para generar el código.');
      return;
    }

    setError(null);

    try {
      await props.onCreateEvent(draft);
      setDraft(createEmptyEventDraft());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos crear el evento.');
    }
  };

  return (
    <div className={`mt-4 rounded-[24px] border p-5 ${props.panelSurfaceStrongClasses}`}>
      <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${props.panelTertiaryTextClasses}`}>Alta interna</p>
      <h2 className="mt-3 text-3xl leading-none tracking-[-0.04em]" style={displayFont}>
        Alta de eventos con estructura de base.
      </h2>
      <p className={`mt-4 max-w-2xl text-sm leading-7 ${props.panelMutedTextClasses}`}>
        `idEvento` se genera solo. `codigo_evento` se crea automaticamente con 10 caracteres aleatorios no repetidos cuando guardas el alta.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>codigo_evento</span>
          <input
            value="Automatico al crear"
            readOnly
            className="rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm uppercase tracking-[0.14em] text-zinc-300 outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>nombre_evento</span>
          <input
            value={draft.eventTitle}
            onChange={(event) => updateDraft('eventTitle', event.target.value)}
            placeholder="Ej. Boda de Ana y Luis"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Anfitrión o familia</span>
          <input
            value={draft.hostName}
            onChange={(event) => updateDraft('hostName', event.target.value)}
            placeholder="Ej. Familia Torres"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Fecha y hora</span>
          <input
            value={draft.eventDate}
            onChange={(event) => updateDraft('eventDate', event.target.value)}
            placeholder="Ej. 18 de octubre de 2026 · 5:00 PM"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Lugar</span>
          <input
            value={draft.venue}
            onChange={(event) => updateDraft('venue', event.target.value)}
            placeholder="Ej. Salón Aura, Hermosillo"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Google Maps</span>
          <input
            type="url"
            value={draft.venueMapsUrl}
            onChange={(event) => updateDraft('venueMapsUrl', event.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-rose-400">{error}</p> : null}
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={props.isEventEditorBusy}
            className={`rounded-[18px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
          >
            {props.isEventEditorBusy ? 'Creando evento...' : 'Crear evento y generar código'}
          </button>
        </div>
      </form>
    </div>
  );
};

const EventDetailsEditorPanel: React.FC<
  Pick<
    EventPortalPageProps,
    'activeEventRecord' | 'isEventEditorBusy' | 'panelShellClasses' | 'panelPrimaryButtonClasses' | 'panelSurfaceStrongClasses' | 'panelTertiaryTextClasses' | 'panelMutedTextClasses' | 'onSaveEventDetails'
  >
> = (props) => {
  const activeEventRecord = props.activeEventRecord;
  const [draft, setDraft] = React.useState<EventPortalEventDraft | null>(
    activeEventRecord ? createEventDraftFromRecord(activeEventRecord) : null
  );
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(activeEventRecord ? createEventDraftFromRecord(activeEventRecord) : null);
    setMessage(null);
  }, [activeEventRecord?.code, activeEventRecord?.updatedAt]);

  if (!activeEventRecord || !draft) {
    return null;
  }

  const updateDraft = <K extends keyof EventPortalEventDraft>(key: K, value: EventPortalEventDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const savedRecord = await props.onSaveEventDetails(draft);
    if (savedRecord) {
      setDraft(createEventDraftFromRecord(savedRecord));
      setMessage('Datos actualizados correctamente.');
    }
  };

  return (
    <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[10px] border" style={{ backgroundColor: '#f9731616', borderColor: '#f9731636', color: '#f97316' }}>
          {renderLandingIcon('pin', 'h-3 w-3')}
        </div>
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Datos editables</p>
      </div>
      <h3 className="mt-3 text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
        Ajusta la ficha del evento.
      </h3>
      <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
        Desde aquí actualizas la tabla `evento` sin salir del panel.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Nombre del evento</span>
          <input
            value={draft.eventTitle}
            onChange={(event) => updateDraft('eventTitle', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Anfitrión</span>
          <input
            value={draft.hostName}
            onChange={(event) => updateDraft('hostName', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Fecha y hora</span>
          <input
            value={draft.eventDate}
            onChange={(event) => updateDraft('eventDate', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Lugar</span>
          <input
            value={draft.venue}
            onChange={(event) => updateDraft('venue', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Google Maps</span>
          <input
            type="url"
            value={draft.venueMapsUrl}
            onChange={(event) => updateDraft('venueMapsUrl', event.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        {message ? <p className="md:col-span-2 text-sm text-emerald-400">{message}</p> : null}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={props.isEventEditorBusy}
            className={`rounded-[18px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
          >
            {props.isEventEditorBusy ? 'Guardando...' : 'Guardar datos del evento'}
          </button>
        </div>
      </form>
    </motion.article>
  );
};

type EventDatabaseCreatePanelProps = Pick<
  EventPortalPageProps,
  'isEventEditorBusy' | 'panelPrimaryButtonClasses' | 'panelSurfaceStrongClasses' | 'panelTertiaryTextClasses' | 'panelMutedTextClasses' | 'onCreateEvent'
> & {
  containerClassName?: string;
};

const EventDatabaseCreatePanel: React.FC<EventDatabaseCreatePanelProps> = (props) => {
  const [draft, setDraft] = React.useState<EventPortalEventDraft>(createEmptyEventDraft);
  const [error, setError] = React.useState<string | null>(null);

  const updateDraft = <K extends keyof EventPortalEventDraft>(key: K, value: EventPortalEventDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.eventTitle.trim()) {
      setError('Agrega al menos nombre_evento.');
      return;
    }

    setError(null);

    try {
      await props.onCreateEvent(draft);
      setDraft(createEmptyEventDraft());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos crear el evento.');
    }
  };

  return (
    <div className={props.containerClassName ?? `mt-4 rounded-[24px] border p-5 ${props.panelSurfaceStrongClasses}`}>
      <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${props.panelTertiaryTextClasses}`}>Alta interna</p>
      <h2 className="mt-3 text-3xl leading-none tracking-[-0.04em]" style={displayFont}>
        Alta de eventos con estructura de base.
      </h2>
      <p className={`mt-4 max-w-2xl text-sm leading-7 ${props.panelMutedTextClasses}`}>
        `idEvento` y `codigo_evento` se generan automaticamente al guardar. El codigo no se muestra aqui antes del alta para no exponerlo.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>nombre_evento</span>
          <input
            value={draft.eventTitle}
            onChange={(event) => updateDraft('eventTitle', event.target.value)}
            placeholder="Ej. Boda de Ana y Luis"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>fecha_evento</span>
          <input
            type="datetime-local"
            value={draft.eventDate}
            onChange={(event) => updateDraft('eventDate', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>lugar</span>
          <input
            value={draft.venue}
            onChange={(event) => updateDraft('venue', event.target.value)}
            placeholder="Ej. Salon Aura, Hermosillo"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>maps_url</span>
          <input
            type="url"
            value={draft.venueMapsUrl}
            onChange={(event) => updateDraft('venueMapsUrl', event.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>estatus</span>
          <select
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value as EventPortalEventDraft['status'])}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          >
            {EVENT_PORTAL_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>fecha_creacion</span>
          <input
            type="date"
            value={draft.createdDate}
            onChange={(event) => updateDraft('createdDate', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>host_name</span>
          <input
            value={draft.hostName}
            onChange={(event) => updateDraft('hostName', event.target.value)}
            placeholder="Opcional: anfitrion o familia"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-rose-400">{error}</p> : null}
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={props.isEventEditorBusy}
            className={`rounded-[18px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
          >
            {props.isEventEditorBusy ? 'Creando evento...' : 'Crear evento'}
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminProtectedEventCreatePanel: React.FC<
  Pick<
    EventPortalPageProps,
    'isAdminWorkspaceBusy' | 'panelPrimaryButtonClasses' | 'panelTertiaryTextClasses' | 'panelMutedTextClasses' | 'onOpenAdminWorkspace'
  >
> = (props) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const resetAccessState = React.useCallback(() => {
    setPasswordValue('');
    setError(null);
  }, []);

  const handleOpenModal = () => {
    resetAccessState();
    setIsModalOpen(true);
  };

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
    resetAccessState();
  }, [resetAccessState]);

  React.useEffect(() => {
    if (!isModalOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseModal, isModalOpen]);

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isValidAdminEventFormPassword(passwordValue)) {
      setError(null);
      try {
        await props.onOpenAdminWorkspace();
        handleCloseModal();
      } catch (openError) {
        setError(openError instanceof Error ? openError.message : 'No pudimos abrir el proyecto de la invitacion.');
      }
      return;
    }

    setError('Contrasena incorrecta.');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={props.isAdminWorkspaceBusy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[13px] border border-white/10 bg-white/[0.05] text-zinc-300  transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Abrir panel administrativo"
        title="Abrir panel administrativo"
      >
        {props.isAdminWorkspaceBusy ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" opacity="0.2" />
            <path d="M12 3a9 9 0 0 1 8.46 5.94" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          renderLockIcon('h-4 w-4')
        )}
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="absolute inset-0" aria-hidden="true" onClick={handleCloseModal} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-[#0c0c11] text-white "
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.1]"
                aria-label="Cerrar ventana"
              >
                {renderLandingIcon('close', 'h-4 w-4')}
              </button>
            </div>

            <form onSubmit={handleUnlock} className="px-5 pb-6 pt-2 sm:px-6 sm:pb-7">
              <div className="mx-auto max-w-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-white">
                  {renderLockIcon('h-5 w-5')}
                </div>
                <p className={`mt-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${props.panelTertiaryTextClasses}`}>
                  Acceso interno
                </p>
                <label className="mt-5 grid gap-1.5">
                  <span className="sr-only">Contrasena de administrador</span>
                  <input
                    id="admin-access-password"
                    type="password"
                    value={passwordValue}
                    onChange={(event) => setPasswordValue(event.target.value)}
                    autoFocus
                    placeholder="Contrasena"
                    className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-400/60"
                  />
                </label>
                {error ? <p className="mt-3 text-center text-sm text-rose-400">{error}</p> : null}
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={props.isAdminWorkspaceBusy}
                    className={`rounded-[18px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
                  >
                    {props.isAdminWorkspaceBusy ? 'Abriendo...' : 'Entrar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-[18px] border border-white/10 bg-white/[0.04] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.1]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </>
  );
};

const EventDatabaseDetailsEditorPanel: React.FC<
  Pick<
    EventPortalPageProps,
    'activeEventRecord' | 'isEventEditorBusy' | 'panelShellClasses' | 'panelPrimaryButtonClasses' | 'panelTertiaryTextClasses' | 'panelMutedTextClasses' | 'onSaveEventDetails'
  >
> = (props) => {
  const activeEventRecord = props.activeEventRecord;
  const [draft, setDraft] = React.useState<EventPortalEventDraft | null>(
    activeEventRecord ? createEventDraftFromRecord(activeEventRecord) : null
  );
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(activeEventRecord ? createEventDraftFromRecord(activeEventRecord) : null);
    setMessage(null);
  }, [activeEventRecord?.code, activeEventRecord?.updatedAt]);

  if (!activeEventRecord || !draft) {
    return null;
  }

  const updateDraft = <K extends keyof EventPortalEventDraft>(key: K, value: EventPortalEventDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const savedRecord = await props.onSaveEventDetails(draft);
    if (savedRecord) {
      setDraft(createEventDraftFromRecord(savedRecord));
      setMessage('Datos actualizados correctamente.');
    }
  };

  return (
    <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[10px] border" style={{ backgroundColor: '#f9731616', borderColor: '#f9731636', color: '#f97316' }}>
          {renderLandingIcon('pin', 'h-3 w-3')}
        </div>
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Datos editables</p>
      </div>
      <h3 className="mt-3 text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
        Ajusta la ficha del evento.
      </h3>
      <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
        Desde aqui actualizas la tabla `evento` con el mismo esquema operativo.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>codigo_evento</span>
          <input
            value={draft.eventCode}
            readOnly
            className="rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm uppercase tracking-[0.14em] text-zinc-300 outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>nombre_evento</span>
          <input
            value={draft.eventTitle}
            onChange={(event) => updateDraft('eventTitle', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>fecha_evento</span>
          <input
            type="datetime-local"
            value={draft.eventDate}
            onChange={(event) => updateDraft('eventDate', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>lugar</span>
          <input
            value={draft.venue}
            onChange={(event) => updateDraft('venue', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>maps_url</span>
          <input
            type="url"
            value={draft.venueMapsUrl}
            onChange={(event) => updateDraft('venueMapsUrl', event.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>estatus</span>
          <select
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value as EventPortalEventDraft['status'])}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          >
            {EVENT_PORTAL_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>fecha_creacion</span>
          <input
            type="date"
            value={draft.createdDate}
            onChange={(event) => updateDraft('createdDate', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>host_name</span>
          <input
            value={draft.hostName}
            onChange={(event) => updateDraft('hostName', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        {message ? <p className="md:col-span-2 text-sm text-emerald-400">{message}</p> : null}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={props.isEventEditorBusy}
            className={`rounded-[18px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
          >
            {props.isEventEditorBusy ? 'Guardando...' : 'Guardar datos del evento'}
          </button>
        </div>
      </form>
    </motion.article>
  );
};

const ManualGuestEntryPanel: React.FC<
  Pick<
    EventPortalPageProps,
    'activeEventRecord' | 'isGuestSyncBusy' | 'panelPrimaryButtonClasses' | 'panelSurfaceStrongClasses' | 'panelTertiaryTextClasses' | 'panelMutedTextClasses' | 'onAddManualGuest'
  >
> = (props) => {
  const [draft, setDraft] = React.useState<EventPortalGuestDraft>(createEmptyGuestDraft);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(createEmptyGuestDraft());
    setError(null);
  }, [props.activeEventRecord?.code]);

  const updateDraft = <K extends keyof EventPortalGuestDraft>(key: K, value: EventPortalGuestDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name.trim()) {
      setError('Captura el nombre del invitado.');
      return;
    }

    setError(null);

    const savedRecord = await props.onAddManualGuest(draft);
    if (savedRecord) {
      setDraft(createEmptyGuestDraft());
    }
  };

  return (
    <div className={`rounded-[24px] border p-4 sm:p-5 ${props.panelSurfaceStrongClasses}`}>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[10px] border" style={{ backgroundColor: '#14b8a616', borderColor: '#14b8a636', color: '#14b8a6' }}>
          {renderLandingIcon('users', 'h-3 w-3')}
        </div>
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Alta manual</p>
      </div>
      <h3 className="mt-3 text-[1.5rem] leading-none tracking-[-0.04em] text-white sm:text-[1.8rem]" style={displayFont}>
        Registrar invitado manualmente.
      </h3>
      <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
        Este formulario llena `invitado`, `confirmaciones`, `mesa` y `mesa_asignada` al guardar.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Nombre</span>
          <input
            value={draft.name}
            onChange={(event) => updateDraft('name', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Grupo</span>
          <input
            value={draft.group}
            onChange={(event) => updateDraft('group', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Mesa</span>
          <input
            value={draft.tableLabel ?? ''}
            onChange={(event) => updateDraft('tableLabel', event.target.value)}
            placeholder="Ej. Mesa 3"
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Pases asignados</span>
          <input
            type="number"
            min={1}
            value={draft.companions}
            onChange={(event) => updateDraft('companions', Math.max(1, Number.parseInt(event.target.value || '1', 10) || 1))}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Teléfono</span>
          <input
            value={draft.phone ?? ''}
            onChange={(event) => updateDraft('phone', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Email</span>
          <input
            value={draft.email ?? ''}
            onChange={(event) => updateDraft('email', event.target.value)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Estatus</span>
          <select
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value as GuestStatus)}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          >
            {EVENT_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 md:col-span-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Nota interna</span>
          <textarea
            value={draft.note ?? ''}
            onChange={(event) => updateDraft('note', event.target.value)}
            rows={3}
            className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
          />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-rose-400">{error}</p> : null}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={props.isGuestSyncBusy}
            className={`rounded-[18px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
          >
            {props.isGuestSyncBusy ? 'Guardando invitado...' : 'Agregar invitado'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ACCESS_STEPS: ReadonlyArray<{ icon: IconName; title: string; description: string; color: string }> = [
  { icon: 'ticket', title: 'Entra con tu código', description: 'Escribe el código de tu evento y abre tu panel.', color: '#f472b6' },
  { icon: 'users', title: 'Administra invitados', description: 'Confirmaciones, pases y mesas en tiempo real.', color: '#22d3ee' },
  { icon: 'pin', title: 'Consulta los detalles', description: 'Fecha, sede y enlaces en un solo lugar.', color: '#a78bfa' },
  { icon: 'send', title: 'Recibe con QR', description: 'Escanea en la entrada sin apps ni listas de papel.', color: '#34d399' }
];

/* Vista previa del panel dibujada en codigo: muestra al cliente lo que vera al entrar */
const PanelPreview: React.FC = () => (
  <div className="rounded-[28px] border border-white/[0.08] bg-[#0c0c11] p-5 sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">Tu panel</p>
        <p className="mt-1 text-[1.15rem] font-semibold text-white">Boda Sofía &amp; Mateo</p>
      </div>
      <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[12px] font-semibold text-emerald-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        En vivo
      </span>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2.5">
      {[
        ['86', 'Asisten', '#34d399'],
        ['22', 'Pendientes', '#fbbf24'],
        ['12', 'No asisten', '#71717a']
      ].map(([value, label, color]) => (
        <div key={label} className="rounded-2xl bg-white/[0.04] px-3 py-3.5">
          <p className="text-[1.6rem] font-bold leading-none" style={{ color }}>
            {value}
          </p>
          <p className="mt-1.5 text-[12px] text-zinc-500">{label}</p>
        </div>
      ))}
    </div>
    <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full w-[72%] bg-emerald-400" />
      <div className="h-full w-[18%] bg-amber-300" />
    </div>
    <ul className="mt-5 grid gap-2">
      {[
        ['Familia Torres', 'confirmó · 4 pases', '#34d399'],
        ['Daniela y Luis', 'entró con QR · mesa 8', '#22d3ee'],
        ['Martha Salazar', 'abrió la invitación', '#a78bfa']
      ].map(([name, detail, color]) => (
        <li key={name} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3.5 py-2.5 text-sm">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-white">{name}</span>
          <span className="truncate text-zinc-500">{detail}</span>
        </li>
      ))}
    </ul>
  </div>
);

const EventAccessView: React.FC<EventPortalPageProps> = (props) => {
  const recentCodes = Array.from(
    new Set(
      [props.activeEventRecord?.code ?? '', ...props.localAccessCodes, props.demoAccessCode]
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code !== '')
    )
  ).slice(0, 5);

  return (
    <section className="w-full px-4 pb-20 pt-28 sm:px-6 lg:px-16 2xl:px-24">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerGroup}
        className="mx-auto grid w-full max-w-[110rem] gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start"
      >
        <div className="min-w-0">
          <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">Mi evento</p>
            <AdminProtectedEventCreatePanel
              isAdminWorkspaceBusy={props.isAdminWorkspaceBusy}
              panelPrimaryButtonClasses={props.panelPrimaryButtonClasses}
              panelTertiaryTextClasses={props.panelTertiaryTextClasses}
              panelMutedTextClasses={props.panelMutedTextClasses}
              onOpenAdminWorkspace={props.onOpenAdminWorkspace}
            />
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.045em] text-white sm:text-[3.6rem] lg:text-[4.2rem]"
            style={displayFont}
          >
            Entra a tu evento. <span className="brand-gradient-text">Todo el control, aquí.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-5 max-w-[34rem] text-[1.05rem] leading-7 text-zinc-400">
            Con tu código ves a tus invitados, sus confirmaciones y usas el escáner QR en la entrada, desde cualquier celular.
          </motion.p>

          <motion.form variants={fadeInUp} onSubmit={props.onSubmitAccess} className="glow-card mt-8 rounded-[28px] p-6 sm:p-7">
            <label htmlFor="event-access-code" className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-400">
              Código del evento
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="event-access-code"
                value={props.eventAccessCode}
                onChange={(event) => props.onEventAccessCodeChange(event.target.value.toUpperCase())}
                placeholder="A1B2C3D4E5"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[1.15rem] font-bold uppercase tracking-[0.3em] text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/60 focus:bg-white/[0.06]"
              />
              <button
                type="submit"
                disabled={props.isEventAccessBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-[15px] font-semibold text-zinc-950 transition hover:bg-white/85 disabled:opacity-60"
              >
                {props.isEventAccessBusy ? 'Conectando…' : 'Entrar al panel'}
                {!props.isEventAccessBusy ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </button>
            </div>

            {props.eventAccessError ? (
              <p className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
                {props.eventAccessError}
              </p>
            ) : null}

            {recentCodes.length > 0 ? (
              <div className="mt-5">
                <p className="text-[12px] font-semibold text-zinc-500">Accesos rápidos</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentCodes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => props.onQuickCode(code)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] font-bold tracking-[0.16em] text-zinc-200 transition hover:border-white/25 hover:text-white"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.form>

          {props.activeEventRecord ? (
            <motion.div
              variants={fadeInUp}
              className="mt-4 flex flex-col gap-4 rounded-[24px] border border-emerald-400/25 bg-emerald-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-emerald-300">Sesión lista</p>
                <p className="mt-1 text-sm text-zinc-300">
                  Ya validaste <span className="font-bold text-white">{props.activeEventRecord.code}</span>. Vuelve a tu panel sin escribirlo.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => props.onOpenPanel(props.activeEventRecord!)}
                  className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-zinc-950 transition hover:bg-white/85"
                >
                  Abrir panel
                </button>
                <button
                  type="button"
                  onClick={props.onClearSession}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/[0.06]"
                >
                  Cambiar código
                </button>
              </div>
            </motion.div>
          ) : null}

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col gap-3 rounded-[24px] border border-white/[0.07] bg-[#0c0c11] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-zinc-400">
              ¿Aún no tienes tu evento? <span className="text-white">Actívalo en minutos.</span>
            </p>
            <a
              href="#registro"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/[0.06]"
            >
              Empezar por $389
            </a>
          </motion.div>
        </div>

        <motion.div variants={fadeInUp} className="grid gap-4">
          <PanelPreview />
          <ol className="grid gap-3 sm:grid-cols-2">
            {ACCESS_STEPS.map((step, index) => (
              <li key={step.title} className="rounded-[22px] border border-white/[0.07] bg-[#0c0c11] p-5">
                <div className="flex items-center gap-3">
                  {props.renderAccentBadge(step.icon, step.color, 'h-4 w-4')}
                  <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: step.color }}>
                    Paso {index + 1}
                  </span>
                </div>
                <p className="mt-3 font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{step.description}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </motion.div>
    </section>
  );
};

const EventPanelGateView: React.FC<EventPortalPageProps> = (props) => (
  <section className="flex w-full flex-1 items-center justify-center overflow-y-auto px-4 py-10">
    <motion.article initial="hidden" animate="visible" variants={fadeInUp} className="glow-card w-full max-w-xl rounded-[32px] p-8 text-center sm:p-10">
      <div className="mx-auto w-fit">{props.renderAccentBadge('ticket', '#a78bfa', 'h-5 w-5')}</div>
      <h2 className="mt-5 text-[2rem] leading-[1.05] tracking-[-0.03em] text-white" style={displayFont}>
        Primero valida tu código
      </h2>
      <p className="mt-3 text-[1rem] leading-7 text-zinc-400">Para abrir este panel entra desde “Mi evento” con el código de tu evento.</p>
      <button
        type="button"
        onClick={props.onNavigateAccess}
        className="mt-7 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-white/85"
      >
        Ir a Mi evento
      </button>
    </motion.article>
  </section>
);

type EventPanelSectionId = 'overview' | 'guests' | 'invitation' | 'control';

const EVENT_PANEL_SECTIONS: ReadonlyArray<{
  id: EventPanelSectionId;
  label: string;
  icon: IconName;
  color: string;
}> = [
  {
    id: 'overview',
    label: 'Informacion',
    icon: 'ticket',
    color: '#fbbf24'
  },
  {
    id: 'guests',
    label: 'Invitados',
    icon: 'users',
    color: '#22d3ee'
  },
  {
    id: 'invitation',
    label: 'Invitacion',
    icon: 'edit',
    color: '#f472b6'
  },
  {
    id: 'control',
    label: 'Control',
    icon: 'shield',
    color: '#a78bfa'
  }
] as const;

type LiveEventCountdownProps = {
  eventDate: string;
  badge: React.ReactNode;
  mutedTextClasses: string;
  tertiaryTextClasses: string;
};

const EMPTY_COUNTDOWN_BLOCKS = [
  { label: 'Dias', value: '--' },
  { label: 'Horas', value: '--' },
  { label: 'Minutos', value: '--' },
  { label: 'Segundos', value: '--' }
];

// Se actualiza por si solo para que el resto del panel no se re-renderice cada segundo.
const LiveEventCountdown: React.FC<LiveEventCountdownProps> = ({ eventDate, badge, mutedTextClasses, tertiaryTextClasses }) => {
  const [now, setNow] = React.useState(() => Date.now());
  const countdown = buildEventCountdown(eventDate, now);
  const isTicking = Boolean(countdown && !countdown.isPast);

  React.useEffect(() => {
    if (!isTicking) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isTicking]);

  const blocks = countdown
    ? [
        { label: 'Dias', value: countdown.days },
        { label: 'Horas', value: countdown.hours },
        { label: 'Minutos', value: countdown.minutes },
        { label: 'Segundos', value: countdown.seconds }
      ]
    : EMPTY_COUNTDOWN_BLOCKS;
  const title = countdown?.isPast ? 'El evento ya comenzo' : 'Tiempo restante';
  const dateLabel = countdown
    ? `Fecha detectada: ${new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' }).format(countdown.target)}`
    : `No pudimos calcular la cuenta regresiva con la fecha actual: ${eventDate}`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {badge}
        <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${tertiaryTextClasses}`}>Cuenta regresiva</p>
        <p className="text-[11px] font-black leading-5 text-white sm:ml-auto">{title}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {blocks.map((item) => (
          <div key={item.label} className="rounded-[18px] bg-white/[0.05] px-3 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            <p className="text-[1.1rem] leading-none tabular-nums tracking-[-0.03em] text-white sm:text-[1.35rem]" style={displayFont}>
              {item.value}
            </p>
            <p className={`mt-1.5 text-[7px] font-black uppercase tracking-[0.14em] ${tertiaryTextClasses}`}>{item.label}</p>
          </div>
        ))}
      </div>

      <p className={`mt-3 text-[11px] leading-[1.3rem] ${mutedTextClasses}`}>{dateLabel}</p>
    </>
  );
};

const EventPanelOverviewView: React.FC<EventPortalPageProps> = (props) => {
  const activeStyle = props.activeEventRecord
    ? PACKAGES.find((pkg) => pkg.id === props.activeEventRecord!.packageId) ?? PACKAGES[0]
    : null;

  if (!props.activeEventRecord || !props.eventMetrics || !activeStyle) {
    return <EventPanelGateView {...props} />;
  }

  const { activeEventRecord, eventMetrics } = props;
  const guestFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const scannerStreamRef = React.useRef<MediaStream | null>(null);
  const scannerFrameRef = React.useRef<number | null>(null);
  const lastAcceptedScanRef = React.useRef<{ value: string; at: number } | null>(null);
  const invitationPreviewAutoRequestRef = React.useRef<string | null>(null);
  const invitationPreviewBusyRef = React.useRef(false);
  const [activeSection, setActiveSection] = React.useState<EventPanelSectionId>('overview');
  const [isPanelNavOpen, setIsPanelNavOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);
  const [copiedLabel, setCopiedLabel] = React.useState<string | null>(null);
  const [qrPreviewGuestId, setQrPreviewGuestId] = React.useState<string | null>(null);
  const [qrPreviewMode, setQrPreviewMode] = React.useState<'code' | 'url'>('code');
  const [isGuestEntryOpen, setIsGuestEntryOpen] = React.useState(false);
  const [guestStatusFocusId, setGuestStatusFocusId] = React.useState<string | null>(null);
  const [expandedGuestId, setExpandedGuestId] = React.useState<EventPortalRecord['guests'][number]['id'] | null>(null);
  const [invitationPreviewReloadKey, setInvitationPreviewReloadKey] = React.useState(0);
  const [guestFilters, setGuestFilters] = React.useState(DEFAULT_GUEST_FILTERS);
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);
  const [isScannerSupported, setIsScannerSupported] = React.useState(false);
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [isScannerBusy, setIsScannerBusy] = React.useState(false);
  const [isScannerConfirmBusy, setIsScannerConfirmBusy] = React.useState(false);
  const [scannerError, setScannerError] = React.useState<string | null>(null);
  const [scannerHint, setScannerHint] = React.useState('Activa la camara del celular para escanear la invitacion.');
  const [pendingScanResult, setPendingScanResult] = React.useState<ScanResult | null>(null);
  const [lastScanResult, setLastScanResult] = React.useState<ScanResult | null>(null);

  React.useEffect(() => {
    setActiveSection('overview');
    setIsPanelNavOpen(false);
    setCopiedLabel(null);
    setQrPreviewGuestId(null);
    setQrPreviewMode('code');
    setIsGuestEntryOpen(false);
    setGuestStatusFocusId(null);
    setExpandedGuestId(null);
    setGuestFilters(DEFAULT_GUEST_FILTERS);
    setIsScannerOpen(false);
    setIsScannerBusy(false);
    setIsScannerConfirmBusy(false);
    setScannerError(null);
    setScannerHint('Activa la camara del celular para escanear la invitacion.');
    setPendingScanResult(null);
    setLastScanResult(null);
  }, [activeEventRecord.code]);

  React.useEffect(() => {
    if (!isGuestEntryOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsGuestEntryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGuestEntryOpen]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorStatic }).BarcodeDetector;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileByAgent = /android|iphone|ipad|ipod|windows phone|mobile/.test(userAgent);
    const coarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
    const smallTouchViewport = coarsePointer && Math.max(window.innerWidth, window.innerHeight) <= 1180;

    setIsMobileDevice(mobileByAgent || smallTouchViewport);
    setIsScannerSupported(Boolean(window.navigator.mediaDevices?.getUserMedia) && Boolean(detectorCtor));
  }, []);

  const formatCheckInLabel = (value?: string) => {
    if (!value) return 'Sin escanear';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(parsed);
  };

  const releaseScannerResources = React.useEffectEvent(() => {
    if (typeof window !== 'undefined' && scannerFrameRef.current !== null) {
      window.cancelAnimationFrame(scannerFrameRef.current);
      scannerFrameRef.current = null;
    }

    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((track) => track.stop());
      scannerStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  });

  const stopScannerSession = React.useEffectEvent(() => {
    releaseScannerResources();
    setIsScannerOpen(false);
    setIsScannerBusy(false);
  });

  const resolveGuestFromScanPayload = React.useEffectEvent((payload: string) => {
    const normalizedPayload = payload.trim();
    if (!normalizedPayload) return null;

    const normalizedCode = normalizedPayload.toUpperCase();
    const guestByCode = activeEventRecord.guests.find((guest) => guest.guestCode.toUpperCase() === normalizedCode);
    if (guestByCode) return guestByCode;

    const guestByUrl = activeEventRecord.guests.find((guest) => guest.guestUrl === normalizedPayload);
    if (guestByUrl) return guestByUrl;

    try {
      const parsedUrl = new URL(normalizedPayload);
      const eventCode = parsedUrl.searchParams.get('event')?.trim().toUpperCase();
      const guestCode = parsedUrl.searchParams.get('guest')?.trim().toUpperCase();

      if (eventCode && eventCode !== activeEventRecord.code.toUpperCase()) {
        return null;
      }

      if (!guestCode) return null;
      return activeEventRecord.guests.find((guest) => guest.guestCode.toUpperCase() === guestCode) ?? null;
    } catch {
      return null;
    }
  });

  const registerScannedPayload = React.useEffectEvent(async (payload: string) => {
    const matchedGuest = resolveGuestFromScanPayload(payload);

    if (!matchedGuest) {
      setScannerError('El QR no coincide con un invitado de este evento.');
      setScannerHint('Escanea una invitacion generada para este evento.');
      setPendingScanResult(null);
      return;
    }

    const now = Date.now();
    const lastAcceptedScan = lastAcceptedScanRef.current;

    if (lastAcceptedScan && lastAcceptedScan.value === matchedGuest.guestCode && now - lastAcceptedScan.at < 4000) {
      return;
    }

    lastAcceptedScanRef.current = {
      value: matchedGuest.guestCode,
      at: now
    };

    stopScannerSession();
    setScannerError(null);
    setScannerHint(
      (matchedGuest.checkInCount ?? 0) > 0
        ? 'Invitacion detectada nuevamente. Revisa los datos y confirma si quieres registrar otro acceso.'
        : 'Invitacion detectada. Revisa los datos y confirma la asistencia.'
    );
    setPendingScanResult({
      guest: matchedGuest,
      payload,
      isRepeatScan: (matchedGuest.checkInCount ?? 0) > 0
    });
    setLastScanResult(null);
  });

  const handleOpenScanner = () => {
    if (!isMobileDevice) {
      setScannerError('El escaner de invitaciones solo se habilita desde dispositivos moviles.');
      return;
    }

    if (!isScannerSupported) {
      setScannerError('Tu navegador movil no soporta esta demo de escaneo QR. Pruebalo en Chrome o Edge movil.');
      return;
    }

    lastAcceptedScanRef.current = null;
    setScannerError(null);
    setScannerHint('Solicitando acceso a la camara...');
    setPendingScanResult(null);
    setLastScanResult(null);
    setIsScannerConfirmBusy(false);
    setIsScannerOpen(true);
  };

  const handleCloseScanner = () => {
    stopScannerSession();
    setScannerHint('Escaner detenido.');
  };

  const handleScanAnotherQr = () => {
    setPendingScanResult(null);
    setLastScanResult(null);
    setIsScannerConfirmBusy(false);
    handleOpenScanner();
  };

  const handleConfirmScannedGuest = async () => {
    if (!pendingScanResult || isScannerConfirmBusy) return;

    setIsScannerConfirmBusy(true);

    try {
      const updatedGuest = await props.onRegisterGuestCheckIn(pendingScanResult.guest.guestCode);

      if (!updatedGuest) {
        setScannerError('Reconocimos la invitacion, pero no pudimos confirmar la asistencia.');
        setScannerHint('Intenta confirmar otra vez o vuelve a escanear.');
        return;
      }

      setScannerError(null);
      setScannerHint(
        pendingScanResult.isRepeatScan
          ? 'Asistencia confirmada nuevamente. Ya puedes escanear otra invitacion.'
          : 'Asistencia confirmada. Ya puedes escanear otra invitacion.'
      );
      setLastScanResult({
        guest: updatedGuest,
        payload: pendingScanResult.payload,
        isRepeatScan: pendingScanResult.isRepeatScan
      });
      setPendingScanResult(null);
    } finally {
      setIsScannerConfirmBusy(false);
    }
  };

  React.useEffect(() => {
    if (activeSection === 'control') return;

    stopScannerSession();
    setIsScannerConfirmBusy(false);
    setPendingScanResult(null);
  }, [activeSection]);

  React.useEffect(() => {
    setIsPanelNavOpen(false);
  }, [activeSection]);

  React.useEffect(() => () => releaseScannerResources(), []);

  React.useEffect(() => {
    const eventCode = props.activeEventRecord?.code?.trim() ?? '';
    const previewUrl = props.activeInvitationProject?.previewUrl?.trim() ?? '';
    const previewExists = props.activeInvitationProject?.previewExists ?? false;

    if (activeSection !== 'invitation') {
      invitationPreviewAutoRequestRef.current = null;
      return;
    }

    if (!eventCode || props.isInvitationProjectBusy) {
      return;
    }

    if (previewUrl !== '' && previewExists) {
      invitationPreviewAutoRequestRef.current = eventCode;
      return;
    }

    if (invitationPreviewAutoRequestRef.current === eventCode) {
      return;
    }

    invitationPreviewAutoRequestRef.current = eventCode;
    void props.onPreviewInvitationProject();
  }, [
    activeSection,
    props.activeEventRecord?.code,
    props.activeInvitationProject?.previewExists,
    props.activeInvitationProject?.previewUrl,
    props.isInvitationProjectBusy,
    props.onPreviewInvitationProject
  ]);

  React.useEffect(() => {
    const finishedPreparing = invitationPreviewBusyRef.current && !props.isInvitationProjectBusy;
    if (finishedPreparing && activeSection === 'invitation' && props.activeInvitationProject?.previewUrl?.trim()) {
      setInvitationPreviewReloadKey((current) => current + 1);
    }

    invitationPreviewBusyRef.current = props.isInvitationProjectBusy;
  }, [activeSection, props.activeInvitationProject?.previewUrl, props.isInvitationProjectBusy]);

  React.useEffect(() => {
    if (!isScannerOpen) return;

    const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorStatic }).BarcodeDetector;
    const video = videoRef.current;

    if (!detectorCtor || !video || !navigator.mediaDevices?.getUserMedia) {
      setScannerError('No encontramos soporte suficiente para abrir el escaner QR.');
      setIsScannerOpen(false);
      return;
    }

    let isCancelled = false;

    const bootScanner = async () => {
      setIsScannerBusy(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        scannerStreamRef.current = stream;
        video.srcObject = stream;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        await video.play();

        const detector = new detectorCtor({ formats: ['qr_code'] });

        setScannerError(null);
        setScannerHint('Apunta la camara al QR de la invitacion.');

        const scanFrame = async () => {
          if (isCancelled) return;

          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            scannerFrameRef.current = window.requestAnimationFrame(scanFrame);
            return;
          }

          try {
            const scans = await detector.detect(video);
            const payload = scans[0]?.rawValue?.trim();

            if (payload) {
              void registerScannedPayload(payload);
            }
          } catch {
            // Algunos navegadores moviles fallan intermitentemente cuadro a cuadro; seguimos intentando.
          }

          scannerFrameRef.current = window.requestAnimationFrame(scanFrame);
        };

        scannerFrameRef.current = window.requestAnimationFrame(scanFrame);
      } catch {
        if (!isCancelled) {
          setScannerError('No pudimos abrir la camara del celular. Revisa permisos e intentalo otra vez.');
          setScannerHint('Permiso de camara requerido para escanear.');
          setIsScannerOpen(false);
        }
      } finally {
        if (!isCancelled) {
          setIsScannerBusy(false);
        }
      }
    };

    void bootScanner();

    return () => {
      isCancelled = true;
      releaseScannerResources();
    };
  }, [isScannerOpen]);

  const renderPanelAccentBadge = (icon: IconName, color: string, size = 'h-3 w-3') => (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-[10px] border"
      style={{
        backgroundColor: `${color}16`,
        borderColor: `${color}36`,
        color
      }}
    >
      {renderLandingIcon(icon, size)}
    </div>
  );

  const handleOpenGuestFilePicker = () => {
    guestFileInputRef.current?.click();
  };

  const handleGuestFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await props.onImportGuestFile(file);
    } finally {
      event.target.value = '';
    }
  };

  const showCopiedFeedback = (label: string) => {
    setCopiedLabel(label);
    window.setTimeout(() => setCopiedLabel((current) => (current === label ? null : current)), 1800);
  };

  const handleCopyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showCopiedFeedback(label);
    } catch {
      setCopiedLabel(null);
    }
  };

  const handleShareGuestUrl = async (guest: EventPortalRecord['guests'][number]) => {
    const guestUrl = guest.guestUrl?.trim();
    if (!guestUrl) {
      return;
    }

    const feedbackLabel = `${guest.id}-share`;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: `${activeEventRecord.eventTitle} · ${guest.name}`,
          text: `Acceso individual para ${guest.name}`,
          url: guestUrl
        });
        showCopiedFeedback(feedbackLabel);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
    }

    await handleCopyValue(guestUrl, feedbackLabel);
  };

  const toggleGuestQrPreview = (guestId: string) => {
    setQrPreviewGuestId((current) => (current === guestId ? null : guestId));
  };

  const buildGuestQrPayload = (guest: EventPortalRecord['guests'][number]) =>
    qrPreviewMode === 'code' ? guest.guestCode : guest.guestUrl;

  const guestFeedbackClasses =
    props.guestSyncTone === 'success'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
      : props.guestSyncTone === 'error'
        ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
        : 'border-sky-400/30 bg-sky-400/10 text-sky-300';
  const invitationProjectFeedbackClasses =
    props.invitationProjectTone === 'success'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
      : props.invitationProjectTone === 'error'
        ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
        : 'border-sky-400/30 bg-sky-400/10 text-sky-300';
  const activeSectionMeta =
    EVENT_PANEL_SECTIONS.find((section) => section.id === activeSection) ?? EVENT_PANEL_SECTIONS[0];
  const handleSectionChange = (sectionId: EventPanelSectionId) => {
    setActiveSection(sectionId);
    setIsPanelNavOpen(false);
  };
  const sectionSwapVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: 0.06
      }
    }
  };
  const eventStatusLabel =
    EVENT_PORTAL_STATUS_OPTIONS.find((status) => status.value === activeEventRecord.status)?.label ?? activeEventRecord.status;

  const eventInfoItems = [
    { label: 'Anfitriones', value: activeEventRecord.hostName, icon: 'users' as IconName, color: '#f97316' },
    { label: 'Fecha del evento', value: activeEventRecord.eventDate, icon: 'calendar' as IconName, color: '#14b8a6' },
    {
      label: 'Ubicacion',
      value: activeEventRecord.venue,
      icon: 'pin' as IconName,
      color: '#8b5cf6',
      href: activeEventRecord.venueMapsUrl || '',
      hrefLabel: 'Abrir Google Maps'
    },
    { label: 'Estatus del evento', value: eventStatusLabel, icon: 'check' as IconName, color: '#0f766e' }
  ];
  const invitationLaunchUrl = (
    props.activeInvitationProject?.shareUrl?.trim()
    || activeEventRecord.shareUrl?.trim()
    || ''
  );
  const invitationLocalPreviewUrl =
    typeof window !== 'undefined' && activeEventRecord.code.trim() !== ''
      ? new URL(`/db/invitaciones/${encodeURIComponent(activeEventRecord.code.trim())}/dist/index.html`, window.location.origin).toString()
      : '';
  const invitationOpenUrl =
    invitationLocalPreviewUrl
    || props.activeInvitationProject?.previewUrl?.trim()
    || invitationLaunchUrl;
  const invitationProjectStatusLabel = props.activeInvitationProject
    ? props.activeInvitationProject.previewExists
      ? 'Vista previa lista'
      : invitationLaunchUrl !== ''
        ? 'Invitacion lista para abrir'
        : 'Proyecto detectado'
    : props.isInvitationProjectBusy
      ? 'Preparando vista previa...'
      : invitationLocalPreviewUrl !== ''
        ? 'Vista previa local disponible'
      : invitationLaunchUrl !== ''
        ? 'Invitacion disponible'
        : 'Pendiente de preparar';
  const invitationPreviewFrameBaseUrl =
    invitationLocalPreviewUrl
    || props.activeInvitationProject?.previewUrl?.trim()
    || (!props.isInvitationProjectBusy ? invitationLaunchUrl : '');
  const invitationPreviewEmbedUrl = invitationPreviewFrameBaseUrl
    ? `${invitationPreviewFrameBaseUrl}${invitationPreviewFrameBaseUrl.includes('?') ? '&' : '?'}panelPreview=${invitationPreviewReloadKey}`
    : null;
  const invitationHasApiSyncFallback = Boolean(
    invitationPreviewEmbedUrl
    && props.invitationProjectMessage
    && /(respuesta no v[áa]lida|connection refused|no pudimos recuperar|no pudimos preparar)/i.test(props.invitationProjectMessage)
  );
  const invitationVisibleMessage = invitationHasApiSyncFallback
    ? 'No pudimos sincronizar la vista por API, pero estamos cargando la version local disponible de la invitacion.'
    : props.invitationProjectMessage;
  const invitationVisibleFeedbackClasses = invitationHasApiSyncFallback
    ? `mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[12px] leading-5 text-zinc-400`
    : `mt-4 rounded-[18px] border px-3.5 py-3 text-[12px] leading-5 ${invitationProjectFeedbackClasses}`;

  const assignedTableCount = new Set(
    activeEventRecord.guests
      .map((guest) => guest.tableLabel?.trim())
      .filter((value): value is string => Boolean(value))
  ).size;
  const pendingGuestsWithContact = activeEventRecord.guests.filter((guest) => {
    if (guest.status !== 'pendiente') return false;

    return Boolean((guest.phone ?? '').trim() || (guest.email ?? '').trim());
  }).length;
  const pendingGuestsWithoutContact = activeEventRecord.guests.filter((guest) => {
    if (guest.status !== 'pendiente') return false;

    return !((guest.phone ?? '').trim() || (guest.email ?? '').trim());
  }).length;
  const guestStatusLegend = [
    {
      id: 'confirmados',
      label: 'Confirmados',
      description: 'Aceptaron la invitacion y ya cuentan dentro del evento.',
      count: eventMetrics.confirmedGuests,
      color: '#14b8a6'
    },
    {
      id: 'por-confirmar',
      label: 'Por confirmar',
      description: 'Siguen pendientes, pero ya tienen telefono o email para seguimiento.',
      count: pendingGuestsWithContact,
      color: '#f59e0b'
    },
    {
      id: 'sin-confirmar',
      label: 'Sin confirmar',
      description: 'Siguen pendientes y todavia no tienen contacto cargado.',
      count: pendingGuestsWithoutContact,
      color: '#94a3b8'
    },
    {
      id: 'no-asistire',
      label: 'No asistire',
      description: 'Declinaron la invitacion o avisaron que no podran ir.',
      count: eventMetrics.declinedGuests,
      color: '#ec4899'
    }
  ];
  const guestStatusTotal = guestStatusLegend.reduce((sum, item) => sum + item.count, 0);
  const guestStatusChartSegments = guestStatusLegend.map((item) => {
    const ratio = guestStatusTotal > 0 ? item.count / guestStatusTotal : 0;
    return {
      ...item,
      ratio,
      percentage: ratio * 100
    };
  });
  const activeGuestStatusSegment =
    guestStatusChartSegments.find((segment) => segment.id === guestStatusFocusId) ??
    guestStatusChartSegments.find((segment) => segment.count > 0) ??
    guestStatusChartSegments[0];
  const getGuestStatusClasses = (status: EventPortalRecord['guests'][number]['status']) =>
    status === 'confirmado'
      ? 'bg-emerald-400/15 text-emerald-300'
      : status === 'declinado'
        ? 'bg-rose-400/15 text-rose-300'
        : 'bg-amber-400/15 text-amber-300';
  const getGuestStatusLabel = (status: EventPortalRecord['guests'][number]['status']) =>
    status === 'confirmado' ? 'Confirmado' : status === 'declinado' ? 'No asistira' : 'Pendiente';
  const getGuestGroupLabel = (guest: EventPortalRecord['guests'][number]) => (guest.group ?? '').trim() || 'General';
  const getGuestTableDisplayLabel = (guest: EventPortalRecord['guests'][number]) => (guest.tableLabel ?? '').trim() || 'Mesa por asignar';
  const getGuestTableFilterLabel = (guest: EventPortalRecord['guests'][number]) => (guest.tableLabel ?? '').trim() || 'Sin mesa';
  const getGuestContactLabel = (guest: EventPortalRecord['guests'][number]) => {
    const contactItems = [guest.phone?.trim(), guest.email?.trim()].filter((value): value is string => Boolean(value));
    return contactItems.length > 0 ? contactItems.join(' · ') : 'Sin telefono ni email';
  };
  const guestTableOptions = [...new Set<string>(activeEventRecord.guests.map((guest) => getGuestTableFilterLabel(guest)))].sort((left, right) =>
    left.localeCompare(right, 'es')
  );
  const guestGroupOptions = [...new Set<string>(activeEventRecord.guests.map((guest) => getGuestGroupLabel(guest)))].sort((left, right) =>
    left.localeCompare(right, 'es')
  );
  const guestSearchQuery = guestFilters.query.trim().toLowerCase();
  const filteredGuests = activeEventRecord.guests.filter((guest) => {
    const tableFilterLabel = getGuestTableFilterLabel(guest);
    const groupLabel = getGuestGroupLabel(guest);
    const matchesQuery =
      guestSearchQuery === '' ||
      [guest.name, guest.guestCode, guest.phone ?? '', guest.email ?? '', tableFilterLabel, groupLabel]
        .join(' ')
        .toLowerCase()
        .includes(guestSearchQuery);
    const matchesTable = guestFilters.table === 'all' || tableFilterLabel === guestFilters.table;
    const matchesGroup = guestFilters.group === 'all' || groupLabel === guestFilters.group;
    const matchesStatus = guestFilters.status === 'all' || guest.status === guestFilters.status;

    return matchesQuery && matchesTable && matchesGroup && matchesStatus;
  });
  const hasGuestFiltersActive =
    guestFilters.query.trim() !== '' || guestFilters.table !== 'all' || guestFilters.group !== 'all' || guestFilters.status !== 'all';
  const guestFilterFieldClasses =
    'rounded-[14px] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12px] leading-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60';
  const guestWorkspaceSummaryCards = [
    {
      label: 'Invitados cargados',
      value: `${activeEventRecord.guests.length}`,
      color: '#14b8a6',
      tooltip: 'Total de invitados actualmente cargados en la lista maestra.'
    },
    {
      label: 'Confirmados',
      value: `${eventMetrics.confirmedGuests}`,
      color: '#2563eb',
      tooltip: 'Invitados que ya confirmaron su asistencia.'
    },
    {
      label: 'Pendientes',
      value: `${pendingGuestsWithContact + pendingGuestsWithoutContact}`,
      color: '#f59e0b',
      tooltip: 'Invitados que siguen sin confirmar asistencia.'
    },
    {
      label: 'Mesas activas',
      value: `${assignedTableCount}`,
      color: '#8b5cf6',
      tooltip: 'Numero de mesas o zonas que ya tienen invitados asignados.'
    }
  ];
  const guestWorkspaceActionCards = [
    {
      key: 'template',
      label: 'Descargar plantilla',
      description: 'Baja el formato base para capturar invitados fuera del panel.',
      tooltip: 'Descarga una plantilla lista para llenar en Excel y volver a importar.',
      icon: 'grid' as IconName,
      onClick: props.onDownloadGuestTemplate,
      disabled: false,
      tone: 'primary' as const
    },
    {
      key: 'upload',
      label: props.isGuestSyncBusy ? 'Procesando archivo...' : 'Subir invitados',
      description: 'Importa una plantilla y sustituye la lista actual previo aviso.',
      tooltip: 'Sube una plantilla Excel. Si ya hay invitados, el sistema pedira confirmacion para reemplazarlos.',
      icon: 'send' as IconName,
      onClick: handleOpenGuestFilePicker,
      disabled: props.isGuestSyncBusy,
      tone: 'neutral' as const
    },
    {
      key: 'manual',
      label: 'Alta manual',
      description: 'Agrega un invitado directo desde el panel sin usar archivo.',
      tooltip: 'Abre el formulario para capturar un invitado manualmente.',
      icon: 'edit' as IconName,
      onClick: () => setIsGuestEntryOpen(true),
      disabled: false,
      tone: 'neutral' as const
    },
    {
      key: 'delete',
      label: 'Eliminar invitados',
      description: 'Vacía toda la lista actual del evento con confirmacion previa.',
      tooltip: 'Elimina todos los invitados cargados para este evento.',
      icon: 'close' as IconName,
      onClick: props.onDeleteGuests,
      disabled: props.isGuestSyncBusy || activeEventRecord.guests.length === 0,
      tone: 'danger' as const
    }
  ];
  const renderGuestWorkspaceActionCards = (gridClassName: string) => (
    <div className={`mt-3 grid gap-2 ${gridClassName}`}>
      {guestWorkspaceActionCards.map((action) => {
        const isPrimary = action.tone === 'primary';
        const isDanger = action.tone === 'danger';

        return (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.tooltip}
            aria-label={`${action.label}. ${action.tooltip}`}
            className={`flex min-h-[108px] flex-col rounded-[18px] border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isPrimary
                ? 'border-cyan-400/40 bg-cyan-400/10 text-white hover:bg-cyan-400/15'
                : isDanger
                  ? 'border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20'
                  : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] border ${
                  isPrimary
                    ? 'border-white/18 bg-white/10 text-white'
                    : isDanger
                      ? 'border-rose-400/30 bg-white/[0.05] text-rose-300'
                      : 'border-white/10 bg-white/[0.04] text-zinc-300'
                }`}
              >
                {renderLandingIcon(action.icon, 'h-4 w-4')}
              </span>
              <span
                className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${
                  isPrimary
                    ? 'border-white/18 bg-white/10 text-white/84'
                    : isDanger
                      ? 'border-rose-400/30 bg-white/[0.05] text-rose-300'
                      : 'border-white/10 bg-white/[0.04] text-zinc-500'
                }`}
              >
                Tip
              </span>
            </div>
            <p className={`mt-4 text-[10px] font-black uppercase tracking-[0.16em] ${isPrimary ? 'text-white' : ''}`}>{action.label}</p>
            <p className={`mt-1 text-[11px] leading-5 ${isPrimary ? 'text-white/80' : isDanger ? 'text-rose-300/90' : props.panelMutedTextClasses}`}>
              {action.description}
            </p>
          </button>
        );
      })}
    </div>
  );
  const renderGuestWorkspaceSummaryCards = () => (
    <div className="mt-3 grid auto-rows-fr gap-2 sm:grid-cols-2">
      {guestWorkspaceSummaryCards.map((item) => (
        <div key={item.label} title={item.tooltip} className={`flex h-full min-h-[90px] flex-col rounded-[16px] border px-3.5 py-3 ${props.panelShellClasses}`}>
          <p className={`text-[8px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>{item.label}</p>
          <p className="mt-2 text-[1.15rem] font-black leading-none text-white" style={{ ...displayFont, color: item.color }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
  const renderGuestWorkspaceConfirmationCard = () => (
    <div className={`flex h-full flex-col rounded-[24px] border p-4 ${props.panelSurfaceStrongClasses}`}>
      <div className="flex items-center gap-2">
        {renderPanelAccentBadge('ticket', '#2563eb')}
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Confirmaciones</p>
      </div>
      <h4 className="mt-3 text-[1.35rem] leading-none tracking-[-0.04em] text-white sm:text-[1.55rem]" style={displayFont}>
        Confirmaciones
      </h4>
      <p className={`mt-2 text-[12px] leading-5 ${props.panelMutedTextClasses}`}>
        Una sola barra concentra los cuatro estatus. Pasa el cursor o toca un segmento para ver porcentaje y significado.
      </p>

      <div className="mt-4">
        <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04]">
          <div className="flex h-7 w-full">
            {guestStatusChartSegments.map((segment, index) => {
              const isActive = activeGuestStatusSegment?.id === segment.id;
              const width = guestStatusTotal > 0 ? segment.ratio * 100 : 25;

              return (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => setGuestStatusFocusId((current) => (current === segment.id ? null : segment.id))}
                  onMouseEnter={() => setGuestStatusFocusId(segment.id)}
                  onMouseLeave={() => setGuestStatusFocusId(null)}
                  className="relative h-full transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: guestStatusTotal > 0 ? segment.color : `${segment.color}40`,
                    opacity: guestStatusFocusId && guestStatusFocusId !== segment.id ? 0.42 : 1,
                    filter: isActive ? 'saturate(1.08)' : 'saturate(0.94)'
                  }}
                  aria-label={`${segment.label}: ${segment.percentage.toFixed(segment.percentage % 1 === 0 ? 0 : 1)} por ciento`}
                >
                  {index < guestStatusChartSegments.length - 1 ? <span className="absolute inset-y-0 right-0 w-px bg-white/[0.05]" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`mt-3 rounded-[18px] border px-3.5 py-3 ${props.panelShellClasses}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activeGuestStatusSegment?.color ?? '#94a3b8' }} />
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white">
              {activeGuestStatusSegment?.label ?? 'Sin datos'}
            </p>
            <p className={`text-[11px] leading-5 ${props.panelMutedTextClasses}`}>
              {activeGuestStatusSegment
                ? `${activeGuestStatusSegment.percentage.toFixed(activeGuestStatusSegment.percentage % 1 === 0 ? 0 : 1)}% · ${activeGuestStatusSegment.count} invitado(s)`
                : '0% · 0 invitados'}
            </p>
          </div>
          <p className={`mt-1.5 text-[12px] leading-5 ${props.panelMutedTextClasses}`}>
            {activeGuestStatusSegment?.description ?? 'Sin invitados cargados todavia.'}
          </p>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
          {guestStatusChartSegments.map((segment) => {
            const isActive = activeGuestStatusSegment?.id === segment.id;

            return (
              <button
                key={segment.id}
                type="button"
                onClick={() => setGuestStatusFocusId((current) => (current === segment.id ? null : segment.id))}
                onMouseEnter={() => setGuestStatusFocusId(segment.id)}
                onMouseLeave={() => setGuestStatusFocusId(null)}
                className={`rounded-[16px] border p-3 text-left transition-colors ${isActive ? 'border-white/15 bg-white/[0.04]' : props.panelShellClasses}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white">{segment.label}</p>
                </div>
                <p className="mt-2 text-[1.15rem] font-black leading-none text-white">
                  {segment.percentage.toFixed(segment.percentage % 1 === 0 ? 0 : 1)}%
                </p>
                <p className={`mt-1 text-[10px] leading-5 ${props.panelMutedTextClasses}`}>{segment.count} invitado(s)</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOverviewSection = () => (
    <div className="grid gap-2.5">
      <motion.article
        variants={fadeInUp}
        className={`overflow-hidden rounded-[24px] border p-4 sm:p-5 lg:p-6 ${props.panelShellClasses}`}
        style={{
          background: `linear-gradient(145deg, ${activeStyle.primaryColor}14 0%, rgba(12,12,17,0.96) 54%, rgba(8,8,12,0.98) 100%)`
        }}
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {renderPanelAccentBadge('ticket', activeStyle.primaryColor, 'h-3.5 w-3.5')}
              <p className={`text-[8px] font-black uppercase tracking-[0.22em] ${props.panelTertiaryTextClasses}`}>Evento</p>
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white sm:ml-auto"
                style={{ borderColor: `${activeStyle.primaryColor}26`, backgroundColor: `${activeStyle.primaryColor}12` }}
              >
                {eventStatusLabel}
              </span>
            </div>

            <h2 className="mt-3 text-[1.8rem] leading-[0.94] tracking-[-0.05em] sm:text-[2.4rem] xl:text-[3.2rem]" style={displayFont}>
              {activeEventRecord.eventTitle}
            </h2>

            <p className={`mt-4 max-w-2xl text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
              Resumen rapido del evento y acceso directo al panel, sin mezclar invitados ni bloques secundarios.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Codigo del evento</span>
              <p className="rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2 font-mono text-[0.98rem] font-black leading-none tracking-[0.18em] text-white sm:text-[1.08rem]">
                {activeEventRecord.code}
              </p>
              <button
                type="button"
                onClick={() => void handleCopyValue(activeEventRecord.code, 'overview-event-code')}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${props.panelPrimaryButtonClasses}`}
              >
                {copiedLabel === 'overview-event-code' ? 'Copiado' : 'Copiar codigo'}
              </button>
            </div>

            <p className={`mt-3 text-[11px] leading-5 ${props.panelMutedTextClasses}`}>
              Alta detectada: {activeEventRecord.createdDate || 'Sin fecha de alta'}
            </p>
          </div>

          <div className="min-w-0 xl:border-l xl:border-black/8 xl:pl-6">
            <LiveEventCountdown
              eventDate={activeEventRecord.eventDate}
              badge={renderPanelAccentBadge('clock', '#14b8a6')}
              mutedTextClasses={props.panelMutedTextClasses}
              tertiaryTextClasses={props.panelTertiaryTextClasses}
            />
          </div>
        </div>
      </motion.article>

      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)] xl:items-stretch">
        <motion.article variants={fadeInUp} className={`h-full rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`} style={{ borderColor: '#8b5cf636' }}>
          <div className="flex items-center gap-2">
            {renderPanelAccentBadge('pin', '#8b5cf6')}
            <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Informacion del evento</p>
          </div>
          <div className="mt-3 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
            <div className="min-w-0">
              <h3 className="text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
                Datos principales
              </h3>
              <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
                Aqui solo quedan los datos del evento: anfitriones, fecha, ubicacion y estatus general.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void props.onEditInvitationProject()}
              disabled={props.isAdminWorkspaceBusy}
              className={`rounded-[14px] px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${props.panelPrimaryButtonClasses} ${props.isAdminWorkspaceBusy ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {props.isAdminWorkspaceBusy ? 'Abriendo...' : 'Editar invitación'}
            </button>
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {eventInfoItems.map((item) => (
              <div key={item.label} className={`rounded-[18px] border p-3.5 ${props.panelSurfaceStrongClasses}`}>
                <div className="flex items-center gap-2">
                  {renderPanelAccentBadge(item.icon, item.color)}
                  <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>{item.label}</p>
                </div>
                <p className="mt-2.5 break-words text-[13px] leading-5 text-zinc-300">{item.value}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-[11px] font-black uppercase tracking-[0.12em] text-white underline underline-offset-2"
                  >
                    {item.hrefLabel ?? 'Abrir link'}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </motion.article>

        <EventDatabaseDetailsEditorPanel
          activeEventRecord={props.activeEventRecord}
          isEventEditorBusy={props.isEventEditorBusy}
          panelShellClasses={props.panelShellClasses}
          panelPrimaryButtonClasses={props.panelPrimaryButtonClasses}
          panelSurfaceStrongClasses={props.panelSurfaceStrongClasses}
          panelTertiaryTextClasses={props.panelTertiaryTextClasses}
          panelMutedTextClasses={props.panelMutedTextClasses}
          onSaveEventDetails={props.onSaveEventDetails}
        />
      </div>
    </div>
  );

  const renderProjectSection = () => (
    <div className="grid gap-2.5">
      <motion.article
        variants={fadeInUp}
        className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}
        style={{ borderColor: '#ec489936' }}
      >
        <div className="flex items-center gap-2">
          {renderPanelAccentBadge('edit', '#ec4899')}
          <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Invitacion</p>
        </div>
        <div className="mt-3 grid gap-4 min-[980px]:grid-cols-[minmax(0,1fr)_auto] min-[980px]:items-start">
          <div className="min-w-0">
            <h3 className="text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
              Previsualizacion dinamica de la invitacion.
            </h3>
            <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
              Este apartado carga la vista previa del evento de forma automatica y la mantiene separada del control de invitados. El proyecto sigue ligado a
              `invitaciones/{activeEventRecord.code}` para que puedas revisar el resultado sin mezclarlo con la operacion del evento.
            </p>
            {invitationVisibleMessage ? (
              <div className={invitationVisibleFeedbackClasses}>
                {invitationVisibleMessage}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void props.onPreviewInvitationProject()}
                disabled={props.isInvitationProjectBusy}
                className={`rounded-[14px] px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${props.panelPrimaryButtonClasses} ${props.isInvitationProjectBusy ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {props.isInvitationProjectBusy ? 'Preparando...' : 'Reintentar vista previa'}
              </button>
              {invitationOpenUrl ? (
                <a
                  href={invitationOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-[14px] border px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${props.panelSurfaceStrongClasses}`}
                >
                  Abrir invitacion
                </a>
              ) : null}
            </div>
          </div>

          <div className="min-[980px]:justify-self-end">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${props.panelSurfaceStrongClasses}`}>
              {renderLandingIcon(props.isInvitationProjectBusy ? 'clock' : 'ticket', 'h-3.5 w-3.5')}
              <span>{props.isInvitationProjectBusy ? 'Cargando vista previa...' : invitationProjectStatusLabel}</span>
            </div>
          </div>
        </div>

      </motion.article>

      <motion.article variants={fadeInUp} className={`overflow-hidden rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {renderPanelAccentBadge('ticket', '#2563eb')}
            <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Vista previa</p>
          </div>
          <h3 className="mt-3 text-[1.45rem] leading-none tracking-[-0.04em] text-white sm:text-[1.8rem]" style={displayFont}>
            Previsualizacion integrada
          </h3>
          <p className={`mt-3 max-w-3xl text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
            Si ya existe una compilacion del evento, la ves aqui mismo. Si todavia no aparece, este apartado la prepara automaticamente para mostrar la
            version activa del proyecto.
          </p>
        </div>

        {invitationPreviewEmbedUrl ? (
          <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]">
            <iframe
              title={`Vista previa de ${activeEventRecord.eventTitle}`}
              src={invitationPreviewEmbedUrl}
              className="h-[720px] w-full bg-white/[0.04]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`mt-4 rounded-[20px] border border-dashed p-5 ${props.panelSurfaceStrongClasses}`}>
            <p className="text-[13px] leading-6 text-zinc-300">
              Todavia no hay una vista previa compilada para este evento. Este apartado la esta preparando automaticamente para mostrar la version activa en
              cuanto este lista.
            </p>
          </div>
        )}
      </motion.article>
    </div>
  );

  const renderGuestsSection = () => (
    <motion.article variants={fadeInUp} className={`h-full rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
      <div className="flex items-center gap-2">
        {renderPanelAccentBadge('users', '#14b8a6')}
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Carga de invitados</p>
      </div>
      <h3 className="mt-3 text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
        Plantilla, carga y sincronización.
      </h3>
      <p className={`mt-3 max-w-2xl text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
        Descarga la plantilla, llenala fuera del panel con nombre, mesa y numero de invitados, y vuelve a subirla. Al importar, cada invitado recibe un codigo unico y una URL individual para este evento. Si vuelves a subir otra plantilla, la lista actual se sustituye completa previo aviso.
      </p>

      <input ref={guestFileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleGuestFileChange} />

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={props.onDownloadGuestTemplate}
          className={`rounded-[16px] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${props.panelPrimaryButtonClasses}`}
        >
          Descargar plantilla
        </button>
        <button
          type="button"
          onClick={handleOpenGuestFilePicker}
          disabled={props.isGuestSyncBusy}
          className={`rounded-[16px] border px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors disabled:opacity-60 ${props.panelSurfaceStrongClasses}`}
        >
          {props.isGuestSyncBusy ? 'Procesando archivo...' : 'Subir invitados'}
        </button>
        <button
          type="button"
          onClick={props.onExportGuestLinks}
          className={`rounded-[16px] border px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${props.panelSurfaceStrongClasses}`}
        >
          Descargar links
        </button>
        <button
          type="button"
          onClick={props.onDeleteGuests}
          disabled={props.isGuestSyncBusy || activeEventRecord.guests.length === 0}
          className="rounded-[16px] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-rose-300 transition-colors hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ELIMINAR INVITADOS
        </button>
      </div>

      {props.guestSyncMessage ? (
        <div className={`mt-4 rounded-[18px] border px-4 py-3 text-[12px] font-semibold leading-5 ${guestFeedbackClasses}`}>
          {props.guestSyncMessage}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2.5 min-[520px]:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Invitados cargados', value: `${activeEventRecord.guests.length}`, color: '#14b8a6' },
          { label: 'Mesas activas', value: `${assignedTableCount}`, color: '#f59e0b' },
          { label: 'Lugares confirmados', value: `${eventMetrics.confirmedSeats}`, color: '#8b5cf6' }
        ].map((item) => (
          <div key={item.label} className={`rounded-[18px] border p-3 ${props.panelSurfaceStrongClasses}`}>
            <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>{item.label}</p>
            <p className="mt-2 text-[1.45rem] font-black leading-none text-white" style={{ ...displayFont, color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <ManualGuestEntryPanel
        activeEventRecord={props.activeEventRecord}
        isGuestSyncBusy={props.isGuestSyncBusy}
        panelPrimaryButtonClasses={props.panelPrimaryButtonClasses}
        panelSurfaceStrongClasses={props.panelSurfaceStrongClasses}
        panelTertiaryTextClasses={props.panelTertiaryTextClasses}
        panelMutedTextClasses={props.panelMutedTextClasses}
        onAddManualGuest={props.onAddManualGuest}
      />
    </motion.article>
  );

  const renderGuestsWorkspaceSection = () => (
    <>
      <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
        <input ref={guestFileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleGuestFileChange} />

        <div className="hidden gap-4 xl:grid">
          <div className="min-w-0 max-w-3xl">
            <div className="flex items-center gap-2">
              {renderPanelAccentBadge('users', '#14b8a6')}
              <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Invitados</p>
            </div>
            <h3 className="mt-3 text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
              Gestion central de invitados.
            </h3>
            <p className={`mt-3 max-w-2xl text-[12px] leading-5 ${props.panelMutedTextClasses}`}>
              Esta vista concentra carga, confirmaciones y la lista maestra. Si subes otra plantilla, la lista actual se sustituye completa previa
              confirmacion. El control operativo y el escaner quedan en `Control`. La previsualizacion y el proyecto activo viven en `Invitacion`.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:items-stretch">
            {renderGuestWorkspaceConfirmationCard()}

            <div className={`flex h-full flex-col rounded-[24px] border p-4 ${props.panelSurfaceStrongClasses}`}>
              <div>
                <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Acciones</p>
                {renderGuestWorkspaceActionCards('sm:grid-cols-2')}
              </div>

              {props.guestSyncMessage ? (
                <div className={`mt-3 rounded-[18px] border px-3.5 py-3 text-[12px] font-semibold leading-5 ${guestFeedbackClasses}`}>
                  {props.guestSyncMessage}
                </div>
              ) : null}

              <div className="mt-3">
                <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Datos generales</p>
                {renderGuestWorkspaceSummaryCards()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:hidden">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {renderPanelAccentBadge('users', '#14b8a6')}
              <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Invitados</p>
            </div>
            <h3 className="mt-3 text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
              Gestion central de invitados.
            </h3>
            <p className={`mt-3 max-w-2xl text-[12px] leading-5 ${props.panelMutedTextClasses}`}>
              Esta vista concentra carga, confirmaciones y la lista maestra. Si subes otra plantilla, la lista actual se sustituye completa previa
              confirmacion. El control operativo y el escaner quedan en `Control`. La previsualizacion y el proyecto activo viven en `Invitacion`.
            </p>
          </div>

          <div className={`rounded-[24px] border p-4 ${props.panelSurfaceStrongClasses}`}>
            <div>
              <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Acciones</p>
              {renderGuestWorkspaceActionCards('grid-cols-1 sm:grid-cols-2')}
            </div>

            {props.guestSyncMessage ? (
              <div className={`mt-3 rounded-[18px] border px-3.5 py-3 text-[12px] font-semibold leading-5 ${guestFeedbackClasses}`}>
                {props.guestSyncMessage}
              </div>
            ) : null}

            <div className="mt-3">
              <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Datos generales</p>
              {renderGuestWorkspaceSummaryCards()}
            </div>
          </div>

          {renderGuestWorkspaceConfirmationCard()}
        </div>
      </motion.article>
      {isGuestEntryOpen ? (
        <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="absolute inset-0" aria-hidden="true" onClick={() => setIsGuestEntryOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c11] "
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Registro manual</p>
                <p className="mt-1 text-[1.1rem] font-black tracking-[-0.03em] text-white" style={displayFont}>
                  Agrega invitados sin salir de la lista
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGuestEntryOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.1]"
                aria-label="Cerrar registro manual"
              >
                {renderLandingIcon('close', 'h-4 w-4')}
              </button>
            </div>

            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-4 py-4 custom-scrollbar sm:px-5">
              <ManualGuestEntryPanel
                activeEventRecord={props.activeEventRecord}
                isGuestSyncBusy={props.isGuestSyncBusy}
                panelPrimaryButtonClasses={props.panelPrimaryButtonClasses}
                panelSurfaceStrongClasses={props.panelSurfaceStrongClasses}
                panelTertiaryTextClasses={props.panelTertiaryTextClasses}
                panelMutedTextClasses={props.panelMutedTextClasses}
                onAddManualGuest={props.onAddManualGuest}
              />
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );

  const renderLinksSection = () => (
    <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
      <div className="flex items-center gap-2">
        {renderPanelAccentBadge('send', '#ec4899')}
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Links individuales</p>
      </div>
      <h3 className="mt-3 text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
        Cada invitado sale con su propio acceso.
      </h3>
      <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
        Los links se vinculan al código del evento y se actualizan junto con la lista actual de invitados.
      </p>
      <p className={`mt-3 text-[10px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>
        {activeEventRecord.guests.filter((guest) => guest.guestUrl).length} link(s) listos para compartir
      </p>

      <div className="mt-4 grid gap-2.5 xl:grid-cols-2">
        {activeEventRecord.guests.map((guest) => (
          <div key={guest.id} className={`rounded-[18px] border p-3.5 ${props.panelSurfaceStrongClasses}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[13px] font-black leading-5 text-white">{guest.name}</p>
                <p className={`mt-1 text-[11px] uppercase tracking-[0.12em] ${props.panelMutedTextClasses}`}>
                  {guest.group} · {guest.tableLabel ?? 'Mesa por asignar'} · {guest.companions} invitado(s)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleGuestQrPreview(guest.id)}
                  className={`w-full rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] sm:w-auto ${
                    qrPreviewGuestId === guest.id ? props.panelPrimaryButtonClasses : props.panelSurfaceStrongClasses
                  }`}
                >
                  {qrPreviewGuestId === guest.id ? 'Ocultar QR' : 'Ver QR'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleShareGuestUrl(guest)}
                  disabled={!guest.guestUrl}
                  className={`w-full rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] sm:w-auto ${props.panelSurfaceStrongClasses}`}
                >
                  {copiedLabel === `${guest.id}-share` ? 'Compartido' : 'Compartir URL'}
                </button>
              </div>
            </div>
            <p className="mt-3 break-all font-mono text-[11px] leading-5 text-zinc-300">{guest.guestCode}</p>
            <p className="mt-2 break-all text-[11px] leading-5 text-zinc-300">{guest.guestUrl}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopyValue(guest.guestUrl, guest.id)}
                disabled={!guest.guestUrl}
                className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-60 ${props.panelSurfaceStrongClasses}`}
              >
                {copiedLabel === guest.id ? 'Copiado' : 'Copiar URL'}
              </button>
              <button
                type="button"
                onClick={() => handleCopyValue(guest.guestCode, `${guest.id}-qr-code`)}
                className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${props.panelSurfaceStrongClasses}`}
              >
                {copiedLabel === `${guest.id}-qr-code` ? 'Copiado' : 'Copiar codigo'}
              </button>
            </div>

            {qrPreviewGuestId === guest.id ? (
              <div className={`mt-4 rounded-[18px] border p-3.5 ${props.panelShellClasses}`}>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQrPreviewMode('code')}
                    className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
                      qrPreviewMode === 'code' ? props.panelPrimaryButtonClasses : props.panelSurfaceStrongClasses
                    }`}
                  >
                    QR de codigo
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrPreviewMode('url')}
                    className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
                      qrPreviewMode === 'url' ? props.panelPrimaryButtonClasses : props.panelSurfaceStrongClasses
                    }`}
                  >
                    QR de URL
                  </button>
                </div>

                <div className="mt-3">
                  <GuestQrPreview
                    value={buildGuestQrPayload(guest)}
                    title={qrPreviewMode === 'code' ? 'QR para control de acceso' : 'QR para abrir la invitacion'}
                    subtitle={
                      qrPreviewMode === 'code'
                        ? 'Usa este QR para validar al invitado con su codigo unico durante el acceso.'
                        : 'Usa este QR si quieres compartir la entrada individual del invitado desde otro medio.'
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {activeEventRecord.guests.length === 0 ? (
          <div className={`rounded-[18px] border border-dashed p-4 text-[12px] leading-5 ${props.panelSurfaceStrongClasses} ${props.panelMutedTextClasses}`}>
            Todavia no hay invitados importados. Puedes empezar con la plantilla o cargar invitados manualmente.
          </div>
        ) : null}
      </div>
    </motion.article>
  );

  const renderGuestCentralListSection = () => (
    <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
      <div className="flex items-center gap-2">
        {renderPanelAccentBadge('grid', '#8b5cf6')}
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Lista</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-[1.35rem] leading-none tracking-[-0.04em] text-white sm:text-[1.55rem]" style={displayFont}>
            Lista central de invitados
          </h4>
          <p className={`mt-1.5 text-[12px] leading-5 ${props.panelMutedTextClasses}`}>
            Filtra por mesa, grupo, estatus o busca por nombre, codigo, telefono y correo. Cada fila despliega datos, QR y check-in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsGuestEntryOpen(true)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] border transition-colors ${props.panelPrimaryButtonClasses}`}
          aria-label="Registrar invitado"
          title="Registrar invitado"
        >
          {renderLandingIcon('plus', 'h-4 w-4')}
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.72fr))]">
        <label className="grid gap-1.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Buscar</span>
          <input
            type="text"
            value={guestFilters.query}
            onChange={(event) =>
              setGuestFilters((current) => ({
                ...current,
                query: event.target.value
              }))
            }
            className={guestFilterFieldClasses}
            placeholder="Nombre, codigo, telefono o correo"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Mesa</span>
          <select
            value={guestFilters.table}
            onChange={(event) =>
              setGuestFilters((current) => ({
                ...current,
                table: event.target.value
              }))
            }
            className={guestFilterFieldClasses}
          >
            <option value="all">Todas las mesas</option>
            {guestTableOptions.map((tableOption) => (
              <option key={tableOption} value={tableOption}>
                {tableOption}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Grupo</span>
          <select
            value={guestFilters.group}
            onChange={(event) =>
              setGuestFilters((current) => ({
                ...current,
                group: event.target.value
              }))
            }
            className={guestFilterFieldClasses}
          >
            <option value="all">Todos los grupos</option>
            {guestGroupOptions.map((groupOption) => (
              <option key={groupOption} value={groupOption}>
                {groupOption}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Estatus</span>
          <select
            value={guestFilters.status}
            onChange={(event) =>
              setGuestFilters((current) => ({
                ...current,
                status: event.target.value as GuestStatus | 'all'
              }))
            }
            className={guestFilterFieldClasses}
          >
            <option value="all">Todos los estatus</option>
            {EVENT_STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.value === 'declinado' ? 'No asistira' : statusOption.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-[11px] leading-5 ${props.panelMutedTextClasses}`}>
          {filteredGuests.length} de {activeEventRecord.guests.length} invitados visibles
        </p>
        {hasGuestFiltersActive ? (
          <button
            type="button"
            onClick={() => setGuestFilters(DEFAULT_GUEST_FILTERS)}
            className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${props.panelShellClasses}`}
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="mt-4 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredGuests.length > 0 ? (
          <div className="grid gap-2.5 xl:grid-cols-2">
            {filteredGuests.map((guest) => {
              const isExpanded = expandedGuestId === guest.id;
              const isQrOpen = qrPreviewGuestId === guest.id;

              return (
                <article key={`guests-overview-${guest.id}`} className={`rounded-[18px] border p-3 ${props.panelShellClasses}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[1.02rem] font-black leading-tight text-white sm:text-[1.12rem]">{guest.name}</p>
                      <p className={`mt-1 text-[11px] uppercase tracking-[0.12em] ${props.panelMutedTextClasses}`}>
                        {(guest.group || 'General').trim()} · {guest.tableLabel ?? 'Mesa por asignar'} · {guest.companions} pase(s)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${getGuestStatusClasses(guest.status)}`}>
                        {getGuestStatusLabel(guest.status)}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
                          guest.checkedInAt ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-zinc-400'
                        }`}
                      >
                        {guest.checkedInAt ? 'Acceso validado' : 'Sin check-in'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedGuestId((current) => (current === guest.id ? null : guest.id))}
                        className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${props.panelSurfaceStrongClasses}`}
                      >
                        {isExpanded ? 'Ocultar datos' : 'Ver datos'}
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <>
                      <div className="mt-3 grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.92fr)]">
                        <div className="grid gap-2.5">
                          <div className={`rounded-[14px] border p-3 ${props.panelSurfaceStrongClasses}`}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Contacto</p>
                            <p className="mt-1 text-[12px] leading-5 text-zinc-300">{getGuestContactLabel(guest)}</p>
                          </div>
                          <div className={`rounded-[14px] border p-3 ${props.panelSurfaceStrongClasses}`}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Acceso del invitado</p>
                            <p className="mt-1 text-[12px] leading-5 text-zinc-300">
                              {guest.guestUrl
                                ? 'Este invitado ya tiene su acceso individual listo para compartir por QR o enlace.'
                                : 'Todavia no hay un acceso individual listo para este invitado.'}
                            </p>
                          </div>
                          {guest.note ? (
                            <div className={`rounded-[14px] border p-3 ${props.panelSurfaceStrongClasses}`}>
                              <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Nota</p>
                              <p className="mt-1 text-[12px] leading-5 text-zinc-300">{guest.note}</p>
                            </div>
                          ) : null}
                        </div>

                        <div className="grid gap-2.5">
                          <div className={`rounded-[14px] border p-3 ${props.panelSurfaceStrongClasses}`}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Resumen del invitado</p>
                            <div className="mt-1 grid gap-1 text-[12px] leading-5 text-zinc-300">
                              <p>Mesa: {guest.tableLabel ?? 'Mesa por asignar'}</p>
                              <p>Grupo: {(guest.group || 'General').trim()}</p>
                              <p>Pases: {guest.companions}</p>
                            </div>
                          </div>
                          <div className={`rounded-[14px] border p-3 ${props.panelSurfaceStrongClasses}`}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Estado del acceso</p>
                            <p className="mt-1 text-[12px] leading-5 text-zinc-300">
                              {guest.checkedInAt ? `Ingreso registrado: ${formatCheckInLabel(guest.checkedInAt)}` : 'Aun no registra ingreso.'}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-zinc-300">Escaneos registrados: {guest.checkInCount ?? 0}</p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => void handleShareGuestUrl(guest)}
                              disabled={!guest.guestUrl}
                              className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-60 ${props.panelSurfaceStrongClasses}`}
                            >
                              {copiedLabel === `${guest.id}-share` ? 'Compartido' : 'Compartir acceso'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyValue(guest.guestUrl, `${guest.id}-url`)}
                              disabled={!guest.guestUrl}
                              className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-60 ${props.panelSurfaceStrongClasses}`}
                            >
                              {copiedLabel === `${guest.id}-url` ? 'Copiado' : 'Copiar enlace'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleGuestQrPreview(guest.id)}
                              disabled={!guest.guestUrl}
                              className={`rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-60 ${
                                isQrOpen ? props.panelPrimaryButtonClasses : props.panelSurfaceStrongClasses
                              }`}
                            >
                              {isQrOpen ? 'Ocultar QR' : 'Ver QR'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isQrOpen ? (
                        guest.guestUrl ? (
                          <div className={`mt-3 rounded-[18px] border p-3.5 ${props.panelSurfaceStrongClasses}`}>
                            <GuestQrPreview
                              value={guest.guestUrl}
                              title="QR del invitado"
                              subtitle="Comparte este QR para que el invitado abra su acceso individual desde el celular."
                              showValue={false}
                            />
                          </div>
                        ) : (
                          <div className={`mt-3 rounded-[18px] border border-dashed p-3.5 text-[12px] leading-5 ${props.panelSurfaceStrongClasses} ${props.panelMutedTextClasses}`}>
                            Todavia no hay un enlace listo para generar el QR de este invitado.
                          </div>
                        )
                      ) : null}
                    </>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : activeEventRecord.guests.length > 0 ? (
          <div className={`rounded-[18px] border border-dashed p-4 text-[12px] leading-5 ${props.panelShellClasses} ${props.panelMutedTextClasses}`}>
            No encontramos invitados con esos filtros. Ajusta mesa, grupo, estatus o limpia la busqueda.
          </div>
        ) : (
          <div className={`rounded-[18px] border border-dashed p-4 text-[12px] leading-5 ${props.panelShellClasses} ${props.panelMutedTextClasses}`}>
            Todavia no hay invitados cargados. Sube la plantilla o usa el icono superior para registrar uno manualmente.
          </div>
        )}
      </div>
    </motion.article>
  );

  const renderDirectorySection = () => (
    <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
      <div className="flex items-center gap-2">
        {renderPanelAccentBadge('grid', '#14b8a6')}
        <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Directorio de invitados</p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
            Revision final de invitados, mesas y codigos.
          </h3>
          <p className={`mt-3 text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
            Aquí puedes revisar lo que quedó cargado para este evento con sus mesas, códigos y estado actual de acceso.
          </p>
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>
          {activeEventRecord.guests.length} registro(s)
        </p>
      </div>

      <div className="mt-4 grid gap-2.5 lg:hidden">
        {activeEventRecord.guests.map((guest) => (
          <article key={`directory-mobile-${guest.id}`} className={`rounded-[20px] border p-4 ${props.panelSurfaceStrongClasses}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[14px] font-black leading-5 text-white">{guest.name}</p>
                <p className={`mt-1 text-[12px] uppercase tracking-[0.12em] ${props.panelMutedTextClasses}`}>
                  {guest.group} · {guest.tableLabel ?? 'Mesa por asignar'} · {guest.companions} invitado(s)
                </p>
                {guest.note ? <p className="mt-2 text-[12px] leading-5 text-zinc-400">{guest.note}</p> : null}
              </div>
              <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${getGuestStatusClasses(guest.status)}`}>
                {guest.status}
              </span>
            </div>

            <div className="mt-4 grid gap-2.5 min-[520px]:grid-cols-2">
              <div className={`rounded-[16px] border p-3 ${props.panelShellClasses}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Código único</p>
                <p className="mt-2 break-all font-mono text-[12px] leading-5 text-zinc-200">{guest.guestCode}</p>
                <button
                  type="button"
                  onClick={() => handleCopyValue(guest.guestCode, `${guest.id}-code`)}
                  className={`mt-3 w-full rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${props.panelSurfaceStrongClasses}`}
                >
                  {copiedLabel === `${guest.id}-code` ? 'Copiado' : 'Copiar código'}
                </button>
              </div>

              <div className={`rounded-[16px] border p-3 ${props.panelShellClasses}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>URL individual</p>
                <p className="mt-2 break-all text-[12px] leading-5 text-zinc-300">{guest.guestUrl}</p>
                <button
                  type="button"
                  onClick={() => handleCopyValue(guest.guestUrl, `${guest.id}-url`)}
                  className={`mt-3 w-full rounded-[12px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${props.panelSurfaceStrongClasses}`}
                >
                  {copiedLabel === `${guest.id}-url` ? 'Copiada' : 'Copiar URL'}
                </button>
              </div>

              <div className={`rounded-[16px] border p-3 ${props.panelShellClasses}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Contacto</p>
                <p className="mt-2 text-[12px] leading-5 text-zinc-300">{guest.phone ?? 'Sin teléfono'}</p>
                <p className="mt-1 break-all text-[12px] leading-5 text-zinc-300">{guest.email ?? 'Sin email'}</p>
              </div>

              <div className={`rounded-[16px] border p-3 ${props.panelShellClasses}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Check-in</p>
                <p className="mt-2 text-[12px] leading-5 text-zinc-300">{formatCheckInLabel(guest.checkedInAt)}</p>
                <p className="mt-1 text-[12px] leading-5 text-zinc-300">Escaneos: {guest.checkInCount ?? 0}</p>
              </div>
            </div>
          </article>
        ))}
        {activeEventRecord.guests.length === 0 ? (
          <div className={`rounded-[18px] border border-dashed p-4 text-[12px] leading-5 ${props.panelSurfaceStrongClasses} ${props.panelMutedTextClasses}`}>
            Todavía no hay invitados cargados para mostrar en este directorio.
          </div>
        ) : null}
      </div>

      <div className="mt-4 hidden overflow-x-auto pb-2 custom-scrollbar lg:block">
        <table className="min-w-[980px] w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Invitado</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Grupo</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Mesa</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Invitados</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Codigo unico</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>URL individual</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Contacto</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Estado</th>
              <th className={`px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>Check-in</th>
            </tr>
          </thead>
          <tbody>
            {activeEventRecord.guests.map((guest) => (
              <tr key={guest.id} className="border-b border-white/[0.06] align-top">
                <td className="px-3 py-3">
                  <p className="text-[13px] font-black leading-5 text-white">{guest.name}</p>
                  {guest.note ? <p className="mt-1 text-[11px] leading-5 text-zinc-400">{guest.note}</p> : null}
                </td>
                <td className="px-3 py-3 text-[12px] leading-5 text-zinc-300">{guest.group}</td>
                <td className="px-3 py-3 text-[12px] leading-5 text-zinc-300">{guest.tableLabel ?? 'Sin asignar'}</td>
                <td className="px-3 py-3 text-[12px] leading-5 text-zinc-300">{guest.companions}</td>
                <td className="px-3 py-3">
                  <div className="flex items-start gap-2">
                    <code className="rounded-[10px] bg-white/[0.04] px-2 py-1 text-[11px] font-black text-zinc-200">{guest.guestCode}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyValue(guest.guestCode, `${guest.id}-code`)}
                      className={`rounded-[10px] border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${props.panelSurfaceStrongClasses}`}
                    >
                      {copiedLabel === `${guest.id}-code` ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-start gap-2">
                    <p className="max-w-[24rem] break-all text-[11px] leading-5 text-zinc-300">{guest.guestUrl}</p>
                    <button
                      type="button"
                      onClick={() => handleCopyValue(guest.guestUrl, `${guest.id}-url`)}
                      className={`rounded-[10px] border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${props.panelSurfaceStrongClasses}`}
                    >
                      {copiedLabel === `${guest.id}-url` ? 'Copiada' : 'Copiar'}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 text-[11px] leading-5 text-zinc-300">
                  <p>{guest.phone ?? 'Sin telefono'}</p>
                  <p className="mt-1 break-all">{guest.email ?? 'Sin email'}</p>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${getGuestStatusClasses(guest.status)}`}>
                    {guest.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-[11px] leading-5 text-zinc-300">
                  <p>{formatCheckInLabel(guest.checkedInAt)}</p>
                  <p className="mt-1">Escaneos: {guest.checkInCount ?? 0}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.article>
  );

  const renderManageSection = () => (
    <div className="grid gap-2.5">
      <motion.article variants={fadeInUp} className={`rounded-[24px] border p-4 sm:p-5 ${props.panelShellClasses}`}>
        <div className="flex items-center gap-2">
          {renderPanelAccentBadge('shield', '#64748b')}
          <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${props.panelTertiaryTextClasses}`}>Control</p>
        </div>
        <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]">
          <div>
            <h3 className="text-[1.65rem] leading-none tracking-[-0.04em] text-white sm:text-[2rem]" style={displayFont}>
              Control operativo de invitados.
            </h3>
            <p className={`mt-3 max-w-2xl text-[13px] leading-6 ${props.panelMutedTextClasses}`}>
              Desde aqui descargas la lista operativa, exportas links con QR y validas accesos desde celular. La administracion y previsualizacion de la
              invitacion quedaron concentradas en el apartado `Invitacion`.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={props.onExportGuestAdminList}
                className={`rounded-[16px] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${props.panelPrimaryButtonClasses}`}
              >
                Descargar lista operativa
              </button>
              <button
                type="button"
                onClick={props.onExportGuestLinks}
                className={`rounded-[16px] border px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${props.panelSurfaceStrongClasses}`}
              >
                Descargar links y QR
              </button>
              <button
                type="button"
                onClick={isScannerOpen ? handleCloseScanner : handleOpenScanner}
                className={`rounded-[16px] border px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${props.panelSurfaceStrongClasses}`}
              >
                {isScannerOpen ? 'Detener escaneo' : 'Escanear invitaciones'}
              </button>
            </div>
          </div>

          <div className="grid gap-2 min-[520px]:grid-cols-2 xl:grid-cols-2">
            {[
              { label: 'Pases asignados', value: `${eventMetrics.totalSeats}`, color: '#f59e0b' },
              { label: 'QR validados', value: `${eventMetrics.checkedInGuests}`, color: '#8b5cf6' },
              { label: 'Personas ingresadas', value: `${eventMetrics.checkedInSeats}`, color: '#ec4899' },
              { label: 'Links listos', value: `${activeEventRecord.guests.filter((guest) => guest.guestUrl).length}`, color: '#14b8a6' }
            ].map((item) => (
              <div key={item.label} className={`rounded-[18px] border p-3 ${props.panelSurfaceStrongClasses}`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.16em] ${props.panelTertiaryTextClasses}`}>{item.label}</p>
                <p className="mt-2 text-[1.35rem] font-black leading-none text-white" style={{ ...displayFont, color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-4 rounded-[20px] border p-3.5 ${props.panelSurfaceStrongClasses}`}>
          {!isMobileDevice ? (
            <p className="text-[12px] leading-5 text-zinc-300">
              En web no se puede usar esta herramienta. Abre este panel desde un dispositivo movil para activar la camara y escanear la invitacion.
            </p>
          ) : !isScannerSupported ? (
            <p className="text-[12px] leading-5 text-zinc-300">
              Este navegador movil no soporta el escaner QR de esta demo. Pruebalo en Chrome o Edge movil con permisos de camara.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={isScannerOpen ? handleCloseScanner : handleOpenScanner}
                  className={`rounded-[14px] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${props.panelPrimaryButtonClasses}`}
                >
                  {isScannerOpen ? 'Detener escaneo' : 'Escanear invitaciones'}
                </button>
                {isScannerOpen ? (
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${props.panelSurfaceStrongClasses}`}>
                    {isScannerBusy ? 'Iniciando camara...' : 'Camara activa'}
                  </span>
                ) : null}
                {!isScannerOpen && (pendingScanResult || lastScanResult) ? (
                  <button
                    type="button"
                    onClick={handleScanAnotherQr}
                    disabled={isScannerConfirmBusy}
                    className={`rounded-[14px] border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelSurfaceStrongClasses}`}
                  >
                    Escanear otro QR
                  </button>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-[18px] border border-white/10 bg-black">
                {isScannerOpen ? (
                  <video ref={videoRef} className="aspect-[4/5] w-full object-cover min-[520px]:aspect-[4/3]" autoPlay muted playsInline />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center px-6 text-center text-[12px] leading-6 text-white/72 min-[520px]:aspect-[4/3]">
                    Activa la camara y apunta al QR de la invitacion para identificar al invitado.
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-3 text-[12px] leading-5 text-zinc-300">{scannerHint}</p>

          {scannerError ? (
            <div className="mt-3 rounded-[16px] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[12px] font-semibold leading-5 text-rose-300">
              {scannerError}
            </div>
          ) : null}

          {pendingScanResult ? (
            <div className="mt-3 rounded-[18px] border border-sky-400/30 bg-sky-400/10 p-4 text-sky-100">
              <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                {pendingScanResult.isRepeatScan ? 'Invitacion detectada nuevamente' : 'Invitacion detectada'}
              </p>
              <p className="mt-2 text-[15px] font-black leading-5">{pendingScanResult.guest.name}</p>
              <div className="mt-3 grid gap-2 min-[520px]:grid-cols-2">
                <div className="rounded-[14px] border border-sky-400/25 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-sky-300">Mesa</p>
                  <p className="mt-1 text-[12px] leading-5">{pendingScanResult.guest.tableLabel ?? 'Mesa por asignar'}</p>
                </div>
                <div className="rounded-[14px] border border-sky-400/25 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-sky-300">Pases</p>
                  <p className="mt-1 text-[12px] leading-5">{pendingScanResult.guest.companions} invitado(s)</p>
                </div>
                <div className="rounded-[14px] border border-sky-400/25 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-sky-300">Grupo</p>
                  <p className="mt-1 text-[12px] leading-5">{pendingScanResult.guest.group}</p>
                </div>
                <div className="rounded-[14px] border border-sky-400/25 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-sky-300">Estatus</p>
                  <p className="mt-1 text-[12px] leading-5">{pendingScanResult.guest.checkedInAt ? 'Ya tenia acceso registrado' : 'Pendiente por confirmar'}</p>
                </div>
              </div>
              <p className="mt-3 break-all font-mono text-[11px] leading-5">{pendingScanResult.guest.guestCode}</p>
              <p className="mt-2 text-[12px] leading-5">
                Ultimo registro: {formatCheckInLabel(pendingScanResult.guest.checkedInAt)} · Escaneos: {pendingScanResult.guest.checkInCount ?? 0}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleConfirmScannedGuest()}
                  disabled={isScannerConfirmBusy}
                  className={`rounded-[14px] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelPrimaryButtonClasses}`}
                >
                  {isScannerConfirmBusy ? 'Confirmando...' : 'Confirmar asistencia'}
                </button>
                <button
                  type="button"
                  onClick={handleScanAnotherQr}
                  disabled={isScannerConfirmBusy}
                  className={`rounded-[14px] border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-colors disabled:opacity-60 ${props.panelSurfaceStrongClasses}`}
                >
                  Escanear otro QR
                </button>
              </div>
            </div>
          ) : null}

          {lastScanResult ? (
            <div className="mt-3 rounded-[18px] border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200">
              <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                {lastScanResult.isRepeatScan ? 'Asistencia confirmada nuevamente' : 'Asistencia confirmada'}
              </p>
              <p className="mt-2 text-[15px] font-black leading-5">{lastScanResult.guest.name}</p>
              <p className="mt-1 text-[12px] leading-5">
                {lastScanResult.guest.tableLabel ?? 'Mesa por asignar'} · {lastScanResult.guest.companions} invitado(s)
              </p>
              <p className="mt-1 break-all font-mono text-[11px] leading-5">{lastScanResult.guest.guestCode}</p>
              <p className="mt-2 text-[12px] leading-5">
                Ultimo registro: {formatCheckInLabel(lastScanResult.guest.checkedInAt)} · Escaneos: {lastScanResult.guest.checkInCount ?? 0}
              </p>
            </div>
          ) : null}
        </div>
      </motion.article>

      {renderGuestCentralListSection()}
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'invitation':
        return renderProjectSection();
      case 'control':
        return renderManageSection();
      case 'guests':
        return renderGuestsWorkspaceSection();
      case 'overview':
      default:
        return renderOverviewSection();
    }
  };

  return (
    <section className="flex min-h-0 flex-1 w-full overflow-hidden px-2 pt-2 pb-3 sm:px-3 md:px-4 md:pb-3">
      <motion.div
        ref={props.panelContentRef}
        initial="hidden"
        animate="visible"
        variants={staggerGroup}
        className={`grid h-full min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2.5 xl:grid-rows-1 ${
          isSidebarCollapsed ? 'xl:grid-cols-[88px_minmax(0,1fr)]' : 'xl:grid-cols-[220px_minmax(0,1fr)]'
        }`}
      >
        <motion.aside
          variants={fadeInUp}
          className={`hidden min-h-0 flex-col overflow-hidden rounded-[24px] border p-2.5 xl:flex xl:overflow-y-auto custom-scrollbar ${props.panelShellClasses}`}
        >
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2 px-1`}>
            {!isSidebarCollapsed ? (
              <p className={`px-2 text-[10px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Apartados</p>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] border transition-colors ${props.panelSurfaceStrongClasses}`}
              aria-label={isSidebarCollapsed ? 'Expandir apartados' : 'Colapsar apartados'}
              title={isSidebarCollapsed ? 'Expandir apartados' : 'Colapsar apartados'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7H20" />
                <path d="M4 12H20" />
                <path d="M4 17H20" />
              </svg>
            </button>
          </div>

          <div className={`mt-2 flex min-h-0 flex-1 flex-col ${isSidebarCollapsed ? 'items-center' : ''}`}>
            <div className={`grid gap-2 ${isSidebarCollapsed ? 'w-auto' : 'w-full'}`}>
              {EVENT_PANEL_SECTIONS.map((section) => {
                const isActive = section.id === activeSection;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionChange(section.id)}
                    className={`rounded-[18px] border transition-colors ${
                      isActive ? 'border-white/20 bg-white/[0.08] text-white' : props.panelSurfaceStrongClasses
                    } ${isSidebarCollapsed ? 'flex h-12 w-12 items-center justify-center p-0' : 'w-full p-3 text-left'}`}
                    aria-label={section.label}
                    title={section.label}
                  >
                    <div className={`flex ${isSidebarCollapsed ? 'items-center justify-center' : 'items-center gap-3'}`}>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border ${
                          ''
                        }`}
                        style={{ borderColor: `${section.color}${isActive ? '80' : '30'}`, color: section.color, backgroundColor: `${section.color}${isActive ? '33' : '12'}` }}
                      >
                        {renderLandingIcon(section.icon, 'h-4 w-4')}
                      </div>
                      {!isSidebarCollapsed ? (
                        <div className="min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${isActive ? 'text-white' : 'text-white'}`}>
                            {section.label}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mt-3 pt-1 xl:mt-auto xl:pt-3 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <button
              type="button"
              onClick={props.onClearSession}
              className={`rounded-[16px] transition-colors ${props.panelPrimaryButtonClasses} ${
                isSidebarCollapsed
                  ? 'flex h-12 w-12 items-center justify-center p-0'
                  : 'w-full px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em]'
              }`}
              aria-label="Cambiar codigo"
              title="Cambiar codigo"
            >
              {isSidebarCollapsed ? renderLandingIcon('close', 'h-4 w-4') : 'Cambiar codigo'}
            </button>
          </div>
        </motion.aside>

        <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto pr-0.5 custom-scrollbar xl:pr-1">
          <motion.div
            key={activeSection}
            initial="hidden"
            animate="visible"
            variants={sectionSwapVariants}
            className="grid gap-2.5"
          >
            <motion.article
              variants={fadeInUp}
              className={`sticky top-0 z-10 rounded-[24px] border p-3.5 xl:hidden ${props.panelShellClasses}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {renderPanelAccentBadge(activeSectionMeta.icon, activeSectionMeta.color)}
                    <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${props.panelTertiaryTextClasses}`}>Navbar del panel</p>
                  </div>
                  <p className="mt-2 text-[1.05rem] font-black leading-5 tracking-[-0.03em] text-white" style={displayFont}>
                    {activeSectionMeta.label}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={props.onClearSession}
                    className={`inline-flex items-center rounded-[14px] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${props.panelSurfaceStrongClasses}`}
                  >
                    Cambiar código
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPanelNavOpen((previous) => !previous)}
                    className={`inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${props.panelPrimaryButtonClasses}`}
                    aria-expanded={isPanelNavOpen}
                    aria-label={isPanelNavOpen ? 'Cerrar apartados' : 'Abrir apartados'}
                  >
                    {isPanelNavOpen ? 'Cerrar' : 'Apartados'}
                    <svg
                      className={`h-4 w-4 transition-transform ${isPanelNavOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9L12 15L18 9" />
                    </svg>
                  </button>
                </div>
              </div>

              {isPanelNavOpen ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {EVENT_PANEL_SECTIONS.map((section) => {
                    const isActive = section.id === activeSection;

                    return (
                      <button
                        key={`mobile-${section.id}`}
                        type="button"
                        onClick={() => handleSectionChange(section.id)}
                        className={`rounded-[18px] border p-3 text-left transition-colors ${
                          isActive ? 'border-white/20 bg-white/[0.08] text-white' : props.panelSurfaceStrongClasses
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border ${
                              ''
                            }`}
                            style={{ borderColor: `${section.color}${isActive ? '80' : '30'}`, color: section.color, backgroundColor: `${section.color}${isActive ? '33' : '12'}` }}
                          >
                            {renderLandingIcon(section.icon, 'h-4 w-4')}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${isActive ? 'text-white' : 'text-white'}`}>
                              {section.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className={`mt-2 text-[12px] leading-5 ${props.panelMutedTextClasses}`}>
                  Toca <span className="font-black text-white">Apartados</span> para navegar entre informacion e invitados.
                </p>
              )}
            </motion.article>

            {renderActiveSection()}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export const EventPortalPage: React.FC<EventPortalPageProps> = (props) => {
  if (props.variant === 'access') return <EventAccessView {...props} />;
  if (props.variant === 'gate') return <EventPanelGateView {...props} />;
  return <EventPanelOverviewView {...props} />;
};
