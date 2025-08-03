<template>
  <div :class="containerClasses">
    <div class="text-center">
      <!-- Icon -->
      <div class="mx-auto mb-4">
        <component v-if="icon" :is="icon" :class="iconClasses" />
        <svg
          v-else
          :class="iconClasses"
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

      <!-- Title -->
      <h3 v-if="title" :class="titleClasses">
        {{ title }}
      </h3>

      <!-- Message -->
      <p v-if="message" :class="messageClasses">
        {{ message }}
      </p>

      <!-- Details (collapsible) -->
      <div v-if="details" class="mt-4">
        <button
          v-if="!showDetails"
          @click="showDetails = true"
          class="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Show details
        </button>
        <div v-else class="mt-2">
          <button
            @click="showDetails = false"
            class="text-sm text-gray-500 hover:text-gray-700 underline mb-2"
          >
            Hide details
          </button>
          <div class="bg-gray-100 rounded-md p-3 text-left">
            <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{
              details
            }}</pre>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        v-if="showRetry || $slots.actions"
        class="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
      >
        <button
          v-if="showRetry"
          @click="handleRetry"
          :disabled="retrying"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="retrying"
            class="animate-spin -ml-1 mr-2 h-4 w-4"
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
          <svg
            v-else
            class="-ml-1 mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ retrying ? retryingText : retryText }}
        </button>

        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: "error" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  title?: string;
  message?: string;
  details?: string;
  icon?: any;
  showRetry?: boolean;
  retryText?: string;
  retryingText?: string;
  fullHeight?: boolean;
  bordered?: boolean;
  background?: boolean;
}

interface Emits {
  (e: "retry"): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: "error",
  size: "md",
  title: "Something went wrong",
  message: "An unexpected error occurred. Please try again.",
  showRetry: true,
  retryText: "Try again",
  retryingText: "Retrying...",
  fullHeight: false,
  bordered: false,
  background: false,
});

const emit = defineEmits<Emits>();

// Local state
const showDetails = ref(false);
const retrying = ref(false);

// Container classes
const containerClasses = computed(() => {
  let classes = "flex items-center justify-center p-6";

  if (props.fullHeight) {
    classes += " min-h-96";
  }

  if (props.bordered) {
    classes += " border border-gray-200 rounded-lg";
  }

  if (props.background) {
    const backgrounds = {
      error: " bg-red-50",
      warning: " bg-yellow-50",
      info: " bg-blue-50",
    };
    classes += backgrounds[props.type];
  }

  return classes;
});

// Icon classes
const iconClasses = computed(() => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const colors = {
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return `${sizes[props.size]} ${colors[props.type]}`;
});

// Title classes
const titleClasses = computed(() => {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const colors = {
    error: "text-red-900",
    warning: "text-yellow-900",
    info: "text-blue-900",
  };

  return `font-medium mb-2 ${sizes[props.size]} ${colors[props.type]}`;
});

// Message classes
const messageClasses = computed(() => {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const colors = {
    error: "text-red-700",
    warning: "text-yellow-700",
    info: "text-blue-700",
  };

  return `${sizes[props.size]} ${colors[props.type]}`;
});

// Handle retry
const handleRetry = async () => {
  retrying.value = true;
  try {
    emit("retry");
    // Add a small delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    retrying.value = false;
  }
};
</script>
