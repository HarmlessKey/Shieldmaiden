import { db } from '@/firebase';

export const modifierMixin = {
	methods: {
		newModifier(origin) {
			this.modifier = {
				origin: origin
			}
			this.$refs['modifier-modal'].show();
		},
		hideModal(origin) {
			this.modifier = {}
			this.$refs['modifier-modal'].hide();
		},
		addModifier() {
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(this.modifier);
			this.$refs['modifier-modal'].hide();
		},
		editModifier(modifier) {
			this.modifier = { ...modifier};
			this.$refs['modifier-modal'].show();
		},
		saveModifier(modifier) {
			const key = modifier['.key'];
			delete modifier['.key'];
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).set(modifier);
			this.modifier = {}
			this.$refs['modifier-modal'].hide();
		},
		deleteModifier(key) {
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).remove();
		}
	}
}
