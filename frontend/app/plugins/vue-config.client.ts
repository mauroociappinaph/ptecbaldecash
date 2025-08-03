/**
 * Vue configuration plugin to suppress development warnings
 * and configure Vue for optimal performance
 */

// Define warning patterns to suppress (as const for better type safety)
const SUPPRESSED_WARNING_PATTERNS = [
  "<Suspense> is an experimental feature",
  "Hydration completed but contains mismatches",
  "Hydration node mismatch",
  "Hydration text mismatch",
  "Vue received a Component which was made a reactive object",
  "Failed to resolve component",
  "runtime-core.esm-bundler.js",
  // Nuxt-specific warnings
  "NuxtPage",
  "pages/",
] as const;

// Environment-based configuration
const SHOULD_SUPPRESS_WARNINGS =
  import.meta.dev && !import.meta.env.VITE_SHOW_ALL_WARNINGS;

/**
 * Check if a warning message should be suppressed
 * @param message - The console message to check
 * @returns true if the message should be suppressed
 */
const shouldSuppressMessage = (message: unknown): boolean => {
  if (typeof message !== "string") return false;

  return SUPPRESSED_WARNING_PATTERNS.some((pattern) =>
    message.includes(pattern)
  );
};

export default defineNuxtPlugin(() => {
  // Only suppress warnings in development mode
  if (SHOULD_SUPPRESS_WARNINGS) {
    const originalWarn = console.warn;
    const originalError = console.error;

    // Create optimized filtered console methods
    const filteredWarn = (...args: unknown[]) => {
      if (args.length === 0 || !shouldSuppressMessage(args[0])) {
        originalWarn.apply(console, args);
      }
    };

    const filteredError = (...args: unknown[]) => {
      if (args.length === 0 || !shouldSuppressMessage(args[0])) {
        originalError.apply(console, args);
      }
    };

    // Override console methods with filtering
    console.warn = filteredWarn;
    console.error = filteredError;

    // Cleanup: restore original console methods on page unload
    if (import.meta.client) {
      const cleanup = () => {
        console.warn = originalWarn;
        console.error = originalError;
      };

      // Use multiple cleanup strategies for reliability
      window.addEventListener("beforeunload", cleanup);
      window.addEventListener("pagehide", cleanup);

      // Return cleanup function for proper plugin lifecycle
      return { provide: {}, cleanup };
    }
  }
});
