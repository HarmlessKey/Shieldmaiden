import shortkey from "src/directives/shortkey";

export default async ({ app }) => {
	app.use(shortkey);
};
