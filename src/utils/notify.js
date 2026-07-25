import { Notify, Dialog } from "quasar";

/**
 * Notification helpers — replaces vue-snotify with Quasar Notify + Dialog.
 *
 * Usage:
 *   import { notifySuccess, notifyError, notifyWarning, confirmAction } from "src/utils/notify";
 *   notifySuccess("Saved.", "Critical hit!");
 *   confirmAction({ title: "Delete NPC", message: "Are you sure?", onOk: () => remove(key) });
 */

export function notifySuccess(message, title, options = {}) {
	Notify.create({
		message: title ? `<b>${title}</b><br/>${message}` : message,
		html: !!title,
		type: "positive",
		position: options.position === "centerTop" ? "top" : "top-right",
		timeout: 3000,
	});
}

export function notifyError(message, title, options = {}) {
	Notify.create({
		message: title ? `<b>${title}</b><br/>${message}` : String(message),
		html: !!title,
		type: "negative",
		position: options.position === "centerCenter" ? "center" : "top-right",
		timeout: 5000,
	});
}

export function notifyWarning(message, title, options = {}) {
	Notify.create({
		message: title ? `<b>${title}</b><br/>${message}` : message,
		html: !!title,
		type: "warning",
		position: "top-right",
		timeout: options.timeout !== undefined ? options.timeout : 4000,
	});
}

export function notifyHtml(html, options = {}) {
	Notify.create({
		message: html,
		html: true,
		position: options.position || "top-right",
		timeout: options.timeout !== undefined ? options.timeout : 5000,
		color: options.color || "dark",
	});
}

export function confirmAction({ title, message, onOk, okLabel = "Yes", cancelLabel = "No" }) {
	Dialog.create({
		title,
		message,
		cancel: { label: cancelLabel, flat: true },
		ok: { label: okLabel, color: "negative", flat: true },
		persistent: true,
	}).onOk(onOk);
}

export function warningAction({ title, message, onOk, onCancel, timeout, okLabel = "OK", cancelLabel = "Dismiss" }) {
	Dialog.create({
		title,
		message,
		cancel: onCancel ? { label: cancelLabel, flat: true } : false,
		ok: { label: okLabel, flat: true },
		persistent: !timeout,
	})
		.onOk(() => onOk && onOk())
		.onCancel(() => onCancel && onCancel());
}
