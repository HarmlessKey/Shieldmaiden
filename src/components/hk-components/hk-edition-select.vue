<template>
  <hk-select
    class="hk-edition-select"
    v-bind="$attrs"
    v-model="edition"
    label="Edition"
    clearable
    emit-value
    map-options
    :options="edition_options"
  />
</template>

<script>
import { editions } from "src/utils/generalConstants";

export default {
  name: "hk-edition-select",
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      edition_options: editions,
    };
  },
  computed: {
    edition: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal);
      },
    },
  },
};
</script>
