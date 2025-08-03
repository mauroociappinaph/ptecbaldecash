/**
 * Nuxt 3 auto-imports type declarations
 */

// Re-export all Nuxt auto-imports for better TypeScript support
export * from "#app";
export * from "@vueuse/core";
export * from "nuxt-auth-utils";
export * from "vue";

// Ensure global types are available
declare global {
  // Process meta for client-side detection
  interface ImportMeta {
    client: boolean;
    server: boolean;
  }
}
