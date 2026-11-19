const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(value: string | number | undefined): string | null {
  const raw = value === undefined ? "" : String(value).trim();
  if (!raw) return null;
  const m = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(raw);
  if (!m) return raw;
  const [, y, mo, d] = m;
  const name = mo ? MONTHS[Number(mo) - 1] : undefined;
  if (!name) return y;
  return d ? `${name} ${Number(d)}, ${y}` : `${name} ${y}`;
}
