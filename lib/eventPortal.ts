import type { EventCountdown } from '../components/event-portal/types';

const SPANISH_MONTH_INDEX: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
};

const normalizeEventDateSource = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[|·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const parseEventDateValue = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'fecha pendiente') return null;

  const directParsed = new Date(trimmed);
  if (!Number.isNaN(directParsed.getTime())) return directParsed;

  const normalized = normalizeEventDateSource(trimmed);

  const slashDateMatch = normalized.match(
    /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );
  if (slashDateMatch) {
    let [, dayText, monthText, yearText, hourText, minuteText, meridiem] = slashDateMatch;
    let hour = hourText ? Number.parseInt(hourText, 10) : 0;
    const minute = minuteText ? Number.parseInt(minuteText, 10) : 0;
    const year = yearText.length === 2 ? 2000 + Number.parseInt(yearText, 10) : Number.parseInt(yearText, 10);

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    const parsed = new Date(year, Number.parseInt(monthText, 10) - 1, Number.parseInt(dayText, 10), hour, minute);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const naturalDateMatch = normalized.match(
    /^(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})(?:\s+(?:a\s+las\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );
  if (!naturalDateMatch) return null;

  let [, dayText, monthName, yearText, hourText, minuteText, meridiem] = naturalDateMatch;
  const monthIndex = SPANISH_MONTH_INDEX[monthName];
  if (monthIndex === undefined) return null;

  let hour = hourText ? Number.parseInt(hourText, 10) : 0;
  const minute = minuteText ? Number.parseInt(minuteText, 10) : 0;

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  const parsed = new Date(Number.parseInt(yearText, 10), monthIndex, Number.parseInt(dayText, 10), hour, minute);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const buildEventCountdown = (eventDate: string, nowTimestamp: number): EventCountdown | null => {
  const target = parseEventDateValue(eventDate);
  if (!target) return null;

  const diff = target.getTime() - nowTimestamp;
  const clampedDiff = Math.max(0, diff);
  const totalSeconds = Math.floor(clampedDiff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    target,
    isPast: diff <= 0,
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
};
