import { useEffect } from "react";

/**
 * Transform-only scroll parallax (rAF-throttled, passive listeners).
 * Any element with data-parallax="<depth>" moves on scroll:
 *  - data-parallax-mode="hero": translateY = scrollY * depth
 *  - default: offset relative to its parent's position in the viewport.
 * Disabled under prefers-reduced-motion; depth is halved on phones.
 */
export function useParallax() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (!els.length) return;
    let ticking = false;
    let scale = window.innerWidth < 768 ? 0.5 : 1;
    const update = () => {
      ticking = false;
      if (mq.matches) return;
      const vh = window.innerHeight;
      const y = window.scrollY;
      for (const el of els) {
        const depth = parseFloat(el.dataset.parallax ?? "0") * scale;
        if (!depth) continue;
        if (el.dataset.parallaxMode === "hero") {
          if (y > vh * 1.3) continue;
          el.style.transform = `translate3d(0, ${(y * depth).toFixed(1)}px, 0)`;
          continue;
        }
        const anchor = el.parentElement ?? el;
        const r = anchor.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) continue;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * depth).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      scale = window.innerWidth < 768 ? 0.5 : 1;
      onScroll();
    };
    const onMotionChange = () => {
      if (mq.matches) for (const el of els) el.style.transform = "";
      else onScroll();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    mq.addEventListener?.("change", onMotionChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener?.("change", onMotionChange);
      for (const el of els) el.style.transform = "";
    };
  }, []);
}

/** Fades .reveal elements in once as they enter the viewport. */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
