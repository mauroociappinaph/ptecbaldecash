import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import FormError from "~/components/UI/FormError.vue";
import Toast from "~/components/UI/Toast.vue";

describe("Error Handling Components", () => {
  const pinia = createPinia();

  describe("FormError", () => {
    it("renders single error message", () => {
      const wrapper = mount(FormError, {
        props: {
          errors: "This field is required",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("This field is required");
    });

    it("renders array of errors", () => {
      const wrapper = mount(FormError, {
        props: {
          errors: ["Error 1", "Error 2"],
          multiple: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Error 1");
      expect(wrapper.text()).toContain("Error 2");
    });

    it("renders field-specific errors from object", () => {
      const wrapper = mount(FormError, {
        props: {
          errors: {
            email: ["Invalid email format"],
            password: ["Password too short"],
          },
          field: "email",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Invalid email format");
      expect(wrapper.text()).not.toContain("Password too short");
    });

    it("does not render when no errors", () => {
      const wrapper = mount(FormError, {
        props: {
          errors: null,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toBe("");
    });
  });

  describe("Toast", () => {
    it("renders toast message", () => {
      const wrapper = mount(Toast, {
        props: {
          message: "Success message",
          type: "success",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Success message");
    });

    it("renders with title", () => {
      const wrapper = mount(Toast, {
        props: {
          message: "Test message",
          title: "Test Title",
          type: "info",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Test Title");
      expect(wrapper.text()).toContain("Test message");
    });

    it("emits close event when close button clicked", async () => {
      const wrapper = mount(Toast, {
        props: {
          message: "Test message",
          closable: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      const closeButton = wrapper.find("button");
      await closeButton.trigger("click");

      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
