<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              User Management System
            </h1>
            <p v-if="user" class="text-sm text-gray-500 mt-1">
              Welcome, {{ user.name }} {{ user.last_name }} ({{ user.role }})
            </p>
          </div>
          <button
            @click="handleLogout"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- User List Component -->
        <UserList
          :users="usersStore.users"
          :loading="usersStore.loading.list"
          :error="usersStore.error"
          :pagination="usersStore.pagination"
          @create-user="handleCreateUser"
          @edit-user="handleEditUser"
          @delete-user="handleDeleteUser"
          @page-change="handlePageChange"
          @search="handleSearch"
          @filter-role="handleRoleFilter"
          @clear-filters="handleClearFilters"
          @retry="handleRetry"
        />
      </div>
    </div>

    <!-- Create User Modal -->
    <CreateUserModal
      :is-open="showCreateModal"
      @close="handleCloseCreateModal"
      @success="handleCreateSuccess"
    />

    <!-- Edit User Modal -->
    <EditUserModal
      :is-open="showEditModal"
      :user="selectedUser"
      @close="handleCloseEditModal"
      @success="handleEditSuccess"
    />

    <!-- Delete User Modal -->
    <DeleteUserModal
      :is-open="showDeleteModal"
      :user="selectedUser"
      @close="handleCloseDeleteModal"
      @success="handleDeleteSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import CreateUserModal from "~/components/Users/CreateUserModal.vue";
import DeleteUserModal from "~/components/Users/DeleteUserModal.vue";
import EditUserModal from "~/components/Users/EditUserModal.vue";
import UserList from "~/components/Users/UserList.vue";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";
import { useUsersStore } from "~/stores/users";
import type { User } from "~/types/index";

// Page metadata
definePageMeta({
  // middleware: "auth", // Re-enable when authentication is working
});

// SEO and meta tags
useHead({
  title: "Users - User Management System",
});

// Composables
const { user, logout } = useAuth();
const { success: showSuccessToast } = useToast();
const usersStore = useUsersStore();
// Current search query, role filter, and page
const currentSearch = ref("");
const currentRoleFilter = ref("");
const currentPage = ref(1);

// Modal state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref<User | null>(null);

// Load users on mount
onMounted(async () => {
  await loadUsers();
});

// Load users with current filters
const loadUsers = async () => {
  try {
    await usersStore.fetchUsers(
      currentPage.value,
      currentSearch.value || undefined,
      currentRoleFilter.value || undefined
    );
  } catch (error) {
    console.error("Failed to load users:", error);
  }
};

// Handle logout
const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Handler functions
const handleCreateUser = (): void => {
  showCreateModal.value = true;
};

const handleCloseCreateModal = (): void => {
  showCreateModal.value = false;
};

const handleCloseEditModal = (): void => {
  showEditModal.value = false;
  selectedUser.value = null;
};

const handleCloseDeleteModal = (): void => {
  showDeleteModal.value = false;
  selectedUser.value = null;
};

const handleCreateSuccess = (user: User): void => {
  showSuccessToast(
    `User ${user.name} ${user.last_name} has been created successfully and will receive their credentials via email.`,
    { title: "User Created" }
  );
  loadUsers();
};

const handleEditSuccess = (user: User): void => {
  showSuccessToast(
    `User ${user.name} ${user.last_name} has been updated successfully.`,
    { title: "User Updated" }
  );
  loadUsers();
};

const handleEditUser = (user: User): void => {
  selectedUser.value = user;
  showEditModal.value = true;
};

const handleDeleteUser = (user: User): void => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const handleDeleteSuccess = (user: User): void => {
  showSuccessToast(
    `User ${user.name} ${user.last_name} has been deleted successfully.`,
    { title: "User Deleted" }
  );
  loadUsers();
};

// Handle page change
const handlePageChange = async (page: number): Promise<void> => {
  if (page >= 1 && page <= usersStore.pagination.lastPage) {
    currentPage.value = page;
    await loadUsers();
  }
};

// Handle search
const handleSearch = async (query: string): Promise<void> => {
  currentSearch.value = query;
  currentPage.value = 1; // Reset to first page when searching
  await loadUsers();
};

// Handle role filtering
const handleRoleFilter = async (role: string): Promise<void> => {
  currentRoleFilter.value = role;
  currentPage.value = 1; // Reset to first page when filtering
  await loadUsers();
};

// Handle retry on error
const handleRetry = async (): Promise<void> => {
  await loadUsers();
};

// Handle clearing all filters
const handleClearFilters = async (): Promise<void> => {
  currentSearch.value = "";
  currentRoleFilter.value = "";
  currentPage.value = 1;
  await loadUsers();
};

// Watch for store errors and clear them after some time
watch(
  () => usersStore.error,
  (error: any) => {
    if (error) {
      setTimeout(() => {
        usersStore.clearError();
      }, 5000);
    }
  }
);
</script>
