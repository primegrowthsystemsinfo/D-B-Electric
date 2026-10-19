// Quote-form logic: validation, the Web3Forms payload and response handling.
// Pure functions (no DOM, no network) so they can be tested in scripts/test-inquiry.ts.

export const SERVICE_OPTIONS = [
  "EV charger / 240V circuit",
  "New outlets or GFCI",
  "Breakers or electrical panel",
  "Lighting, fans or fixtures",
  "Troubleshooting a problem",
  "Something else",
] as const;

export const CONTACT_OPTIONS = ["Phone call", "Text message", "Email"] as const;

export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  contactPref: string;
  details: string;
};

export type InquiryErrors = Partial<Record<keyof Inquiry, string>>;

export const EMPTY_INQUIRY: Inquiry = {
  name: "",
  email: "",
  phone: "",
  service: "",
  location: "",
  contactPref: "Phone call",
  details: "",
};

export const LIMITS = { name: 80, email: 120, phone: 30, location: 80, details: 2000 } as const;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

export function isValidEmail(v: string) {
  return EMAIL_RE.test(v.trim());
}

/** Collapse to one line: strips CR/LF and control characters from single-line fields. */
export function oneLine(v: string) {
  return v.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
}

export function validateInquiry(i: Inquiry): InquiryErrors {
  const e: InquiryErrors = {};
  const name = oneLine(i.name);
  if (!name) e.name = "Please enter your name.";
  else if (name.length < 2) e.name = "Please enter your full name.";
  if (!i.email.trim()) e.email = "Please enter your email so Dave can reply.";
  else if (!isValidEmail(i.email)) e.email = "That email doesn't look right. Example: you@example.com";
  const digits = i.phone.replace(/\D/g, "");
  if (i.phone.trim() && (digits.length < 10 || digits.length > 15))
    e.phone = "Please enter a 10-digit phone number, or leave it blank.";
  if (i.contactPref !== "Email" && i.contactPref && !i.phone.trim())
    e.phone = `Add a phone number, or choose "Email" as how to reach you.`;
  if (!i.service) e.service = "Please choose the type of work.";
  const details = i.details.trim();
  if (!details) e.details = "Please describe the job in a sentence or two.";
  else if (details.length < 10) e.details = "A little more detail helps Dave quote accurately.";
  else if (details.length > LIMITS.details) e.details = `Please keep this under ${LIMITS.details} characters.`;
  return e;
}

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const ACCESS_KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Web3Forms access keys are UUIDs. An empty or malformed key means setup isn't finished. */
export function isValidAccessKey(key: string) {
  return ACCESS_KEY_RE.test(key.trim());
}

export function inquirySubject(businessName: string) {
  return `New Free Quote Request — ${businessName}`;
}

export function formatTimestamp(d: Date, timeZone: string) {
  const local = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
  return `${local} (${d.toISOString()})`;
}

/**
 * The JSON body sent to Web3Forms. The recipient is fixed by the access key
 * (created for the owner's inbox), so nothing here can redirect the email.
 * Non-special keys appear in the notification email as labeled lines, in order.
 */
export function buildWeb3FormsPayload(
  i: Inquiry,
  opts: { accessKey: string; businessName: string; submittedAt: Date; timeZone: string; pageUrl: string },
): Record<string, string> {
  if (!isValidAccessKey(opts.accessKey)) throw new Error("WEB3FORMS_ACCESS_KEY is missing or invalid.");
  const email = oneLine(i.email);
  return {
    access_key: opts.accessKey.trim(),
    subject: inquirySubject(opts.businessName),
    from_name: `${opts.businessName} Website`,
    replyto: email,
    Business: opts.businessName,
    "Submitted at": formatTimestamp(opts.submittedAt, opts.timeZone),
    Name: oneLine(i.name),
    // Web3Forms also uses a field named "email" as the reply-to address.
    email,
    Phone: oneLine(i.phone) || "Not provided",
    "Preferred contact": oneLine(i.contactPref) || "Not specified",
    "Service requested": oneLine(i.service),
    "Neighborhood / ZIP": oneLine(i.location) || "Not provided",
    "Project details": i.details.replace(/\r\n?/g, "\n").trim(),
    "Sent from": opts.pageUrl,
  };
}

export type SubmitOutcome =
  | { ok: true }
  | { ok: false; reason: "rate-limited" | "rejected" | "network"; detail?: string };

/** Interprets Web3Forms' reply ({ success: boolean, message }). */
export function interpretWeb3FormsResponse(status: number, body: unknown): SubmitOutcome {
  const b = (body ?? {}) as { success?: unknown; message?: unknown };
  const message = typeof b.message === "string" ? b.message : undefined;
  if (status >= 200 && status < 300 && b.success === true) return { ok: true };
  if (status === 429) return { ok: false, reason: "rate-limited", detail: message };
  return { ok: false, reason: "rejected", detail: message ?? `HTTP ${status}` };
}
