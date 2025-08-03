<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-red-600 mb-4">
        Error {{ error.statusCode }}
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        {{ error.statusMessage || "An error occurred" }}
      </p>
      <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
        <h3 class="text-sm font-medium text-red-800 mb-2">
          Debug Information:
        </h3>
        <pre class="text-xs text-red-700 whitespace-pre-wrap">{{
          JSON.stringify(error, null, 2)
        }}</pre>
      </div>
      <div class="space-x-4">
        <button
          @click="handleError"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Go Home
        </button>
        <button
          @click="refresh"
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NuxtError {
  statusCode: number;
  statusMessage?: string;
  message?: string;
  stack?: string;
  data?: any;
}

const props = defineProps<{
  error: NuxtError;
}>();

console.error("🚨 Error Page: Error occurred");
console.error("🚨 Error Page: Error details:", props.error);
console.error(
  "🚨 Error Page: Current URL:",
  process.client ? window.location.href : "SSR"
);
console.error(
  "🚨 Error Page: User Agent:",
  process.client ? navigator.userAgent : "SSR"
);

const handleError = () => {
  console.log("🔍 Error Page: Attempting to navigate to home");
  clearError({ redirect: "/" });
};

const refresh = () => {
  console.log("🔍 Error Page: Refreshing page");
  if (process.client) {
    window.location.reload();
  }
};

// Log additional debugging information
onMounted(() => {
  console.log("🔍 Error Page: Error page mounted");
  console.log(
    "🔍 Error Page: Available routes:",
    useRouter()
      .getRoutes()
      .map((r) => r.path)
  );
  console.log("🔍 Error Page: Current route object:", useRoute());
});
</script>
