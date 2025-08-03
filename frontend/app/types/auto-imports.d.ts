// Auto-imports for composables and Nuxt functions
declare global {
  // Custom composables
  const useAuth: typeof import("../composables/useAuth").useAuth;
  const useApi: typeof import("../composables/useApi").useApi;
  const useCsrf: typeof import("../composables/useCsrf").useCsrf;
  const useApiCache: typeof import("../composables/useApiCache").useApiCache;

  // Nuxt configuration
  const defineNuxtConfig: typeof import("nuxt/config").defineNuxtConfig;

  // Additional Nuxt functions that might not be auto-imported
  const definePageMeta: (meta: any) => void;
  const defineNuxtRouteMiddleware: typeof import("#app")["defineNuxtRouteMiddleware"];
}

export {};
