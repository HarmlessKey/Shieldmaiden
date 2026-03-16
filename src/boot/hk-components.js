const HkInput = () => import("../components/hk-components/hk-input");
const HkSelect = () => import("../components/hk-components/hk-select");
import HkDialog from "../components/hk-components/hk-dialog"; // can't load async because it's used in mounted
const HkIcon = () => import("../components/hk-components/hk-icon");
const HkTable = () => import("../components/hk-components/hk-table");
const HkCard = () => import("../components/hk-components/hk-card");
const HkCardDeck = () => import("../components/hk-components/hk-card-deck");
const HkShowKeybind = () => import("../components/hk-components/hk-show-keybind");
const HkRoll = () => import("../components/hk-components/hk-roll");
const HkRollAction = () => import("../components/hk-components/hk-action-rolls/hk-roll-action");
const HkAnimatedInteger = () => import("../components/hk-components/hk-animated-integer");
const HkDiceText = () => import("../components/hk-components/hk-dice-text");
const HkPopover = () => import("../components/hk-components/hk-popover");
const HkLoader = () => import("../components/hk-components/hk-loader");
const HkDmgTypeSelect = () => import("../components/hk-components/hk-dmg-type-select");
const HkTip = () => import("../components/hk-components/hk-tip");
const HkTimer = () => import("../components/hk-components/hk-timer");
const HkShare = () => import("../components/hk-components/hk-share-button");
const HkImageUploader = () => import("../components/hk-components/hk-image-uploader");
const HkBackgroundSelect = () => import("../components/hk-components/hk-background-select");
const HkMarkdownEditor = () => import("../components/hk-components/hk-markdown-editor");
const HkXpBar = () => import("../components/hk-components/hk-xp-bar");
const HkLinkCharacter = () => import("../components/hk-components/hk-link-character");
const HkActionRollForm = () =>
	import("../components/hk-components/hk-action-rolls/hk-action-roll-form");
const HkActionRollsTable = () =>
	import("../components/hk-components/hk-action-rolls/hk-action-rolls-table");
const HkActionRollScaling = () =>
	import("../components/hk-components/hk-action-rolls/hk-action-roll-scaling");
const HkPane = () => import("../components/hk-components/hk-pane");
const HkFilter = () => import("../components/hk-components/hk-filter");
const HkTransformSelect = () => import("../components/hk-components/hk-transform-select");
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
