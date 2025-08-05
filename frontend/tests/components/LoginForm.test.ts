import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import LoginForm from "../../components/Auth/LoginForm.vue";

describe("LoginForm", () => {
  let mockAuth: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    // Create fresh mock for each test
    mockAuth = {
      login: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
      clearError: vi.fn(),
    };

    // Mock useAuth globally
    global.useAuth = vi.fn().mockReturnValue(mockAuth);

    // Mock useRouter
    global.useRouter = vi.fn().mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    });
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
    expect(submitButton.text()).toContain("Sign in");
  });

  it("allows input in email field", async () => {
    const wrapper = mount(LoginForm);

    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue("test@example.com");

    expect((emailInput.element as HTMLInputElement).value).toBe(
      "test@example.com"
    );
  });

  it("allows input in password field", async () => {
    const wrapper = mount(LoginForm);

    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue("password123");

    expect((passwordInput.element as HTMLInputElement).value).toBe("password123");
  });

  it("shows loading state when submitting", () => {
    // Set loading state
    mockAuth.isLoading.value = true;

    const wrapper = mount(LoginForm);
    const submitButton = wrapper.find('button[type="submit"]');

    expect(submitButton.attributes("disabled")).toBeDefined();
  });

  it("displays error messages", () => {
    // Set error state
    mockAuth.error.value = "Invalid credentials";

    const wrapper = mount(LoginForm);
    expect(wrapper.text()).toContain("Invalid credentials");
  });

  it("prevents form submission when loading", () => {
    // Set loading state
    mockAuth.isLoading.value = true;

    const wrapper = mount(LoginForm);
    const submitButton = wrapper.find('button[type="submit"]');

    expect(submitButton.attributes("disabled")).toBeDefined();
  });
});
