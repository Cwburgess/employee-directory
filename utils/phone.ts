// utils/phone.ts
import { clean } from "utils/clean";

export const isExactGeneralCounsel = (title: unknown) =>
  /^general\s*counsel$/i.test(clean(title));

export const digitsOnly = (v: unknown): string => {
  const s = clean(v);
  return s.replace(/\D+/g, "");
};

export const toExtension = (extValue: unknown, title: unknown): string => {
  const nums = digitsOnly(extValue);
  if (!nums) return "";
  return isExactGeneralCounsel(title) ? nums.slice(-4) : nums.slice(-3);
};
