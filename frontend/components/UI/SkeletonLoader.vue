<template>
  <div :class="containerClass">
    <!-- Table skeleton -->
    <div v-if="type === 'table'" class="space-y-4">
      <!-- Table header -->
      <div class="flex space-x-4">
        <div
          v-for="i in columns"
          :key="`header-${i}`"
          class="h-4 bg-gray-200 rounded animate-pulse flex-1"
        />
      </div>

      <!-- Table rows -->
      <div v-for="row in rows" :key="`row-${row}`" class="flex space-x-4">
        <div
          v-for="col in columns"
          :key="`cell-${row}-${col}`"
          class="h-4 bg-gray-200 rounded animate-pulse flex-1"
        />
      </div>
    </div>

    <!-- Card skeleton -->
    <div v-else-if="type === 'card'" class="space-y-4">
      <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
      <div class="space-y-2">
        <div class="h-4 bg-gray-200 rounded animate-pulse" />
        <div class="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        <div class="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
      </div>
    </div>

    <!-- Form skeleton -->
    <div v-else-if="type === 'form'" class="space-y-6">
      <div v-for="field in fields" :key="`field-${field}`" class="space-y-2">
        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
        <div class="h-10 bg-gray-200 rounded animate-pulse" />
      </div>

      <div class="flex space-x-4">
        <div class="h-10 bg-gray-200 rounded animate-pulse w-24" />
        <div class="h-10 bg-gray-200 rounded animate-pulse w-24" />
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div
        v-for="item in items"
        :key="`item-${item}`"
        class="flex items-center space-x-4"
      >
        <div class="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>

    <!-- Text skeleton -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div
        v-for="line in lines"
        :key="`line-${line}`"
        :class="[
          'h-4 bg-gray-200 rounded animate-pulse',
          line === lines ? 'w-3/4' : 'w-full',
        ]"
      />
    </div>

    <!-- Custom skeleton -->
    <div v-else class="space-y-4">
      <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
      <div class="h-4 bg-gray-200 rounded animate-pulse" />
      <div class="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: "table" | "card" | "form" | "list" | "text" | "custom";
  rows?: number;
  columns?: number;
  fields?: number;
  items?: number;
  lines?: number;
  containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "custom",
  rows: 5,
  columns: 4,
  fields: 3,
  items: 5,
  lines: 3,
  containerClass: "",
});
</script>

<style scoped>
/* Optimized animation for better performance */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
    opacity: 0.5;
  }
}
</style>
