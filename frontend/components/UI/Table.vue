<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <!-- Table header -->
    <div v-if="showHeader" class="px-6 py-4 border-b border-gray-200">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 v-if="title" class="text-lg font-medium text-gray-900">
            {{ title }}
          </h2>
          <p v-if="description" class="text-sm text-gray-500">
            {{ description }}
          </p>
        </div>
        <div v-if="$slots.actions" class="flex-shrink-0">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="px-6 py-12 text-center">
      <div class="inline-flex items-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
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
        {{ loadingText }}
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="px-6 py-12 text-center">
      <div class="text-red-600">
        <svg
          class="mx-auto h-12 w-12 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p class="text-sm font-medium">{{ error }}</p>
        <button
          v-if="showRetry"
          @click="$emit('retry')"
          class="mt-2 text-sm text-blue-600 hover:text-blue-500"
        >
          Try again
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="isEmpty" class="px-6 py-12 text-center">
      <div v-if="$slots.empty">
        <slot name="empty" />
      </div>
      <div v-else>
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="text-sm font-medium text-gray-900 mb-1">{{ emptyTitle }}</h3>
        <p class="text-sm text-gray-500">{{ emptyDescription }}</p>
      </div>
    </div>

    <!-- Table content -->
    <div v-else class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- Table head -->
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="column in columns"
                :key="String(column.key)"
                scope="col"
                :class="[
                  'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                    ? 'text-right'
                    : 'text-left',
                ]"
              >
                <div
                  v-if="column.sortable"
                  class="flex items-center cursor-pointer hover:text-gray-700"
                  @click="handleSort(String(column.key))"
                >
                  <span>{{ column.label }}</span>
                  <svg
                    v-if="sortBy === String(column.key)"
                    :class="[
                      'ml-1 h-4 w-4',
                      sortOrder === 'asc' ? 'transform rotate-180' : '',
                    ]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <svg
                    v-else
                    class="ml-1 h-4 w-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                </div>
                <span v-else>{{ column.label }}</span>
              </th>
            </tr>
          </thead>

          <!-- Table body -->
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in data"
              :key="getRowKey(item, index)"
              :class="[
                'transition-colors duration-150',
                props.hoverable ? 'hover:bg-gray-50' : '',
                props.striped && index % 2 === 1 ? 'bg-gray-50' : '',
              ]"
            >
              <td
                v-for="column in columns"
                :key="String(column.key)"
                :class="[
                  'px-6 py-4 whitespace-nowrap text-sm',
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                    ? 'text-right'
                    : 'text-left',
                ]"
              >
                <slot
                  :name="`cell-${String(column.key)}`"
                  :item="item"
                  :value="getNestedValue(item, String(column.key))"
                  :index="index"
                >
                  {{ formatCellValue(item, column) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Table footer -->
    <div
      v-if="$slots.footer"
      class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  formatter?: (value: unknown, item: T) => string;
  className?: string;
}

interface Props<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showRetry?: boolean;
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  hoverable?: boolean;
  striped?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  rowKey?: string | ((item: T, index: number) => string | number);
}

interface Emits {
  (e: "sort", column: string, order: "asc" | "desc"): void;
  (e: "retry"): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  showHeader: true,
  showRetry: true,
  loadingText: "Loading...",
  emptyTitle: "No data available",
  emptyDescription: "There are no items to display.",
  hoverable: true,
  striped: false,
  sortOrder: "asc",
});

const emit = defineEmits<Emits>();

// Check if table is empty
const isEmpty = computed(() => {
  return !props.loading && !props.error && props.data.length === 0;
});

// Get row key for v-for
const getRowKey = (item: any, index: number): string | number => {
  if (typeof props.rowKey === "function") {
    return props.rowKey(item, index);
  }
  if (typeof props.rowKey === "string") {
    return item[props.rowKey] || index;
  }
  return item.id || index;
};

// Memoized nested value getter for better performance
const getNestedValue = useMemoize((obj: any, path: string): any => {
  // Fast path for simple keys
  if (!path.includes(".")) {
    return obj?.[path];
  }

  // Split and reduce for nested paths
  const keys = path.split(".");
  return keys.reduce((current, key) => current?.[key], obj);
});

// Format cell value
const formatCellValue = (item: any, column: Column): string => {
  const value = getNestedValue(item, String(column.key));

  if (column.formatter) {
    return column.formatter(value, item);
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

// Handle sorting
const handleSort = (columnKey: keyof any | string) => {
  const keyString = String(columnKey);
  const newOrder =
    props.sortBy === keyString && props.sortOrder === "asc" ? "desc" : "asc";
  emit("sort", keyString, newOrder);
};
</script>
