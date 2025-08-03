declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "#app" {
  interface NuxtApp {
    // Add any custom Nuxt app properties here
  }
}
