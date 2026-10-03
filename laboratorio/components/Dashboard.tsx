import React from 'react';
import { UserSession } from '../types';
import type { EventAdminWorkspaceItem, EventPortalEventDraft, EventPortalRecord } from '../../components/event-portal/types';
import { PackageType as EventPackageType } from '../../types';

interface DashboardProps {
  currentUser: UserSession;
  totalDesigns: number;
  completedDesigns: number;
  onOpenTemplates: () => void;
  onOpenCreator: () => void;
  mode?: 'default' | 'event-admin';
  eventItems?: EventAdminWorkspaceItem[];
  isEventWorkspaceBusy?: boolean;
  eventWorkspaceError?: string | null;
  isEventCreating?: boolean;
  onRefreshEvents?: () => void | Promise<void>;
  onCreateEvent?: (draft: EventPortalEventDraft) => Promise<EventPortalRecord>;
  onOpenEventPanel?: (record: EventPortalRecord) => void;
  onEditEventInvitation?: (item: EventAdminWorkspaceItem) => void;
  onDownloadEventArchive?: (item: EventAdminWorkspaceItem) => void | Promise<void>;
  onUploadEventArchive?: (item: EventAdminWorkspaceItem) => void;
}

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
  packageId: EventPackageType.ORO,
});

const formatShortDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value || 'Pendiente';
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const formatStatusLabel = (value: string) => {
  if (value === 'borrador') return 'Borrador';
  if (value === 'inactivo') return 'Inactivo';
  if (value === 'cancelado') return 'Cancelado';
  return 'Activo';
};

