// Normalize to local 11-digit format: 090xxxxxxxx
export function normalizePhoneLocal(input) {
  if (!input) return "";
  let digits = String(input).replace(/\D+/g, "");

  // strip leading +234 / 234
  if (digits.startsWith("234")) digits = digits.slice(3);
  // ensure leading 0
  if (!digits.startsWith("0")) digits = "0" + digits;

  // clamp to 11 digits if user pasted extra
  if (digits.length > 11) digits = digits.slice(0, 11);
  return digits;
}
