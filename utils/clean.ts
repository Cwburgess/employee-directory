export const clean = (v: unknown): string => {
  if (v == null) return "";
  const s = String(v).trim();
  if (!s) return "";
  if (/^(null|undefined|n\/a|na|none)$/i.test(s)) return "";
  return s;
};
