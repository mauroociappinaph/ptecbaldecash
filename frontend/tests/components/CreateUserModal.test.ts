import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateUserModal from "../../components/Users/CreateUserModal.vue";

// Mock the composables
vi.mock("../../composables/useApi", () => ({
  useApi: () => ({
    post: vi.fn(),
  }),
}));

vi.mock("../../stores/users", () => ({
  useUsersStore: () => ({
    createUser: vi.fn(),
  }),
}));

describe("CreateUserModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders correctly when open", () => {
    const wrapper = mount(CreateUserModal, {
      props: {
        isOpen: true,
      },
    });

    expect(wrapper.find('[id="modal-title"]').text()).toBe("Create New User");
    expect(wrapper.find('input[id="name"]').exists()).toBe(true);
    expect(wrapper.find('input[id="last_name"]').exists()).toBe(true);
    expect(wrapper.find('input[id="email"]').exists()).toBe(true);
    expect(wrapper.find('input[id="password"]').exists()).toBe(true);
    expect(wrapper.find('select[id="role"]').exists()).toBe(true);
  });

  it("does not render when closed", () => {
    const wrapper = mount(CreateUserModal, {
      props: {
        isOpen: false,
      },
    });

    expect(wrapper.find('[id="modal-title"]').exists()).toBe(false);
  });

  it("emits close event when cancel button is clicked", async () => {
    const wrapper = mount(CreateUserModal, {
      props: {
        isOpen: true,
      },
    });

    await wrapper.find('button[type="button"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("has required form fields", () => {
    const wrapper = mount(CreateUserModal, {
      props: {
        isOpen: true,
      },
    });

    const nameInput = wrapper.find('input[id="name"]');
    const lastNameInput = wrapper.find('input[id="last_name"]');
    const emailInput = wrapper.find('input[id="email"]');
    const passwordInput = wrapper.find('input[id="password"]');
    const roleSelect = wrapper.find('select[id="role"]');

    expect(nameInput.attributes("required")).toBeDefined();
    expect(lastNameInput.attributes("required")).toBeDefined();
    expect(emailInput.attributes("required")).toBeDefined();
    expect(passwordInput.attributes("required")).toBeDefined();
    expect(roleSelect.attributes("required")).toBeDefined();
  });

  it("has correct role options", () => {
    const wrapper = mount(CreateUserModal, {
      props: {
        isOpen: true,
      },
    });

    const roleSelect = wrapper.find('select[id="role"]');
    const options = roleSelect.findAll("option");

    expect(options).toHaveLength(3); // Including the default "Select a role" option
    expect(options[1]?.attributes("value")).toBe("administrator");
    expect(options[2]?.attributes("value")).toBe("reviewer");
  });
});
