import { Section } from '../../types';

const pad = (value: number) => String(value).padStart(2, '0');

export const formatDateTimeLocalValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const getDefaultCountdownTargetValue = () => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);
  targetDate.setHours(18, 0, 0, 0);
  return formatDateTimeLocalValue(targetDate);
};

export const getCountdownParts = (targetValue?: string, nowMs = Date.now()) => {
  const targetMs = targetValue ? new Date(targetValue).getTime() : Number.NaN;

  if (!Number.isFinite(targetMs)) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      hasTarget: false,
      isComplete: false,
    };
  }

  const diffMs = Math.max(targetMs - nowMs, 0);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    hasTarget: true,
    isComplete: diffMs === 0,
  };
};

const getMapsQueryFromUrl = (url: URL) => {
  const searchQuery = url.searchParams.get('q') || url.searchParams.get('query');
  if (searchQuery) return searchQuery;

  const dataParam = url.searchParams.get('data');
  if (dataParam) {
    const placeMatch = dataParam.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (placeMatch) {
      return `${placeMatch[1]},${placeMatch[2]}`;
    }
  }

  const raw = url.toString();
  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return `${atMatch[1]},${atMatch[2]}`;
  }

  const pathSegments = url.pathname.split('/').filter(Boolean);
  const placeIndex = pathSegments.findIndex((segment) => segment === 'place');
  if (placeIndex >= 0 && pathSegments[placeIndex + 1]) {
    return decodeURIComponent(pathSegments[placeIndex + 1]).replace(/\+/g, ' ');
  }

  return '';
};

export const getGoogleMapsEmbedUrl = (value?: string) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '';

  try {
    const url = new URL(trimmedValue);

    if (url.hostname.includes('google.com') && url.pathname.includes('/maps/embed')) {
      return url.toString();
    }

    const query = getMapsQueryFromUrl(url);
    if (!query) return '';

    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  } catch {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmedValue)}&z=15&output=embed`;
  }
};

export const getGoogleMapsOpenUrl = (value?: string) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '';

  try {
    const url = new URL(trimmedValue);
    return url.toString();
  } catch {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedValue)}`;
  }
};

export const getRevealButtonLabel = (section: Pick<Section, 'revealButtonLabel' | 'title' | 'type'>) => {
  const customLabel = section.revealButtonLabel?.trim();
  if (customLabel) return customLabel;

  const titleLabel = section.title?.trim();
  if (titleLabel) return titleLabel;

  if (section.type === 'LOCATION') return 'Ver ubicación';
  if (section.type === 'COUNTDOWN') return 'Ver cuenta';
  if (section.type === 'GUESTS') return 'Confirmar asistencia';
  if (section.type === 'ITINERARY') return 'Ver itinerario';
  if (section.type === 'MUSIC') return 'Abrir música';

  return 'Ver sección';
};
