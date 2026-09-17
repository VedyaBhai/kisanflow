/* ============================================================
   WhatsApp click-to-chat
   ------------------------------------------------------------
   Uses ONLY the official wa.me click-to-chat link. There is no
   WhatsApp Cloud API, no business API, no unofficial automation,
   and no server involved.

   What this actually does: opens WhatsApp with the message
   pre-filled in the compose box. The person still has to press
   Send themselves. KISANFLOW must never claim a message was
   "sent" — only that the chat was opened. The UI wording
   ("WhatsApp Opened" / "Press Send in WhatsApp") reflects that.

   CONTACT LOADING — two sources, in priority order
   1. src/config/demoContacts.js (local dev). Gitignored, so it is
      absent on Netlify. A plain `import` of a missing file is a
      hard build error, so we use Vite's import.meta.glob, which
      resolves to {} when the file doesn't exist.
   2. VITE_KISANFLOW_*_WHATSAPP environment variables (Netlify).
   3. Neither -> empty string, button disabled.

   No real number is hardcoded here or anywhere else in source.
   ============================================================ */

// Eagerly glob a single optional module. Missing file -> {} (no error).
const contactModules = import.meta.glob("../config/demoContacts.js", { eager: true });
const demoContacts = Object.values(contactModules)[0] || null;

/* Env vars must be referenced as static, fully-written-out property
   accesses — Vite substitutes them at build time and cannot resolve a
   dynamically-built key like import.meta.env[`VITE_${name}`]. */
const ENV_NUMBERS = {
  Akshay: import.meta.env.VITE_KISANFLOW_AKSHAY_WHATSAPP,
  Nikhil: import.meta.env.VITE_KISANFLOW_NIKHIL_WHATSAPP,
  Akshaya: import.meta.env.VITE_KISANFLOW_AKSHAYA_WHATSAPP,
  Ruthvika: import.meta.env.VITE_KISANFLOW_RUTHVIKA_WHATSAPP,
  Vedya: import.meta.env.VITE_KISANFLOW_VEDYA_WHATSAPP,
};

// Flattened view of the local file: farmers, buyer and logistics together,
// so one lookup covers every contact type.
const LOCAL_NUMBERS = demoContacts
  ? {
      ...(demoContacts.FARMER_WHATSAPP_NUMBERS || {}),
      ...(demoContacts.BUYER_CONTACTS || {}),
      ...(demoContacts.LOGISTICS_CONTACTS || {}),
    }
  : {};

/** True when the private contacts file is present in this build. */
export const hasDemoContacts = Boolean(demoContacts);

/**
 * Resolves a contact number by name: local private file first, then the
 * matching VITE_ env var, then "" (never null, never a hardcoded number).
 * Works for farmers, the buyer and the logistics partner alike.
 * Never logs or prints the value.
 */
export function getContactNumber(name) {
  return LOCAL_NUMBERS[name] || ENV_NUMBERS[name] || "";
}

/**
 * Looks up a farmer's WhatsApp number by name. Returns "" when neither
 * source supplies one — callers disable the button in that case.
 */
export function getFarmerWhatsAppNumber(name) {
  return getContactNumber(name);
}

/**
 * Normalizes an Indian mobile number to the digits-only form wa.me expects
 * (country code + subscriber number, no +, spaces or dashes).
 * Returns null if the input isn't a usable number.
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizeIndianPhone(raw) {
  if (typeof raw !== "string") return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // 10-digit local number -> prefix country code.
  if (digits.length === 10) return `91${digits}`;
  // Already country-coded.
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  // 0-prefixed local number.
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;

  return null;
}

/** True only if this number can actually open a chat. */
export function hasValidWhatsAppNumber(raw) {
  return normalizeIndianPhone(raw) !== null;
}

/**
 * Builds the click-to-chat URL. The message is URL-encoded so newlines,
 * emoji and Telugu script all survive intact.
 */
export function buildWhatsAppUrl(raw, message) {
  const phone = normalizeIndianPhone(raw);
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens the chat in a new tab. Called directly from the button's click
 * handler so the browser treats it as a user gesture — otherwise popup
 * blockers reject it.
 *
 * @returns {{ok: true} | {ok: false, reason: "no-number"|"blocked"}}
 */
export function openWhatsAppChat(raw, message) {
  const url = buildWhatsAppUrl(raw, message);
  if (!url) return { ok: false, reason: "no-number" };

  const win = window.open(url, "_blank", "noopener,noreferrer");
  // A blocked popup returns null (or an immediately-closed window).
  if (!win) return { ok: false, reason: "blocked" };

  return { ok: true };
}

/* ------------------------------------------------------------
   Name-based wrappers. The UI passes a farmer name, never a raw
   number, so contact details stay confined to this module and
   the private config file.
   ------------------------------------------------------------ */

/** True if this farmer has a usable number configured. */
export function canWhatsAppFarmer(name) {
  return hasValidWhatsAppNumber(getContactNumber(name));
}

/** Opens the chat for a farmer by name. */
export function openWhatsAppChatForFarmer(name, message) {
  return openWhatsAppChat(getContactNumber(name), message);
}

/** True if any named contact (farmer, buyer, logistics) is reachable. */
export function canWhatsAppContact(name) {
  return hasValidWhatsAppNumber(getContactNumber(name));
}

/** Opens the chat for any named contact (farmer, buyer, logistics). */
export function openWhatsAppChatForContact(name, message) {
  return openWhatsAppChat(getContactNumber(name), message);
}
