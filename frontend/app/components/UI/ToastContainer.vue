<template>
  <div>
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2"
    >
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :duration="toast.duration"
        :closable="toast.closable"
        :persistent="toast.persistent"
        :action-text="toast.actionText"
        :on-action="toast.onAction"
        @close="removeToast(toast.id)"
        @action="toast.onAction"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ToastOptions } from "~/composables/useToast";

interface ToastItem extends ToastOptions {
  id: string;
}

// Toast state
const toasts = ref<ToastItem[]>([]);

// Add toast with optimized ID generation
const addToast = (options: ToastOptions): string => {
  console.log("🔍 ToastContainer: Adding toast:", options);
  const id = `toast-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const toast: ToastItem = {
    id,
    ...options,
  };

  toasts.value.push(toast);
  console.log("🔍 ToastContainer: Current toasts count:", toasts.value.length);

  return id;
};

// Remove toast
const removeToast = (id: string) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// Clear all toasts
const clearToasts = () => {
  toasts.value = [];
};

// Expose methods for the composable
defineExpose({
  addToast,
  removeToast,
  clearToasts,
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
