import { configureCompat } from "vue";

configureCompat({
	MODE: 2, // Run in Vue 2 mode by default
	INSTANCE_EVENT_EMITTER: false, // Already migrated to mitt in Phase 0
});
