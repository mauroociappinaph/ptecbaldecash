<template>
  <div>
    <!-- Error state -->
    <div v-if="hasError" class="error-boundary">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg
              class="h-8 w-8 text-red-500"
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
            <h3 class="text-lg font-medium text-gray-900">
              {{ errorTitle }}
            </h3>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Error details (only in development) -->
        <div v-if="showDetails && errorDetails" class="mb-4">
          <details class="bg-gray-50 rounded p-3">
            <summary
              class="cursor-pointer text-sm font-medium text-gray-700 mb-2"
            >
              Error Details
            </summary>
            <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{
              errorDetails
            }}</pre>
          </details>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <button
            @click="retry"
            class="btn btn--primary btn--sm"
            :disabled="isRetrying"
          >
            <svg
              v-if="isRetrying"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isRetrying ? "Retrying..." : "Try Again" }}
          </button>

          <button @click="goHome" class="btn btn--secondary btn--sm">
            Go Home
          </button>

          <button
            v-if="showReportButton"
            @click="reportError"
            class="btn btn--secondary btn--sm"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>

    <!-- Normal content -->
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Explicit import for better TypeScript support
import { usePerformance } from "~/composables/usePerformance";

interface Props {
  fallbackTitle?: string;
  fallbackMessage?: string;
  showDetails?: boolean;
  showReportButton?: boolean;
  onRetry?: () => void | Promise<void>;
  onReport?: (error: Error) => void;
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: "Something went wrong",
  fallbackMessage:
    "An unexpected error occurred. Please try again or contact support if the problem persists.",
  showDetails: false,
  showReportButton: false,
});

const emit = defineEmits<{
  error: [error: Error];
  retry: [];
}>();

const hasError = ref(false);
const currentError = ref<Error | null>(null);
const isRetrying = ref(false);

const errorTitle = computed(() => {
  if (currentError.value?.name === "ChunkLoadError") {
    return "Update Available";
  }
  return props.fallbackTitle;
});

const errorMessage = computed(() => {
  if (currentError.value?.name === "ChunkLoadError") {
    return "A new version of the application is available. Please refresh the page to get the latest updates.";
  }
  return props.fallbackMessage;
});

// Centralized error reset
const resetError = () => {
  hasError.value = false;
  currentError.value = null;
  isRetrying.value = false;
};

// Better error details with validation
const errorDetails = computed(() => {
  if (!currentError.value) return null;

  return JSON.stringify(
    {
      name: currentError.value.name || "Unknown",
      message: currentError.value.message || "No message",
      stack: currentError.value.stack || "No stack trace",
      timestamp: new Date().toISOString(),
      userAgent: import.meta.client ? navigator.userAgent : "Server",
    },
    null,
    2
  );
});

const handleError = (error: Error) => {
  console.error("Error caught by boundary:", error);

  hasError.value = true;
  currentError.value = error;

  emit("error", error);

  // Log error for monitoring
  if (import.meta.client) {
    try {
      const { logMemoryUsage } = usePerformance();
      logMemoryUsage("error-boundary");
    } catch (error) {
      console.warn("Performance monitoring not available:", error);
    }
  }
};

const retry = async () => {
  if (isRetrying.value) return;

  isRetrying.value = true;

  try {
    if (props.onRetry) {
      await props.onRetry();
    }

    // Use centralized reset
    resetError();
    emit("retry");
  } catch (error) {
    console.error("Retry failed:", error);
    // Keep error state if retry fails
  } finally {
    isRetrying.value = false;
  }
};

const goHome = () => {
  navigateTo("/");
};

const reportError = () => {
  if (currentError.value && errorDetails.value) {
    if (props.onReport) {
      props.onReport(currentError.value);
    }

    // Copy to clipboard as fallback
    if (import.meta.client) {
      navigator.clipboard.writeText(errorDetails.value);
    }
  }
};

// Store references for cleanup
let handleGlobalError: ((event: ErrorEvent) => void) | null = null;
let handleGlobalRejection: ((event: PromiseRejectionEvent) => void) | null =
  null;

// Global error handler for unhandled errors
if (import.meta.client) {
  handleGlobalError = (event: ErrorEvent) => {
    handleError(new Error(event.message));
  };

  handleGlobalRejection = (event: PromiseRejectionEvent) => {
    handleError(new Error(event.reason));
  };

  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", handleGlobalRejection);
}

// Cleanup event listeners on unmount
onUnmounted(() => {
  if (import.meta.client && handleGlobalError && handleGlobalRejection) {
    window.removeEventListener("error", handleGlobalError);
    window.removeEventListener("unhandledrejection", handleGlobalRejection);
  }
});

// Vue error handler
onErrorCaptured((error) => {
  handleError(error);
  return false; // Prevent error from propagating
});

// Provide error handler to child components
provide("errorHandler", handleError);
</script>

<style scoped>
.error-boundary {
  @apply min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8;
}

/* Ensure error boundary is accessible */
.error-boundary button:focus {
  @apply outline-none ring-2 ring-offset-2 ring-red-500;
}
</style>
