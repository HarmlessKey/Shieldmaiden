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
	/**
	 * Determines the type of the first argument and assigns a value to `n` based on its type.
	 * If the first argument is a string or number, `n` is set to an array of all arguments.
	 * Otherwise, `n` is set to the first argument itself.
	 *
	 * @param {...*} arguments - The arguments passed to the function.
	 * @returns {Array|*} Returns an array of arguments if the first argument is a string or number, otherwise returns the first argument.
	 */
	/**
	 * Determines the type of the first argument and assigns it to variable `t`.
	 *
	 * @type {string}
	 * @example
	 * // If the first argument is a string:
	 * var t = typeof "hello"; // t === "string"
	 *
	 * // If the first argument is a number:
	 * var t = typeof 42; // t === "number"
	 *
	 * // If the first argument is an object:
	 * var t = typeof { key: "value" }; // t === "object"
	 */
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

Number.prototype.toOrdinal = function () {
	const s = ["th", "st", "nd", "rd"];
	const v = this % 100;
	return this + (s[(v - 20) % 10] || s[v] || s[0]);
};

Array.min = function (array) {
	return Math.min.apply(Math, array);
};

