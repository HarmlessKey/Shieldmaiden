import { Notify } from "quasar";

/**
 * Drop-in replacement for the `$snotify` API that vue-snotify provided on Vue 2,
 * implemented on top of Quasar's Notify plugin.
 *
 * Only the surface the app actually uses is implemented:
 *   $snotify.success(message, title?, options?)
 *   $snotify.error(message, title?, options?)
 *   $snotify.warning(message, title?, options?)
 *   $snotify.info(message, title?, options?)
 *   $snotify.html(html, options?)
 *   $snotify.remove(id?)        // no id removes everything, as in vue-snotify
 *   $snotify.clear()
 *
 * Supported options: { timeout, buttons: [{ text, action(toast), bold }], position,
 * closeOnClick }. A timeout of 0 means "stay until dismissed", same as vue-snotify.
 *
 * Every create returns a toast object with an `id`, so the vue-snotify idiom
 * `action: (toast) => this.$snotify.remove(toast.id)` keeps working.
 */

const POSITIONS = {
	leftTop: "top-left",
	leftCenter: "left",
	leftBottom: "bottom-left",
	rightTop: "top-right",
	rightCenter: "right",
	rightBottom: "bottom-right",
	centerTop: "top",
	centerCenter: "center",
	centerBottom: "bottom",
};

const TYPES = {
	success: { color: "positive", icon: "fas fa-check" },
	error: { color: "negative", icon: "fas fa-exclamation-triangle" },
	warning: { color: "warning", icon: "fas fa-exclamation-circle", textColor: "black" },
	info: { color: "info", icon: "fas fa-info-circle" },
};

// Active toasts by id, so remove(id) can dismiss a specific one.
const active = new Map();
let nextId = 1;

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function create(type, message, title, options = {}) {
	const id = nextId++;
	const toast = { id };
	const style = TYPES[type] || {};

	// vue-snotify rendered title and body as two lines; Notify takes a single message.
	const body = title
		? `<b>${escapeHtml(title)}</b><br>${escapeHtml(message)}`
		: escapeHtml(message);

	const actions = (options.buttons || []).map((button) => ({
		label: button.text,
		color: "white",
		class: button.bold ? "text-weight-bold" : undefined,
		handler: () => button.action && button.action(toast),
	}));

	const dismiss = Notify.create({
		message: body,
		html: true,
		color: style.color,
		textColor: style.textColor,
		icon: style.icon,
		position: POSITIONS[options.position] || "top",
		// vue-snotify: timeout 0 === never auto-close. Quasar: timeout 0 === same.
		timeout: options.timeout === undefined ? 4000 : options.timeout,
		closeBtn: options.timeout === 0 && actions.length === 0 ? "Close" : false,
		actions,
		group: false,
		onDismiss: () => active.delete(id),
	});

	active.set(id, dismiss);
	toast.close = () => remove(id);
	return toast;
}

function remove(id) {
	if (id === undefined) {
		return clear();
	}
	const dismiss = active.get(id);
	if (dismiss) {
		dismiss();
		active.delete(id);
	}
}

function clear() {
	active.forEach((dismiss) => dismiss());
	active.clear();
}

export const snotify = {
	success: (message, title, options) => create("success", message, title, options),
	error: (message, title, options) => create("error", message, title, options),
	warning: (message, title, options) => create("warning", message, title, options),
	info: (message, title, options) => create("info", message, title, options),
	html: (html, options = {}) => {
		const id = nextId++;
		const toast = { id };
		const dismiss = Notify.create({
			message: html,
			html: true,
			position: POSITIONS[options.position] || "top",
			timeout: options.timeout === undefined ? 4000 : options.timeout,
			color: options.color || "dark",
			onDismiss: () => active.delete(id),
		});
		active.set(id, dismiss);
		toast.close = () => remove(id);
		return toast;
	},
	remove,
	clear,
};

export default {
	install(app) {
		app.config.globalProperties.$snotify = snotify;
	},
};
