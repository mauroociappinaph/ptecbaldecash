<template>
  <div>
    <!-- Error overlay for critical errors -->
    <div
      v-if="criticalError"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg
              class="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 id="error-title" class="text-lg font-medium text-gray-900">
              Application Error
            </h3>
          </div>
        </div>

        <div class="mb-4">
          <p id="error-description" class="text-sm text-gray-700">
            {{ criticalError.message }}
          </p>

          <div v-if="criticalError.details" class="mt-3">
            <button
              @click="showDetails = !showDetails"
              class="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {{ showDetails ? "Hide" : "Show" }} details
            </button>

            <div v-if="showDetails" class="mt-2 bg-gray-100 rounded p-3">
              <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{
                criticalError.details
              }}</pre>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="reloadPage"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reload Page
          </button>
          <button
            @click="dismissError"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>

    <!-- Slot for app content -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface CriticalError {
  message: string;
  details?: string;
  timestamp: Date;
}

// Error state
const criticalError = ref<CriticalError | null>(null);
const showDetails = ref(false);

// Show critical error
const showCriticalError = (error: Error | string, details?: string) => {
  const message = typeof error === "string" ? error : error.message;
  const errorDetails =
    details || (typeof error === "object" ? error.stack : undefined);

  criticalError.value = {
    message,
    details: errorDetails,
    timestamp: new Date(),
  };

  // Log to console for debugging
  console.error("🚨 GlobalErrorBoundary: Critical error:", error);
  console.error("🚨 GlobalErrorBoundary: Error details:", errorDetails);
  console.error("🚨 GlobalErrorBoundary: Current URL:", window.location.href);
};

// Dismiss error
const dismissError = () => {
  criticalError.value = null;
  showDetails.value = false;
};

// Reload page
const reloadPage = () => {
  window.location.reload();
};

// Global error handler
const handleGlobalError = (event: ErrorEvent) => {
  console.error("🚨 GlobalErrorBoundary: Global error caught:", event);
  showCriticalError(
    event.error || event.message,
    `File: ${event.filename}\nLine: ${event.lineno}\nColumn: ${event.colno}`
  );
};

// Unhandled promise rejection handler
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error("🚨 GlobalErrorBoundary: Unhandled rejection:", event);
  console.error("🚨 GlobalErrorBoundary: Rejection reason:", event.reason);

  // Check if this is a routing error
  if (event.reason?.message?.includes("Page not found")) {
    console.error("🚨 GlobalErrorBoundary: Page not found error detected");
    console.log(
      "🔍 GlobalErrorBoundary: Current location:",
      window.location.href
    );
  }

  showCriticalError(
    event.reason?.message || "Unhandled promise rejection",
    event.reason?.stack
  );
};

// Vue error handler (for future use with app.config.errorHandler)
const handleVueError = (error: Error, info: string) => {
  showCriticalError(error, `Vue error info: ${info}`);
};

// Setup global error handlers
onMounted(() => {
  console.log("🔍 GlobalErrorBoundary: Setting up error handlers");
  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
});

onUnmounted(() => {
  window.removeEventListener("error", handleGlobalError);
  window.removeEventListener("unhandledrejection", handleUnhandledRejection);
});

// Expose methods for external use
defineExpose({
  showCriticalError,
  dismissError,
  handleVueError, // Expose for potential future use
});
</script>
