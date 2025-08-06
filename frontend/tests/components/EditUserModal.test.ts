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

// Mock the composables and stores
vi.mock("../../composables/useApi", () => ({
  useApi: () => ({
    put: vi.fn(),
  }),
}));

vi.mock("../../stores/users", () => ({
  useUsersStore: () => ({
    updateUser: vi.fn(),
  }),
}));

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

    expect(wrapper.find('[id="modal-title"]').text()).toBe("Edit User");
    expect(
      (wrapper.find('input[id="edit-name"]').element as HTMLInputElement).value
    ).toBe("Admin");
    expect(
      (wrapper.find('input[id="edit-last-name"]').element as HTMLInputElement).value
    ).toBe("User");
    expect(
      (wrapper.find('input[id="edit-email"]').element as HTMLInputElement).value
    ).toBe("admin@example.com");
    expect(
      (wrapper.find('select[id="edit-role"]').element as HTMLSelectElement).value
    ).toBe("administrator");
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

    const nameInput = wrapper.find('input[id="edit-name"]');
    const lastNameInput = wrapper.find('input[id="edit-last-name"]');
    const emailInput = wrapper.find('input[id="edit-email"]');
    const roleSelect = wrapper.find('select[id="edit-role"]');

    expect(nameInput.attributes("required")).toBeDefined();
    expect(lastNameInput.attributes("required")).toBeDefined();
    expect(emailInput.attributes("required")).toBeDefined();
    expect(roleSelect.attributes("required")).toBeDefined();
  });
});
