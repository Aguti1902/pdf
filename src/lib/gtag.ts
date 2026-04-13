// Google Analytics + Ads measurement helpers
// AW conversion label: get it from Google Ads → Goals → Conversions → select action → Tag setup
const ADS_ID          = "AW-18057514661";
const CONVERSION_LABEL = "V2oKCJfnspscEKWdv6JD";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Fire a Google Ads conversion event after successful payment */
export function fireConversion(value: number, currency: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (!CONVERSION_LABEL) {
    // No label yet — at least log a GA4 purchase event
    window.gtag("event", "purchase", {
      currency,
      value,
      transaction_id: Date.now().toString(),
    });
    return;
  }
  window.gtag("event", "conversion", {
    send_to: `${ADS_ID}/${CONVERSION_LABEL}`,
    value,
    currency,
    transaction_id: Date.now().toString(),
  });
}

/** Generic GA4 event helper */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
