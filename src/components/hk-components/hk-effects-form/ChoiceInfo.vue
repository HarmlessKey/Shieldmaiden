<template>
	<hk-popover :header="chosen ? 'Chosen when applied' : 'Can be variable'">
		<i
			aria-hidden="true"
			class="fas choice-info"
			:class="chosen ? 'fa-dice blue' : 'fa-info-circle neutral-2'"
			@click.stop
		/>
		<template #content>
			<template v-if="chosen">
				<p>
					The {{ name }} is asked when the effect is applied, or set when the effect is linked to an
					action or spell. Each creature keeps its own.
				</p>
				<p v-if="kind === 'damage_type'" class="mb-0">
					List the types the caster can pick from here, or leave it empty to allow every type.
				</p>
				<p v-else class="mb-0">
					Remove the Choice configuration of this sub-effect to set a fixed {{ name }} here.
				</p>
			</template>
			<template v-else>
				<p>
					This {{ name }} doesn't have to be fixed. Add <strong>Choice → {{ label }}</strong> in this
					sub-effect's Configuration, and the {{ name }} is asked when the effect is applied, or set
					when the effect is linked to an action or spell.
				</p>
				<p class="mb-0">{{ example }}</p>
			</template>
		</template>
	</hk-popover>
</template>

<script>
import { choice_kinds } from "src/utils/effectsConstants";

const EXAMPLES = {
	ability: "Hex is one effect: the caster picks the ability when casting it.",
	damage_type: "One Resistance effect works for every damage type: the type is picked when it's applied.",
	skill: "One skill bonus effect works for every skill: the skill is picked when it's applied.",
	condition: "One immunity effect works for every condition: the condition is picked when it's applied.",
	creature_type: "One favored enemy effect works for every creature type: the type is picked when it's applied.",
	value: "One Armor Class Bonus works for +1, +2 and +3: the number is entered when it's applied.",
};

/**
 * Info icon on a field a Choice can fill: explains that the value can be variable, or that it
 * is chosen when the effect is applied
 */
export default {
	name: "ChoiceInfo",
	props: {
		// choice_kinds key (ability, damage_type, skill, condition, creature_type, value)
		kind: { type: String, required: true },
		// The sub-effect already takes this field from a choice
		chosen: { type: Boolean, default: false },
	},
	computed: {
		label() {
			return choice_kinds[this.kind]?.label || this.kind;
		},
		name() {
			return this.label.toLowerCase();
		},
		example() {
			return EXAMPLES[this.kind];
		},
	},
};
</script>

<style lang="scss" scoped>
.choice-info {
	cursor: pointer;
	padding: 0 4px;
}
</style>
