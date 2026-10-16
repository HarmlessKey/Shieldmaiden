export class NotEnoughSlotsError extends Error {
	constructor(message = "Not enough slots") {
		super(message);
		this.name = "NotEnoughSlotsError";
	}
}

// Shown to the user when a NotEnoughSlotsError is caught
export const NOT_ENOUGH_SLOTS_MESSAGE =
	"You've used all your available slots. Delete some content or upgrade your plan to add more.";
