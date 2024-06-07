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

export default async ({ Vue }) => {
	Vue.component("hk-input", HkInput);
	Vue.component("hk-select", HkSelect);
	Vue.component("hk-dialog", HkDialog);
	Vue.component("hk-icon", HkIcon);
	Vue.component("hk-table", HkTable);
	Vue.component("hk-card", HkCard);
	Vue.component("hk-card-deck", HkCardDeck);
	Vue.component("hk-show-keybind", HkShowKeybind);
	Vue.component("hk-animated-integer", HkAnimatedInteger);
	Vue.component("hk-roll", HkRoll);
	Vue.component("hk-roll-action", HkRollAction);
	Vue.component("hk-loader", HkLoader);
	Vue.component("hk-dice-text", HkDiceText);
	Vue.component("hk-popover", HkPopover);
	Vue.component("hk-dmg-type-select", HkDmgTypeSelect);
	Vue.component("hk-tip", HkTip);
	Vue.component("hk-timer", HkTimer);
	Vue.component("hk-share", HkShare);
	Vue.component("hk-image-uploader", HkImageUploader);
	Vue.component("hk-background-select", HkBackgroundSelect);
	Vue.component("hk-markdown-editor", HkMarkdownEditor);
	Vue.component("hk-xp-bar", HkXpBar);
	Vue.component("hk-link-character", HkLinkCharacter);
	Vue.component("hk-action-roll-form", HkActionRollForm);
	Vue.component("hk-action-rolls-table", HkActionRollsTable);
	Vue.component("hk-action-roll-scaling", HkActionRollScaling);
	Vue.component("hk-pane", HkPane);
	Vue.component("hk-filter", HkFilter);
	Vue.component("hk-transform-select", HkTransformSelect);
};
