// NOTE: vue-snotify is not Vue 3 compatible and has been removed
// This boot file is no longer loaded (removed from quasar.config.js)
//
// Replacement: Use Quasar Notify (already available)
// Quasar Notify is already configured in quasar.config.js plugins
//
// Migration Guide:
// Old (vue-snotify):
//   this.$snotify.success('Success message')
//   this.$snotify.error('Error message')
//   this.$snotify.info('Info message')
//
// New (Quasar Notify):
//   import { Notify } from 'quasar'
//   Notify.create({ type: 'positive', message: 'Success message' })
//   Notify.create({ type: 'negative', message: 'Error message' })
//   Notify.create({ type: 'info', message: 'Info message' })
//
// Or in composition API:
//   import { useQuasar } from 'quasar'
//   const $q = useQuasar()
//   $q.notify({ type: 'positive', message: 'Success message' })
//
// Or in Options API:
//   this.$q.notify({ type: 'positive', message: 'Success message' })
//
// TODO: Search codebase for $snotify usage and replace with Quasar Notify
// Search pattern: \$snotify

export default async ({ app }) => {
	console.warn('vue-snotify has been removed. Use Quasar Notify instead: this.$q.notify()');
	// No-op for now - components using $snotify will need updates
};