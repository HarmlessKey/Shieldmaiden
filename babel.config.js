const sharedPlugins = [
	"@babel/plugin-transform-nullish-coalescing-operator",
	"@babel/plugin-transform-optional-chaining",
	"@babel/plugin-transform-export-namespace-from",
];

// Jest runs with NODE_ENV=test and needs a Node-targeted transform (the Quasar
// preset targets browsers and expects the Quasar app build context). The
// production/dev builds are untouched and keep using @quasar/babel-preset-app.
module.exports = (api) => {
	const isTest = api.env("test") || process.env.NODE_ENV === "test";

	if (isTest) {
		return {
			presets: [["@babel/preset-env", { targets: { node: "current" } }]],
			plugins: sharedPlugins,
		};
	}

	return {
		presets: ["@quasar/babel-preset-app"],
		plugins: sharedPlugins,
	};
};
