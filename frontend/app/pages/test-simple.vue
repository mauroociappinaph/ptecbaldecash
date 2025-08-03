<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Simple Test Page</h1>
      <p class="text-lg text-gray-600">
        This is a simple test page to verify routing works.
      </p>
      <div class="mt-8 space-x-4">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800"
          >Home</NuxtLink
        >
        <NuxtLink to="/login" class="text-blue-600 hover:text-blue-800"
          >Login</NuxtLink
        >
        <NuxtLink to="/users" class="text-blue-600 hover:text-blue-800"
          >Users</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple test page with no middleware or complex logic
</script>
