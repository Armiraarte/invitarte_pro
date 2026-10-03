import type {
  EventPortalGuest,
  EventPortalRecord,
  InvitationProjectBuilderStateRecord,
  InvitationProjectRecord,
  InvitationProjectSourceRecord,
} from '../components/event-portal/types';
import type { InvitationData } from '../laboratorio/types';

type EventPortalApiResponse = {
  success: boolean;
  message?: string;
  record?: EventPortalRecord | null;
  records?: EventPortalRecord[];
  updatedGuest?: EventPortalGuest | null;
  request_id?: string;
};

type InvitationProjectApiResponse = {
  success: boolean;
  message?: string;
  project?: InvitationProjectRecord | null;
  created?: boolean;
  source?: string;
  sourceUpdatedAt?: string | null;
  packageId?: string | null;
  formData?: InvitationData | null;
  builderStateUpdatedAt?: string | null;
  hasBuilderState?: boolean;
  request_id?: string;
};

export class EventPortalApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'EventPortalApiError';
    this.status = status;
  }
}

const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

const pushApiBaseUrlCandidate = (bucket: string[], value?: string | null) => {
  const normalized = normalizeApiBaseUrl(value?.trim() ?? '');
  if (normalized === '' || bucket.includes(normalized)) {
    return;
  }

  bucket.push(normalized);
};

const appendApiBaseUrlVariants = (bucket: string[], value?: string | null) => {
  const normalized = normalizeApiBaseUrl(value?.trim() ?? '');
  if (normalized === '') {
    return;
  }

  pushApiBaseUrlCandidate(bucket, normalized);
  pushApiBaseUrlCandidate(bucket, /\/db$/i.test(normalized) ? normalized.replace(/\/db$/i, '') : `${normalized}/db`);
};

const resolveWindowApiBaseUrlCandidates = () => {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  const candidates: string[] = [];
  const { origin, protocol, hostname, port } = window.location;
  const sameHostPhpBaseUrl = `${protocol}//${hostname}:8000`;
  const prefersPhpPort = ['3000', '4173', '5173'].includes(port);

  if (prefersPhpPort) {
    appendApiBaseUrlVariants(candidates, sameHostPhpBaseUrl);
    appendApiBaseUrlVariants(candidates, origin);
  } else {
    appendApiBaseUrlVariants(candidates, origin);
    appendApiBaseUrlVariants(candidates, sameHostPhpBaseUrl);
  }

  if (hostname === 'localhost') {
    appendApiBaseUrlVariants(candidates, `${protocol}//127.0.0.1:8000`);
    appendApiBaseUrlVariants(candidates, `${protocol}//127.0.0.1${port ? `:${port}` : ''}`);
  } else if (hostname === '127.0.0.1') {
    appendApiBaseUrlVariants(candidates, `${protocol}//localhost:8000`);
    appendApiBaseUrlVariants(candidates, `${protocol}//localhost${port ? `:${port}` : ''}`);
  }

  return candidates;
};

const resolveApiBaseUrlCandidates = () => {
  const candidates: string[] = [];
  const configuredBase = import.meta.env.VITE_EVENT_PORTAL_API_BASE_URL?.trim();
  if (configuredBase) {
    appendApiBaseUrlVariants(candidates, configuredBase);
  }

  resolveWindowApiBaseUrlCandidates().forEach((candidate) => {
    pushApiBaseUrlCandidate(candidates, candidate);
  });

  if (candidates.length === 0) {
    appendApiBaseUrlVariants(candidates, 'http://localhost:8000');
    appendApiBaseUrlVariants(candidates, 'http://localhost/db');
  }

  return candidates;
};

const resolveApiBaseUrl = () => resolveApiBaseUrlCandidates()[0] ?? 'http://localhost:8000';

const resolveApiKey = () => import.meta.env.VITE_EVENT_PORTAL_API_KEY?.trim() ?? '';

const buildEndpointUrl = (baseUrl = resolveApiBaseUrl()) => {
  const endpoint = `${baseUrl}/event_portal.php`;
  return new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
};

const buildInvitationProjectEndpointUrl = (baseUrl = resolveApiBaseUrl()) => {
  const endpoint = `${baseUrl}/invitation_project.php`;
  return new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
};

