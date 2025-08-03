<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              User Management System
            </h1>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Simplified layout without auth for now to avoid composable issues
console.log("🔍 default.vue: layout loaded");
console.log("🔍 default.vue: current route:", useRoute().path);

onMounted(() => {
  console.log("🔍 default.vue: layout mounted");
});
</script>
