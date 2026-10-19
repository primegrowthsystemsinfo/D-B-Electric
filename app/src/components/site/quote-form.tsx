import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { SITE, WEB3FORMS_ACCESS_KEY } from "../../site.config";
import {
  CONTACT_OPTIONS,
  EMPTY_INQUIRY,
  LIMITS,
  SERVICE_OPTIONS,
  WEB3FORMS_ENDPOINT,
  buildWeb3FormsPayload,
  interpretWeb3FormsResponse,
  validateInquiry,
  type Inquiry,
  type InquiryErrors,
  type SubmitOutcome,
} from "../../lib/inquiry/inquiry";

const DRAFT_KEY = "db-electric-quote-draft";
const ORDER: (keyof Inquiry)[] = ["name", "email", "phone", "contactPref", "service", "location", "details"];
const TIMEOUT_MS = 20000;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string } | { kind: "failed"; outcome: SubmitOutcome };

export function QuoteForm() {
  const [values, setValues] = useState<Inquiry>(EMPTY_INQUIRY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honey, setHoney] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Restore an unsent draft (e.g. the page was reloaded after an error).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setValues({ ...EMPTY_INQUIRY, ...(JSON.parse(raw) as Partial<Inquiry>) });
    } catch { /* storage unavailable — fine */ }
  }, []);

  const update = (k: keyof Inquiry) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (status.kind === "failed" || status.kind === "sent") setStatus({ kind: "idle" });
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: validateInquiry(next)[k] }));
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const focusPanel = () => requestAnimationFrame(() => panelRef.current?.focus());

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    const errs = validateInquiry(values);
    setErrors(errs);
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "sending" });
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let outcome: SubmitOutcome;
    try {
      // Spam trap: real visitors never fill the hidden field. Bots get a fake success.
      if (honey.trim()) {
        outcome = { ok: true };
      } else {
        const payload = buildWeb3FormsPayload(values, {
          accessKey: WEB3FORMS_ACCESS_KEY,
          businessName: SITE.name,
          submittedAt: new Date(),
          timeZone: SITE.timeZone,
          pageUrl: window.location.origin + window.location.pathname,
        });
        const res = await fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        const body = await res.json().catch(() => null);
        outcome = interpretWeb3FormsResponse(res.status, body);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      // A missing/invalid access key is a setup problem, not the visitor's connection.
      outcome = { ok: false, reason: /ACCESS_KEY/.test(detail) ? "rejected" : "network", detail };
    } finally {
      window.clearTimeout(timer);
    }

    if (outcome.ok) {
      setStatus({ kind: "sent", name: values.name.trim().split(/\s+/)[0] ?? "" });
      setValues(EMPTY_INQUIRY);
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    } else {
      // Recoverable: keep everything the customer typed.
      setStatus({ kind: "failed", outcome });
      if (outcome.reason !== "network") console.warn("Quote form not delivered:", outcome.detail);
    }
    focusPanel();
  };

  const err = (k: keyof Inquiry) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {});
  const msg = (k: keyof Inquiry) => errors[k] ? <p id={`${k}-error`} className="error">{errors[k]}</p> : null;
  const sending = status.kind === "sending";

  return (
    <div className="form-card">
      <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-note" aria-busy={sending} className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="name">Your name <span aria-hidden="true">*</span></label>
          <input id="name" name="name" autoComplete="name" required maxLength={LIMITS.name} value={values.name} onChange={update("name")} {...err("name")} />
          {msg("name")}
        </div>
        <div className="field">
          <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={LIMITS.email} value={values.email} onChange={update("email")} {...err("email")} />
          {msg("email")}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone <span className="hint">(optional if you choose email)</span></label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phone} value={values.phone} onChange={update("phone")} {...err("phone")} />
          {msg("phone")}
        </div>
        <div className="field">
          <label htmlFor="contactPref">Best way to reach you</label>
          <select id="contactPref" name="contactPref" value={values.contactPref} onChange={update("contactPref")}>
            {CONTACT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="service">Type of work <span aria-hidden="true">*</span></label>
          <select id="service" name="service" required value={values.service} onChange={update("service")} {...err("service")}>
            <option value="" disabled>Choose one…</option>
            {SERVICE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          {msg("service")}
        </div>
        <div className="field">
          <label htmlFor="location">Neighborhood or ZIP <span className="hint">(optional)</span></label>
          <input id="location" name="location" autoComplete="postal-code" maxLength={LIMITS.location} value={values.location} onChange={update("location")} placeholder="e.g. 89129" />
        </div>
        <div className="field sm:col-span-2">
          <label htmlFor="details">Project details <span aria-hidden="true">*</span></label>
          <textarea id="details" name="details" required maxLength={LIMITS.details} value={values.details} onChange={update("details")} {...err("details")}
            placeholder="e.g. Need a 240V outlet in the garage for a Level 2 EV charger. Panel is on the same wall." />
          <p className="hint">{values.details.length}/{LIMITS.details} · Please don't include payment details or passwords.</p>
          {msg("details")}
        </div>
        {/* Spam trap, hidden from people and screen readers */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="company-website">Leave this empty</label>
          <input id="company-website" name="botcheck" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-4 text-xs text-[var(--mute)]"><span aria-hidden="true">*</span> Required</p>
          <button type="submit" className="btn-quote on-light w-full sm:w-auto" disabled={sending} aria-disabled={sending}>
            Get My Free Quote
            {sending ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            )}
          </button>
          <p id="form-note" className="mt-3 text-sm text-[var(--mute)]">
            {sending ? "Sending your request…" : "Your request goes straight to Dave's inbox. He'll reply by your preferred contact method."}
          </p>
        </div>
      </form>

      <div ref={panelRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
        {status.kind === "sent" && (
          <div className="handoff handoff-ok mt-6" data-testid="sent">
            <p className="font-bold">Thanks{status.name ? `, ${status.name}` : ""}! Your quote request was sent.</p>
            <p className="mt-1 text-sm">
              It's on its way to D &amp; B Electric. Dave will get back to you soon. Need something urgent? Call{" "}
              <a href={`tel:${SITE.phoneE164}`} className="link font-semibold">{SITE.phoneDisplay}</a>.
            </p>
          </div>
        )}
        {status.kind === "failed" && (
          <div className="handoff mt-6" data-testid="failed" role="alert">
            <p className="font-bold">Your request didn't go through.</p>
            <p className="mt-1 text-sm">
              {status.outcome.ok === false && status.outcome.reason === "network"
                ? "We couldn't reach the server. Check your connection and try again."
                : status.outcome.ok === false && status.outcome.reason === "rate-limited"
                  ? "Too many requests were sent just now. Please wait a minute and try again."
                  : "Something went wrong on our end."}{" "}
              Your answers are still filled in above, so you can press <strong>Get My Free Quote</strong> again, or call instead.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href={`tel:${SITE.phoneE164}`} className="btn-ghost">Call {SITE.phoneDisplay}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
