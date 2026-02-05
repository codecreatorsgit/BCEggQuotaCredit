function replaceNullsByEmptyString(value: any) {
  return (value == null) ? "" : value
}

export const getUrlParameter = (sParam: any) => {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0].toLowerCase() === sParam) {
      return (sParameterName[1] === undefined || replaceNullsByEmptyString(sParameterName[1]) === "") ? false : decodeURIComponent(sParameterName[1]);
    }
  }
}



export const formatDate = (date: any) => {
  if (!date) return '';
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0]
}

export const formatDateFromString = (
  dateString: string,
  toSharePointFormat: boolean = false
): string => {
  if (dateString.indexOf('T') === -1) {
    dateString = dateString + 'T12:00:00.000Z';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Invalid date fallback

  const yyyy = date.getFullYear();
  const pad = (num: number): string => (num < 10 ? '0' + num : '' + num);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());

  if (toSharePointFormat) {
    // SharePoint expects ISO 8601
    return `${yyyy}-${mm}-${dd}T00:00:00Z`;
  }
  return `${mm}/${dd}/${yyyy}`;
};
export const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export function getFormattedCurrentDate(
  preset: 'long' | 'medium' | 'short' = 'long',
  timeZone: string = 'America/New_York'
): string {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions =
    preset === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : preset === 'medium'
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: '2-digit', day: '2-digit' }; // short → locale-specific (e.g., 1/20/26)
  console.log(new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(now))
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(now);
}


/**
 * Returns the number of weeks between two dates.
 *
 * @param startDate - First date (Date or date-like string)
 * @param endDate - Second date (Date or date-like string)
 * @param mode - 'floor' | 'ceil' | 'round' (default: 'floor')
 *   - 'floor': full weeks only
 *   - 'ceil': any partial week counts as a full week
 *   - 'round': nearest whole week
 *
 * @example
 * weeksBetween('2026-01-01', '2026-01-15')           // 2  (floor)
 * weeksBetween('2026-01-01', '2026-01-08', 'ceil')   // 1
 * weeksBetween(new Date(2026, 0, 1), new Date(2026, 0, 4)) // 0 (floor)
 */
export function weeksBetween(
  startDate: Date | string,
  endDate: Date | string,
  mode: 'floor' | 'ceil' | 'round' = 'floor'
): number {
  const d1 = startDate instanceof Date ? startDate : new Date(startDate);
  const d2 = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error('Invalid date(s) supplied.');
  }

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const rawWeeks = diffMs / msPerWeek;

  switch (mode) {
    case 'ceil':
      return Math.ceil(rawWeeks);
    case 'round':
      return Math.round(rawWeeks);
    case 'floor':
    default:
      return Math.floor(rawWeeks);
  }
}


/**
 * Returns the number of days between two dates (absolute difference).
 *
 * @param startDate - First date (Date or date-like string)
 * @param endDate - Second date (Date or date-like string)
 *
 * @example
 * daysBetween('2026-01-01', '2026-01-05'); // 4
 * daysBetween(new Date('2026-01-10'), new Date('2026-01-03')); // 7
 */
export function daysBetween(
  startDate: Date | string,
  endDate: Date | string
): number {
  const d1 = startDate instanceof Date ? startDate : new Date(startDate);
  const d2 = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error('Invalid date(s) supplied.');
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffMs / msPerDay);
}
