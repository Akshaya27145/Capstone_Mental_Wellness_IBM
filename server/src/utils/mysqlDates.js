/** mysql2 maps MySQL DATE to JS Date; avoid String(d).slice(0,10) (locale, wrong for SQL). */
export function mysqlDateToYmd(v) {
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(v ?? '');
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}

export function mysqlTimeToHms(v) {
  if (v == null) return '00:00:00';
  if (typeof v === 'string') {
    return v.length === 5 ? `${v}:00` : v.length >= 8 ? v.slice(0, 8) : v;
  }
  return String(v).slice(0, 8);
}
