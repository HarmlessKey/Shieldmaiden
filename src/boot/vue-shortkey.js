// NOTE: vue-shortkey is not Vue 3 compatible and has been removed
// This boot file is no longer loaded (removed from quasar.config.js)
//
// Alternative Solutions:
// 1. Use @vueuse/core: import { useEventListener } from '@vueuse/core'
// 2. Use native event listeners with key detection
// 3. Find a Vue 3 compatible keyboard shortcut library
//
// Example with @vueuse/core:
// import { useEventListener } from '@vueuse/core'
// useEventListener(document, 'keydown', (e) => {
//   if (e.key === 's' && e.ctrlKey) {
//     e.preventDefault()
//     // Handle save
//   }
// })
//
// TODO: Search codebase for v-shortkey directive usage and replace
// Search pattern: v-shortkey

export default async ({ app }) => {
	console.warn('vue-shortkey has been removed. Keyboard shortcuts need reimplementation.');
	// No-op for now - components using v-shortkey will need updates
};