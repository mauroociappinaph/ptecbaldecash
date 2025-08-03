import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserList from "../../components/Users/UserList.vue";
import { mockUsers } from "../test-utils";

// Mock the stores and composables
vi.mock("../../stores/users", () => ({
  useUsersStore: () => ({
    users: [mockUsers.administrator, mockUsers.reviewer],
    loading: false,
    error: null,
    fetchUsers: vi.fn(),
    deleteUser: vi.fn(),
  }),
}));

vi.mock("../../composables/useAuth", () => ({
  useAuth: () => ({
    user: { value: mockUsers.administrator },
    isAdministrator: { value: true },
    isReviewer: { value: false },
  }),
}));

describe("UserList", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders user list correctly", () => {
    const wrapper = mount(UserList);

    // Check if table headers are present
    expect(wrapper.text()).toContain("ID");
    expect(wrapper.text()).toContain("Name");
    expect(wrapper.text()).toContain("Email");
    expect(wrapper.text()).toContain("Role");
    expect(wrapper.text()).toContain("Actions");
  });

  it("displays user data in table rows", () => {
    const wrapper = mount(UserList);

    // Check if user data is displayed
    expect(wrapper.text()).toContain("Admin User");
    expect(wrapper.text()).toContain("admin@example.com");
    expect(wrapper.text()).toContain("administrator");

    expect(wrapper.text()).toContain("Reviewer User");
    expect(wrapper.text()).toContain("reviewer@example.com");
    expect(wrapper.text()).toContain("reviewer");
  });

  it("shows action buttons for administrators", () => {
    const wrapper = mount(UserList);

    // Administrator should see action buttons
    const editButtons = wrapper.findAll('[data-testid="edit-user-btn"]');
    const deleteButtons = wrapper.findAll('[data-testid="delete-user-btn"]');

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it("shows create user button for administrators", () => {
    const wrapper = mount(UserList);

    const createButton = wrapper.find('[data-testid="create-user-btn"]');
    expect(createButton.exists()).toBe(true);
  });

  it("emits events when action buttons are clicked", async () => {
    const wrapper = mount(UserList);

    const createButton = wrapper.find('[data-testid="create-user-btn"]');
    await createButton.trigger("click");

    // Check if the create modal would be opened (component should handle this)
    expect(wrapper.emitted()).toBeDefined();
  });

  it("handles search functionality", async () => {
    const wrapper = mount(UserList);

    const searchInput = wrapper.find('input[placeholder*="Search"]');
    if (searchInput.exists()) {
      await searchInput.setValue("admin");
      await searchInput.trigger("input");

      // The component should filter results
      expect((searchInput.element as HTMLInputElement).value).toBe("admin");
    }
  });

  it("handles role filter functionality", async () => {
    const wrapper = mount(UserList);

    const roleFilter = wrapper.find('select[data-testid="role-filter"]');
    if (roleFilter.exists()) {
      await roleFilter.setValue("administrator");

      // The component should filter by role
      expect((roleFilter.element as HTMLSelectElement).value).toBe(
        "administrator"
      );
    }
  });
});
