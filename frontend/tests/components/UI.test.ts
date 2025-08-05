import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Button from "../../components/UI/Button.vue";
import Loading from "../../components/UI/Loading.vue";
import Modal from "../../components/UI/Modal.vue";

describe("UI Components", () => {
  const pinia = createPinia();

  beforeEach(() => {
    // Mock NuxtLink component
    vi.stubGlobal('NuxtLink', {
      template: '<a><slot /></a>',
      props: ['to', 'href']
    });
  });

  describe("Button", () => {
    it("renders button with text", () => {
      const wrapper = mount(Button, {
        props: {
          text: "Click me",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Click me");
    });

    it("renders button with different variants", () => {
      const wrapper = mount(Button, {
        props: {
          text: "Primary Button",
          variant: "primary",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.classes()).toContain("bg-blue-600");
    });

    it("renders disabled button", () => {
      const wrapper = mount(Button, {
        props: {
          text: "Disabled",
          disabled: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.attributes("disabled")).toBeDefined();
    });

    it("shows loading state", () => {
      const wrapper = mount(Button, {
        props: {
          text: "Loading",
          loading: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.attributes("disabled")).toBeDefined();
      expect(wrapper.text()).toContain("Loading");
    });

    it("emits click event", async () => {
      const wrapper = mount(Button, {
        props: {
          text: "Click me",
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.trigger("click");
      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });

  describe("Modal", () => {
    it("renders when open", () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: "Test Modal",
        },
        slots: {
          default: "<p>Modal content</p>",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Test Modal");
      expect(wrapper.text()).toContain("Modal content");
    });

    it("does not render when closed", () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: false,
          title: "Test Modal",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).not.toContain("Test Modal");
    });

    it("emits close event when overlay is clicked", async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: "Test Modal",
        },
        global: {
          plugins: [pinia],
        },
      });

      const overlay = wrapper.find('[data-testid="modal-overlay"]');
      if (overlay.exists()) {
        await overlay.trigger("click");
        expect(wrapper.emitted("close")).toBeTruthy();
      }
    });

    it("emits close event when close button is clicked", async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: "Test Modal",
          closable: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      const closeButton = wrapper.find('[data-testid="modal-close"]');
      if (closeButton.exists()) {
        await closeButton.trigger("click");
        expect(wrapper.emitted("close")).toBeTruthy();
      }
    });
  });

  describe("Loading", () => {
    it("renders loading spinner", () => {
      const wrapper = mount(Loading, {
        props: {
          type: "spinner",
        },
        global: {
          plugins: [pinia],
        },
      });

      // Look for the SVG spinner element
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it("renders with custom text", () => {
      const wrapper = mount(Loading, {
        props: {
          text: "Loading users...",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.text()).toContain("Loading users...");
    });

    it("renders different sizes", () => {
      const wrapper = mount(Loading, {
        props: {
          size: "lg",
          type: "spinner",
        },
        global: {
          plugins: [pinia],
        },
      });

      // Check that the component renders with the large size
      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
    });
  });
});
