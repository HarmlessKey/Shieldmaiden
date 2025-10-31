/**
 * Quasar Notify wrapper to replace vue-snotify
 *
 * This wrapper provides a compatible API for vue-snotify while using Quasar Notify underneath.
 * Supports success, error, warning, info, remove, and clear methods.
 */

import { Notify } from 'quasar';

// Store active notifications for removal
const activeNotifications = new Map();
let notificationCounter = 0;

/**
 * Create a notification wrapper
 */
class NotifyWrapper {
	/**
	 * Show a success notification
	 * @param {string} message - The notification message
	 * @param {string} title - The notification title (optional)
	 * @param {object} options - Additional options
	 */
	success(message, title, options = {}) {
		return this._create('positive', message, title, options);
	}

	/**
	 * Show an error notification
	 * @param {string} message - The notification message
	 * @param {string} title - The notification title (optional)
	 * @param {object} options - Additional options
	 */
	error(message, title, options = {}) {
		return this._create('negative', message, title, options);
	}

	/**
	 * Show a warning notification
	 * @param {string} message - The notification message
	 * @param {string} title - The notification title (optional)
	 * @param {object} options - Additional options
	 */
	warning(message, title, options = {}) {
		return this._create('warning', message, title, options);
	}

	/**
	 * Show an info notification
	 * @param {string} message - The notification message
	 * @param {string} title - The notification title (optional)
	 * @param {object} options - Additional options
	 */
	info(message, title, options = {}) {
		return this._create('info', message, title, options);
	}

	/**
	 * Remove a specific notification by ID
	 * @param {number} id - The notification ID to remove
	 */
	remove(id) {
		const dismiss = activeNotifications.get(id);
		if (dismiss) {
			dismiss();
			activeNotifications.delete(id);
		}
	}

	/**
	 * Clear all notifications
	 */
	clear() {
		activeNotifications.forEach((dismiss) => dismiss());
		activeNotifications.clear();
	}

	/**
	 * Internal method to create notifications
	 * @private
	 */
	_create(type, message, title, options = {}) {
		const id = ++notificationCounter;

		// Build the notification message
		let fullMessage = message;
		if (title && typeof title === 'string') {
			fullMessage = `<strong>${title}</strong><br>${message}`;
		}

		// Map vue-snotify position to Quasar position
		const positionMap = {
			centerTop: 'top',
			centerCenter: 'center',
			centerBottom: 'bottom',
			rightTop: 'top-right',
			rightCenter: 'right',
			rightBottom: 'bottom-right',
			leftTop: 'top-left',
			leftCenter: 'left',
			leftBottom: 'bottom-left',
		};

		// Build Quasar Notify config
		const config = {
			type,
			message: fullMessage,
			html: title ? true : false,
			position: positionMap[options.position] || 'top',
			timeout: options.timeout !== undefined ? options.timeout : 5000,
		};

		// Handle buttons (convert to Quasar actions)
		if (options.buttons && Array.isArray(options.buttons)) {
			config.actions = options.buttons.map((button) => ({
				label: button.text,
				color: 'white',
				handler: () => {
					if (button.action) {
						button.action({ id });
					}
				},
			}));
		}

		// Create the notification and store the dismiss function
		const dismiss = Notify.create(config);
		activeNotifications.set(id, dismiss);

		// Clean up from map when it auto-dismisses
		if (config.timeout > 0) {
			setTimeout(() => {
				activeNotifications.delete(id);
			}, config.timeout);
		}

		// Return a toast-like object for compatibility
		return { id };
	}
}

// Create singleton instance
const notifyWrapper = new NotifyWrapper();

/**
 * Boot file to inject $snotify into Vue app
 */
export default async ({ app }) => {
	// Make available as $snotify for backward compatibility
	app.config.globalProperties.$snotify = notifyWrapper;
};
