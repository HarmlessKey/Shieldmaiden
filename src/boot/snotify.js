import snotify from "src/plugins/snotify";

export default async ({ app }) => {
	app.use(snotify);
};
