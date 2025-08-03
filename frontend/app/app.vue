<template>
  <div>
    <GlobalErrorBoundary>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <!-- Toast notification container -->
      <ToastContainer ref="toastContainer" />
    </GlobalErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useToast } from "~/composables/useToast";

// App initialization

// Toast container reference
const toastContainer = ref();

onMounted(() => {
  // Initialize toast system
  if (toastContainer.value) {
    const { setToastContainer } = useToast();
    setToastContainer(toastContainer.value);
  }
});

// Global app configuration
useHead({
  titleTemplate: "%s - User Management System",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      name: "description",
      content:
        "A comprehensive user management system with role-based access control",
    },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>
