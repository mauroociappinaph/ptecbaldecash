<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        User Management System
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Welcome to the user management system
      </p>
      <div class="space-x-4">
        <NuxtLink
          to="/login"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Login
        </NuxtLink>
        
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
console.log("🔍 index.vue: page component loaded");
console.log("🔍 index.vue: current route:", useRoute().path);
console.log("🔍 index.vue: route params:", useRoute().params);
console.log("🔍 index.vue: route query:", useRoute().query);

// Simple home page - no automatic redirects to avoid routing issues
useHead({
  title: "Home - User Management System",
});
</script>
