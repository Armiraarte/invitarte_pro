import type { EventPortalGuest, EventPortalRecord, GuestStatus } from '../components/event-portal/types';
import { buildInvitationProjectLaunchUrl } from '../services/eventPortalApi';

export type ImportedGuestRow = {
  name: string;
  group: string;
  companions: number;
  guestCode?: string;
  guestUrl?: string;
  tableLabel?: string;
  email?: string;
  phone?: string;
  note?: string;
  status?: GuestStatus;
  checkedInAt?: string;
  checkInCount?: number;
};

const TEMPLATE_FILE_NAME = 'plantilla-invitados-demo.xlsx';
const GENERATED_LINKS_FILE_NAME = 'invitados-con-links-demo.xlsx';
const ADMIN_LIST_FILE_NAME = 'lista-operativa-evento-demo.xlsx';

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const normalizeTextKey = (value: string) => normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '');

const toOptionalText = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
};

const toPositiveInteger = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value);

  const parsed = Number.parseInt(String(value ?? '').replace(/[^0-9-]+/g, ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const toNonNegativeInteger = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.round(value);

  const parsed = Number.parseInt(String(value ?? '').replace(/[^0-9-]+/g, ''), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const normalizeGuestStatus = (value: unknown): GuestStatus => {
  const normalized = normalizeTextKey(String(value ?? ''));

  if (normalized.startsWith('confirm')) return 'confirmado';
  if (normalized.startsWith('declin') || normalized.startsWith('cancel')) return 'declinado';
  return 'pendiente';
};

const normalizeGuestCode = (value: unknown) => {
  const text = toOptionalText(value);
  return text ? text.toUpperCase() : undefined;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const buildGuestIdentityKey = (guest: Pick<EventPortalGuest, 'name' | 'group' | 'email' | 'phone'>) =>
  [
    normalizeTextKey(guest.name),
    normalizeTextKey(guest.group),
    normalizeTextKey(guest.email ?? ''),
    normalizeTextKey(guest.phone ?? '')
  ].join('|');

const buildGuestUrl = (shareUrl: string, eventCode: string, guestCode: string) => {
  const baseUrl = shareUrl.trim() || buildInvitationProjectLaunchUrl(eventCode);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}event=${encodeURIComponent(eventCode)}&guest=${encodeURIComponent(guestCode)}`;
};

const buildUniqueGuestCode = (eventCode: string, identityKey: string, index: number, usedCodes: Set<string>) => {
  const sequence = String(index + 1).padStart(3, '0');
  let attempt = 0;
  let candidate = '';

  do {
    const fingerprint = (hashString(`${identityKey}|${attempt}`) + index).toString(36).toUpperCase().padStart(4, '0').slice(-4);
    candidate = `${eventCode}-${sequence}-${fingerprint}`;
    attempt += 1;
  } while (usedCodes.has(candidate));

  usedCodes.add(candidate);
  return candidate;
};

export const hydrateEventPortalGuest = (
  input: Partial<EventPortalGuest>,
  index: number,
  eventCode: string,
  shareUrl: string,
  existingGuest?: EventPortalGuest,
  usedCodes?: Set<string>
): EventPortalGuest => {
  const name = toOptionalText(input.name) ?? `Invitado ${index + 1}`;
  const group = toOptionalText(input.group) ?? 'General';
  const email = toOptionalText(input.email);
  const phone = toOptionalText(input.phone);
  const note = toOptionalText(input.note ?? existingGuest?.note);
  const tableLabel = toOptionalText(input.tableLabel ?? existingGuest?.tableLabel);
  const identityKey = buildGuestIdentityKey({
    name,
    group,
    email,
    phone
  } as Pick<EventPortalGuest, 'name' | 'group' | 'email' | 'phone'>);
  const resolvedUsedCodes = usedCodes ?? new Set<string>();
  const preservedCode = toOptionalText(input.guestCode) ?? existingGuest?.guestCode;
  const guestCode = preservedCode ?? buildUniqueGuestCode(eventCode, identityKey || `${eventCode}-${index}`, index, resolvedUsedCodes);

  resolvedUsedCodes.add(guestCode);

  return {
    id: toOptionalText(input.id) ?? existingGuest?.id ?? `${eventCode}-${index}`,
    name,
    companions: toPositiveInteger(input.companions ?? existingGuest?.companions),
    group,
    tableLabel,
    guestCode,
    guestUrl: toOptionalText(input.guestUrl) ?? existingGuest?.guestUrl ?? buildGuestUrl(shareUrl, eventCode, guestCode),
    email,
    phone,
    status: normalizeGuestStatus(input.status ?? existingGuest?.status),
    checkedInAt: toOptionalText(input.checkedInAt ?? existingGuest?.checkedInAt),
    checkInCount: toNonNegativeInteger(input.checkInCount ?? existingGuest?.checkInCount),
    note
  };
};

const normalizeWorksheetRow = (row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeTextKey(key), value]));

const getRowValue = (row: Record<string, unknown>, aliases: string[]) => {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && String(value).trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

export const parseGuestUploadFile = async (file: File): Promise<ImportedGuestRow[]> => {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];

  if (!firstSheet) {
    throw new Error('No encontramos hojas validas en el archivo.');
  }

  const worksheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: '',
    raw: false
  });

  const guests = worksheetRows
    .map((row) => normalizeWorksheetRow(row))
    .map((row) => {
      const name = toOptionalText(
        getRowValue(row, ['nombre', 'invitado', 'guest', 'fullname', 'nombrecompleto'])
      );
      const rawGuestCode = getRowValue(row, ['codigounico', 'codigo', 'guestcode', 'codigoinvitado']);
      const rawGuestUrl = getRowValue(row, ['urlindividual', 'payloadqr', 'guesturl', 'url']);
      const rawStatus = getRowValue(row, ['estatusconfirmacion', 'estatus', 'estado', 'status']);
      const rawCheckedInAt = getRowValue(row, ['ultimocheckin', 'checkedinat', 'checkin']);
      const rawCheckInCount = getRowValue(row, ['vecesescaneado', 'checkincount', 'escaneos']);

      if (!name) return null;

      return {
        name,
        group: toOptionalText(getRowValue(row, ['grupo', 'categoria', 'segmento'])) ?? 'General',
        companions: toPositiveInteger(getRowValue(row, ['invitados', 'numeroinvitados', 'lugares', 'acompanantes', 'acompanantesextra', 'companions'])),
        guestCode: normalizeGuestCode(rawGuestCode),
        guestUrl: toOptionalText(rawGuestUrl),
        tableLabel: toOptionalText(getRowValue(row, ['mesa', 'table', 'mesaasignada', 'mesanumero', 'numeromesa'])),
        email: toOptionalText(getRowValue(row, ['email', 'correo', 'correoelectronico'])),
        phone: toOptionalText(getRowValue(row, ['telefono', 'celular', 'movil', 'phone'])),
        note: toOptionalText(getRowValue(row, ['nota', 'notas', 'comentario', 'comentarios'])),
        status: rawStatus !== undefined ? normalizeGuestStatus(rawStatus) : undefined,
        checkedInAt: toOptionalText(rawCheckedInAt),
        checkInCount: rawCheckInCount !== undefined ? toNonNegativeInteger(rawCheckInCount) : undefined
      } as ImportedGuestRow;
    })
    .filter((row): row is ImportedGuestRow => Boolean(row));

  if (guests.length === 0) {
    throw new Error('La plantilla no tiene invitados validos. Revisa que la columna nombre tenga datos.');
  }

  return guests;
};

export const mergeImportedGuests = (
  eventCode: string,
  shareUrl: string,
  importedRows: ImportedGuestRow[],
  existingGuests: EventPortalGuest[]
) => {
  const existingByKey = new Map<string, EventPortalGuest>();
  const existingByCode = new Map<string, EventPortalGuest>();
  const usedCodes = new Set<string>();

  existingGuests.forEach((guest) => {
    existingByKey.set(buildGuestIdentityKey(guest), guest);
    existingByCode.set(guest.guestCode.toUpperCase(), guest);
    if (guest.guestCode) usedCodes.add(guest.guestCode);
  });

  return importedRows.map((row, index) => {
    const importedGuestCode = normalizeGuestCode(row.guestCode);
    const existingGuest =
      (importedGuestCode ? existingByCode.get(importedGuestCode) : undefined) ??
      existingByKey.get(
        buildGuestIdentityKey({
          name: row.name,
          group: row.group,
          email: row.email,
          phone: row.phone
        } as Pick<EventPortalGuest, 'name' | 'group' | 'email' | 'phone'>)
      );

    return hydrateEventPortalGuest(
      {
        ...row,
        // For new guests, always generate a unique code server-side in the app flow.
        // We only preserve a code when it already belongs to an existing guest record.
        guestCode: existingGuest?.guestCode,
        id: existingGuest?.id
      },
      index,
      eventCode,
      shareUrl,
      existingGuest,
      usedCodes
    );
  });
};

export const downloadGuestTemplateWorkbook = async (eventCode: string) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const inviteSheetRows = [
    ['NOMBRE', 'GRUPO', 'MESA', 'INVITADOS', 'TELEFONO', 'EMAIL'],
    ['Ana Martinez', 'Familia', 'Mesa 1', 2, '6621234567', 'ana@example.com']
  ];
  const instructionRows = [
    ['CAMPO', 'DETALLE'],
    ['NOMBRE', 'Obligatorio. Nombre visible del invitado.'],
    ['GRUPO', 'Opcional. Familia, amigos, proveedores, etc.'],
    ['MESA', 'Opcional. Mesa o zona asignada para control del evento.'],
    ['INVITADOS', 'Numero total de invitados o pases asignados a ese registro.'],
    ['TELEFONO', 'Opcional. Sirve para distinguir invitados repetidos.'],
    ['EMAIL', 'Opcional. Sirve para distinguir invitados repetidos.'],
    ['CODIGO_UNICO', 'No se captura en esta plantilla. El sistema lo genera automaticamente de forma unica para cada alta nueva.'],
    ['ESTATUS', 'No se captura en esta plantilla. El sistema lo asigna por defecto como PENDIENTE y conserva el existente al actualizar.'],
    ['NOTA', 'No se captura en esta plantilla. El sistema la deja vacia por defecto y conserva la existente al actualizar.'],
    ['EVENTO', `Codigo actual de referencia: ${eventCode}`]
  ];

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(inviteSheetRows), 'INVITADOS');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(instructionRows), 'INSTRUCCIONES');
  XLSX.writeFile(workbook, TEMPLATE_FILE_NAME, { compression: true });
};

export const downloadGuestLinksWorkbook = async (record: EventPortalRecord) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const rows = record.guests.map((guest) => ({
    nombre: guest.name,
    grupo: guest.group,
    mesa: guest.tableLabel ?? '',
    invitados: guest.companions,
    codigo_unico: guest.guestCode,
    url_individual: guest.guestUrl,
    telefono: guest.phone ?? '',
    email: guest.email ?? '',
    estatus: guest.status,
    nota: guest.note ?? ''
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Invitados');
  XLSX.writeFile(workbook, GENERATED_LINKS_FILE_NAME, { compression: true });
};

export const downloadGuestAdminWorkbook = async (record: EventPortalRecord) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const rows = record.guests.map((guest) => ({
    invitado: guest.name,
    grupo: guest.group,
    mesa: guest.tableLabel ?? 'Sin asignar',
    numero_invitados: guest.companions,
    codigo_unico: guest.guestCode,
    payload_qr: guest.guestUrl,
    url_individual: guest.guestUrl,
    estatus_confirmacion: guest.status,
    ultimo_checkin: guest.checkedInAt ?? '',
    veces_escaneado: guest.checkInCount ?? 0,
    telefono: guest.phone ?? '',
    email: guest.email ?? '',
    nota: guest.note ?? ''
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Control');
  XLSX.writeFile(workbook, ADMIN_LIST_FILE_NAME, { compression: true });
};
