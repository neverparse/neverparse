import productsData from "@/registry/products.json";

export interface ProductEndpoint {
  method: string;
  path: string;
  description: string;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: "active" | "beta" | "archived" | "candidate-archive";
  version: string;
  category: string;
  endpoints: ProductEndpoint[];
  examples: {
    curl: string;
    typescript: string;
    python: string;
  };
  pricing: string;
  metrics: {
    requests: number;
    errors: number;
    avgLatencyMs: number;
    signups: number;
  };
  validation: {
    githubStars: number;
    ctaClicks: number;
    apiCalls: number;
    lastChecked: string | null;
  };
  deploy: {
    platform: string;
    url: string | null;
    lastDeployed: string | null;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Registry {
  products: Product[];
  config: {
    killThresholds: {
      minApiCallsPerWeek: number;
      minSignupsPerMonth: number;
      maxErrorRate: number;
      evaluationWindowDays: number;
    };
    validationSchedule: string;
  };
}

export function getRegistry(): Registry {
  return productsData as Registry;
}

export function getProducts(): Product[] {
  return getRegistry().products;
}

export function getActiveProducts(): Product[] {
  return getProducts().filter(
    (p) => p.status === "active" || p.status === "beta"
  );
}

export function getProduct(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}
