// These are all registered synchronously, where Vue 2 registered most of them with an
// `() => import(...)` factory.
//
// Vue 3 defers hydration of an async component's subtree until its chunk has loaded,
// which is after the app has mounted. Anything that changes on mount has then already
// changed by the time the subtree hydrates: a component's own `loading` flag, and
// Quasar's `isRuntimeSsrPreHydration` (QImg renders a different tree once it is false).
// The result was "Hydration completed but contains mismatches." in the console — an
// error, not a warning, and it is logged in production builds too.
//
// Splitting them per component would mean auditing, for every one of them, whether it
// can end up in server-rendered markup on any route, including the auth-gated ones.
// Registering them all up front is the version that cannot silently break later.
import HkInput from "../components/hk-components/hk-input";
import HkSelect from "../components/hk-components/hk-select";
import HkDialog from "../components/hk-components/hk-dialog";
import HkIcon from "../components/hk-components/hk-icon";
import HkTable from "../components/hk-components/hk-table";
import HkCard from "../components/hk-components/hk-card";
import HkCardDeck from "../components/hk-components/hk-card-deck";
import HkShowKeybind from "../components/hk-components/hk-show-keybind";
import HkRoll from "../components/hk-components/hk-roll";
import HkRollAction from "../components/hk-components/hk-action-rolls/hk-roll-action";
import HkAnimatedInteger from "../components/hk-components/hk-animated-integer";
import HkDiceText from "../components/hk-components/hk-dice-text";
import HkPopover from "../components/hk-components/hk-popover";
import HkLoader from "../components/hk-components/hk-loader";
import HkDmgTypeSelect from "../components/hk-components/hk-dmg-type-select";
import HkTip from "../components/hk-components/hk-tip";
import HkTimer from "../components/hk-components/hk-timer";
import HkShare from "../components/hk-components/hk-share-button";
import HkImageUploader from "../components/hk-components/hk-image-uploader";
import HkBackgroundSelect from "../components/hk-components/hk-background-select";
import HkMarkdownEditor from "../components/hk-components/hk-markdown-editor";
import HkXpBar from "../components/hk-components/hk-xp-bar";
import HkLinkCharacter from "../components/hk-components/hk-link-character";
import HkActionRollForm from "../components/hk-components/hk-action-rolls/hk-action-roll-form";
import HkActionRollsTable from "../components/hk-components/hk-action-rolls/hk-action-rolls-table";
import HkActionRollScaling from "../components/hk-components/hk-action-rolls/hk-action-roll-scaling";
import HkPane from "../components/hk-components/hk-pane";
import HkFilter from "../components/hk-components/hk-filter";
import HkTransformSelect from "../components/hk-components/hk-transform-select";
import HkEditionSelect from "../components/hk-components/hk-edition-select";
import HkCompendiumImage from "../components/hk-components/hk-compendium-image";

export default async ({ app }) => {
	app.component("hk-input", HkInput);
	app.component("hk-select", HkSelect);
	app.component("hk-dialog", HkDialog);
	app.component("hk-icon", HkIcon);
	app.component("hk-table", HkTable);
	app.component("hk-card", HkCard);
	app.component("hk-card-deck", HkCardDeck);
	app.component("hk-show-keybind", HkShowKeybind);
	app.component("hk-animated-integer", HkAnimatedInteger);
	app.component("hk-roll", HkRoll);
	app.component("hk-roll-action", HkRollAction);
	app.component("hk-loader", HkLoader);
	app.component("hk-dice-text", HkDiceText);
	app.component("hk-popover", HkPopover);
	app.component("hk-dmg-type-select", HkDmgTypeSelect);
	app.component("hk-tip", HkTip);
	app.component("hk-timer", HkTimer);
	app.component("hk-share", HkShare);
	app.component("hk-image-uploader", HkImageUploader);
	app.component("hk-background-select", HkBackgroundSelect);
	app.component("hk-markdown-editor", HkMarkdownEditor);
	app.component("hk-xp-bar", HkXpBar);
	app.component("hk-link-character", HkLinkCharacter);
	app.component("hk-action-roll-form", HkActionRollForm);
	app.component("hk-action-rolls-table", HkActionRollsTable);
	app.component("hk-action-roll-scaling", HkActionRollScaling);
	app.component("hk-pane", HkPane);
	app.component("hk-filter", HkFilter);
	app.component("hk-transform-select", HkTransformSelect);
	app.component("hk-edition-select", HkEditionSelect);
	app.component("hk-compendium-image", HkCompendiumImage);
};
