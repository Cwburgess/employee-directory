// utils/avatar.ts

import { getOverrideSlug } from "./photo-overrides";

// Keep this type here if you don't already export it from a central types module.
// If you DO have a central type, import it here instead to avoid duplication.
export type CrewMember = {
  name: string;
  jobtitle: string;
  number: string; // raw phone from DB (may include formatting)
  extension: string; // derived: last 3 digits of number
};

function normalizeName(fullName: string): string {
  return (fullName ?? "")
    .normalize("NFKD") // normalize accents
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .trim();
}

/**
 * Extracts first initial and last name (handling suffixes like Jr, Sr, II, III, ...)
 * and preserves hyphenated last names. Removes other non-alphanumeric chars.
 */
function getFirstInitialAndLastNameFrom(fullName: string): [string, string] {
  const normalized = normalizeName(fullName);
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ["", ""];

  const firstInitial = parts[0]?.[0] ?? "";

  // Handle suffixes like Jr, Sr, II, III, IV, V
  const suffixes = new Set(["JR", "SR", "II", "III", "IV", "V"]);
  let last = parts.length > 1 ? parts[parts.length - 1] : "";

  if (suffixes.has(last.toUpperCase()) && parts.length > 2) {
    last = parts[parts.length - 2];
  }

  // Keep hyphenated last names, strip other odd chars
  last = last.replace(/[^A-Za-z0-9-]/g, "");

  return [firstInitial, last];
}

// Append ".jpg" if missing
function ensureJpg(fileOrSlug: string): string {
  const f = (fileOrSlug ?? "").trim();
  return f.toLowerCase().endsWith(".jpg") ? f : `${f}.jpg`;
}

// Encode a single path segment safely.
// If the slug already contains % escapes, decode then re-encode to avoid double-encoding.
function encodePathSegment(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    // Malformed % sequence; just encode directly.
    return encodeURIComponent(segment);
  }
}

export function toEmployeePhotoSrc(member: CrewMember): string {
  const base = "https://employeedirectory/UserPhotos/";

  // 1) Try override
  const overrideSlug = getOverrideSlug(member.name);

  // 2) Otherwise build default: first initial + last name
  const [firstInitial, last] = getFirstInitialAndLastNameFrom(member.name);
  const defaultSlug = `${firstInitial}${last}`.toLowerCase(); // e.g., "cburgess"

  // 3) Choose slug (preserve override case; some filesystems are case-sensitive)
  const chosenSlug =
    overrideSlug && overrideSlug.trim().length > 0
      ? overrideSlug.trim()
      : defaultSlug;

  // 4) Ensure extension and URL-encode safely
  const fileName = ensureJpg(chosenSlug);
  const encoded = encodePathSegment(fileName);

  return `${base}${encoded}`;
}

export function getInitialsFromMember(member: CrewMember): string {
  const [firstInitial, last] = getFirstInitialAndLastNameFrom(member.name);
  const lastInitial = last[0] ?? "";
  return `${firstInitial}${lastInitial}`.toUpperCase(); // e.g., "CB"
}
