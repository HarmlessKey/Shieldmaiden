import mitt from "mitt";

// Vue 3 instances are no longer event emitters, so the app-wide bus is a mitt
// emitter. API: EventBus.on(type, handler) / .off(type, handler) / .emit(type, payload).
// Handlers receive a single payload argument.
export const EventBus = mitt();
