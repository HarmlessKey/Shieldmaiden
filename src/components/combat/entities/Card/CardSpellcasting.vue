<template>
	<div class="card-spellcasting">
		<h3 class="label">Spellcasting</h3>
		<template v-if="entity.caster_ability">
			<div class="stats">
				<div>
					<div class="truncate label value__label">Ability</div>
					<div class="value">{{ entity.caster_ability.substring(0, 3).toUpperCase() }}</div>
				</div>
				<div>
					<div class="truncate label value__label">Save DC</div>
					<div class="value">{{ entity.caster_save_dc }}</div>
				</div>
				<div>
					<div class="truncate label value__label">Attack</div>
					<div class="value">
						{{
							entity.caster_spell_attack > 0
								? `+${entity.caster_spell_attack}`
								: entity.caster_spell_attack
						}}
					</div>
				</div>
			</div>
			<p>
				<strong><em>Spellcasting</em></strong>
				The {{ entity.name.capitalizeEach() }} is a {{ entity.caster_level | numeral("Oo") }}-level
				spellcaster. Its spellcasting ability is {{ entity.caster_ability.capitalize() }} (spell
				save DC {{ entity.caster_save_dc }},
				{{
					entity.caster_spell_attack > 0
						? `+${entity.caster_spell_attack}`
						: entity.caster_spell_attack
				}}
				to hit with spell attacks). The {{ entity.name.capitalizeEach() }} has the following spells
				prepared:
			</p>
			<strong><em>Spells</em></strong
			><br />
			<p>
				<template v-for="level in caster_spell_levels">
					<div :key="`spell-${level}`">
						<template v-if="level === 0"> Cantrips (at will): </template>
						<template v-else>
							{{ level | numeral("Oo") }} level ({{ entity.caster_spell_slots[level] }} slots):
						</template>
						<i aria-hidden="true" v-for="(spell, index) in spellsForLevel(level)" :key="spell.name">
							<hk-popover>
								{{ spell.name }}
								<template #content> <Spell :id="spell.key" /> </template
							></hk-popover>
							<!-- eslint-disable-next-line vue/no-parsing-error -->
							{{ index + 1 < spellsForLevel(level).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>

		<!-- INNATE SPELLCASTING -->
		<template v-if="entity.innate_ability">
			<div class="stats">
				<div>
					<div class="truncate label value__label">Ability</div>
					<div class="value">{{ entity.innate_ability.substring(0, 3).toUpperCase() }}</div>
				</div>
				<div>
					<div class="truncate label value__label">Save DC</div>
					<div class="value">{{ entity.innate_save_dc }}</div>
				</div>
				<div>
					<div class="truncate label value__label">Attack</div>
					<div class="value">
						{{
							entity.innate_spell_attack > 0
								? `+${entity.innate_spell_attack}`
								: entity.innate_spell_attack
						}}
					</div>
				</div>
			</div>
			<p>
				<strong><em>Innate spellcasting</em></strong>
				The {{ entity.name.capitalizeEach() }}'s innate spellcasting ability is
				{{ entity.innate_ability.capitalize() }} (spell save DC {{ entity.innate_save_dc }},
				{{
					entity.innate_spell_attack > 0
						? `+${entity.innate_spell_attack}`
						: entity.innate_spell_attack
				}}
				to hit with spell attacks). The {{ entity.name.capitalizeEach() }} can cast the following
				spells, requiring no material components:
			</p>
			<strong><em>Innate spells</em></strong
			><br />
			<p>
				<template v-for="limit in innate_spell_levels">
					<div :key="`spell-${limit}`">
						<template v-if="limit === Infinity"> At will: </template>
						<template v-else> {{ limit }}/day each: </template>
						<i aria-hidden="true" v-for="(spell, index) in spellsForLimit(limit)" :key="spell.name">
							<hk-popover>
								{{ spell.name }}
								<template #content>
									<Spell :id="spell.key" />
								</template>
							</hk-popover>
							<!-- eslint-disable-next-line vue/no-parsing-error -->
							{{ index + 1 < spellsForLimit(limit).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import Spell from "src/components/compendium/Spell.vue";

export default {
	name: "CardDetails",
	mixins: [],
	components: {
		Spell,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {};
	},
	computed: {
		...mapGetters(["broadcast", "targeted"]),
		spellCasting() {
			let casting = [];
			if (this.entity.innate_ability)
				casting.push({
					name: "innate",
					label: "Innate spellcasting",
				});
			if (this.entity.caster_ability)
				casting.push({
					name: "caster",
					label: "Spellcasting",
				});
			return casting;
		},
		caster_spell_levels() {
			if (this.entity.caster_spells) {
				let levels = [];
				for (const spell of Object.values(this.entity.caster_spells)) {
					if (!levels.includes(spell.level)) levels.push(spell.level);
				}
				return levels.sort();
			}
			return [];
		},
		innate_spell_levels() {
			if (this.entity.innate_spells) {
				let levels = [];
				for (const spell of Object.values(this.entity.innate_spells)) {
					const limit = spell.limit ? spell.limit : Infinity;
					if (!levels.includes(limit)) levels.push(limit);
				}
				levels = levels.sort();
				return levels.reverse();
			}
			return [];
		},
	},
	methods: {
		spellsForLevel(level) {
			return Object.entries(this.entity.caster_spells)
				.filter(([key, item]) => {
					item.key = key;
					return item.level == level;
				})
				.map((item) => {
					return item[1];
				});
		},
		spellsForLimit(limit) {
			return Object.entries(this.entity.innate_spells)
				.filter(([key, item]) => {
					item.key = key;
					if (item.limit === 0) item.limit = Infinity;
					return item.limit == limit;
				})
				.map((item) => {
					return item[1];
				});
		},
	},
};
</script>

<style lang="scss" scoped>
.card-spellcasting {
}
</style>
