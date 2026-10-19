import type { ReactNode } from "react";

import { SITE } from "../../site.config";
import { Bolt, Logo } from "./hero";
import { QuoteForm } from "./quote-form";
import { publicUrl } from "../../lib/paths";

function Icon({ d }: { d: ReactNode }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
  );
}

export function TrustBar() {
  const items = [
    ["Recommended by neighbors", "See what customers say below"],
    ["Clear, upfront quotes", "Know the price before work starts"],
    ["Easy to pay", "Customers mention paying by Zelle"],
    ["Local to the valley", "Based in northwest Las Vegas, 89129"],
  ] as const;
  return (
    <section aria-label="Why customers choose D & B Electric" className="relative z-10" style={{ background: "var(--ink)" }}>
      <ul className="wrap grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 md:grid-cols-4" style={{ background: "rgba(246,243,236,0.08)", transform: "translateY(-1px)" }}>
        {items.map(([t, s]) => (
          <li key={t} className="p-5 md:p-6" style={{ background: "var(--ink)" }}>
            <p className="font-bold text-[var(--paper)]">{t}</p>
            <p className="mt-1 text-sm text-[var(--paper-3)]">{s}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const SERVICES: { title: string; body: string; icon: ReactNode }[] = [
  { title: "EV charger circuits", body: "A dedicated 240V circuit so your car charges at full speed in your own garage.",
    icon: <><rect x="5" y="3" width="10" height="15" rx="2" /><path d="M10 7.5 8.5 10.5h3L10 13.5" /><path d="M15 9h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0" /><path d="M5 21h10" /></> },
  { title: "Outlets & GFCI", body: "New outlets where you actually need them, plus GFCI protection for kitchens, baths, garages and yards.",
    icon: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M10 8v2.5M14 8v2.5" /><path d="M10.5 15.5a1.5 1.5 0 0 1 3 0V17h-3z" /></> },
  { title: "Breakers & panels", body: "Breakers that keep tripping, worn-out breakers, and new circuits added the right way.",
    icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h3M8 11h3M8 15h3M13 7h3M13 11h3M13 15h3" /></> },
  { title: "Lighting & fixtures", body: "Light fixtures, ceiling fans, switches and exterior lighting, installed cleanly.",
    icon: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z" /></> },
  { title: "Troubleshooting", body: "Dead outlets, flickering lights or something that just isn't right — tracked down and fixed.",
    icon: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /><path d="M11.6 8 9.8 11.2h2.4L10.4 14" /></> },
  { title: "Small jobs, too", body: "One outlet or one fixture is still worth a call. Describe it in the form and get a quote.",
    icon: <><path d="M14.5 5.5a3.5 3.5 0 0 0-4.7 4.4L4 15.7 6.3 18l5.8-5.8a3.5 3.5 0 0 0 4.4-4.7l-2 2-2-.5-.5-2z" /></> },
];

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24 md:py-32">
      {/* decorative circuit traces — mid depth */}
      <svg data-parallax="0.12" className="pointer-events-none absolute -right-24 top-10 h-[640px] w-[640px] opacity-[0.5]" viewBox="0 0 400 400" aria-hidden="true">
        <g fill="none" stroke="var(--paper-3)" strokeWidth="1.2">
          <path d="M20 60h140l40 40h180M20 140h90l40 40h230M60 220h160l30-30h130M20 300h220l40 40h100" />
          <circle cx="160" cy="60" r="4" /><circle cx="110" cy="140" r="4" /><circle cx="220" cy="220" r="4" /><circle cx="240" cy="300" r="4" />
        </g>
      </svg>
      <div className="wrap relative">
        <div className="reveal max-w-2xl">
          <p className="eyebrow">What Dave does</p>
          <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-balance">Residential electrical work, done properly the first time.</h2>
          <p className="mt-5 text-lg text-[var(--mute)]">The jobs customers call about most, from quick fixes to new circuits.</p>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <li key={s.title} className="reveal service-card" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
              <span className="service-icon"><Icon d={s.icon} /></span>
              <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-[var(--mute)]">{s.body}</p>
            </li>
          ))}
        </ul>
        <p className="reveal mt-10 text-[var(--mute)]">
          Don't see your job listed? <a href="#quote" className="link">Describe it in the quote form</a> or call{" "}
          <a href={`tel:${SITE.phoneE164}`} className="link">{SITE.phoneDisplay}</a>.
        </p>
      </div>
    </section>
  );
}

export function MeetDave() {
  return (
    <section id="dave" className="relative isolate overflow-hidden text-[var(--paper)]" style={{ background: "var(--ink)" }}>
      {/* depth 1: photo band */}
      <div data-parallax="0.22" className="absolute -inset-y-[18%] inset-x-0" aria-hidden="true">
        <img src={publicUrl("assets/band.webp")} alt="" loading="lazy" decoding="async" width={1600} height={900} className="h-full w-full object-cover object-[30%_50%]" />
      </div>
      {/* depth 2: tint */}
      <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(90deg, rgba(8,13,24,0.25) 0%, rgba(8,13,24,0.7) 45%, rgba(8,13,24,0.94) 70%)" }} />
      {/* depth 3: glow orb */}
      <div data-parallax="-0.12" className="pointer-events-none absolute right-[8%] top-[20%] h-72 w-72 rounded-full blur-3xl" aria-hidden="true" style={{ background: "radial-gradient(circle, rgba(243,168,59,0.35), transparent 70%)" }} />
      <div className="wrap relative grid py-28 md:grid-cols-12 md:py-40">
        <div className="reveal md:col-span-6 md:col-start-7">
          <p className="eyebrow">Meet Dave</p>
          <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-balance">Decades at the trade. Fair about the bill.</h2>
          <p className="mt-6 text-lg leading-relaxed text-[var(--paper-2)]">
            D &amp; B Electric is Dave's shop. Customers on Google describe a tradesman who has spent decades perfecting
            the craft, does the job efficiently, and doesn't charge an arm and a leg for it.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[var(--paper-2)]">
            One customer added a tip to their payment — and Dave made sure they knew they'd sent more than the quote.
            That's the kind of electrician you want in your house.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="#quote" className="btn-quote">Get My Free Quote</a>
            <a href={`tel:${SITE.phoneE164}`} className="btn-call">Call {SITE.phoneDisplay}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const steps = [
    ["Tell Dave about the job", "Send the quote form or call. A sentence or two about the job is plenty."],
    ["Get a clear quote", "You'll know what the work costs before anything starts — customers mention flat-rate pricing."],
    ["The work gets done right", "Clean, efficient installation by an experienced electrician."],
    ["Pay the easy way", "Customers mention paying quickly by Zelle once the job was done."],
  ] as const;
  return (
    <section id="process" className="py-24 md:py-32" style={{ background: "var(--paper-2)" }}>
      <div className="wrap">
        <div className="reveal max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.8rem)]">Simple from first call to final switch.</h2>
        </div>
        <ol className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map(([t, b], i) => (
            <li key={t} className="reveal relative border-t-2 pt-6" style={{ borderColor: "var(--ink)", transitionDelay: `${i * 80}ms` }}>
              <span className="font-display text-5xl" style={{ color: "var(--amber-2)" }}>0{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold">{t}</h3>
              <p className="mt-2 leading-relaxed text-[var(--mute)]">{b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const REVIEWS = [
  { quote: "Dave is awesome. You need work done, call this guy.", who: "F J", meta: "Local Guide · Google review" },
  { quote: "He installed a 240v for my EV charger and it was the perfect experience.", who: "Google reviewer", meta: "Google review" },
  { quote: "We thoroughly recommend you choose Dave for a good job at a low price.", who: "J K", meta: "Local Guide · Google review" },
] as const;

export function Reviews() {
  return (
    <section id="reviews" className="py-24 md:py-32">
      <div className="wrap">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Reviews</p>
            <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.8rem)]">"Great service for a great price."</h2>
          </div>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <li key={r.quote} className="reveal review-card" style={{ transitionDelay: `${i * 80}ms` }}>
              <blockquote className="text-xl leading-snug">“{r.quote}”</blockquote>
              <p className="mt-6 text-sm"><span className="font-bold">{r.who}</span> <span className="text-[var(--mute)]">· {r.meta}</span></p>
            </li>
          ))}
        </ul>
        <a href={SITE.mapsSearchUrl} target="_blank" rel="noopener" className="reveal link mt-10 inline-block font-semibold">
          Read more reviews on Google ↗
        </a>
      </div>
    </section>
  );
}

export function Quote() {
  return (
    <section id="quote" className="relative overflow-hidden py-24 md:py-32" style={{ background: "var(--ink)" }}>
      <div data-parallax="0.15" className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full blur-3xl" aria-hidden="true" style={{ background: "radial-gradient(circle, rgba(95,212,232,0.16), transparent 70%)" }} />
      <div className="wrap relative grid gap-12 lg:grid-cols-12">
        <div className="reveal text-[var(--paper)] lg:col-span-5">
          <p className="eyebrow">Free quote</p>
          <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-balance">Tell Dave what you need.</h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--paper-2)]">
            Send the form and your request goes straight to Dave. Prefer to talk? Call directly.
          </p>
          <a href={`tel:${SITE.phoneE164}`} className="mt-8 inline-flex items-center gap-3 text-2xl font-bold text-[var(--paper)] hover:text-[var(--amber)]">
            <Bolt className="text-[var(--amber)]" size={22} /> {SITE.phoneDisplay}
          </a>
        </div>
        <div className="reveal lg:col-span-7">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="py-24 md:py-28" style={{ background: "var(--paper-2)" }}>
      <div className="wrap grid gap-10 md:grid-cols-3">
        <div className="reveal">
          <p className="eyebrow">Call</p>
          <a href={`tel:${SITE.phoneE164}`} className="font-display mt-3 block text-3xl hover:text-[var(--amber-2)]">{SITE.phoneDisplay}</a>
          <p className="mt-2 text-[var(--mute)]">Call for availability and scheduling.</p>
        </div>
        <div className="reveal">
          <p className="eyebrow">Find us</p>
          <address className="mt-3 not-italic text-lg leading-relaxed">
            {SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}
          </address>
          <a href={SITE.mapsDirectionsUrl} target="_blank" rel="noopener" className="link mt-2 inline-block font-semibold">Get directions ↗</a>
        </div>
        <div className="reveal">
          <p className="eyebrow">Service area</p>
          <p className="mt-3 text-lg leading-relaxed">Homes across the Las Vegas valley, from our base in the northwest part of town.</p>
          <p className="mt-2 text-[var(--mute)]">Not sure if you're in range? Just ask.</p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 text-[var(--paper-2)]" style={{ background: "var(--ink)" }}>
      <div className="wrap flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="text-[var(--paper)]"><Logo /></div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="#services" className="hover:text-[var(--paper)]">Services</a>
          <a href="#reviews" className="hover:text-[var(--paper)]">Reviews</a>
          <a href="#quote" className="hover:text-[var(--paper)]">Free quote</a>
          <a href={`tel:${SITE.phoneE164}`} className="hover:text-[var(--paper)]">{SITE.phoneDisplay}</a>
        </nav>
        <p className="text-sm text-[var(--paper-3)]">© {new Date().getFullYear()} D &amp; B Electric · {SITE.address.city}, {SITE.address.region}</p>
      </div>
    </footer>
  );
}
