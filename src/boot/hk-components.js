import { defineAsyncComponent } from 'vue';

const HkInput = defineAsyncComponent(() => import("../components/hk-components/hk-input"));
const HkSelect = defineAsyncComponent(() => import("../components/hk-components/hk-select"));
import HkDialog from "../components/hk-components/hk-dialog"; // can't load async because it's used in mounted
const HkIcon = defineAsyncComponent(() => import("../components/hk-components/hk-icon"));
const HkTable = defineAsyncComponent(() => import("../components/hk-components/hk-table"));
const HkCard = defineAsyncComponent(() => import("../components/hk-components/hk-card"));
const HkCardDeck = defineAsyncComponent(() => import("../components/hk-components/hk-card-deck"));
const HkShowKeybind = defineAsyncComponent(() => import("../components/hk-components/hk-show-keybind"));
const HkRoll = defineAsyncComponent(() => import("../components/hk-components/hk-roll"));
const HkRollAction = defineAsyncComponent(() => import("../components/hk-components/hk-action-rolls/hk-roll-action"));
const HkAnimatedInteger = defineAsyncComponent(() => import("../components/hk-components/hk-animated-integer"));
const HkDiceText = defineAsyncComponent(() => import("../components/hk-components/hk-dice-text"));
const HkPopover = defineAsyncComponent(() => import("../components/hk-components/hk-popover"));
const HkLoader = defineAsyncComponent(() => import("../components/hk-components/hk-loader"));
const HkDmgTypeSelect = defineAsyncComponent(() => import("../components/hk-components/hk-dmg-type-select"));
const HkTip = defineAsyncComponent(() => import("../components/hk-components/hk-tip"));
const HkTimer = defineAsyncComponent(() => import("../components/hk-components/hk-timer"));
const HkShare = defineAsyncComponent(() => import("../components/hk-components/hk-share-button"));
const HkImageUploader = defineAsyncComponent(() => import("../components/hk-components/hk-image-uploader"));
const HkBackgroundSelect = defineAsyncComponent(() => import("../components/hk-components/hk-background-select"));
const HkMarkdownEditor = defineAsyncComponent(() => import("../components/hk-components/hk-markdown-editor"));
const HkXpBar = defineAsyncComponent(() => import("../components/hk-components/hk-xp-bar"));
const HkLinkCharacter = defineAsyncComponent(() => import("../components/hk-components/hk-link-character"));
const HkActionRollForm = defineAsyncComponent(() =>
	import("../components/hk-components/hk-action-rolls/hk-action-roll-form"));
const HkActionRollsTable = defineAsyncComponent(() =>
	import("../components/hk-components/hk-action-rolls/hk-action-rolls-table"));
const HkActionRollScaling = defineAsyncComponent(() =>
	import("../components/hk-components/hk-action-rolls/hk-action-roll-scaling"));
const HkPane = defineAsyncComponent(() => import("../components/hk-components/hk-pane"));
const HkFilter = defineAsyncComponent(() => import("../components/hk-components/hk-filter"));
const HkTransformSelect = defineAsyncComponent(() => import("../components/hk-components/hk-transform-select"));
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
	app.component("hk-compendium-image", HkCompendiumImage);
};
