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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  Edit User
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- First Name -->
                  <div>
                    <label
                      for="edit-name"
                      class="block text-sm font-medium text-gray-700"
                    >
                      First Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-name"
                      ref="firstNameInput"
                      v-model="form.name"
                      type="text"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          errors.name,
                      }"
                      placeholder="Enter first name"
                    />
                    <p
                      v-if="errors.name"
                      class="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {{ errors.name[0] }}
                    </p>
                  </div>

                  <!-- Last Name -->
                  <div>
                    <label
                      for="edit-last-name"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Last Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-last-name"
                      v-model="form.last_name"
                      type="text"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          errors.last_name,
                      }"
                      placeholder="Enter last name"
                    />
                    <p
                      v-if="errors.last_name"
                      class="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {{ errors.last_name[0] }}
                    </p>
                  </div>

                  <!-- Email -->
                  <div>
                    <label
                      for="edit-email"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Email <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-email"
                      v-model="form.email"
                      type="email"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          errors.email,
                      }"
                      placeholder="Enter email address"
                    />
                    <p
                      v-if="errors.email"
                      class="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {{ errors.email[0] }}
                    </p>
                  </div>

                  <!-- Password -->
                  <div>
                    <label
                      for="edit-password"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Password
                      <span class="text-gray-500 text-xs"
                        >(leave blank to keep current)</span
                      >
                    </label>
                    <input
                      id="edit-password"
                      v-model="form.password"
                      type="password"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          errors.password,
                      }"
                      placeholder="Enter new password (optional)"
                    />
                    <p
                      v-if="errors.password"
                      class="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {{ errors.password[0] }}
                    </p>
                  </div>

                  <!-- Password Confirmation -->
                  <div v-if="form.password && form.password.trim() !== ''">
                    <label
                      for="edit-password-confirmation"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Confirm Password <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-password-confirmation"
                      v-model="form.password_confirmation"
                      type="password"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          errors.password_confirmation,
                      }"
                      placeholder="Confirm new password"
                    />
                    <p
                      v-if="errors.password_confirmation"
                      class="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {{ errors.password_confirmation[0] }}
                    </p>
                  </div>

                  <!-- Role -->
                  <div>
                    <label
                      for="edit-role"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Role <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-role"
                      v-model="form.role"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          errors.role,
                      }"
                    >
                      <option value="">Select a role</option>
                      <option value="administrator">Administrator</option>
                      <option value="reviewer">Reviewer</option>
                    </select>
                    <p
                      v-if="errors.role"
                      class="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {{ errors.role[0] }}
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
              :disabled="isLoading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="isLoading"
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
              {{ isLoading ? "Updating..." : "Update User" }}
            </button>
            <button
              type="button"
              @click="handleClose"
              :disabled="isLoading"
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
import { useUsersStore } from "../../stores/users";
import type { UpdateUserData, User } from "../../types/index";

// Props
interface Props {
  isOpen: boolean;
  user: User | null;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  close: [];
  success: [user: User];
}

const emit = defineEmits<Emits>();

// Store
const usersStore = useUsersStore();

// Form state
const form = ref<UpdateUserData & { password_confirmation?: string }>({
  name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "reviewer",
});

// Loading and error states
const isLoading = ref(false);
const errors = ref<Record<string, string[]>>({});
const generalError = ref<string | null>(null);

// Template refs
const firstNameInput = ref<HTMLInputElement>();

// Watch for user prop changes to populate form
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.value = {
        name: newUser.name,
        last_name: newUser.last_name,
        email: newUser.email,
        password: "", // Always start with empty password
        password_confirmation: "",
        role: newUser.role,
      };
    }
  },
  { immediate: true }
);

// Watch for modal open to focus first input
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        firstNameInput.value?.focus();
      });
    }
  }
);

// Clear form and errors when modal closes
const resetForm = () => {
  form.value = {
    name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "reviewer",
  };
  errors.value = {};
  generalError.value = null;
  isLoading.value = false;
};

// Handle form submission
const handleSubmit = async () => {
  if (!props.user) return;

  isLoading.value = true;
  errors.value = {};
  generalError.value = null;

  try {
    // Prepare update data - only include password if it's not empty
    const updateData: UpdateUserData = {
      name: form.value.name,
      last_name: form.value.last_name,
      email: form.value.email,
      role: form.value.role,
    };

    // Only include password if it's provided
    if (form.value.password && form.value.password.trim() !== "") {
      updateData.password = form.value.password;
      (updateData as any).password_confirmation =
        form.value.password_confirmation;
    }

    const updatedUser = await usersStore.updateUser(props.user.id, updateData);

    // Emit success event
    emit("success", updatedUser);

    // Close modal and reset form
    handleClose();
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.status === 422 && error.data?.errors) {
      // Handle validation errors
      errors.value = error.data.errors;
    } else {
      // Handle general errors
      generalError.value =
        error.message || "Failed to update user. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

// Handle modal close
const handleClose = () => {
  if (!isLoading.value) {
    resetForm();
    emit("close");
  }
};

// Handle ESC key to close modal
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.isOpen && !isLoading.value) {
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
