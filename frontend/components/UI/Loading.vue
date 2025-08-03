<template>
  <div :class="containerClasses">
    <div v-if="type === 'spinner'" class="inline-flex items-center">
      <svg :class="spinnerClasses" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span v-if="text" :class="textClasses">{{ text }}</span>
    </div>

    <div v-else-if="type === 'dots'" class="inline-flex items-center">
      <div class="flex space-x-1">
        <div
          v-for="i in 3"
          :key="i"
          :class="[
            'rounded-full animate-pulse',
            dotClasses,
            { 'animation-delay-200': i === 2, 'animation-delay-400': i === 3 },
          ]"
          :style="{ animationDelay: `${(i - 1) * 200}ms` }"
        ></div>
      </div>
      <span v-if="text" :class="textClasses">{{ text }}</span>
    </div>

    <div v-else-if="type === 'pulse'" :class="pulseClasses">
      <div class="animate-pulse flex space-x-4">
        <div class="rounded-full bg-gray-300 h-12 w-12"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-300 rounded"></div>
            <div class="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'skeleton'" class="animate-pulse">
      <div class="space-y-3">
        <div v-for="i in skeletonLines" :key="i" class="grid grid-cols-3 gap-4">
          <div class="h-4 bg-gray-300 rounded col-span-2"></div>
          <div class="h-4 bg-gray-300 rounded col-span-1"></div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'bars'" class="inline-flex items-center">
      <div class="flex space-x-1">
        <div
          v-for="i in 4"
          :key="i"
          :class="['bg-current animate-pulse', barClasses]"
          :style="{
            animationDelay: `${(i - 1) * 150}ms`,
            animationDuration: '1s',
          }"
        ></div>
      </div>
      <span v-if="text" :class="textClasses">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: "spinner" | "dots" | "pulse" | "skeleton" | "bars";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "blue" | "gray" | "green" | "red" | "yellow" | "purple" | "pink";
  text?: string;
  center?: boolean;
  fullScreen?: boolean;
  overlay?: boolean;
  skeletonLines?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "spinner",
  size: "md",
  color: "blue",
  center: false,
  fullScreen: false,
  overlay: false,
  skeletonLines: 3,
});

// Container classes
const containerClasses = computed(() => {
  let classes = "";

  if (props.fullScreen) {
    classes += "fixed inset-0 flex items-center justify-center ";
    if (props.overlay) {
      classes += "bg-white bg-opacity-75 z-50 ";
    }
  } else if (props.center) {
    classes += "flex items-center justify-center ";
  }

  return classes.trim();
});

// Color classes
const colorClasses = computed(() => {
  const colors = {
    blue: "text-blue-600",
    gray: "text-gray-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
  };
  return colors[props.color];
});

// Size classes for spinner
const spinnerClasses = computed(() => {
  const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };
  return `animate-spin ${sizes[props.size]} ${colorClasses.value}`;
});

// Size classes for dots
const dotClasses = computed(() => {
  const sizes = {
    xs: "h-1 w-1",
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
    xl: "h-3 w-3",
  };
  return `${sizes[props.size]} bg-current ${colorClasses.value}`;
});

// Size classes for bars
const barClasses = computed(() => {
  const sizes = {
    xs: "w-0.5 h-3",
    sm: "w-0.5 h-4",
    md: "w-1 h-5",
    lg: "w-1 h-6",
    xl: "w-1.5 h-8",
  };
  return `${sizes[props.size]} ${colorClasses.value}`;
});

// Text classes
const textClasses = computed(() => {
  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };
  return `ml-3 ${sizes[props.size]} ${colorClasses.value}`;
});

// Pulse container classes
const pulseClasses = computed(() => {
  return "p-4";
});
</script>

<style scoped>
.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}

.animate-pulse-scale {
  animation: pulse-scale 1s ease-in-out infinite;
}
</style>
