// Run from app/:  bun scripts/test-inquiry.ts
// Pure tests for the Web3Forms quote form (no network).
import { BUSINESS_OWNER_EMAIL, SITE, WEB3FORMS_ACCESS_KEY } from "../src/site.config";
import {
  EMPTY_INQUIRY,
  WEB3FORMS_ENDPOINT,
  buildWeb3FormsPayload,
  interpretWeb3FormsResponse,
  isValidAccessKey,
  isValidEmail,
  validateInquiry,
  type Inquiry,
} from "../src/lib/inquiry/inquiry";

let pass = 0;
let fail = 0;
const ok = (cond: unknown, name: string) => {
  if (cond) { pass++; console.log("PASS", name); } else { fail++; console.log("FAIL", name); }
};
const TEST_KEY = "123e4567-e89b-12d3-a456-426614174000";

// Configuration
ok(isValidEmail(BUSINESS_OWNER_EMAIL), "BUSINESS_OWNER_EMAIL is a valid address");
if (WEB3FORMS_ACCESS_KEY) ok(isValidAccessKey(WEB3FORMS_ACCESS_KEY), "WEB3FORMS_ACCESS_KEY is a valid key");
else console.log("WARN  WEB3FORMS_ACCESS_KEY is empty: the live form will show an error until it is set");
ok(WEB3FORMS_ENDPOINT === "https://api.web3forms.com/submit", "endpoint is Web3Forms over HTTPS");
ok(!isValidAccessKey("") && !isValidAccessKey("abc") && isValidAccessKey(TEST_KEY), "access key format is checked");

// Validation
const blank = validateInquiry(EMPTY_INQUIRY);
ok(blank.name && blank.email && blank.service && blank.details && blank.phone, "empty form → required-field errors");
ok(validateInquiry({ ...EMPTY_INQUIRY, email: "nope@" }).email?.includes("doesn't look right"), "invalid email rejected");
ok(validateInquiry({ ...EMPTY_INQUIRY, phone: "123" }).phone, "short phone rejected");
const emailOnly: Inquiry = { name: "Jo Doe", email: "jo@example.com", phone: "", service: "Something else", location: "", contactPref: "Email", details: "Replace a dead outlet." };
ok(Object.keys(validateInquiry(emailOnly)).length === 0, "phone optional when preferred contact is Email");

// Payload
const tricky: Inquiry = {
  name: "Ana O'Neil & Sons\r\nBcc: evil@x.com",
  email: " ana+quotes@example.com ",
  phone: "(702) 555-0199",
  service: "EV charger / 240V circuit",
  location: "Summerlin 89135",
  contactPref: "Text message",
  details: "Need 240V for a Level 2 charger, 50A?\r\nGarage is 20' from panel. Café ⚡ & more=yes? #2",
};
ok(Object.keys(validateInquiry(tricky)).length === 0, "tricky but valid inquiry passes validation");
const at = new Date("2026-10-18T22:52:00Z");
const opts = { accessKey: TEST_KEY, businessName: SITE.name, submittedAt: at, timeZone: SITE.timeZone, pageUrl: SITE.siteUrl + "/" };
const p = buildWeb3FormsPayload(tricky, opts);
ok(p.access_key === TEST_KEY, "access key (which fixes the recipient) is sent");
ok(p.subject === "New Free Quote Request — D & B Electric", "subject is 'New Free Quote Request — D & B Electric'");
ok(p.from_name === "D & B Electric Website", "sender name shows the business");
ok(p.replyto === "ana+quotes@example.com" && p.email === "ana+quotes@example.com", "validated customer email is the Reply-To (trimmed)");
ok(!("ccemail" in p) && !("redirect" in p) && !("webhook" in p), "no extra recipients, redirects or webhooks");
ok(!Object.values(p).some((v) => v.includes(BUSINESS_OWNER_EMAIL)), "owner's email is never in the payload");
ok(p.Business === "D & B Electric", "business name included");
ok(p["Submitted at"] === "Sun, Oct 18, 2026, 3:52 PM PDT (2026-10-18T22:52:00.000Z)", `timestamp in business time zone: ${p["Submitted at"]}`);
ok(p.Name === "Ana O'Neil & Sons Bcc: evil@x.com", "single-line fields have line breaks stripped");
ok(p.Phone === "(702) 555-0199" && p["Preferred contact"] === "Text message", "phone and contact preference included");
ok(p["Service requested"] === "EV charger / 240V circuit" && p["Neighborhood / ZIP"] === "Summerlin 89135", "service and location included");
ok(p["Project details"] === "Need 240V for a Level 2 charger, 50A?\nGarage is 20' from panel. Café ⚡ & more=yes? #2", "project details kept intact (unicode, symbols, line breaks)");
const roundTrip = JSON.parse(JSON.stringify(p)) as Record<string, string>;
ok(Object.keys(p).every((k) => roundTrip[k] === p[k]), "every field survives JSON encoding unchanged");
const emptyOpt = buildWeb3FormsPayload(emailOnly, opts);
ok(emptyOpt.Phone === "Not provided" && emptyOpt["Neighborhood / ZIP"] === "Not provided", "blank optional fields read 'Not provided'");
let threw = false;
try { buildWeb3FormsPayload(tricky, { ...opts, accessKey: "" }); } catch { threw = true; }
ok(threw, "missing access key refuses to send instead of failing silently");

// Response handling
ok(interpretWeb3FormsResponse(200, { success: true, message: "Email sent successfully!" }).ok, "success response → sent");
ok(!interpretWeb3FormsResponse(200, { success: "true" }).ok, "only a real boolean success counts as sent");
const bad = interpretWeb3FormsResponse(400, { success: false, message: "Invalid access key" });
ok(!bad.ok && bad.reason === "rejected", "invalid key → failure, values kept");
const slow = interpretWeb3FormsResponse(429, { success: false, message: "Too many requests" });
ok(!slow.ok && slow.reason === "rate-limited", "rate limit → 'try again in a minute'");
ok(!interpretWeb3FormsResponse(500, null).ok, "server error → failure");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
