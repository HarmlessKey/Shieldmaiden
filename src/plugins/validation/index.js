import ValidationProvider from "./ValidationProvider";
import ValidationObserver from "./ValidationObserver";
import { extend } from "./rules";

export { ValidationProvider, ValidationObserver, extend };

export default {
	install(app) {
		app.component("ValidationProvider", ValidationProvider);
		app.component("ValidationObserver", ValidationObserver);
	},
};
