<template>
  <div class="bg-white shadow-sm rounded-lg">
    <!-- Header with search and create button -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-medium text-gray-900">Users</h2>
          <p class="text-sm text-gray-500">
            Manage system users and their roles
            <span v-if="pagination.total > 0" class="font-medium">
              ({{ pagination.total }} total)
            </span>
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Search and filter controls -->
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search input -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input v-model="searchQuery" type="text" placeholder="Search users..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                @input="debouncedSearch" />
            </div>

            <!-- Role filter -->
            <div class="relative">
              <select v-model="roleFilter" @change="handleRoleFilter"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">All Roles</option>
                <option value="administrator">Administrator</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>

            <!-- Clear filters button -->
            <button v-if="hasActiveFilters" @click="clearFilters"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Clear all filters">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Create user button (only for administrators) -->
          <button v-if="canManageUsers()" @click="$emit('create-user')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            data-testid="create-user-btn">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create User
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="px-6 py-12 text-center">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        Loading users...
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="px-6 py-12 text-center">
      <div class="text-red-600">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">{{ error }}</p>
        <button @click="$emit('retry')" class="mt-2 text-sm text-blue-600 hover:text-blue-500">
          Try again
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="users.length === 0" class="px-6 py-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-sm font-medium text-gray-900 mb-1">No users found</h3>
      <p class="text-sm text-gray-500 mb-4">
        {{
          searchQuery
            ? "No users match your search criteria."
            : "Get started by creating your first user."
        }}
      </p>
      <button v-if="canManageUsers() && !searchQuery" @click="$emit('create-user')"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create User
      </button>
    </div>

    <!-- Users table -->
    <div v-else class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration Date
              </th>
              <th v-if="canManageUsers()" scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors duration-150"
              :data-testid="`user-row-${user.id}`">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ user.name }} {{ user.last_name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.role === 'administrator'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800',
                ]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td v-if="canManageUsers()" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button @click="$emit('edit-user', user)"
                    class="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                    :data-testid="`edit-user-${user.id}`">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="$emit('delete-user', user)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-150"
                    :data-testid="`delete-user-${user.id}`">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div class="flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="$emit('page-change', pagination.currentPage - 1)" :disabled="pagination.currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button @click="$emit('page-change', pagination.currentPage + 1)"
            :disabled="pagination.currentPage >= pagination.lastPage"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{
                (pagination.currentPage - 1) * pagination.perPage + 1
              }}</span>
              to
              <span class="font-medium">{{
                Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.total
                )
              }}</span>
              of
              <span class="font-medium">{{ pagination.total }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button @click="$emit('page-change', pagination.currentPage - 1)" :disabled="pagination.currentPage <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <template v-for="page in visiblePages" :key="page">
                <button v-if="page !== '...'" @click="$emit('page-change', page as number)" :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === pagination.currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                ]">
                  {{ page }}
                </button>
                <span v-else
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              </template>

              <button @click="$emit('page-change', pagination.currentPage + 1)"
                :disabled="pagination.currentPage >= pagination.lastPage"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import type { User } from "../../types/index";

interface Props {
  users: User[];
  loading?: boolean;
  error?: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

interface Emits {
  (e: "create-user"): void;
  (e: "edit-user", user: User): void;
  (e: "delete-user", user: User): void;
  (e: "page-change", page: number): void;
  (e: "search", query: string): void;
  (e: "filter-role", role: string): void;
  (e: "clear-filters"): void;
  (e: "retry"): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<Emits>();

// Authentication composable
const { canManageUsers } = useAuth();

// Performance monitoring
const { monitorRender } = usePerformance();
monitorRender("UserList");

// Search functionality with debouncing
const searchQuery = ref("");
let searchTimeout: NodeJS.Timeout;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("search", searchQuery.value);
  }, 300);
};

// Role filtering functionality
const roleFilter = ref("");

const handleRoleFilter = () => {
  emit("filter-role", roleFilter.value);
};

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== "" || roleFilter.value !== "";
});

// Clear all filters
const clearFilters = () => {
  searchQuery.value = "";
  roleFilter.value = "";
  emit("clear-filters");
};

// Date formatting
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Pagination logic for visible pages
const visiblePages = computed(() => {
  const current = props.pagination.currentPage;
  const last = props.pagination.lastPage;
  const pages: (number | string)[] = [];

  if (last <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= last; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current <= 4) {
      // Show pages 2-5 and ellipsis
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("...");
    } else if (current >= last - 3) {
      // Show ellipsis and last 4 pages
      pages.push("...");
      for (let i = last - 4; i <= last - 1; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis, current page area, ellipsis
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
    }

    // Always show last page
    if (last > 1) {
      pages.push(last);
    }
  }

  return pages;
});

// Cleanup timeout on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>
