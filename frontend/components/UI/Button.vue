<template>
  <component :is="tag" :type="tag === 'button' ? type : undefined" :href="tag === 'a' ? href : undefined"
    :to="tag === 'NuxtLink' ? to : undefined" :disabled="disabled || loading" :class="buttonClasses"
    @click="handleClick">
    <!-- Loading spinner -->
    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
      </path>
    </svg>

    <!-- Left icon -->
    <component v-if="leftIcon && !loading" :is="leftIcon" :class="iconClasses" />

    <!-- Button text -->
    <span v-if="$slots.default || text">
      <slot>{{ text }}</slot>
    </span>

    <!-- Right icon -->
    <component v-if="rightIcon && !loading" :is="rightIcon" :class="iconClasses" />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ButtonSize, ButtonVariant } from "~/types";

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  rounded?: boolean;
  text?: string;
  leftIcon?: any;
  rightIcon?: any;
  href?: string;
  to?: string | object;
}

interface Emits {
  (e: "click", event: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  block: false,
  rounded: false,
});

const emit = defineEmits<Emits>();

// Determine the component tag
const tag = computed(() => {
  if (props.href) return "a";
  if (props.to) return "NuxtLink";
  return "button";
});

// Base button classes
const baseClasses =
  "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm leading-4",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-2 text-base",
    xl: "px-6 py-3 text-base",
  };
  return sizes[props.size];
});

// Variant classes
const variantClasses = computed(() => {
  const variants = {
    primary:
      "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 border border-transparent",
    secondary:
      "text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 border border-gray-300",
    success:
      "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 border border-transparent",
    danger:
      "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 border border-transparent",
    warning:
      "text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 border border-transparent",
    ghost:
      "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500 border border-transparent",
    link: "text-blue-600 bg-transparent hover:text-blue-800 focus:ring-blue-500 border border-transparent underline",
  };
  return variants[props.variant];
});

// Border radius classes
const roundedClasses = computed(() => {
  return props.rounded ? "rounded-full" : "rounded-md";
});

// Block classes
const blockClasses = computed(() => {
  return props.block ? "w-full" : "";
});

// Icon classes
const iconClasses = computed(() => {
  const slots = useSlots();
  const hasText = props.text || slots.default;
  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  let classes = iconSizes[props.size];

  if (hasText) {
    if (props.leftIcon) classes += " -ml-1 mr-2";
    if (props.rightIcon) classes += " ml-2 -mr-1";
  }

  return classes;
});

// Combined button classes
const buttonClasses = computed(() => {
  return [
    baseClasses,
    sizeClasses.value,
    variantClasses.value,
    roundedClasses.value,
    blockClasses.value,
  ].join(" ");
});

// Handle click
const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>
