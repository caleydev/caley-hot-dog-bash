export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 10);
  if (digits.length <= 3) return p1;
  if (digits.length <= 6) return `(${p1}) ${p2}`;
  return `(${p1}) ${p2}-${p3}`;
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  return normalizePhone(value).length >= 10;
}