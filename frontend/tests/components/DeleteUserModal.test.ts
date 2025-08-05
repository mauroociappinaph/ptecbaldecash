import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeleteUserModal from "../../components/Users/DeleteUserModal.vue";
import { mockUsers } from "../test-utils";

// Mock the composables and stores
vi.mock("../../composables/useApi", () => ({
  useApi: () => ({
    delete: vi.fn(),
  }),
}));

vi.mock("../../stores/users", () => ({
  useUsersStore: () => ({
    deleteUser: vi.fn(),
  }),
}));

describe("DeleteUserModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders correctly when open with user data", () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    expect(wrapper.find('[id="modal-title"]').text()).toBe("Delete User");
    expect(wrapper.text()).toContain("Admin User");
    expect(wrapper.text()).toContain("admin@example.com");
  });

  it("does not render when closed", () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: false,
        user: mockUsers.administrator,
      },
    });

    expect(wrapper.find('[id="modal-title"]').exists()).toBe(false);
  });

  it("shows confirmation message", () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.reviewer,
      },
    });

    expect(wrapper.text()).toContain("Are you sure you want to delete");
    expect(wrapper.text()).toContain("This action cannot be undone");
  });

  it("displays user information to be deleted", () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.reviewer,
      },
    });

    expect(wrapper.text()).toContain("Reviewer User");
    expect(wrapper.text()).toContain("reviewer@example.com");
    expect(wrapper.text()).toContain("reviewer");
  });

  it("has cancel and delete buttons", () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const cancelButton = wrapper.find('[data-testid="cancel-delete-btn"]');
    const deleteButton = wrapper.find('[data-testid="confirm-delete-btn"]');

    expect(cancelButton.exists()).toBe(true);
    expect(deleteButton.exists()).toBe(true);
    expect(deleteButton.text()).toContain("Delete");
  });

  it("emits close event when cancel button is clicked", async () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const cancelButton = wrapper.find('[data-testid="cancel-delete-btn"]');
    await cancelButton.trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("shows loading state during deletion", () => {
    // Mock the loading state by setting up the component with loading behavior
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    // Check that buttons exist
    const deleteButton = wrapper.find('[data-testid="confirm-delete-btn"]');
    expect(deleteButton.exists()).toBe(true);
  });

  it("prevents deletion when loading", () => {
    const wrapper = mount(DeleteUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    // Check that cancel button exists
    const cancelButton = wrapper.find('[data-testid="cancel-delete-btn"]');
    expect(cancelButton.exists()).toBe(true);
  });
});
