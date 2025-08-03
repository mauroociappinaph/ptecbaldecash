import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Performance optimizations
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true, // Better for component testing
      },
    },
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".nuxt/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/tests/**",
      ],
    },
    // Test isolation and cleanup
    clearMocks: true,
    restoreMocks: true,
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "."),
      "@": resolve(__dirname, "."),
      // Add specific aliases for better module resolution
      "~/types": resolve(__dirname, "./types"),
      "~/composables": resolve(__dirname, "./composables"),
      "~/stores": resolve(__dirname, "./stores"),
      "~/components": resolve(__dirname, "./components"),
    },
  },
  // Define globals for better TypeScript support
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
