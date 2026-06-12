<template>
	<ActionsDropdown
		v-if="available_types?.length"
		v-model="show"
		:types="available_types"
		type="spells"
	>
		<template #select-type>
			<q-item
				v-for="key in available_types"
				:key="key"
				:clickable="!(selected_type?.length === 1 && selected_type.includes(key))"
				v-ripple
				v-close-popup
				:class="{ active: selected_type?.length === 1 && selected_type.includes(key) }"
				@click="((selected_type = key), (show = true))"
			>
				<q-item-section>
					{{ spell_types[key].label }}
				</q-item-section>
			</q-item>
		</template>
		<q-item v-if="selected_type === 'caster'" class="d-flex gap-05 items-center p-2">
			<button
				v-for="level of spell_levels"
				class="btn btn-sm"
				:class="{
					'bg-neutral-5': !selected_levels?.includes(level),
					'bg-neutral-7 neutral-2':
						!selected_levels?.includes(level) &&
						actor.limited_uses?.[selected_type]?.[level] >=
							actor[`${selected_type}_spell_slots`]?.[level],
				}"
				:key="level"
				@click="selectLevel(level)"
			>
				{{ level === 0 ? "C" : level }}
			</button>
		</q-item>
		<RollSpells
			:actor="actor"
			:levels="selected_levels"
			:type="selected_type"
			@roll="show = false"
		/>
	</ActionsDropdown>
</template>

<script>
import ActionsDropdown from "./ActionsDropdown.vue";
import RollSpells from "../actions/RollSpells.vue";

export default {
	name: "ActorSpells",
	components: {
		ActionsDropdown,
		RollSpells,
	},
	props: {
		actor: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			typeSetter: undefined,
			casterLevelSetter: undefined,
			show: false,
			spell_types: {
				caster: { label: "Spellcasting", name: "caster" },
				innate: { label: "Innate spellcasting", name: "innate" },
			},
		};
	},
	computed: {
		available_types() {
			let types = this.actor.caster_ability ? ["caster"] : [];
			if (this.actor.innate_ability) {
				types.push("innate");
			}
			return types;
		},
		selected_type: {
			get() {
				return this.typeSetter ? this.typeSetter : this.available_types[0];
			},
			set(newVal) {
				this.typeSetter = newVal;
			},
		},
		selected_levels: {
			get() {
				if (this.selected_type === "innate") return this.spell_levels;
				return this.casterLevelSetter ? this.casterLevelSetter : [0];
			},
			set(newVal) {
				this.casterLevelSetter = newVal;
			},
		},
		spell_levels() {
			let levels = [];
			const spells = this.actor[`${this.selected_type}_spells`];

			if (spells) {
				if (this.selected_type === "caster") {
					for (const spell of Object.values(spells)) {
						if (!levels.includes(spell.level)) levels.push(spell.level);
					}
					levels = levels.sort();
				} else {
					for (const spell of Object.values(spells)) {
						if (!spell.limit) spell.limit = Infinity;
						if (!levels.includes(spell.limit)) levels.push(spell.limit);
					}
					levels = levels.sort();
					levels = levels.reverse();
				}
			}
			return levels;
		},
	},
	methods: {
		selectLevel(level) {
			if (this.selected_levels.includes(level)) {
				this.selected_levels = this.selected_levels.filter((item) => item !== level);
			} else {
				this.selected_levels = [...this.selected_levels, level];
			}
			this.selected_levels = this.selected_levels.sort();
		},
	},
};
</script>

<style lang="scss" scoped>
.active {
	font-weight: bold;
}
</style>
