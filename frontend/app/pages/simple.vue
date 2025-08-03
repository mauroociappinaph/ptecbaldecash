<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Simple Test Page</h1>
      <p class="text-lg text-gray-600 mb-8">
        This page should work without any complex dependencies
      </p>
      <div class="space-x-4">
        <NuxtLink
          to="/"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Go Home
        </NuxtLink>
        <NuxtLink
          to="/test"
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Go to Test
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple page with no complex dependencies
useHead({
  title: "Simple Test - User Management System",
});
</script>
