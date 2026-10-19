import { createFileRoute } from "@tanstack/react-router";

import { StructuredData } from "../components/StructuredData";
import { Hero, Nav } from "../components/site/hero";
import { useParallax, useReveal } from "../components/site/motion";
import { Contact, Footer, MeetDave, Process, Quote, Reviews, Services, TrustBar } from "../components/site/sections";
import { SITE } from "../site.config";
import { publicUrl } from "../lib/paths";

const TITLE = "D & B Electric | Electrician in Las Vegas, NV · Free Quotes";
const DESCRIPTION =
  "EV charger circuits, outlets, GFCIs, breakers and lighting for Las Vegas homes from Dave at D & B Electric. Call (702) 870-7310 or get a free quote.";
const OG = `${SITE.siteUrl}/assets/og.jpg`;

// Only facts present on the business's Google listing are included.
const LOCAL_BUSINESS_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Electrician",
  name: SITE.name,
  url: `${SITE.siteUrl}/`,
  telephone: SITE.phoneE164,
  image: OG,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  areaServed: { "@type": "City", name: "Las Vegas" },
  hasMap: SITE.mapsSearchUrl,
  potentialAction: { "@type": "QuoteAction", target: `${SITE.siteUrl}/#quote` },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE.siteUrl}/` },
      { property: "og:image", content: OG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "D & B Electric, electrician in Las Vegas" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG },
      { name: "geo.region", content: "US-NV" },
      { name: "geo.placename", content: "Las Vegas" },
    ],
    links: [
      { rel: "canonical", href: `${SITE.siteUrl}/` },
      { rel: "preload", as: "image", href: publicUrl("assets/hero-poster.jpg"), fetchPriority: "high" },
    ],
  }),
  component: Index,
});

function Index() {
  useParallax();
  useReveal();
  return (
    <>
      <StructuredData json={LOCAL_BUSINESS_JSON} />
      <Nav />
      <main id="main">
        <Hero />
        <TrustBar />
        <Services />
        <MeetDave />
        <Process />
        <Reviews />
        <Quote />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
