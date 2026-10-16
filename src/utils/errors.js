export class NotEnoughSlotsError extends Error {
	constructor(message = "Not enough slots") {
		super(message);
		this.name = "NotEnoughSlotsError";
	}
}
