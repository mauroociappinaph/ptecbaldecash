<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          User Management System
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- Error Display -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <!-- Email Field -->
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{
                'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                  validationErrors.email,
              }" placeholder="Email address" :disabled="isLoading" />
            <div v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
              {{ validationErrors.email[0] }}
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" v-model="form.password" name="password" type="password" autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{
                'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                  validationErrors.password,
              }" placeholder="Password" :disabled="isLoading" />
            <div v-if="validationErrors.password" class="mt-1 text-sm text-red-600">
              {{ validationErrors.password[0] }}
            </div>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg v-if="!isLoading" class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd" />
              </svg>
              <svg v-else class="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            {{ isLoading ? "Signing in..." : "Sign in" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import type { LoginCredentials } from "../../types/index";

// Composables
const { login, isLoading, error, clearError } = useAuth();
const router = useRouter();

// Form state
const form = reactive<LoginCredentials>({
  email: "",
  password: "",
});

// Validation errors from API
const validationErrors = ref<Record<string, string[]>>({});

// Computed properties
const isFormValid = computed(() => {
  return form.email.trim() !== "" && form.password.trim() !== "";
});

// Clear errors when form changes
watch([() => form.email, () => form.password], () => {
  clearError();
  validationErrors.value = {};
});

// Handle form submission
const handleSubmit = async () => {
  console.log("LoginForm: handleSubmit triggered");
  console.log("LoginForm: Form data:", form.email, form.password);
  console.log("LoginForm: isFormValid:", isFormValid.value);

  if (!isFormValid.value) {
    console.log("LoginForm: Form is not valid, preventing submission.");
    return;
  }

  try {
    clearError();
    validationErrors.value = {};

    await login(form);

    console.log("LoginForm: Login successful, redirecting to /users");
    await router.push("/users");
  } catch (err: any) {
    console.error("LoginForm: Login failed in handleSubmit catch block:", err);

    // Handle validation errors specifically
    if (err.status === 422 && err.data?.errors) {
      validationErrors.value = err.data.errors;
      console.log("LoginForm: Validation errors:", validationErrors.value);
    }
    // Other errors are handled by the useAuth composable
  }
};

// Clear errors on component mount
onMounted(() => {
  clearError();
});
</script>
