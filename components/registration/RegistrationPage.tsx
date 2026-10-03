import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m as motion } from 'motion/react';
import { InviteScreen, PhoneShell } from '../landing/partyDesign';
import { categoryLabel, findTemplate, INVITATION_TEMPLATES, type TemplateCategory } from '../landing/templatesData';
import { optimizeImageFileToDataUrl } from '../../lib/imageOptimization';
import { createOrder, type CreatedOrder, type OrderDraft } from '../../services/ordersApi';

type RegistrationPageProps = {
  initialTemplateId: string | null;
  price: string;
  displayFont: React.CSSProperties;
  onExit: () => void;
};

type PhotoItem = { id: string; url: string; blob: Blob };
type FieldErrors = Record<string, string>;

const STEPS = ['Plantilla', 'Tus datos', 'Tu evento', 'Fotos', 'Pago'] as const;
const MAX_PHOTOS = 10;
const DRAFT_STORAGE_KEY = 'invitarte_registro_borrador_v1';

const EVENT_TYPES = ['Boda', 'XV años', 'Graduación', 'Cumpleaños', 'Bautizo', 'Baby shower', 'Corporativo', 'Otro'];
const TYPE_BY_CATEGORY: Record<TemplateCategory, string> = {
  bodas: 'Boda',
  xv: 'XV años',
  graduacion: 'Graduación',
  cumpleanos: 'Cumpleaños',
  bautizo: 'Bautizo',
  corporativo: 'Corporativo'
};
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const emptyDraft = (templateId: string): OrderDraft => {
  const template = findTemplate(templateId) ?? INVITATION_TEMPLATES[0];
  return {
    templateId: template.id,
    customer: { name: '', email: '', phone: '' },
    event: { type: TYPE_BY_CATEGORY[template.category], title: '', date: '', time: '', venue: '', address: '', guests: '', notes: '' }
  };
};

/* El borrador (solo textos, nunca fotos) se guarda en este navegador para no perder avances al recargar */
const loadDraft = (initialTemplateId: string | null): OrderDraft => {
  const fallback = emptyDraft(initialTemplateId ?? INVITATION_TEMPLATES[0].id);
  try {
    const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as OrderDraft;
    const merged: OrderDraft = {
      templateId: parsed.templateId || fallback.templateId,
      customer: { ...fallback.customer, ...parsed.customer },
      event: { ...fallback.event, ...parsed.event }
    };
    // Si llega con una plantilla elegida en el catalogo, esa manda.
    if (initialTemplateId && findTemplate(initialTemplateId)) merged.templateId = initialTemplateId;
    return merged;
  } catch {
    return fallback;
  }
};

const formatPreviewDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return `${match[3]} · ${MONTHS[Number(match[2]) - 1] ?? ''} · ${match[1]}`;
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const dataUrlToBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();

/* ---------- Campos ---------- */

const inputClasses =
  'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.06]';

