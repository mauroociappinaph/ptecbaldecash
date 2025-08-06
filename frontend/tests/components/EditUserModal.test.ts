import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditUserModal from "../../components/Users/EditUserModal.vue";
import { mockUsers } from "../test-utils";

// Test utilities for better element selection
const getFormElements = (wrapper: any) => ({
  nameInput: wrapper.find('input[id="edit-name"]'),
  lastNameInput: wrapper.find('input[id="edit-last-name"]'),
  emailInput: wrapper.find('input[id="edit-email"]'),
  passwordInput: wrapper.find('input[id="edit-password"]'),
  roleSelect: wrapper.find('select[id="edit-role"]'),
  submitButton: wrapper.find('button[type="submit"]'),
  cancelButton: wrapper.find('button[type="button"]'),
  modalTitle: wrapper.find('[id="modal-title"]'),
});

// Type-safe form value validators
const expectFormValues = (elements: ReturnType<typeof getFormElements>, expectedValues: {
  name: string;
  lastName: string;
  email: string;
  role: string;
}) => {
  expect((elements.nameInput.element as HTMLInputElement).value).toBe(expectedValues.name);
  expect((elements.lastNameInput.element as HTMLInputElement).value).toBe(expectedValues.lastName);
  expect((elements.emailInput.element as HTMLInputElement).value).toBe(expectedValues.email);
  expect((elements.roleSelect.element as HTMLSelectElement).value).toBe(expectedValues.role);
};

// Mock the composables and stores
vi.mock("../../composables/useApi", () => ({
  useApi: () => ({
    put: vi.fn(),
  }),
}));

const mockUseUsersStore = vi.fn();
vi.mock("../../stores/users", () => ({
  useUsersStore: mockUseUsersStore,
}));

// Default mock implementation
mockUseUsersStore.mockReturnValue({
  updateUser: vi.fn().mockResolvedValue(mockUsers.administrator),
});

describe("EditUserModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders correctly when open with user data", () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const elements = getFormElements(wrapper);

    expect(elements.modalTitle.text()).toBe("Edit User");
    expectFormValues(elements, {
      name: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "administrator"
    });
  });

  it("does not render when closed", () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: false,
        user: mockUsers.administrator,
      },
    });

    expect(wrapper.find('[id="modal-title"]').exists()).toBe(false);
  });

  it("pre-fills form with user data", () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.reviewer,
      },
    });

    const nameInput = wrapper.find('input[id="edit-name"]');
    const lastNameInput = wrapper.find('input[id="edit-last-name"]');
    const emailInput = wrapper.find('input[id="edit-email"]');
    const roleSelect = wrapper.find('select[id="edit-role"]');

    expect((nameInput.element as HTMLInputElement).value).toBe("Reviewer");
    expect((lastNameInput.element as HTMLInputElement).value).toBe("User");
    expect((emailInput.element as HTMLInputElement).value).toBe(
      "reviewer@example.com"
    );
    expect((roleSelect.element as HTMLSelectElement).value).toBe("reviewer");
  });

  it("emits close event when cancel button is clicked", async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    await wrapper.find('button[type="button"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("has password field that is optional", () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const passwordInput = wrapper.find('input[id="edit-password"]');
    expect(passwordInput.exists()).toBe(true);
    expect(passwordInput.attributes("required")).toBeUndefined();
    expect((passwordInput.element as HTMLInputElement).value).toBe("");
  });

  it("allows updating user data", async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const nameInput = wrapper.find('input[id="edit-name"]');
    await nameInput.setValue("Updated Name");

    expect((nameInput.element as HTMLInputElement).value).toBe("Updated Name");
  });

  it("validates required fields", () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const elements = getFormElements(wrapper);

    expect(elements.nameInput.attributes("required")).toBeDefined();
    expect(elements.lastNameInput.attributes("required")).toBeDefined();
    expect(elements.emailInput.attributes("required")).toBeDefined();
    expect(elements.roleSelect.attributes("required")).toBeDefined();

    // Password should not be required for editing
    expect(elements.passwordInput.attributes("required")).toBeUndefined();
  });

  it("handles form submission with loading state", async () => {
    const mockUpdateUser = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    vi.mocked(useUsersStore).mockReturnValue({
      updateUser: mockUpdateUser,
    } as any);

    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const elements = getFormElements(wrapper);

    // Trigger form submission
    await elements.submitButton.trigger("click");

    // Check loading state
    expect(elements.submitButton.text()).toContain("Updating...");
    expect(elements.submitButton.attributes("disabled")).toBeDefined();
  });

  it("handles validation errors from API", async () => {
    const mockUpdateUser = vi.fn().mockRejectedValue({
      status: 422,
      data: {
        errors: {
          email: ["The email has already been taken."],
          name: ["The name field is required."]
        }
      }
    });

    vi.mocked(useUsersStore).mockReturnValue({
      updateUser: mockUpdateUser,
    } as any);

    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const elements = getFormElements(wrapper);

    // Trigger form submission
    await elements.submitButton.trigger("click");
    await wrapper.vm.$nextTick();

    // Check error display
    expect(wrapper.text()).toContain("The email has already been taken.");
    expect(wrapper.text()).toContain("The name field is required.");
  });
});
