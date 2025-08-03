<template>
  <div>
    <div
      v-if="visible"
      :class="containerClasses"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div :class="toastClasses">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <component v-if="icon" :is="icon" :class="iconClasses" />
          <svg
            v-else
            :class="iconClasses"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              v-if="type === 'success'"
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
            <path
              v-else-if="type === 'error'"
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
            <path
              v-else-if="type === 'warning'"
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
            <path
              v-else
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="ml-3 w-0 flex-1">
          <p v-if="title" :class="titleClasses">
            {{ title }}
          </p>
          <p :class="messageClasses">
            {{ message }}
          </p>

          <!-- Action button -->
          <div v-if="actionText && onAction" class="mt-3">
            <button
              @click="handleAction"
              :class="actionButtonClasses"
              type="button"
            >
              {{ actionText }}
            </button>
          </div>
        </div>

        <!-- Close button -->
        <div v-if="closable" class="ml-4 flex-shrink-0 flex">
          <button
            @click="handleClose"
            :class="closeButtonClasses"
            type="button"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

interface Props {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  persistent?: boolean;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  icon?: any;
  actionText?: string;
  onAction?: () => void;
}

interface Emits {
  (e: "close"): void;
  (e: "action"): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: "info",
  duration: 5000,
  closable: true,
  persistent: false,
  position: "top-right",
});

const emit = defineEmits<Emits>();

// Local state
const visible = ref(true);
let timeoutId: NodeJS.Timeout | null = null;

// Auto-hide timer
const startTimer = () => {
  if (!props.persistent && props.duration > 0) {
    timeoutId = setTimeout(() => {
      handleClose();
    }, props.duration);
  }
};

// Clear timer
const clearTimer = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

// Handle close
const handleClose = () => {
  visible.value = false;
  clearTimer();
  emit("close");
};

// Handle action
const handleAction = () => {
  if (props.onAction) {
    props.onAction();
  }
  emit("action");
};

// Container classes - memoized for better performance
const POSITION_CLASSES = {
  "top-right": "fixed top-4 right-4 z-50",
  "top-left": "fixed top-4 left-4 z-50",
  "bottom-right": "fixed bottom-4 right-4 z-50",
  "bottom-left": "fixed bottom-4 left-4 z-50",
  "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
  "bottom-center": "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
} as const;

const containerClasses = computed(() => {
  return `${POSITION_CLASSES[props.position]} max-w-sm w-full`;
});

// Toast classes
const toastClasses = computed(() => {
  const baseClasses = "flex items-start p-4 rounded-lg shadow-lg border";

  const typeClasses = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return `${baseClasses} ${typeClasses[props.type]}`;
});

// Icon classes
const iconClasses = computed(() => {
  const typeClasses = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return `h-5 w-5 ${typeClasses[props.type]}`;
});

// Title classes
const titleClasses = computed(() => {
  const typeClasses = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  };

  return `text-sm font-medium ${typeClasses[props.type]}`;
});

// Message classes
const messageClasses = computed(() => {
  const typeClasses = {
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-yellow-700",
    info: "text-blue-700",
  };

  const marginClass = props.title ? "mt-1" : "";

  return `text-sm ${typeClasses[props.type]} ${marginClass}`;
});

// Action button classes
const actionButtonClasses = computed(() => {
  const typeClasses = {
    success:
      "text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200",
    error: "text-red-800 hover:text-red-900 bg-red-100 hover:bg-red-200",
    warning:
      "text-yellow-800 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200",
    info: "text-blue-800 hover:text-blue-900 bg-blue-100 hover:bg-blue-200",
  };

  return `inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
    typeClasses[props.type]
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`;
});

// Close button classes
const closeButtonClasses = computed(() => {
  const typeClasses = {
    success: "text-green-400 hover:text-green-500",
    error: "text-red-400 hover:text-red-500",
    warning: "text-yellow-400 hover:text-yellow-500",
    info: "text-blue-400 hover:text-blue-500",
  };

  return `inline-flex rounded-md p-1.5 ${
    typeClasses[props.type]
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`;
});

// Lifecycle
onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  clearTimer();
});

// Pause timer on hover (used in template event handlers)
const handleMouseEnter = () => {
  clearTimer();
};

const handleMouseLeave = () => {
  startTimer();
};
</script>
