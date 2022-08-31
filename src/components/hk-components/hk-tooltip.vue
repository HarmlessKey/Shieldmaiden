<template>
  <q-tooltip :anchor="anchor" :self="self">
    <slot />
  </q-tooltip>
</template>

<script>
export default {
  name: "CompileTooltip",
  props: {
    anchor: {
      type: String,
      default: "top middle"
    },
    self: {
      type: String,
      default: "center middle"
    }
  }
}
</script>