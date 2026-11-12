/** Shared portal format for Tanzania national identification numbers. */
export const NIDA_PLACEHOLDER = "yyyymmdd-#####-#####-##";
export const NIDA_PATTERN = "[0-9]{8}-[0-9]{5}-[0-9]{5}-[0-9]{2}";
export const NIDA_ERROR = `Use the NIDA format ${NIDA_PLACEHOLDER}.`;
export const isNidaType = (label: string) => /\bnida\b|national\s+(id|identity|identification)/i.test(label);
export const isValidNida = (value: string) => new RegExp(`^${NIDA_PATTERN}$`).test(value);
export function formatNida(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 20);
  return [digits.slice(0, 8), digits.slice(8, 13), digits.slice(13, 18), digits.slice(18, 20)].filter(Boolean).join("-");
}