const logInvitationProjectApiDebug = (scope: string, details?: unknown) => {
  if (typeof console === 'undefined') return;

  if (details === undefined) {
    console.log(`[InvitationProjectApi] ${scope}`);
    return;
  }

  console.log(`[InvitationProjectApi] ${scope}`, details);
};

const logInvitationProjectApiError = (scope: string, error: unknown, details?: unknown) => {
  if (typeof console === 'undefined') return;

  if (details === undefined) {
    console.error(`[InvitationProjectApi] ${scope}`, error);
    return;
  }

  console.error(`[InvitationProjectApi] ${scope}`, {
    details,
    error,
  });
};

export const buildInvitationProjectLaunchUrl = (code: string) => {
  const endpoint = buildInvitationProjectEndpointUrl();
  endpoint.searchParams.set('action', 'launch');
  endpoint.searchParams.set('code', code);
  return endpoint.toString();
};

const buildRequestHeaders = (headersInit?: HeadersInit, options: { includeContentType?: boolean } = {}) => {
  const headers = new Headers(headersInit);
  const includeContentType = options.includeContentType ?? false;

  if (includeContentType && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const apiKey = resolveApiKey();
  if (apiKey !== '') {
    headers.set('X-API-KEY', apiKey);
  }

  return headers;
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new EventPortalApiError('La API devolvió una respuesta no válida.', response.status || 500);
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'No pudimos completar la solicitud con el servidor.';
    throw new EventPortalApiError(message, response.status || 500);
  }

  return payload as T;
};

const TRANSIENT_API_ERROR_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const resolveRequestMethod = (init?: RequestInit) => (init?.method?.toUpperCase() ?? 'GET');

const isSafeRequestMethod = (method: string) => method === 'GET' || method === 'HEAD';

const shouldRetryWithAlternateBase = (error: unknown) =>
  error instanceof TypeError ||
  (error instanceof EventPortalApiError &&
    (error.status === 404 || error.message === 'La API devolvió una respuesta no válida.'));

const shouldRetrySameRequest = (error: unknown, method: string) =>
  isSafeRequestMethod(method) &&
  error instanceof EventPortalApiError &&
  TRANSIENT_API_ERROR_STATUSES.has(error.status);

const waitForRetry = (attempt: number) =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, attempt * 250);
  });

const requestApiWithFallback = async <T>(
  buildEndpoint: (baseUrl?: string) => URL,
  searchParams: Record<string, string>,
  init?: RequestInit
): Promise<T> => {
  const requestMethod = resolveRequestMethod(init);
  const includeContentType =
    init?.body !== undefined && !(init.body instanceof FormData) && requestMethod !== 'GET';
  const candidateBaseUrls = resolveApiBaseUrlCandidates();
  const maxAttemptsPerCandidate = isSafeRequestMethod(requestMethod) ? 2 : 1;

  let lastError: unknown = null;

  for (let index = 0; index < candidateBaseUrls.length; index += 1) {
    const endpoint = buildEndpoint(candidateBaseUrls[index]);
    Object.entries(searchParams).forEach(([key, value]) => {
      endpoint.searchParams.set(key, value);
    });

    let shouldAdvanceToNextBase = false;

    for (let attempt = 1; attempt <= maxAttemptsPerCandidate; attempt += 1) {
      try {
        return await parseJsonResponse<T>(
          await fetch(endpoint.toString(), {
            ...init,
            headers: buildRequestHeaders(init?.headers, {
              includeContentType,
            }),
          })
        );
      } catch (error) {
        lastError = error;

        if (attempt < maxAttemptsPerCandidate && shouldRetrySameRequest(error, requestMethod)) {
          await waitForRetry(attempt);
          continue;
        }

        if (shouldRetryWithAlternateBase(error) && index < candidateBaseUrls.length - 1) {
          shouldAdvanceToNextBase = true;
          break;
        }

        throw error;
      }
    }

    if (shouldAdvanceToNextBase) {
      continue;
    }
  }

  throw lastError instanceof Error ? lastError : new EventPortalApiError('No pudimos completar la solicitud con el servidor.');
};

const requestEventPortal = async (searchParams: Record<string, string>, init?: RequestInit) =>
  requestApiWithFallback<EventPortalApiResponse>(buildEndpointUrl, searchParams, init);

const requestInvitationProject = async (searchParams: Record<string, string>, init?: RequestInit) =>
  requestApiWithFallback<InvitationProjectApiResponse>(buildInvitationProjectEndpointUrl, searchParams, init);

