import React from 'react';

interface ActionPanelProps {
  invitationId: string | null;
  onEdit: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ invitationId, onEdit }) => {
  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">Proyecto finalizado</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">Lista para compartir.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Tu invitación ya tiene una salida clara para revisión, impresión o envío desde WhatsApp.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">ID de invitación</label>
            <code className="text-sm font-black text-orange-700">{invitationId}</code>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Vínculo compartible</label>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-slate-600">
              https://laboratorio-de-invitaciones.com/v/{invitationId}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 8.75V5.5A1.75 1.75 0 018.5 3.75h7A1.75 1.75 0 0117.25 5.5v3.25m-10.5 0h10.5A2.25 2.25 0 0119.5 11v4.25a2.25 2.25 0 01-2.25 2.25h-1.5v2.25H8.25V17.5h-1.5A2.25 2.25 0 014.5 15.25V11a2.25 2.25 0 012.25-2.25z" />
            </svg>
            Imprimir
          </button>
          <button className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-emerald-500">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-orange-200 bg-orange-50 p-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-orange-800">Ajuste rápido</h4>
        <p className="mt-3 text-sm leading-7 text-orange-700">
          Si quieres regenerar mensajes o corregir detalles, vuelve al editor y ajusta los bloques antes de compartir.
        </p>
        <button
          onClick={onEdit}
          className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-orange-700 transition hover:text-orange-900"
        >
          Volver al editor
        </button>
      </div>
    </div>
  );
};
