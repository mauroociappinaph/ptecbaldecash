<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Users List</h1>
    <p>This page will display a list of users.</p>
    <NuxtLink to="/users/create" class="text-blue-500 hover:underline">Create New User</NuxtLink>
    <br>
    <NuxtLink to="/users/1" class="text-blue-500 hover:underline">Edit User with ID 1 (Example)</NuxtLink>
  </div>
</template>

<script setup lang="ts">
// User list fetching and display logic will be added here
</script>

<style scoped>
/* Page specific styles */
</style>
