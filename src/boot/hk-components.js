import { defineAsyncComponent } from "vue";

const lazy = (loader) => defineAsyncComponent(loader);

const HkInput = lazy(() => import("../components/hk-components/hk-input"));
const HkSelect = lazy(() => import("../components/hk-components/hk-select"));
import HkDialog from "../components/hk-components/hk-dialog"; // can't load async because it's used in mounted
const HkIcon = lazy(() => import("../components/hk-components/hk-icon"));
const HkTable = lazy(() => import("../components/hk-components/hk-table"));
const HkCard = lazy(() => import("../components/hk-components/hk-card"));
const HkCardDeck = lazy(() => import("../components/hk-components/hk-card-deck"));
const HkShowKeybind = lazy(() => import("../components/hk-components/hk-show-keybind"));
const HkRoll = lazy(() => import("../components/hk-components/hk-roll"));
const HkRollAction = lazy(() =>
	import("../components/hk-components/hk-action-rolls/hk-roll-action")
);
const HkAnimatedInteger = lazy(() => import("../components/hk-components/hk-animated-integer"));
const HkDiceText = lazy(() => import("../components/hk-components/hk-dice-text"));
const HkPopover = lazy(() => import("../components/hk-components/hk-popover"));
const HkLoader = lazy(() => import("../components/hk-components/hk-loader"));
const HkDmgTypeSelect = lazy(() => import("../components/hk-components/hk-dmg-type-select"));
const HkTip = lazy(() => import("../components/hk-components/hk-tip"));
const HkTimer = lazy(() => import("../components/hk-components/hk-timer"));
const HkShare = lazy(() => import("../components/hk-components/hk-share-button"));
const HkImageUploader = lazy(() => import("../components/hk-components/hk-image-uploader"));
const HkBackgroundSelect = lazy(() => import("../components/hk-components/hk-background-select"));
const HkMarkdownEditor = lazy(() => import("../components/hk-components/hk-markdown-editor"));
const HkXpBar = lazy(() => import("../components/hk-components/hk-xp-bar"));
const HkLinkCharacter = lazy(() => import("../components/hk-components/hk-link-character"));
const HkActionRollForm = lazy(() =>
	import("../components/hk-components/hk-action-rolls/hk-action-roll-form")
);
const HkActionRollsTable = lazy(() =>
	import("../components/hk-components/hk-action-rolls/hk-action-rolls-table")
);
const HkActionRollScaling = lazy(() =>
	import("../components/hk-components/hk-action-rolls/hk-action-roll-scaling")
);
const HkPane = lazy(() => import("../components/hk-components/hk-pane"));
const HkFilter = lazy(() => import("../components/hk-components/hk-filter"));
const HkTransformSelect = lazy(() => import("../components/hk-components/hk-transform-select"));
const HkEditionSelect = lazy(() => import("../components/hk-components/hk-edition-select"));
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
