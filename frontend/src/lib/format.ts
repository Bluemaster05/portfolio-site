const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "2024" -> "2024", "2024-06" / "2024-06-15" -> "Jun 2024".
 * Done by hand so server and browser output match regardless of locale or time zone.
 */
export function formatPartialDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const [year, month] = value.split('-');
  const monthIndex = Number(month) - 1;
  return MONTHS[monthIndex] ? `${MONTHS[monthIndex]} ${year}` : year;
}

/** "Jun 2022 – Present", "2019 – 2023", or a single date. */
export function formatDateRange(start?: string, end?: string, ongoingLabel = 'Present'): string {
  const from = formatPartialDate(start);
  const to = formatPartialDate(end);
  if (from && to) return from === to ? from : `${from} – ${to}`;
  if (from) return `${from} – ${ongoingLabel}`;
  return to ?? '';
}

/** ISO date-time -> "Jun 15, 2024" in UTC. */
export function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
