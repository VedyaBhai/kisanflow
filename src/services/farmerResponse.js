// KISANFLOW farmer response parser

export function parseResponseQuantity(text = "") {
  const value = String(text).match(/[\d,]+/);

  if (!value) return 0;

  return Number(value[0].replace(/,/g, ""));
}
