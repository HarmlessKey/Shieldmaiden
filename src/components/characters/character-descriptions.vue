<template>
  <div v-html="text" />
</template>

<script>
import sanitizeHtml from 'sanitize-html';
import { marked } from "marked";

export default {
  name: "CharacterDescription",
  props: {
    value: {
      type: String
    }
  },
  computed: {
    text() {
      return sanitizeHtml(marked.parse(this.value || ""));
    }
  }
}
</script>