const renderDefaultDashboard = (props: DashboardProps) => (
  <div className="space-y-5 animate-in fade-in duration-500">
    <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">Workspace</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">Hola, {props.currentUser.name}.</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
        Este panel sigue disponible para plantillas, borradores y armado libre de invitaciones.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Borradores</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{props.totalDesigns}</p>
        </div>
        <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Finalizados</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{props.completedDesigns}</p>
        </div>
        <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Acciones</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={props.onOpenTemplates}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Plantillas
            </button>
            <button
              type="button"
              onClick={props.onOpenCreator}
              className="rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
            >
              Nuevo proyecto
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const [draft, setDraft] = React.useState<EventPortalEventDraft>(createEmptyEventDraft);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [pendingCreatedCode, setPendingCreatedCode] = React.useState<string | null>(null);
  const eventItems = props.eventItems ?? [];

  React.useEffect(() => {
    if (!pendingCreatedCode || !props.onEditEventInvitation) {
      return;
    }

    const createdItem = eventItems.find((item) => item.record.code === pendingCreatedCode);
    if (!createdItem) {
      return;
    }

    props.onEditEventInvitation(createdItem);
    setPendingCreatedCode(null);
  }, [eventItems, pendingCreatedCode, props.onEditEventInvitation]);

  if (props.mode !== 'event-admin') {
    return renderDefaultDashboard(props);
  }

  const updateDraft = <K extends keyof EventPortalEventDraft>(key: K, value: EventPortalEventDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!props.onCreateEvent) {
      setSubmitError('No hay un flujo de alta conectado.');
      return;
    }

    if (!draft.eventTitle.trim()) {
      setSubmitError('Agrega al menos el nombre del evento.');
      return;
    }

    setSubmitError(null);
    setFeedback(null);

    try {
      const createdRecord = await props.onCreateEvent(draft);
      setDraft(createEmptyEventDraft());
      setPendingCreatedCode(createdRecord.code);
      await props.onRefreshEvents?.();
      setFeedback(`Evento creado: ${createdRecord.code}. La invitacion base ya quedo lista para editar, descargar o sustituir con un ZIP.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos crear el evento.');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">Alta interna</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">Crea el evento y genera su base.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Desde aqui levantas el evento, se guarda en base de datos y se prepara su carpeta para editar la invitacion sin pasar por el panel del cliente.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Nombre del evento</span>
              <input
                value={draft.eventTitle}
                onChange={(event) => updateDraft('eventTitle', event.target.value)}
                placeholder="Cumpleanos Valeria"
                className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Fecha y hora</span>
              <input
                type="datetime-local"
                value={draft.eventDate}
                onChange={(event) => updateDraft('eventDate', event.target.value)}
                className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Anfitrion</span>
              <input
                value={draft.hostName}
                onChange={(event) => updateDraft('hostName', event.target.value)}
                placeholder="Claudia Alvarado"
                className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Lugar</span>
              <input
                value={draft.venue}
                onChange={(event) => updateDraft('venue', event.target.value)}
                placeholder="Salon Fiesta Americana"
                className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              />
            </label>
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Google Maps</span>
              <input
                type="url"
                value={draft.venueMapsUrl}
                onChange={(event) => updateDraft('venueMapsUrl', event.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              />
            </label>
            {submitError ? <p className="md:col-span-2 text-sm text-rose-500">{submitError}</p> : null}
            {feedback ? <p className="md:col-span-2 text-sm text-emerald-600">{feedback}</p> : null}
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={props.isEventCreating}
                className="rounded-full bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {props.isEventCreating ? 'Creando...' : 'Crear evento'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(createEmptyEventDraft());
                  setSubmitError(null);
                  setFeedback(null);
                }}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Limpiar
              </button>
            </div>
          </form>
        </article>

        <aside className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Laboratorio</p>
          <h3 className="mt-3 text-[2rem] font-black tracking-[-0.05em] text-slate-950">Control interno.</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Aqui cargas eventos reales, editas la invitacion con base en su codigo y abres la vista publicada cuando haga falta.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Eventos listados</p>
              <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{eventItems.length}</p>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Usuario</p>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950">{props.currentUser.name}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void props.onRefreshEvents?.()}
              disabled={props.isEventWorkspaceBusy}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {props.isEventWorkspaceBusy ? 'Actualizando...' : 'Actualizar eventos'}
            </button>
            <button
              type="button"
              onClick={props.onOpenCreator}
              className="rounded-full bg-orange-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-orange-500"
            >
              Lienzo libre
            </button>
          </div>
        </aside>
      </section>

      {props.eventWorkspaceError ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {props.eventWorkspaceError}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">Eventos activos</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">Carga real del panel administrativo.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Cada tarjeta conserva el codigo, la carpeta del proyecto y los accesos para editar la invitacion o abrir el panel del cliente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void props.onRefreshEvents?.()}
            disabled={props.isEventWorkspaceBusy}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refrescar lista
          </button>
        </div>

        {props.isEventWorkspaceBusy && eventItems.length === 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[0, 1].map((index) => (
              <div key={index} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-2/3 rounded-2xl bg-slate-200" />
                <div className="mt-6 grid gap-3">
                  <div className="h-14 rounded-[18px] bg-white" />
                  <div className="h-14 rounded-[18px] bg-white" />
                  <div className="h-14 rounded-[18px] bg-white" />
                </div>
              </div>
            ))}
          </div>
        ) : eventItems.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">No hay eventos cargados todavia.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Usa el alta interna de arriba y luego vuelve a cargar la lista para empezar a editar la invitacion.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {eventItems.map((item) => (
              <article key={item.record.code} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Codigo {item.record.code}</p>
                    <h3 className="mt-3 text-[1.6rem] font-black tracking-[-0.05em] text-slate-950">{item.record.eventTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.record.hostName || 'Anfitrion por definir'}</p>
                  </div>
                  <span className="inline-flex rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
                    {formatStatusLabel(item.record.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Fecha</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatShortDate(item.record.eventDateValue || item.record.eventDate)}</p>
                  </div>
                  <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Lugar</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.record.venue || 'Lugar pendiente'}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Carpeta</p>
                    <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-slate-700">{item.projectPath}</code>
                  </div>
                  <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Entrada</p>
                    <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-slate-700">{item.appEntry}</code>
                  </div>
                  <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Vista previa</p>
                    <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-slate-700">{item.previewPath}</code>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => props.onEditEventInvitation?.(item)}
                    className="rounded-full bg-slate-950 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
                  >
                    Editar invitacion
                  </button>
                  <button
                    type="button"
                    onClick={() => void props.onDownloadEventArchive?.(item)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    Descargar ZIP
                  </button>
                  <button
                    type="button"
                    onClick={() => props.onUploadEventArchive?.(item)}
                    className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
                  >
                    Subir ZIP
                  </button>
                  <button
                    type="button"
                    onClick={() => props.onOpenEventPanel?.(item.record)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    Abrir panel
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
