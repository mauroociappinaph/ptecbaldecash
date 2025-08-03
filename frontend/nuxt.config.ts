// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";

// Configuration constants
const CONFIG = {
  APP_NAME: "User Management System",
  DEFAULT_API_BASE: "http://localhost:8000/api",
  COMPATIBILITY_DATE: "2025-07-15",
} as const;

// Environment variable validation with better error handling
const validateEnvironmentVariables = () => {
  const requiredEnvVars = {
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
  } as const;

  // Only validate in development to avoid production noise
  if (process.env.NODE_ENV === "development") {
    const missing = Object.entries(requiredEnvVars)
      .filter(([, value]) => !value)
      .map(([key]) => `NUXT_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`);

    if (missing.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
      console.warn("Please check your .env file. Example:");
      console.warn("NUXT_SESSION_PASSWORD=your-secure-session-password-here");
    }
  }

  return requiredEnvVars;
};

const envVars = validateEnvironmentVariables();

export default defineNuxtConfig({
  compatibilityDate: CONFIG.COMPATIBILITY_DATE,
  devtools: { enabled: true },

  // Enable TypeScript with strict mode for better type safety
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === "development", // Enable type checking in development
    includeWorkspace: true,
  },

  // Add required modules
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
  ],

  // Vite configuration optimized for development and production
  vite: {
    define: {
      // Vue feature flags for optimal performance
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
      __FEATURE_SUSPENSE__: "true",
    },
    server: {
      hmr: {
        port: 24678,
      },
    },
    build: {
      target: "esnext",
    },
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },

  // Development server configuration
  devServer: {
    port: process.env.NUXT_PORT ? parseInt(process.env.NUXT_PORT) : 3000,
    host: process.env.NUXT_HOST || "0.0.0.0", // 0.0.0.0 allows network access, localhost restricts to local only
  },

  // Configure runtime configuration for API communication
  runtimeConfig: {
    // Private keys (only available on server-side)
    apiSecret: process.env.NUXT_API_SECRET || "",
    sessionPassword: envVars.sessionPassword,

    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || CONFIG.DEFAULT_API_BASE,
      appName: process.env.NUXT_PUBLIC_APP_NAME || CONFIG.APP_NAME,
      // Security configuration
      enableCsrf: process.env.NUXT_PUBLIC_ENABLE_CSRF !== "false",
      apiTimeout: parseInt(process.env.NUXT_PUBLIC_API_TIMEOUT || "10000"),
    },
  },

  // Configure CSS
  css: ["~/assets/css/main.css"],

  // Configure server-side rendering
  ssr: true,

  // Experimental features configuration
  experimental: {
    // Disable experimental features that might cause warnings
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: false,
    // Explicitly enable async context to suppress warnings
    asyncContext: true,
    // Enable view transitions for better UX
    viewTransition: true,
  },

  // Pages configuration for better routing (Nuxt 4 structure)
  pages: true, // Explicitly enable pages directory scanning
  srcDir: "./app", // Use app directory for Nuxt 4

  // Build configuration to suppress warnings
  build: {
    transpile: [],
  },

  // Build hooks for development optimizations
  hooks: {
    "build:before": () => {
      // Development-specific optimizations can be added here
      if (process.env.NODE_ENV === "development") {
        console.log("🚀 Starting development build...");
      }
    },

    "app:resolve": () => {
      // App resolved successfully
    },
  },

  // App configuration with security headers
  app: {
    head: {
      title: CONFIG.APP_NAME,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "noindex, nofollow" }, // Prevent indexing for admin interface
        { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
        { "http-equiv": "X-Frame-Options", content: "DENY" },
        { "http-equiv": "X-XSS-Protection", content: "1; mode=block" },
        { name: "referrer", content: "strict-origin-when-cross-origin" },
      ],
    },
  },

  // Nitro configuration for API proxy and CORS
  nitro: {
    devProxy: {
      "/api": {
        target: process.env.NUXT_PUBLIC_API_BASE || CONFIG.DEFAULT_API_BASE,
        changeOrigin: true,
        prependPath: true,
        headers: {
          "Access-Control-Allow-Origin":
            process.env.NODE_ENV === "production"
              ? process.env.NUXT_PUBLIC_FRONTEND_URL || "https://yourdomain.com"
              : "*",
          "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    },
  },

  // Configure auto-imports for better TypeScript support
  imports: {
    dirs: ["composables", "stores", "utils"],
    global: true,
  },

  // Configure auto-imports for composables
  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/UI", pathPrefix: false },
  ],

  // Configure path aliases for better module resolution
  alias: {
    "~/types": fileURLToPath(new URL("./types", import.meta.url)),
    "~/stores": fileURLToPath(new URL("./stores", import.meta.url)),
    "~/composables": fileURLToPath(new URL("./composables", import.meta.url)),
    "~/components": fileURLToPath(new URL("./components", import.meta.url)),
  },
});
