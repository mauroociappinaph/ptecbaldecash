<template>
  <div v-if="hasErrors" :class="containerClasses">
    <!-- Single error message -->
    <div v-if="!multiple && firstError" class="flex items-start">
      <div class="flex-shrink-0">
        <svg
          class="h-4 w-4 text-red-400 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-2">
        <p class="text-sm text-red-600">{{ firstError }}</p>
      </div>
    </div>

    <!-- Multiple error messages -->
    <div v-else-if="multiple && errorList.length > 0">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="h-4 w-4 text-red-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-2">
          <ul class="text-sm text-red-600 space-y-1">
            <li v-for="error in errorList" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type ErrorType = string | string[] | Record<string, string[]> | null;

interface Props {
  errors?: ErrorType;
  field?: string;
  multiple?: boolean;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  size: "sm",
  showIcon: true,
});

// Computed properties
const hasErrors = computed(() => {
  if (!props.errors) return false;

  if (typeof props.errors === "string") {
    return props.errors.trim() !== "";
  }

  if (Array.isArray(props.errors)) {
    return props.errors.length > 0;
  }

  if (typeof props.errors === "object") {
    if (props.field) {
      const fieldErrors = props.errors[props.field];
      return fieldErrors && fieldErrors.length > 0;
    }
    return Object.keys(props.errors).length > 0;
  }

  return false;
});

const firstError = computed(() => {
  if (!props.errors) return null;

  if (typeof props.errors === "string") {
    return props.errors;
  }

  if (Array.isArray(props.errors)) {
    return props.errors[0] || null;
  }

  if (typeof props.errors === "object") {
    if (props.field) {
      const fieldErrors = props.errors[props.field];
      return fieldErrors && fieldErrors[0] ? fieldErrors[0] : null;
    }

    // Get first error from any field
    const firstKey = Object.keys(props.errors)[0];
    if (firstKey && props.errors[firstKey]) {
      return props.errors[firstKey][0] || null;
    }
  }

  return null;
});

const errorList = computed(() => {
  if (!props.errors) return [];

  if (typeof props.errors === "string") {
    return [props.errors];
  }

  if (Array.isArray(props.errors)) {
    return props.errors;
  }

  if (typeof props.errors === "object") {
    if (props.field) {
      return props.errors[props.field] || [];
    }

    // Flatten all errors
    const allErrors: string[] = [];
    Object.values(props.errors).forEach((fieldErrors) => {
      if (Array.isArray(fieldErrors)) {
        allErrors.push(...fieldErrors);
      }
    });
    return allErrors;
  }

  return [];
});

const containerClasses = computed(() => {
  const baseClasses = "mt-1";
  const sizeClasses = {
    sm: "",
    md: "mt-2",
  };

  return `${baseClasses} ${sizeClasses[props.size]}`;
});
</script>
