<template>
	<div v-if="items?.length" class="entity-effects" :class="{ collapse: collapse }">
		<Effect v-for="effect in visible" :key="effect.key" :effect="effect" :entity="entity" />
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
					<Effect v-for="effect in collapsed" :key="effect.key" :effect="effect" :entity="entity" />
				</div>
			</q-menu>
		</div>
	</div>
</template>

<script>
import Effect from "./Effect.vue";
import { remindersMixin } from "src/mixins/reminders";
import { describeDuration, effectBadge } from "src/utils/effectFunctions";

export default {
	name: "Effects",
	mixins: [remindersMixin],
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
	},
	data() {
		return {
		};
	},
	computed: {
		items() {
			const reminders = this.entity.reminders
				? Object.entries(this.entity.reminders).map(([key, reminder]) => {
						return {
							type: "reminder",
							key: key,
							title: reminder?.selectedVars
								? this.replaceReminderVariables(title, reminder?.selectedVars)
								: reminder.title,
							value: reminder?.rounds,
							color: reminder?.color,
						};
					})
				: [];
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
			if (!this.entityKey || !this.$store.getters.entity_effects) return [];
			const entities = this.$store.getters.entities || {};

			return this.$store.getters.entity_effects(this.entityKey).map(({ key, instance, definition }) => {
				const name = (definition?.name || instance.name || "").capitalize();
				const isCondition = instance.source === "srd" && definition?.category === "condition";
				const caster = entities[instance.caster_key];

				return {
					type: "effect",
					key: `effect:${key}`,
					effectKey: key,
					entityKey: this.entityKey,
					icon: isCondition ? instance.source_key : undefined,
					initial: name.charAt(0),
					title: name,
					value: effectBadge(instance),
					duration: describeDuration(instance, {
						casterName: caster?.name || instance.caster_name,
						holderName: this.entity.name,
					}),
					// The stored name when the caster isn't in this encounter
					caster: caster
						? caster.name
						: instance.caster_name
						? `${instance.caster_name} (not in this encounter)`
						: undefined,
				};
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
