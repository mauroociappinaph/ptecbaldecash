<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    :aria-labelledby="titleId"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="handleOverlayClick"
      ></div>

      <!-- Modal panel -->
      <div
        :class="[
          'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle',
          sizeClasses,
        ]"
      >
        <!-- Header -->
        <div v-if="showHeader" class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <!-- Icon -->
            <div
              v-if="icon"
              :class="[
                'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                iconClasses,
              ]"
            >
              <component :is="icon" class="h-6 w-6" />
            </div>

            <!-- Title and description -->
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3
                v-if="title"
                :id="titleId"
                class="text-lg leading-6 font-medium text-gray-900"
              >
                {{ title }}
              </h3>
              <p v-if="description" class="mt-2 text-sm text-gray-500">
                {{ description }}
              </p>
            </div>

            <!-- Close button -->
            <button
              v-if="showCloseButton"
              @click="handleClose"
              :disabled="loading"
              class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-600 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div :class="contentClasses">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="showFooter"
          class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  icon?: any;
  iconType?: "info" | "success" | "warning" | "error";
  showHeader?: boolean;
  showFooter?: boolean;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  loading?: boolean;
}

interface Emits {
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  iconType: "info",
  showHeader: true,
  showFooter: false,
  showCloseButton: true,
  closeOnOverlay: true,
  loading: false,
});

const emit = defineEmits<Emits>();

// Generate unique ID for accessibility
const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: "sm:max-w-sm sm:w-full",
    md: "sm:max-w-lg sm:w-full",
    lg: "sm:max-w-2xl sm:w-full",
    xl: "sm:max-w-4xl sm:w-full",
    full: "sm:max-w-full sm:w-full sm:mx-4",
  };
  return sizes[props.size];
});

// Icon classes based on type
const iconClasses = computed(() => {
  const types = {
    info: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    error: "bg-red-100 text-red-600",
  };
  return types[props.iconType];
});

// Content classes
const contentClasses = computed(() => {
  let classes = "";
  if (!props.showHeader) {
    classes += "pt-6 ";
  }
  if (!props.showFooter) {
    classes += "pb-6 ";
  }
  classes += "px-4 sm:px-6";
  return classes;
});

// Handle overlay click
const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.loading) {
    handleClose();
  }
};

// Handle close
const handleClose = () => {
  if (!props.loading) {
    emit("close");
  }
};

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.isOpen && !props.loading) {
    handleClose();
  }
};

// Add/remove event listeners
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
