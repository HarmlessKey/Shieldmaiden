import { NOTIFY_DURATION } from "src/utils/generalConstants";

export class NotEnoughSlotsError extends Error {
	constructor(message = "Not enough slots") {
		super(message);
		this.name = "NotEnoughSlotsError";
	}
}

// Shown to the user when a NotEnoughSlotsError is caught
export const NOT_ENOUGH_SLOTS_MESSAGE =
	"You've used all your available slots. Delete some content or upgrade your plan to add more.";

// Shown when a search NPC turns out not to have an NPC record (status "ghost" from npcs/resolve_npc)
export const GHOST_NPC_MESSAGE =
	"You found a ghost in the machine! This NPC doesn't exist anymore and has been removed from your list.";

// Shown when it couldn't safely be determined whether an NPC exists (status "unknown" from npcs/resolve_npc)
export const NPC_UNAVAILABLE_MESSAGE = "This NPC could not be loaded. Please try again later.";

/**
 * Notifies the user about an NPC that couldn't be resolved
 * Shown longer than the default, so the message can be read without hovering
 *
 * @param {object} snotify The component's this.$snotify
 * @param {string} status "ghost" or "unknown", as returned by npcs/resolve_npc
 */
export function notifyUnresolvedNpc(snotify, status) {
	const options = { position: "rightTop", timeout: NOTIFY_DURATION.MEDIUM };
	if (status === "ghost") {
		snotify.warning(GHOST_NPC_MESSAGE, "Ghost NPC", options);
	} else {
		snotify.error(NPC_UNAVAILABLE_MESSAGE, "Load failed", options);
	}
}
