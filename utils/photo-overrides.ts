// utils/photo-overrides.ts

// Normalize a name into a stable dictionary key:
// - lowercase
// - remove diacritics
// - collapse whitespace
// - trim
export function normalizeKey(s: string): string {
  return (s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// 👉 Store *slugs without extension* as you mentioned.
// It's OK if slugs have spaces or apostrophes; we will URL-encode later.
export const overridesByName: Record<string, string> = {
  // EXAMPLES — keep these matching your actual files on disk:
  "andy miller": "ammiller",
  "amelia miller": "armiller",
  "jesus lozano cervantes": "jlozano cervantes",
  "juan gonzalez jr": "jgonzalez jr",
  "elvis herrera vidales": "eherrera vidales",
  "jaime del barrio": "jdel barrio",
  "thomas candelaria jr": "tcandelaria jr",
  "david martinez chavez": "dmartinez chavez",
  "michele simpson white": "msimpson white",
  "erica anderson maguire": "eanderson maguire",
  "adam van patten": "avan patten",
  "doug o'shea": "do'shea",
  "edinson bautista mejia": "ebautista mejia",
  "samuel o'reilly": "so'reilly",
  "wil loyd": "wloyd iv",
  "peter martinez sanchez": "pmartinez sanchez",
  "sean anderson": "seanderson",
};

// To keep the keys exactly as typed by authors,
// you can always wrap lookups with `normalizeKey(name)`.

export function getOverrideSlug(fullName: string): string | undefined {
  return overridesByName[normalizeKey(fullName)];
}
