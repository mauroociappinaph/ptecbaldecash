<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
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
        @click="handleClose"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <form @submit.prevent="handleSubmit">
          <!-- Modal header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  Create New User
                </h3>
                <p class="mt-2 text-sm text-gray-500">
                  Add a new user to the system. They will receive their login
                  credentials via email.
                </p>
              </div>
            </div>

            <!-- Form fields -->
            <div class="mt-6 space-y-4">
              <!-- Name field -->
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                >
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{
                    'border-red-300 focus:ring-red-500 focus:border-red-500':
                      hasFieldError('name'),
                  }"
                  placeholder="Enter first name"
                />
                <FormError :errors="getFieldError('name')" />
              </div>

              <!-- Last name field -->
              <div>
                <label
                  for="last_name"
                  class="block text-sm font-medium text-gray-700"
                >
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="last_name"
                  v-model="formData.last_name"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{
                    'border-red-300 focus:ring-red-500 focus:border-red-500':
                      hasFieldError('last_name'),
                  }"
                  placeholder="Enter last name"
                />
                <FormError :errors="getFieldError('last_name')" />
              </div>

              <!-- Email field -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email Address <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{
                    'border-red-300 focus:ring-red-500 focus:border-red-500':
                      hasFieldError('email'),
                  }"
                  placeholder="Enter email address"
                />
                <FormError :errors="getFieldError('email')" />
              </div>

              <!-- Password field -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700"
                >
                  Password <span class="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{
                    'border-red-300 focus:ring-red-500 focus:border-red-500':
                      hasFieldError('password'),
                  }"
                  placeholder="Enter password"
                />
                <FormError :errors="getFieldError('password')" />
              </div>

              <!-- Role field -->
              <div>
                <label
                  for="role"
                  class="block text-sm font-medium text-gray-700"
                >
                  Role <span class="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  v-model="formData.role"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{
                    'border-red-300 focus:ring-red-500 focus:border-red-500':
                      hasFieldError('role'),
                  }"
                >
                  <option value="">Select a role</option>
                  <option value="administrator">Administrator</option>
                  <option value="reviewer">Reviewer</option>
                </select>
                <FormError :errors="getFieldError('role')" />
              </div>
            </div>

            <!-- General error message -->
            <div v-if="formState.generalError" class="mt-4">
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-red-400"
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
                    <p class="text-sm text-red-800">
                      {{ formState.generalError }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="formState.loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="formState.loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {{ formState.loading ? "Creating..." : "Create User" }}
            </button>
            <button
              type="button"
              @click="handleClose"
              :disabled="formState.loading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useFormErrorHandler } from "~/composables/useFormErrorHandler";
import { useUsersStore } from "~/stores/users";
import type { CreateUserData, User, UserRole } from "~/types";

interface Props {
  isOpen: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "success", user: User): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Store
const usersStore = useUsersStore();

// Form data
const formData = ref<CreateUserData>({
  name: "",
  last_name: "",
  email: "",
  password: "",
  role: "" as UserRole,
});

// Form error handling
const {
  formState,
  hasErrors,
  handleFormSubmit,
  clearErrors,
  getFieldError,
  hasFieldError,
  getFirstFieldError,
} = useFormErrorHandler();

// Reset form when modal opens/closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  }
);

// Reset form data and errors
const resetForm = () => {
  formData.value = {
    name: "",
    last_name: "",
    email: "",
    password: "",
    role: "" as UserRole,
  };
  clearErrors();
};

// Handle form submission
const handleSubmit = async () => {
  if (formState.loading) return;

  const { success, data } = await handleFormSubmit(
    () => usersStore.createUser(formData.value),
    {
      successMessage: "User created successfully",
      successTitle: "Success",
      clearOnSuccess: true,
    }
  );

  if (success && data) {
    emit("success", data);
    handleClose();
  }
};

// Handle modal close
const handleClose = () => {
  if (formState.loading) return;
  emit("close");
};

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.isOpen && !formState.loading) {
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
