export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  action: string,
  params?: Record<string, string | number>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

export function trackProductView(slug: string) {
  trackEvent("product_view", { product: slug });
}

export function trackCtaClick(slug: string, cta: string) {
  trackEvent("cta_click", { product: slug, cta_type: cta });
}

export function trackApiCall(slug: string, endpoint: string) {
  trackEvent("api_call", { product: slug, endpoint });
}

export function trackTryIt(slug: string) {
  trackEvent("try_it_used", { product: slug });
}
