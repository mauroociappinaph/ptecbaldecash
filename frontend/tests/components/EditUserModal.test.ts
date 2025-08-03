import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditUserModal from "../../components/Users/EditUserModal.vue";
import { mockUsers } from "../test-utils";

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
      (wrapper.find('input[id="name"]').element as HTMLInputElement).value
    ).toBe("Admin");
    expect(
      (wrapper.find('input[id="last_name"]').element as HTMLInputElement).value
    ).toBe("User");
    expect(
      (wrapper.find('input[id="email"]').element as HTMLInputElement).value
    ).toBe("admin@example.com");
    expect(
      (wrapper.find('select[id="role"]').element as HTMLSelectElement).value
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

    const nameInput = wrapper.find('input[id="name"]');
    const lastNameInput = wrapper.find('input[id="last_name"]');
    const emailInput = wrapper.find('input[id="email"]');
    const roleSelect = wrapper.find('select[id="role"]');

    expect(nameInput.element.value).toBe("Reviewer");
    expect(lastNameInput.element.value).toBe("User");
    expect(emailInput.element.value).toBe("reviewer@example.com");
    expect(roleSelect.element.value).toBe("reviewer");
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

    const passwordInput = wrapper.find('input[id="password"]');
    expect(passwordInput.exists()).toBe(true);
    expect(passwordInput.attributes("required")).toBeUndefined();
    expect(passwordInput.element.value).toBe("");
  });

  it("allows updating user data", async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const nameInput = wrapper.find('input[id="name"]');
    await nameInput.setValue("Updated Name");

    expect(nameInput.element.value).toBe("Updated Name");
  });

  it("validates required fields", () => {
    const wrapper = mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUsers.administrator,
      },
    });

    const nameInput = wrapper.find('input[id="name"]');
    const lastNameInput = wrapper.find('input[id="last_name"]');
    const emailInput = wrapper.find('input[id="email"]');
    const roleSelect = wrapper.find('select[id="role"]');

    expect(nameInput.attributes("required")).toBeDefined();
    expect(lastNameInput.attributes("required")).toBeDefined();
    expect(emailInput.attributes("required")).toBeDefined();
    expect(roleSelect.attributes("required")).toBeDefined();
  });
});
