import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserList from "../../components/Users/UserList.vue";
import { mockUsers } from "../test-utils";

// Mock all the composables that UserList needs
vi.mock("~/composables/useAuth", () => ({
  useAuth: () => ({
    canManageUsers: vi.fn().mockReturnValue(true),
  }),
}));

vi.mock("~/composables/usePerformance", () => ({
  usePerformance: vi.fn(() => ({
    startMeasure: vi.fn(),
    endMeasure: vi.fn(),
    logMemoryUsage: vi.fn(),
    monitorRender: vi.fn(),
  })),
}));

describe("UserList (Simple)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders with props", () => {
    const wrapper = mount(UserList, {
      props: {
        users: [mockUsers.administrator, mockUsers.reviewer],
        loading: false,
        error: null,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 2,
          from: 1,
          to: 2,
        },
      },
    });

    // Basic test - just check that it renders without crashing
    expect(wrapper.exists()).toBe(true);
  });

  it("displays user count", () => {
    const wrapper = mount(UserList, {
      props: {
        users: [mockUsers.administrator, mockUsers.reviewer],
        loading: false,
        error: null,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 2,
          from: 1,
          to: 2,
        },
      },
    });

    // Check that it shows the total count
    expect(wrapper.text()).toContain("2 total");
  });
});
