<script lang="ts">
export default {
  name: "Form",
};
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    pages: {
      label?: string;
      groups: {
        label?: string;
        rows: { type: string; value?: string; multiple: boolean }[][];
      }[];
    }[];
    submitLabel: string;
    grouped?: boolean;
  }>(),
  {
    pages: () => [],
    submitLabel: "Submit",
    grouped: false,
  },
);

const emit = defineEmits(["submit"]);

function onNode(node: any) {
  // watch(
  //   () => node.context.state.valid,
  //   (v) => {
  //     if (!v) {
  //       node.props.suffixIcon = "triangle";
  //     } else {
  //       node.props.suffixIcon = suffixIcons.get(node.props.type) || "";
  //     }
  //   },
  // );
}

const prefixIcons = new Map([["number", "minus"]]);
const suffixIcons = new Map([
  ["number", "plus"],
  ["password", "eye"],
]);
const decoratorIcons = new Map([
  ["checkbox", "checkbox"],
  ["radio", "radio"],
]);

function handlePrefixIcon(node: any) {
  if (node.props.type === "number") {
    node.input(parseInt(node.value) - 1);
  }
}
function handleSuffixIcon(node: any) {
  if (node.props.type === "number") {
    node.input(parseInt(node.value) + 1);
  }
  if (node.props.outerClass === "password") {
    node.props.type = node.props.type === "password" ? "text" : "password";
  }
}
</script>

<template>
  <FormKit
    type="form"
    form-class="formkit-theme"
    #default="{ value }"
    @submit="$emit('submit')"
    :submit-label="submitLabel"
    class="gap-l lay"
  >
    <div v-for="p in pages">
      <div class="lay gap-l">
        <component
          :is="grouped ? 'FormKit' : 'div'"
          v-for="g in p.groups"
          v-bind="{ type: 'group', ...g }"
          class="lay"
        >
          <ElementsText v-if="g.label" class="pb-s text-grey-700">
            {{ g.label }}
          </ElementsText>
          <div class="lay gap-m">
            <div v-for="r in g.rows" class="lay s:lay-h gap-m items-start">
              <template v-for="f in r">
                <ElementsText v-if="f.type === 'html'" :text="f.value" :theme="{ size: 's' }" />
                <FormKit
                  v-else
                  v-bind="f"
                  @node="onNode"
                  :prefix-icon="prefixIcons.get(f.type) || ''"
                  :suffix-icon="suffixIcons.get(f.type) || ''"
                  @prefix-icon-click="handlePrefixIcon"
                  @suffix-icon-click="handleSuffixIcon"
                  :decorator-icon="decoratorIcons.get(f.type) || ''"
                  select-icon="arrow"
                  file-remove-icon="cross"
                  no-files-icon="arrow"
                  validation-visibility="dirty"
                  rows="6"
                  :outer-class="f.type"
                  :size="f.multiple ? 6 : 1"
                />
              </template>
            </div>
          </div>
        </component>
      </div>
    </div>
    <pre class="py-l">{{ value }}</pre>
  </FormKit>
</template>
