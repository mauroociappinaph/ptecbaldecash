import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "../../components/Auth/LoginForm.vue";

// Mock the composables
vi.mock("../../composables/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    loading: { value: false },
    error: { value: null },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders login form correctly", () => {
    const wrapper = mount(LoginForm);

    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("has required form fields", () => {
    const wrapper = mount(LoginForm);

    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    expect(emailInput.attributes("required")).toBeDefined();
    expect(passwordInput.attributes("required")).toBeDefined();
  });

  it("has proper input labels", () => {
    const wrapper = mount(LoginForm);

    expect(wrapper.text()).toContain("Email");
    expect(wrapper.text()).toContain("Password");
  });

  it("has submit button with correct text", () => {
    const wrapper = mount(LoginForm);

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.text()).toContain("Sign In");
  });

  it("allows input in email field", async () => {
    const wrapper = mount(LoginForm);

    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue("test@example.com");

    expect(emailInput.element.value).toBe("test@example.com");
  });

  it("allows input in password field", async () => {
    const wrapper = mount(LoginForm);

    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue("password123");

    expect(passwordInput.element.value).toBe("password123");
  });

  it("shows loading state when submitting", () => {
    // Mock loading state
    vi.mocked(require("../../composables/useAuth").useAuth).mockReturnValue({
      login: vi.fn(),
      loading: { value: true },
      error: { value: null },
    });

    const wrapper = mount(LoginForm);
    const submitButton = wrapper.find('button[type="submit"]');

    expect(submitButton.attributes("disabled")).toBeDefined();
  });

  it("displays error messages", () => {
    // Mock error state
    vi.mocked(require("../../composables/useAuth").useAuth).mockReturnValue({
      login: vi.fn(),
      loading: { value: false },
      error: { value: "Invalid credentials" },
    });

    const wrapper = mount(LoginForm);
    expect(wrapper.text()).toContain("Invalid credentials");
  });

  it("prevents form submission when loading", () => {
    // Mock loading state
    vi.mocked(require("../../composables/useAuth").useAuth).mockReturnValue({
      login: vi.fn(),
      loading: { value: true },
      error: { value: null },
    });

    const wrapper = mount(LoginForm);
    const form = wrapper.find("form");
    const submitButton = wrapper.find('button[type="submit"]');

    expect(submitButton.attributes("disabled")).toBeDefined();
  });
});
