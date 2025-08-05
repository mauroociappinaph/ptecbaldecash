<template>
  <nav class="bg-white shadow-sm p-4 flex justify-between items-center">
    <NuxtLink to="/" class="text-2xl font-bold text-pastel-green-600">BaldeCash</NuxtLink>
    <div class="flex items-center space-x-4">
      <NuxtLink to="/users" class="text-gray-700 hover:text-pastel-green-600">Users</NuxtLink>
      <NuxtLink to="/login" class="text-gray-700 hover:text-pastel-green-600">Login</NuxtLink>
      <NuxtLink to="/register" class="text-gray-700 hover:text-pastel-green-600">Register</NuxtLink>
      <!-- Avatar Placeholder -->
      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">AV</div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Navbar logic here
</script>

<style scoped>
/* Navbar specific styles */
</style>
