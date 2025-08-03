/**
 * Early debug plugin - runs first due to 00 prefix
 * Provides early error detection and environment setup
 */

export default defineNuxtPlugin({
  name: "early-debug",
  setup() {
    // Only run in development or when explicitly enabled
    const isDevelopment = process.env.NODE_ENV === "development";
    const isDebugEnabled = process.env.NUXT_DEBUG === "true";

    if (!isDevelopment && !isDebugEnabled) {
      return;
    }

    console.log("🔍 Early Debug: Plugin starting");
    console.log("🔍 Early Debug: Window location:", window.location.href);
    console.log("🔍 Early Debug: Document ready state:", document.readyState);

    // Capture very early errors with better type safety
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const firstArg = args[0];
      if (typeof firstArg === "string" && firstArg.includes("Page not found")) {
        console.log("🚨 Early Debug: Page not found error intercepted");
        console.log("🔍 Early Debug: Error args:", args);
        console.log("🔍 Early Debug: Current URL:", window.location.href);
        console.log("🔍 Early Debug: Document title:", document.title);
      }
      originalConsoleError.apply(console, args);
    };

    // Monitor DOM changes with error handling
    try {
      if (document.readyState === "loading") {
        document.addEventListener(
          "DOMContentLoaded",
          () => {
            console.log("🔍 Early Debug: DOM Content Loaded");
          },
          { once: true }
        );
      }

      // Monitor page visibility with error handling
      document.addEventListener("visibilitychange", () => {
        console.log(
          "🔍 Early Debug: Visibility changed:",
          document.visibilityState
        );
      });
    } catch (error) {
      console.error("🚨 Early Debug: Error setting up event listeners:", error);
    }

    console.log("🔍 Early Debug: Plugin setup complete");
  },
});
