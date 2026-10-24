import { EVENT_CONFIG } from "./event-config";

/**
 * Single source of truth for the images the UI imports.
 *
 * The logo currently lives in `public/`, so it is referenced by URL path.
 * When the final logo is ready, replace `public/logo.webp` — nothing else
 * needs to change.
 */
export const SITE_ASSETS = {
  logo: {
    src: "/logo.webp",
    alt: `${EVENT_CONFIG.institution} logo`,
    width: 250,
    height: 250,
  },
  campusBackdrop: {
    src: "/nit-patna-background.jpg",
    alt: `${EVENT_CONFIG.institution} campus`,
  },
  paymentQr: {
    // Owner-supplied UPI/NEFT QR. Empty until the organiser provides it;
    // the payment step renders a placeholder when this is blank.
    src: "",
    alt: "Payment QR code",
  },
} as const;

export type SiteAsset = (typeof SITE_ASSETS)[keyof typeof SITE_ASSETS];
