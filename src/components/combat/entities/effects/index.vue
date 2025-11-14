<template>
	<div v-if="effects?.length" class="entity-effects" :class="{ collapse: collapse }">
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
		conditions: {
			type: Boolean,
			default: false,
		},
		reminders: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
		};
	},
	computed: {
		effects() {
			const conditions = this.entity.conditions
				? Object.entries(this.entity.conditions).map(([key, value]) => {
						return {
							type: "condition",
							key: key,
							icon: key,
							title: key.capitalize(),
							value: key === "exhaustion" ? value : null,
						};
					})
				: [];
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
			if (this.reminders && !this.conditions) {
				return reminders;
			}
			if (this.conditions && !this.reminders) {
				return conditions;
			}
			return [...reminders, ...conditions];
		},
		numberOfEffectsVisible() {
			const ITEM_SIZE = 33;

			return Math.floor((this.availableSpace) / ITEM_SIZE);
		},
		visible() {
			return this.effects?.length > this.numberOfEffectsVisible && this.collapse
				? this.effects?.slice(0, this.numberOfEffectsVisible - 1)
				: this.effects;
		},
		collapsed() {
			return this.effects?.length > this.numberOfEffectsVisible && this.collapse
				? this.effects?.slice(this.numberOfEffectsVisible - 1, this.effects?.length + 1)
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
