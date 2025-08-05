<template>
  <div ref="containerRef" :class="containerClass" :style="containerStyle">
    <img
      v-if="shouldLoad"
      ref="imageRef"
      :src="src"
      :alt="alt"
      :class="imageClass"
      :loading="loading"
      :decoding="decoding"
      @load="onLoad"
      @error="onError"
    />

    <!-- Loading placeholder -->
    <div v-if="isLoading" :class="placeholderClass">
      <div class="animate-pulse bg-gray-200 w-full h-full rounded" />
    </div>

    <!-- Error placeholder -->
    <div v-if="hasError" :class="placeholderClass">
      <div
        class="flex items-center justify-center w-full h-full bg-gray-100 rounded"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  lazy?: boolean;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  containerClass?: string;
  imageClass?: string;
  placeholderClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true,
  loading: "lazy",
  decoding: "async",
  containerClass: "",
  imageClass: "w-full h-full object-cover",
  placeholderClass: "absolute inset-0",
});

const containerRef = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();
const isLoading = ref(true);
const hasError = ref(false);
const shouldLoad = ref(!props.lazy);

// Intersection Observer for lazy loading
let observer: IntersectionObserver | null = null;

const containerStyle = computed(() => {
  const styles: Record<string, string> = {
    position: "relative",
  };

  if (props.width) {
    styles.width = `${props.width}px`;
  }

  if (props.height) {
    styles.height = `${props.height}px`;
  }

  if (props.aspectRatio) {
    styles.aspectRatio = props.aspectRatio;
  }

  return styles;
});

const onLoad = () => {
  isLoading.value = false;
  hasError.value = false;
};

const onError = () => {
  isLoading.value = false;
  hasError.value = true;
};

const setupIntersectionObserver = () => {
  if (!props.lazy || !containerRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          shouldLoad.value = true;
          observer?.disconnect();
        }
      });
    },
    {
      rootMargin: "50px", // Start loading 50px before the image enters viewport
      threshold: 0.1,
    }
  );

  observer.observe(containerRef.value);
};

onMounted(() => {
  if (props.lazy) {
    setupIntersectionObserver();
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

// Performance monitoring
const { monitorRender } = usePerformance();
monitorRender("OptimizedImage");
</script>

<style scoped>
/* Ensure smooth transitions */
img {
  transition: opacity 0.3s ease-in-out;
}

/* Prevent layout shift during loading */
.aspect-square {
  aspect-ratio: 1 / 1;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

.aspect-photo {
  aspect-ratio: 4 / 3;
}
</style>
