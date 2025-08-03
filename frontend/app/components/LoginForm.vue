<template>
  <div class="space-y-6">
    <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="form-input rounded-t-md"
            :class="{ error: errors.email }"
            placeholder="Email address"
          />
          <p v-if="errors.email" class="error-message">
            {{ errors.email[0] }}
          </p>
        </div>

        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="form-input rounded-b-md"
            :class="{ error: errors.password }"
            placeholder="Password"
          />
          <p v-if="errors.password" class="error-message">
            {{ errors.password[0] }}
          </p>
        </div>
      </div>

      <!-- General error message -->
      <div v-if="error" class="rounded-md bg-red-50 p-4">
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
            <h3 class="text-sm font-medium text-red-800">Login Failed</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <button type="submit" :disabled="loading" class="btn-primary">
          <svg
            v-if="loading"
            class="spinner -ml-1 mr-3 text-white"
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
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
      </div>

      <!-- Demo credentials -->
      <div class="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 class="text-sm font-medium text-blue-800 mb-2">
          Demo Credentials:
        </h4>
        <div class="text-sm text-blue-700 space-y-1">
          <p><strong>Administrator:</strong> admin@example.com / password</p>
          <p><strong>Reviewer:</strong> reviewer@example.com / password</p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
interface LoginForm {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string[];
  password?: string[];
}

// Form state
const form = reactive<LoginForm>({
  email: "",
  password: "",
});

// UI state
const loading = ref(false);
const error = ref<string | null>(null);
const errors = ref<LoginErrors>({});

// Handle form submission
const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  errors.value = {};

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password,
      },
    });

    // Session is already set by the server-side handler
    // Just proceed with navigation

    // Redirect to users page
    await navigateTo("/users");
  } catch (err: any) {
    console.error("Login error:", err);

    if (err.status === 422 && err.data?.errors) {
      // Validation errors
      errors.value = err.data.errors;
    } else if (err.status === 401) {
      error.value = "Invalid email or password. Please try again.";
    } else if (err.status >= 500) {
      error.value = "Server error occurred. Please try again later.";
    } else {
      error.value =
        err.data?.message || "An unexpected error occurred. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

// Clear errors when user types
watch(
  () => form.email,
  () => {
    if (errors.value.email) {
      errors.value.email = undefined;
    }
    if (error.value) {
      error.value = null;
    }
  }
);

watch(
  () => form.password,
  () => {
    if (errors.value.password) {
      errors.value.password = undefined;
    }
    if (error.value) {
      error.value = null;
    }
  }
);
</script>
