<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Debug Page</h1>
    <p>This is a simple debug page to test routing.</p>
    <div class="mt-4">
      <p><strong>Current Route:</strong> {{ $route.path }}</p>
      <p><strong>Route Name:</strong> {{ $route.name }}</p>
      <p><strong>Timestamp:</strong> {{ new Date().toISOString() }}</p>
    </div>
    <div class="mt-4">
      <NuxtLink to="/" class="text-blue-600 hover:underline"
        >Go to Home</NuxtLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
console.log("🔍 debug.vue: Page loaded");
console.log("🔍 debug.vue: Route:", useRoute());

useHead({
  title: "Debug Page",
});
</script>
