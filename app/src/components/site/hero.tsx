import { useEffect, useRef, useState } from "react";

import { SITE } from "../../site.config";
import { publicUrl } from "../../lib/paths";

const POSTER = publicUrl("assets/hero-poster.jpg");

function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (reduce || conn?.saveData) return; // poster only: no bytes spent on motion
    const slow = /(^|\b)(2g|3g)\b/.test(conn?.effectiveType ?? "");
    const small = window.innerWidth < 900 || slow;
    v.muted = true;
    v.defaultMuted = true;
    v.src = publicUrl(small ? "assets/hero-720.mp4" : "assets/hero-1080.mp4");
    let cancelled = false;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(() => !cancelled && setPlaying(true)).catch(() => !cancelled && setPlaying(false));
      }
    };
    const onPlaying = () => setPlaying(true);
    const onError = () => setPlaying(false);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onError);
    v.load();
    tryPlay();
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([e]) => (e?.isIntersecting ? tryPlay() : v.pause()), { threshold: 0.05 })
        : null;
    io?.observe(v);
    const onVis = () => (document.hidden ? v.pause() : tryPlay());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onError);
      v.pause();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img src={POSTER} alt="" width={1920} height={1080} fetchPriority="high" decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[62%_50%]" />
      <video ref={ref} muted loop playsInline autoPlay preload="none" poster={POSTER}
        disablePictureInPicture disableRemotePlayback tabIndex={-1} data-hero-video
        className="absolute inset-0 h-full w-full object-cover object-[62%_50%] transition-opacity duration-700"
        style={{ opacity: playing ? 1 : 0 }} />
    </div>
  );
}

export function Bolt({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M13.2 2 4.5 13.4h6.3L9.6 22l9.9-12.6h-6.6L13.2 2z" fill="currentColor" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden" style={{ background: "var(--ink)", minHeight: "min(100svh, 980px)" }}>
      {/* depth 1: film — slowest */}
      <div data-parallax="0.35" data-parallax-mode="hero" className="absolute inset-0">
        <div className="absolute inset-0" style={{ transform: "scale(1.1)", transformOrigin: "50% 35%" }}>
          <HeroVideo />
        </div>
      </div>
      {/* depth 2: atmosphere + glow */}
      <div data-parallax="0.18" data-parallax-mode="hero" className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(8,13,24,0.86) 0%, rgba(8,13,24,0.55) 38%, rgba(8,13,24,0.05) 70%), linear-gradient(180deg, rgba(8,13,24,0.5) 0%, rgba(8,13,24,0) 30%, rgba(8,13,24,0) 70%, rgba(8,13,24,0.95) 100%)" }} />
      {/* depth 3: copy — drifts up, fastest */}
      <div className="relative flex min-h-[min(100svh,980px)] flex-col">
        <div className="wrap flex flex-1 flex-col justify-end pb-16 pt-32 text-[var(--paper)] md:justify-center md:pb-20 md:pt-40">
          <div data-parallax="-0.14" data-parallax-mode="hero" className="max-w-2xl">
            <p className="eyebrow inline-flex items-center gap-2"><Bolt size={14} /> Electrician · Northwest Las Vegas</p>
            <h1 className="font-display mt-5 text-[clamp(2.9rem,8.4vw,6.4rem)] text-balance">
              Wired right.<br /><span className="glow-text">Priced fair.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--paper-2)] md:text-xl">
              Outlets, GFCIs, breakers and 240V EV charger circuits for Las Vegas homes, from Dave — a
              tradesman his customers keep recommending.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a href="#quote" className="btn-quote">
                Get My Free Quote
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a href={`tel:${SITE.phoneE164}`} className="btn-call">Call {SITE.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full sm:h-9 sm:w-9" style={{ background: "var(--amber)", color: "var(--ink)" }}>
        <Bolt size={18} />
      </span>
      <span className="font-display hidden text-[1.05rem] leading-none tracking-tight min-[360px]:inline sm:text-[1.35rem]">D&nbsp;&amp;&nbsp;B Electric</span>
    </span>
  );
}

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["#services", "Services"], ["#dave", "About"], ["#reviews", "Reviews"], ["#contact", "Contact"]] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      style={{ background: solid ? "rgba(8,13,24,0.9)" : "transparent", backdropFilter: solid ? "blur(10px)" : "none", borderBottom: solid ? "1px solid rgba(246,243,236,0.1)" : "1px solid transparent" }}>
      <a href="#quote" className="skip-link">Skip to quote form</a>
      <nav className="wrap flex h-[4.5rem] items-center justify-between gap-4 text-[var(--paper)]" aria-label="Primary">
        <a href="#top" aria-label="D & B Electric, back to top"><Logo /></a>
        <ul className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {links.map(([href, label]) => (
            <li key={href}><a href={href} className="opacity-80 transition-opacity hover:opacity-100">{label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <a href={`tel:${SITE.phoneE164}`} className="btn-call hidden text-sm md:inline-flex">{SITE.phoneDisplay}</a>
          <a href="#quote" className="btn-quote nav-cta whitespace-nowrap">Get My Free Quote</a>
        </div>
      </nav>
    </header>
  );
}
