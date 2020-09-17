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
			this.modal = true;
		},
		hideModal() {
			this.modifier = {}
			this.modal = false;
		},
		addModifier() {
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(this.modifier);
			this.modal = false;
			this.$emit("change", "modifier.added");
		},
		editModifier(modifier) {
			this.modifier = { ...modifier};
			this.modal = true;
		},
		saveModifier(modifier) {
			const key = modifier['.key'];
			delete modifier['.key'];

			//Clear modifier of unneeded properties
			if(!["ability", "ability_maximum", "skill"].includes(modifier.target)) {
				delete modifier.subtarget;
			}
			//Delete scaling if the type is not a bonus or set
			if(!["bonus", "set"].includes(modifier.type)) {
				delete modifier.scaling_type;
				delete modifier.scaling_start;
				delete modifier.scale_size;
				delete modifier.scale_value;
			}

			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).set(modifier);
			this.modifier = {}
			this.modal = false;
			this.$emit("change", "modifier.saved");
		},
		deleteModifier(key) {
			db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).remove();
			this.$emit("change", "modifier.deleted");
		}
	}
}
