String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.capitalizeEach = function (sep = " ") {
	return this.split(sep)
		.map((s) => s.capitalize())
		.join(sep);
};

String.prototype.formatUnicorn = function () {
	var e = this.toString();
	if (!arguments.length) return e;
	var t = typeof arguments[0],
		n = "string" === t || "number" === t ? Array.prototype.slice.call(arguments) : arguments[0];
	for (var o in n) e = e.replace(new RegExp("\\{" + o + "\\}", "gi"), n[o]);
	return e;
};

// Returns a number equal to or higher than a given minimum
Number.prototype.min = function (min = 0) {
	return Math.max(this, min);
};

// Returns a number equal to or higher than a given minimum
Number.prototype.max = function (max = Infinity) {
	return Math.min(this, max);
};

// Returns a number equal to or higher than a given minimum and lower than or equal to a given maximum
Number.prototype.between = function (min = 0, max = Infinity) {
	return Math.max(Math.min(this, max), min);
};

Array.min = function (array) {
	return Math.min.apply(Math, array);
};

/**
 * Returns the browser type
 * @return {string} browser: Opera, Firefox, Safari, IE, edge, chrome
 */
/* eslint-disable */ export function browserDetect() {
	if (process.browser) {
		// Opera 8.0+
		const isOpera =
			(!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;

		// Firefox 1.0+
		const isFirefox = typeof InstallTrigger !== "undefined";

		// Safari 3.0+ "[object HTMLElementConstructor]"
		const isSafari =
			/constructor/i.test(window.HTMLElement) ||
			(function (p) {
				return p.toString() === "[object SafariRemoteNotification]";
			})(!window["safari"] || (typeof safari !== "undefined" && window["safari"].pushNotification));

		// Internet Explorer 6-11
		const isIE = /*@cc_on!@*/ false || !!document.documentMode;

		// Edge 20+
		const isEdge = !isIE && !!window.StyleMedia;

		// Chrome 1 - 79
		const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

		// Edge (based on chromium) detection
		const isEdgeChromium = isChrome && navigator.userAgent.indexOf("Edg") != -1;

		return isOpera
			? "Opera"
			: isFirefox
			? "Firefox"
			: isSafari
			? "Safari"
			: isEdgeChromium
			? "Edge"
			: isChrome
			? "Chrome"
			: isIE
			? "IE"
			: isEdge
			? "Edge"
			: "Don't know";
	}
	return "Not a browser";
}
