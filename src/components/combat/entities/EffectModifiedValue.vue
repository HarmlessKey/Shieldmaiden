<template>
	<span
		class="effect-modified-value"
		:class="{ modified: isModified, clickable }"
		@click="clickable ? openBonuses($event) : undefined"
	>
		<slot>{{ value }}</slot>
		<b v-if="advantageLetter" class="advantage-letter" :class="advantageLetter === 'A' ? 'green' : 'red'">{{
			advantageLetter
		}}</b>
		<q-tooltip v-if="tooltipLines.length" anchor="top middle" self="bottom middle">
			<div
				v-for="(line, index) in tooltipLines"
				:key="index"
				:class="{ 'not-applied': line.applied === false }"
			>
				<template v-if="line.note">{{ line.note }}</template>
				<template v-else>
					{{ line.name }}: {{ line.text }}{{ line.applied ? "" : " (not applied)" }}
				</template>
			</div>
		</q-tooltip>
	</span>
</template>

<script>
/**
 * A value of an effective entity (store getter effective_entity), marked when effects
 * changed it, with a tooltip listing the effects that did and how.
 * Roll modifiers (rollPlan) pass their own notes and changed state instead.
 */
export default {
	name: "EffectModifiedValue",
	props: {
		// Effective entity: carries effect_modifiers and stored
		entity: {
			type: Object,
			default: () => ({}),
		},
		// Field of the entity; "ac" and "speed" follow displayStats (transformed AC, walk speed)
		field: {
			type: String,
			default: undefined,
		},
		// Shown when there is no slot content
		value: {
			type: [String, Number],
			default: undefined,
		},
		// Manual bonus key (BONUS_VALUES); clicking opens the bonuses drawer for it
		bonus: {
			type: String,
			default: undefined,
		},
		// Tooltip lines instead of the entity's effect_modifiers (rollPlan notes)
		notes: {
			type: Array,
			default: undefined,
		},
		// Marked state instead of the entity's stored values (rollPlan changed)
		changed: {
			type: Boolean,
			default: undefined,
		},
		// Advantage object of a roll (rollPlan advantage): a green A or a red D; both cancel
		advantage: {
			type: Object,
			default: undefined,
		},
	},
	computed: {
		advantageLetter() {
			const advantage = !!this.advantage?.advantage;
			const disadvantage = !!this.advantage?.disadvantage;
			if (advantage === disadvantage) return undefined;
			return advantage ? "A" : "D";
		},
		clickable() {
			return !!this.bonus && !!this.$store.getters.entities?.[this.entity.key];
		},
		resolvedField() {
			if (this.field === "ac" && this.entity.transformed) return "transformedAc";
			if (this.field === "speed" && this.entity.speed === undefined) return "walk_speed";
			return this.field;
		},
		isModified() {
			if (this.changed !== undefined) return this.changed;
			return !!this.entity.stored && !!this.resolvedField && this.resolvedField in this.entity.stored;
		},
		tooltipLines() {
			if (this.notes) return this.notes.map((note) => ({ note }));
			return this.entity.effect_modifiers?.[this.resolvedField] || [];
		},
	},
	methods: {
		openBonuses(event) {
			event.stopPropagation();
			this.$store.dispatch("setDrawer", {
				show: true,
				type: "drawers/encounter/StatBonuses",
				data: { entityKey: this.entity.key, stat: this.bonus },
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.effect-modified-value {
	&.modified {
		color: $blue;
		font-weight: bold;
	}
	&.clickable {
		cursor: pointer;

		&:hover {
			text-decoration: underline dotted;
		}
	}
}
.not-applied {
	opacity: 0.6;
}
.advantage-letter {
	margin-left: 2px;
	font-size: 0.8em;
}
</style>
