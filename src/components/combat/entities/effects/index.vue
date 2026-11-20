<template>
	<div v-if="items?.length" class="entity-effects" :class="{ collapse: collapse }">
		<Effect
			v-for="effect in visible"
			:key="effect.key"
			:effect="effect"
			:entity="entity"
			:readonly="readonly"
			:effect-drawer-data="effectDrawerData"
		/>
		<div v-if="collapsed.length" class="entity-effects__collapsed" @click.stop>
			+<hk-animated-integer :value="collapsed.length" />
			<q-menu
				:dark="$store.getters.theme === 'dark'"
				anchor="bottom middle"
				self="top middle"
				transition-show="jump-down"
				transition-hide="jump-up"
			>
				<div class="entity-effects__collapsed-menu">
					<Effect
						v-for="effect in collapsed"
						:key="effect.key"
						:effect="effect"
						:entity="entity"
						:readonly="readonly"
						:effect-drawer-data="effectDrawerData"
					/>
				</div>
			</q-menu>
		</div>
	</div>
</template>

<script>
import Effect from "./Effect.vue";
import { effectChipItems } from "src/utils/effectFunctions";
import { fillVariables, reminderColor, triggerText } from "src/utils/reminderFunctions";

export default {
	name: "Effects",
	components: {
		Effect,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
		availableSpace: {
			type: Number,
		},
		collapse: {
			type: Boolean,
			default: false,
		},
		reminders: {
			type: Boolean,
			default: false,
		},
		// Active effect instances; without either flag both kinds are shown
		effects: {
			type: Boolean,
			default: false,
		},
		// Effects as [{ key, instance, definition }] instead of the tracker's store (live view)
		effectEntries: {
			type: Array,
			default: undefined,
		},
		// instance => { name, label } of the caster to show, with effectEntries
		casterOf: {
			type: Function,
			default: undefined,
		},
		// The entity's name as shown, with effectEntries
		holderName: {
			type: String,
			default: undefined,
		},
		// effect chip => the ActiveEffect drawer's data, with effectEntries (the campaign's player
		// effects, effects 8)
		effectDrawerData: {
			type: Function,
			default: undefined,
		},
		// Chips don't open the DM's drawers (live view)
		readonly: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
		};
	},
	computed: {
		items() {
			// The encounter's reminders about this entity that aren't done (effects 9); none outside
			// an encounter (the run campaign screen passes its own effect entries)
			const reminders = this.effectEntries
				? []
				: Object.entries(this.$store.getters.reminders || {})
						.filter(([, reminder]) => reminder?.entity_key === this.entityKey)
						.filter(([, reminder]) => !reminder.fired || reminder.repeat)
						.map(([key, reminder]) => ({
							type: "reminder",
							key,
							title: fillVariables(reminder.title, reminder.variables),
							trigger: triggerText(reminder.trigger),
							color: reminderColor(reminder.color),
						}));
			const all = !this.reminders && !this.effects;
			return [
				...(all || this.reminders ? reminders : []),
				...(all || this.effects ? this.effectItems : []),
			];
		},
		entityKey() {
			if (this.entity.key) return this.entity.key;
			const entities = this.$store.getters.entities || {};
			return Object.keys(entities).find((key) => entities[key] === this.entity);
		},
		/**
		 * Active effect instances as chips
		 */
		effectItems() {
			if (this.effectEntries) {
				return effectChipItems(this.effectEntries, {
					entityKey: this.entity.key,
					holderName: this.holderName,
					casterOf: this.casterOf,
				});
			}
			if (!this.entityKey || !this.$store.getters.entity_effects) return [];
			const entities = this.$store.getters.entities || {};

			return effectChipItems(this.$store.getters.entity_effects(this.entityKey), {
				entityKey: this.entityKey,
				holderName: this.entity.name,
				casterOf: (instance) => {
					const caster = entities[instance.caster_key];
					if (caster) return { name: caster.name, label: caster.name };
					// The stored name when the caster isn't in this encounter
					if (instance.caster_name) {
						return {
							name: instance.caster_name,
							label: `${instance.caster_name} (not in this encounter)`,
						};
					}
					return undefined;
				},
			});
		},
		numberOfEffectsVisible() {
			const ITEM_SIZE = 33;

			return Math.floor((this.availableSpace) / ITEM_SIZE);
		},
		visible() {
			return this.items?.length > this.numberOfEffectsVisible && this.collapse
				? this.items?.slice(0, this.numberOfEffectsVisible - 1)
				: this.items;
		},
		collapsed() {
			return this.items?.length > this.numberOfEffectsVisible && this.collapse
				? this.items?.slice(this.numberOfEffectsVisible - 1, this.items?.length + 1)
				: [];
		},
	},
};
</script>

<style lang="scss" scoped>
.entity-effects {
	display: flex;
	align-items: flex-start;
	flex-wrap: wrap;
	gap: 3px;
	flex-grow: 1;

	&.collapse {
		justify-content: flex-end;
		flex-wrap: nowrap;
	}

	&__collapsed {
		height: 30px;
		padding: 0 3px;
		position: relative;
		background-color: $neutral-7;
		border-radius: $border-radius;
		line-height: 28px;
		box-sizing: border-box;
		aspect-ratio: 1/1;
		text-align: center;
		font-weight: bold;

		&-menu {
			padding: 3px;
			background-color: $neutral-11;
			display: flex;
			flex-direction: column;
			gap: 3px;
		}
	}
}
</style>
