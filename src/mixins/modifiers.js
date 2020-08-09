import { db } from '@/firebase';

export const modifierMixin = {
	methods: {
		newModifier(origin) {
			this.modifier = {
				origin: origin,
				type: null,
				target: null,
				subtarget: null,
				ability_modifier: null,
				restrictions: []
			}
			this.$refs['modifier-modal'].show();
		},
		hideModal() {
			this.modifier = {}
			this.$refs['modifier-modal'].hide();
		},
		addModifier() {
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(this.modifier);
			this.$refs['modifier-modal'].hide();
			this.$emit("change", "modifier.added");
		},
		editModifier(modifier) {
			this.modifier = { ...modifier};
			this.$refs['modifier-modal'].show();
		},
		saveModifier(modifier) {
			const key = modifier['.key'];
			delete modifier['.key'];

			//Clear modifier of unneeded properties
			if(!["ability", "ability_maximum", "skill"].includes(modifier.target)) {
				delete modifier.subtarget;
			}


			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).set(modifier);
			this.modifier = {}
			this.$refs['modifier-modal'].hide();
			this.$emit("change", "modifier.saved");
		},
		deleteModifier(key) {
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).remove();
			this.$emit("change", "modifier.deleted");
		}
	}
}
