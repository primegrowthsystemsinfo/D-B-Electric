// ─────────────────────────────────────────────────────────────────────────────
//  CLIENT CONFIGURATION — the only file you need to edit per client.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BUSINESS_OWNER_EMAIL
 * The inbox that receives every "Get My Free Quote" inquiry. Kept here as the
 * record of which inbox WEB3FORMS_ACCESS_KEY was created for. It is not sent
 * anywhere and does not appear on the page.
 */
export const BUSINESS_OWNER_EMAIL = "gisa37730@gmail.com";

/**
 * WEB3FORMS_ACCESS_KEY
 * Delivery runs through Web3Forms (https://web3forms.com). Each access key is
 * created for ONE inbox and Web3Forms emails every submission to that inbox,
 * so the key alone decides the recipient: nothing a visitor types can change it.
 * Web3Forms designs the key to be public (it's an alias for the inbox, not a
 * password), so it is safe in website code.
 *
 * Setup per client: create a key at https://web3forms.com using
 * BUSINESS_OWNER_EMAIL, paste it below (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx),
 * and redeploy. A new client needs a new key made with THEIR email; never
 * reuse another client's key, or their inquiries would go to the wrong inbox.
 */
export const WEB3FORMS_ACCESS_KEY = "";

// PUBLIC business facts (from the Google Business listing). Safe to ship.
export const SITE = {
  // Public address of the live site (no trailing slash). The GitHub Pages build
  // overrides it with VITE_SITE_URL so links and previews point at that copy.
  siteUrl: (import.meta.env?.VITE_SITE_URL as string | undefined) || "https://db-electric-vegas.higgsfield.app",
  name: "D & B Electric",
  owner: "Dave",
  phoneDisplay: "(702) 870-7310",
  phoneE164: "+17028707310",
  timeZone: "America/Los_Angeles",
  address: {
    street: "4310 N Tioga Way",
    city: "Las Vegas",
    region: "NV",
    postalCode: "89129",
    country: "US",
  },
  plusCode: "6PQV+XH Las Vegas, Nevada",
  mapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=D+%26+B+Electric+4310+N+Tioga+Way+Las+Vegas+NV+89129",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=4310+N+Tioga+Way%2C+Las+Vegas%2C+NV+89129",
} as const;
