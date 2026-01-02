declare module "vue-a11y-utils" {
  import { Component } from "vue";

  export const FocusTrap: Component<{
    onGofirst?: () => void;
    onGolast?: () => void;
  }>;
}
