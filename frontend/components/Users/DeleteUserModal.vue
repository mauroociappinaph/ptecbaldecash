<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <!-- Background overlay -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="handleClose">
      </div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <!-- Modal header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Delete User
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Are you sure you want to delete
                  <span class="font-medium text-gray-900">
                    {{ user?.name }} {{ user?.last_name }}
                  </span>
                  ({{ user?.email }})?
                </p>
                <p class="text-sm text-gray-500 mt-2">
                  This action will permanently remove the user from the system.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="px-4 sm:px-6">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Deletion Failed
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ error }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal actions -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" @click="handleDelete" :disabled="loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="confirm-delete-btn">
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ loading ? "Deleting..." : "Delete User" }}
          </button>
          <button type="button" @click="handleClose" :disabled="loading"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="cancel-delete-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useUsersStore } from "../../stores/users";
import type { User } from "../../types/index";

interface Props {
  isOpen: boolean;
  user: User | null;
}

interface Emits {
  (e: "close"): void;
  (e: "success", user: User): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Store
const usersStore = useUsersStore();

// Local state
const loading = ref(false);
const error = ref<string | null>(null);

// Handle modal close
const handleClose = () => {
  if (!loading.value) {
    error.value = null;
    emit("close");
  }
};

// Handle user deletion
const handleDelete = async () => {
  if (!props.user) return;

  loading.value = true;
  error.value = null;

  try {
    await usersStore.deleteUser(props.user.id);
    emit("success", props.user);
    handleClose();
  } catch (err: any) {
    console.error("Delete user error:", err);

    // Handle different error types
    if (err.status === 403) {
      error.value = "You are not authorized to delete users.";
    } else if (err.status === 404) {
      error.value = "User not found or has already been deleted.";
    } else if (err.status >= 500) {
      error.value = "Server error occurred. Please try again later.";
    } else {
      error.value = err.message || "Failed to delete user. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

// Handle ESC key to close modal
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.isOpen && !loading.value) {
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

// Clear error when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      error.value = null;
    }
  }
);
</script>
