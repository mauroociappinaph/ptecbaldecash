<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <!-- Main content -->
    <main class="flex-grow">
      <slot />
    </main>

    <Footer />
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