const Field: React.FC<{ label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  error,
  hint,
  children,
  className = ''
}) => (
  <label className={`block ${className}`}>
    <span className="mb-2 block text-[13px] font-semibold text-zinc-300">{label}</span>
    {children}
    {error ? <span className="mt-1.5 block text-[13px] text-rose-400">{error}</span> : hint ? <span className="mt-1.5 block text-[12px] text-zinc-500">{hint}</span> : null}
  </label>
);

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ initialTemplateId, price, displayFont, onExit }) => {
  const [draft, setDraft] = useState<OrderDraft>(() => loadDraft(initialTemplateId));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedOrder | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const photosRef = useRef<PhotoItem[]>([]);

  const paymentReturn = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('pago');
    return status ? { status, folio: params.get('external_reference') ?? '' } : null;
  }, []);

  const template = findTemplate(draft.templateId) ?? INVITATION_TEMPLATES[0];
  const previewDesign = {
    ...template.design,
    eyebrow: draft.event.type || template.design.eyebrow,
    name: draft.event.title.trim() || template.design.name,
    date: formatPreviewDate(draft.event.date) ?? template.design.date,
    place: draft.event.venue.trim() || template.design.place
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Sin almacenamiento disponible (modo privado): el formulario sigue funcionando.
    }
  }, [draft]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const setCustomer = (key: keyof OrderDraft['customer'], value: string) =>
    setDraft((prev) => ({ ...prev, customer: { ...prev.customer, [key]: value } }));
  const setEvent = (key: keyof OrderDraft['event'], value: string) => setDraft((prev) => ({ ...prev, event: { ...prev.event, [key]: value } }));

  const validate = (target: number): FieldErrors => {
    const next: FieldErrors = {};
    if (target === 1) {
      if (draft.customer.name.trim().length < 3) next.name = 'Escribe tu nombre completo.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.customer.email.trim())) next.email = 'Revisa tu correo.';
      if (onlyDigits(draft.customer.phone).length < 10) next.phone = 'Tu WhatsApp debe tener 10 dígitos.';
    }
    if (target === 2) {
      if (draft.event.title.trim().length < 2) next.title = 'Escribe el nombre del evento o de los festejados.';
      if (!draft.event.date) next.date = 'Elige la fecha del evento.';
      if (draft.event.venue.trim().length < 2) next.venue = 'Escribe el lugar del evento.';
    }
    if (target === 4 && !accepted) next.accepted = 'Necesitamos tu autorización para continuar.';
    return next;
  };

  const goNext = () => {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((current) => Math.min(STEPS.length - 1, current + 1));
  };

  const goTo = (target: number) => {
    // Solo se puede saltar hacia atras o a pasos ya validados.
    for (let index = 1; index < target; index += 1) {
      const found = validate(index);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        setStep(index);
        return;
      }
    }
    setErrors({});
    setStep(target);
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const available = MAX_PHOTOS - photos.length;
    const selected = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, Math.max(0, available));
    if (selected.length === 0) return;

    setPhotoBusy(true);
    try {
      // Se reducen en el navegador (max. 1600 px) para que suban rapido incluso con datos moviles.
      const optimized = await Promise.all(
        selected.map(async (file) => {
          const dataUrl = await optimizeImageFileToDataUrl(file, { maxDimension: 1600, quality: 0.82, minBytesToProcess: 0 });
          const blob = await dataUrlToBlob(dataUrl);
          return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, url: URL.createObjectURL(blob), blob };
        })
      );
      setPhotos((prev) => [...prev, ...optimized].slice(0, MAX_PHOTOS));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = (id: string) =>
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((photo) => photo.id !== id);
    });

  const submit = async () => {
    const found = validate(4);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder(
        { ...draft, customer: { ...draft.customer, phone: onlyDigits(draft.customer.phone) } },
        photos.map((photo) => photo.blob)
      );
      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignorado: solo era el borrador local.
      }
      if (order.checkoutUrl) {
        window.location.assign(order.checkoutUrl);
        return;
      }
      setResult(order);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos registrar tu evento. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Pantallas finales ---------- */

  if (paymentReturn || result) {
    const status = paymentReturn?.status ?? 'registrado';
    const folio = paymentReturn?.folio || result?.folio || '';
    const copy: Record<string, { title: string; text: string; color: string }> = {
      aprobado: { title: '¡Pago recibido!', text: 'Tu evento quedó activado. En breve te escribimos por WhatsApp para entregarte tu acceso al panel.', color: '#34d399' },
      pendiente: { title: 'Pago en proceso', text: 'Tu pago se está procesando. Te avisaremos por WhatsApp en cuanto se confirme.', color: '#fbbf24' },
      rechazado: { title: 'El pago no se completó', text: 'No se cobró nada. Puedes intentarlo de nuevo o escribirnos para ayudarte.', color: '#fb7185' },
      registrado: {
        title: '¡Tu evento quedó registrado!',
        text: 'Guardamos tus datos y tus fotos. Te enviaremos por WhatsApp el enlace de pago para activar tu evento.',
        color: '#a78bfa'
      }
    };
    const view = copy[status] ?? copy.registrado;

    return (
      <section className="flex min-h-[100dvh] items-center justify-center px-5 pb-16 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glow-card w-full max-w-xl rounded-[32px] p-8 text-center sm:p-10"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${view.color}26`, color: view.color }}>
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={status === 'rechazado' ? 'M6 6l12 12M18 6L6 18' : 'M5 12.5l4.5 4.5L19 7.5'} />
            </svg>
          </span>
          <h1 className="mt-6 text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-white" style={displayFont}>
            {view.title}
          </h1>
          <p className="mt-3 text-[1.02rem] leading-7 text-zinc-400">{view.text}</p>
          {folio ? (
            <p className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
              Folio: <span className="ml-1.5 font-bold text-white">{folio}</span>
            </p>
          ) : null}
          <div className="mt-8">
            <button type="button" onClick={onExit} className="rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-white/85">
              Volver al inicio
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  /* ---------- Asistente ---------- */

  return (
    <section className="w-full px-4 pb-20 pt-28 sm:px-6 lg:px-16 2xl:px-24">
      <div ref={topRef} className="scroll-mt-28" />
      <div className="mx-auto grid w-full max-w-[110rem] gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-zinc-500">Crea tu evento</p>
          <h1 className="mt-3 text-[2.4rem] leading-[1] tracking-[-0.045em] text-white sm:text-[3.2rem]" style={displayFont}>
            Empecemos con <span className="brand-gradient-text">tu evento.</span>
          </h1>

          {/* Pasos */}
          <ol className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((label, index) => {
              const state = index === step ? 'active' : index < step ? 'done' : 'todo';
              return (
                <li key={label} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
                      state === 'active'
                        ? 'border-white bg-white text-zinc-950'
                        : state === 'done'
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                    }`}
                    aria-current={state === 'active' ? 'step' : undefined}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${state === 'active' ? 'bg-zinc-950 text-white' : 'bg-white/10'}`}>
                      {state === 'done' ? '✓' : index + 1}
                    </span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#0c0c11] p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                {step === 0 ? (
                  <div>
                    <h2 className="text-[1.4rem] font-semibold text-white">Elige tu plantilla</h2>
                    <p className="mt-1 text-sm text-zinc-400">Podrás cambiar textos, colores y fotos después.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                      {INVITATION_TEMPLATES.map((item) => {
                        const isActive = item.id === draft.templateId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({ ...prev, templateId: item.id, event: { ...prev.event, type: TYPE_BY_CATEGORY[item.category] } }))
                            }
                            className={`rounded-[20px] border p-3 text-left transition ${isActive ? 'border-white bg-white/[0.07]' : 'border-white/[0.08] hover:border-white/25'}`}
                            aria-pressed={isActive}
                          >
                            <PhoneShell className="mx-auto w-[70%]">
                              <InviteScreen invite={item.design} />
                            </PhoneShell>
                            <p className="mt-3 text-sm font-semibold text-white">{item.name}</p>
                            <p className="text-[12px] text-zinc-500">{categoryLabel(item.category)}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div>
                    <h2 className="text-[1.4rem] font-semibold text-white">Tus datos</h2>
                    <p className="mt-1 text-sm text-zinc-400">Te contactaremos por aquí para entregarte tu acceso.</p>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <Field label="Nombre completo" error={errors.name} className="sm:col-span-2">
                        <input className={inputClasses} value={draft.customer.name} onChange={(e) => setCustomer('name', e.target.value)} autoComplete="name" placeholder="Ej. Mariana López" />
                      </Field>
                      <Field label="Correo electrónico" error={errors.email}>
                        <input className={inputClasses} type="email" inputMode="email" value={draft.customer.email} onChange={(e) => setCustomer('email', e.target.value)} autoComplete="email" placeholder="tu@correo.com" />
                      </Field>
                      <Field label="WhatsApp" error={errors.phone} hint="10 dígitos">
                        <input className={inputClasses} type="tel" inputMode="tel" value={draft.customer.phone} onChange={(e) => setCustomer('phone', e.target.value)} autoComplete="tel" placeholder="33 1234 5678" />
                      </Field>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div>
                    <h2 className="text-[1.4rem] font-semibold text-white">Tu evento</h2>
                    <p className="mt-1 text-sm text-zinc-400">Mira cómo se actualiza tu invitación mientras escribes.</p>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <Field label="Tipo de evento" className="sm:col-span-2">
                        <div className="flex flex-wrap gap-2">
                          {EVENT_TYPES.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setEvent('type', type)}
                              className={`rounded-full px-4 py-2 text-[14px] transition ${draft.event.type === type ? 'bg-white font-semibold text-zinc-950' : 'border border-white/10 text-zinc-300 hover:border-white/25'}`}
                              aria-pressed={draft.event.type === type}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Nombre del evento o de los festejados" error={errors.title} className="sm:col-span-2">
                        <input className={inputClasses} value={draft.event.title} onChange={(e) => setEvent('title', e.target.value)} placeholder="Ej. Ana & Carlos" />
                      </Field>
                      <Field label="Fecha" error={errors.date}>
                        <input className={`${inputClasses} [color-scheme:dark]`} type="date" value={draft.event.date} onChange={(e) => setEvent('date', e.target.value)} />
                      </Field>
                      <Field label="Hora">
                        <input className={`${inputClasses} [color-scheme:dark]`} type="time" value={draft.event.time} onChange={(e) => setEvent('time', e.target.value)} />
                      </Field>
                      <Field label="Lugar" error={errors.venue}>
                        <input className={inputClasses} value={draft.event.venue} onChange={(e) => setEvent('venue', e.target.value)} placeholder="Ej. Hacienda Los Olivos" />
                      </Field>
                      <Field label="Invitados aproximados" hint="Nos ayuda a preparar tu lista">
                        <input className={inputClasses} type="number" inputMode="numeric" min={1} value={draft.event.guests} onChange={(e) => setEvent('guests', e.target.value)} placeholder="Ej. 150" />
                      </Field>
                      <Field label="Dirección" className="sm:col-span-2">
                        <input className={inputClasses} value={draft.event.address} onChange={(e) => setEvent('address', e.target.value)} autoComplete="street-address" placeholder="Calle, número, colonia y ciudad" />
                      </Field>
                      <Field label="Notas (opcional)" className="sm:col-span-2">
                        <textarea className={`${inputClasses} min-h-[110px] resize-y`} value={draft.event.notes} onChange={(e) => setEvent('notes', e.target.value)} placeholder="Código de vestimenta, mesa de regalos, lo que quieras que sepamos…" />
                      </Field>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div>
                    <h2 className="text-[1.4rem] font-semibold text-white">Tus fotografías</h2>
                    <p className="mt-1 text-sm text-zinc-400">Sube hasta {MAX_PHOTOS} fotos para tu invitación. La primera será la portada. También puedes enviarlas después.</p>
                    <label
                      className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-6 py-10 text-center transition ${
                        photos.length >= MAX_PHOTOS ? 'pointer-events-none border-white/5 opacity-50' : 'border-white/15 hover:border-violet-400/50 hover:bg-white/[0.02]'
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        void addPhotos(e.dataTransfer.files);
                      }}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-400/15 text-violet-300">
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                        </svg>
                      </span>
                      <span className="mt-4 font-semibold text-white">{photoBusy ? 'Optimizando fotos…' : 'Arrastra tus fotos o toca para elegir'}</span>
                      <span className="mt-1 text-sm text-zinc-500">
                        JPG, PNG o WEBP · {photos.length}/{MAX_PHOTOS}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          void addPhotos(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {photos.length > 0 ? (
                      <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {photos.map((photo, index) => (
                          <li key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10">
                            <img src={photo.url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                            {index === 0 ? <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-zinc-950">Portada</span> : null}
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                              aria-label={`Quitar foto ${index + 1}`}
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                {step === 4 ? (
                  <div>
                    <h2 className="text-[1.4rem] font-semibold text-white">Confirma y paga</h2>
                    <p className="mt-1 text-sm text-zinc-400">Revisa tu resumen. El pago se procesa de forma segura.</p>

                    <dl className="mt-6 grid gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.02] p-5 text-sm sm:grid-cols-2">
                      {[
                        ['Plantilla', `${template.name} · ${categoryLabel(template.category)}`],
                        ['Evento', `${draft.event.type} · ${draft.event.title}`],
                        ['Fecha', `${formatPreviewDate(draft.event.date) ?? '—'}${draft.event.time ? ` · ${draft.event.time}` : ''}`],
                        ['Lugar', draft.event.venue || '—'],
                        ['Contacto', `${draft.customer.name} · ${draft.customer.phone}`],
                        ['Fotos', `${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}`]
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-zinc-500">{label}</dt>
                          <dd className="mt-0.5 font-medium text-white">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-5 flex items-end justify-between rounded-[22px] border border-white/[0.08] p-5">
                      <div>
                        <p className="text-sm text-zinc-400">Total · pago único</p>
                        <p className="text-xs text-zinc-500">Sin mensualidades</p>
                      </div>
                      <p className="brand-gradient-text text-[2.6rem] font-bold leading-none tracking-[-0.04em]" style={displayFont}>
                        {price} <span className="text-sm font-semibold tracking-normal text-zinc-500">MXN</span>
                      </p>
                    </div>

                    <label className="mt-5 flex items-start gap-3 text-sm text-zinc-300">
                      <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-violet-400" />
                      Autorizo a INViTARTE a usar estos datos y fotos únicamente para crear y operar mi evento.
                    </label>
                    {errors.accepted ? <p className="mt-2 text-[13px] text-rose-400">{errors.accepted}</p> : null}
                    {submitError ? (
                      <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
                        {submitError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-6">
              <button
                type="button"
                onClick={() => (step === 0 ? onExit() : setStep((current) => current - 1))}
                className="rounded-full border border-white/12 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/[0.06]"
              >
                {step === 0 ? 'Cancelar' : 'Atrás'}
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={goNext} disabled={photoBusy} className="rounded-full bg-white px-7 py-3 text-[14px] font-semibold text-zinc-950 transition hover:bg-white/85 disabled:opacity-50">
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={submitting}
                  className="rounded-full bg-white px-7 py-3 text-[14px] font-semibold text-zinc-950 transition hover:bg-white/85 disabled:opacity-60"
                >
                  {submitting ? 'Procesando…' : `Pagar ${price} MXN`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vista previa en vivo */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="relative flex justify-center rounded-[32px] border border-white/[0.08] bg-[#0c0c11]/70 p-8" style={{ backgroundImage: `radial-gradient(circle at 50% 30%, ${template.design.accent}33 0%, transparent 65%)` }}>
              <PhoneShell className="w-[15rem] xl:w-[16.5rem]">
                <InviteScreen invite={previewDesign} />
              </PhoneShell>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[22px] border border-white/[0.08] bg-[#0c0c11]/70 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">{template.name}</p>
                <p className="text-[12px] text-zinc-500">Control de invitados + invitación</p>
              </div>
              <p className="text-lg font-bold text-white">{price} MXN</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default RegistrationPage;
