import { vi } from "vitest";

// Mock Pinia stores
export const mockStores = () => {
  vi.mock("pinia", async () => {
    const actual = await vi.importActual("pinia");
    return {
      ...actual,
      defineStore: vi.fn((_name, options) => {
        const store = {
          ...options.state?.(),
          ...options.actions,
          ...options.getters,
        };
        return vi.fn(() => store);
      }),
      createPinia: vi.fn(() => ({ use: vi.fn() })),
      setActivePinia: vi.fn(),
    };
  });
};