/* Solicitud a otro endpoint PHP del mismo backend (por ejemplo orders.php) con las mismas reglas de base URL y reintentos. */
export const requestBackendEndpoint = async <T>(fileName: string, searchParams: Record<string, string>, init?: RequestInit) =>
  requestApiWithFallback<T>(
    (baseUrl = resolveApiBaseUrl()) =>
      new URL(`${baseUrl}/${fileName}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost'),
    searchParams,
    init
  );

const parseErrorResponse = async (response: Response) => {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as { message?: string };
      return payload.message?.trim() || 'No pudimos completar la solicitud con el servidor.';
    } catch {
      return 'No pudimos completar la solicitud con el servidor.';
    }
  }

  try {
    const text = await response.text();
    return text.trim() || 'No pudimos completar la solicitud con el servidor.';
  } catch {
    return 'No pudimos completar la solicitud con el servidor.';
  }
};

const resolveFileNameFromDisposition = (response: Response, fallback: string) => {
  const contentDisposition = response.headers.get('Content-Disposition') ?? '';
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] ?? fallback;
};

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
};

export const fetchEventPortalRecord = async (
  code: string,
  options: { includeGuests?: boolean } = {}
): Promise<EventPortalRecord | null> => {
  const response = await requestEventPortal({
    action: 'fetch',
    code,
    includeGuests: options.includeGuests === false ? '0' : '1',
  });

  return response.record ?? null;
};

export const fetchEventPortalRecordByInvitationId = async (invitationId: string): Promise<EventPortalRecord | null> => {
  const response = await requestEventPortal({
    action: 'fetch',
    invitationId,
  });

  return response.record ?? null;
};

export const listEventPortalRecords = async (options: { limit?: number } = {}): Promise<EventPortalRecord[]> => {
  const response = await requestEventPortal({
    action: 'list',
    limit: String(options.limit ?? 80),
  });

  return Array.isArray(response.records) ? response.records : [];
};

export const upsertEventPortalRecord = async (
  record: EventPortalRecord,
  options: { syncGuests?: boolean } = {}
): Promise<EventPortalRecord> => {
  const response = await requestEventPortal(
    {
      action: 'upsert',
    },
    {
      method: 'POST',
      body: JSON.stringify({
        record,
        syncGuests: options.syncGuests ?? true,
      }),
    }
  );

  if (!response.record) {
    throw new EventPortalApiError('El servidor no devolvió el evento actualizado.');
  }

  return response.record;
};

export const registerEventPortalGuestCheckIn = async (
  code: string,
  guestCode: string
): Promise<{ record: EventPortalRecord; updatedGuest: EventPortalGuest | null }> => {
  const response = await requestEventPortal(
    {
      action: 'checkin',
    },
    {
      method: 'POST',
      body: JSON.stringify({
        code,
        guestCode,
      }),
    }
  );

  if (!response.record) {
    throw new EventPortalApiError('El servidor no devolvió el evento actualizado.');
  }

  return {
    record: response.record,
    updatedGuest: response.updatedGuest ?? null,
  };
};

export const fetchInvitationProject = async (code: string): Promise<InvitationProjectRecord | null> => {
  logInvitationProjectApiDebug('fetch:start', { code });

  try {
    const response = await requestInvitationProject({
      action: 'fetch',
      code,
    });

    logInvitationProjectApiDebug('fetch:done', {
      code,
      hasProject: response.project !== null && response.project !== undefined,
      previewUrl: response.project?.previewUrl ?? null,
      projectPath: response.project?.projectPath ?? null,
    });

    return response.project ?? null;
  } catch (error) {
    logInvitationProjectApiError('fetch:failed', error, { code });
    throw error;
  }
};

export const provisionInvitationProject = async (code: string): Promise<InvitationProjectRecord> => {
  logInvitationProjectApiDebug('provision:start', { code });
  const response = await requestInvitationProject(
    {
      action: 'provision',
    },
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
  );

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió el proyecto de la invitación.');
  }

  logInvitationProjectApiDebug('provision:done', {
    code,
    previewUrl: response.project.previewUrl ?? null,
    projectPath: response.project.projectPath,
  });
  return response.project;
};

export const openInvitationProject = async (code: string): Promise<InvitationProjectRecord> => {
  logInvitationProjectApiDebug('open:start', { code });
  const response = await requestInvitationProject(
    {
      action: 'open',
    },
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
  );

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvio la vista previa de la invitacion.');
  }

  logInvitationProjectApiDebug('open:done', {
    code,
    previewUrl: response.project.previewUrl ?? null,
    previewExists: response.project.previewExists ?? null,
    projectPath: response.project.projectPath,
  });
  return response.project;
};

export const publishInvitationProject = async (code: string): Promise<InvitationProjectRecord> => {
  logInvitationProjectApiDebug('publish:start', { code });
  const response = await requestInvitationProject(
    {
      action: 'publish',
    },
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
  );

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió la vista previa de la invitación.');
  }

  logInvitationProjectApiDebug('publish:done', {
    code,
    previewUrl: response.project.previewUrl ?? null,
    previewExists: response.project.previewExists ?? null,
    projectPath: response.project.projectPath,
  });
  return response.project;
};

export const fetchInvitationProjectSource = async (code: string): Promise<InvitationProjectSourceRecord> => {
  const response = await requestInvitationProject({
    action: 'source',
    code,
  });

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió el proyecto de la invitación.');
  }

  if (typeof response.source !== 'string') {
    throw new EventPortalApiError('El servidor no devolvió el código del proyecto.');
  }

  return {
    project: response.project,
    source: response.source,
    sourceUpdatedAt: response.sourceUpdatedAt ?? null,
  };
};

export const saveInvitationProjectSource = async (
  code: string,
  source: string
): Promise<InvitationProjectSourceRecord> => {
  const response = await requestInvitationProject(
    {
      action: 'save-source',
    },
    {
      method: 'POST',
      body: JSON.stringify({
        code,
        source,
      }),
    }
  );

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió el proyecto actualizado.');
  }

  if (typeof response.source !== 'string') {
    throw new EventPortalApiError('El servidor no devolvió el código guardado del proyecto.');
  }

  return {
    project: response.project,
    source: response.source,
    sourceUpdatedAt: response.sourceUpdatedAt ?? null,
  };
};

export const fetchInvitationProjectBuilderState = async (code: string): Promise<InvitationProjectBuilderStateRecord> => {
  const response = await requestInvitationProject({
    action: 'builder-state',
    code,
  });

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió el proyecto de la invitación.');
  }

  return {
    project: response.project,
    packageId: typeof response.packageId === 'string' ? response.packageId : null,
    formData: response.formData ?? null,
    builderStateUpdatedAt: response.builderStateUpdatedAt ?? null,
    hasBuilderState: response.hasBuilderState === true,
  };
};

export const saveInvitationProjectBuilderState = async (
  code: string,
  packageId: string,
  formData: InvitationData
): Promise<InvitationProjectBuilderStateRecord> => {
  const response = await requestInvitationProject(
    {
      action: 'save-builder-state',
    },
    {
      method: 'POST',
      body: JSON.stringify({
        code,
        packageId,
        formData,
      }),
    }
  );

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió el proyecto actualizado.');
  }

  return {
    project: response.project,
    packageId: typeof response.packageId === 'string' ? response.packageId : null,
    formData: response.formData ?? null,
    builderStateUpdatedAt: response.builderStateUpdatedAt ?? null,
    hasBuilderState: response.hasBuilderState === true,
  };
};

export const uploadInvitationProjectArchive = async (code: string, file: File): Promise<InvitationProjectRecord> => {
  const formData = new FormData();
  formData.set('code', code);
  formData.set('archive', file, file.name);

  const response = await requestInvitationProject(
    {
      action: 'upload',
    },
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.project) {
    throw new EventPortalApiError('El servidor no devolvió el proyecto actualizado.');
  }

  return response.project;
};

export const downloadInvitationProjectArchive = async (code: string) => {
  const endpoint = buildInvitationProjectEndpointUrl();
  endpoint.searchParams.set('action', 'download');
  endpoint.searchParams.set('code', code);

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: buildRequestHeaders(undefined, {
      includeContentType: false,
    }),
  });

  if (!response.ok) {
    throw new EventPortalApiError(await parseErrorResponse(response), response.status || 500);
  }

  const blob = await response.blob();
  const fileName = resolveFileNameFromDisposition(response, `invitacion-${code}.zip`);
  triggerBrowserDownload(blob, fileName);
};
