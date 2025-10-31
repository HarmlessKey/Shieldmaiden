/**
 * Event Bus for Vue 3 using mitt
 *
 * Replaces Vue 2's $root.$on/$emit event bus pattern.
 * In Vue 3, the instance methods $on, $off, and $once have been removed.
 *
 * Usage:
 *   import { eventBus } from 'src/utils/eventBus'
 *
 *   // Listen to event
 *   eventBus.on('event-name', handler)
 *
 *   // Emit event
 *   eventBus.emit('event-name', data)
 *
 *   // Remove listener
 *   eventBus.off('event-name', handler)
 *
 *   // Remove all listeners
 *   eventBus.all.clear()
 */

import mitt from 'mitt';

export const eventBus = mitt();
