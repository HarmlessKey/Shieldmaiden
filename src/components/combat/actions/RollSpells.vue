<template>
	<div v-if="actions">
		<q-list :dark="$store.getters.theme === 'dark'" square class="accordion mb-3">
			<q-expansion-item
				v-for="spell in spellsForLevel(tab, level)"
				:key="`${level}-${spell.key}`"
				:dark="$store.getters.theme === 'dark'"
				switch-toggle-side
				expand-icon-class="hidden-toggle"
				@show="showSpell = `${level}-${spell.key}`"
				:group="tab"
				:name="name"
				@focus="focusButton(level, spell.key)"
			>
				<template v-slot:header>
					<q-item-section :class="checkAvailable(tab, level, spell.key) ? '' : 'is-disabled'">
						<q-item-label>
							{{ spell.name.capitalizeEach() }}
						</q-item-label>
					</q-item-section>
					<q-item-section avatar v-if="tab === 'caster'">
						<hk-roll-action
							v-if="spell.actions && spell.actions.length"
							:ref="`${level}-${spell.key}`"
							:action="spell"
							:tooltip="`Roll ${spell.name}`"
							type="spell"
							:cast-level="level"
							:caster-level="entity[`${name}_level`]"
							@roll="startRoll(...arguments, level, spell, tab)"
							:disabled="!checkAvailable(tab, level, spell.key)"
						>
							<span class="roll-button" />
						</hk-roll-action>
						<a
							v-else-if="checkAvailable(tab, level, spell.key) && level > 0"
							class="neutral-1"
							@click.stop="useSpellSlot(level, tab)"
						>
							Cast
						</a>
					</q-item-section>
					<q-item-section
						v-else
						class="d-flex flex-row items-center gap-1 justify-content-start"
						avatar
					>
						<span v-if="level < Infinity" class="slots">
							<span
								v-for="i in level"
								:key="`limited-${i}`"
								class="ml-1"
								@click.stop="
									entity.limited_uses[tab] && entity.limited_uses[tab][spell.key] >= i
										? useSpellSlot(spell.key, tab, true)
										: useSpellSlot(spell.key, tab)
								"
							>
								<i
									aria-hidden="true"
									class="far"
									:class="
										entity.limited_uses[tab] && entity.limited_uses[tab][spell.key] >= i
											? 'fa-dot-circle'
											: 'fa-circle'
									"
								/>
								<q-tooltip anchor="top middle" self="center middle">
									{{
										entity.limited_uses[tab] && entity.limited_uses[tab][spell.key] >= i
											? "Regain"
											: "Spend"
									}}
								</q-tooltip>
							</span>
						</span>
						<hk-roll-action
							v-if="spell.actions && spell.actions.length"
							:ref="`${level}-${spell.key}`"
							:action="spell"
							:tooltip="`Roll ${spell.name}`"
							type="spell"
							@roll="startRoll(...arguments, spell.key, spell, tab)"
							:disabled="!checkAvailable(tab, level, spell.key)"
						>
							<span class="roll-button" />
						</hk-roll-action>
					</q-item-section>
				</template>
				<div class="accordion-body description">
					<Spell :data="spell" :title="false" v-if="showSpell === `${level}-${spell.key}`" />
				</div>
			</q-expansion-item>
		</q-list>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";
import { runEncounter } from "src/mixins/runEncounter.js";

export default {
	name: "RollAction",
	mixins: [setHP, runEncounter],
	components: {},
	props: {
		actor: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			default: "actions",
		},
		rollsOnly: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {};
	},
	computed: {
		...mapGetters(["targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		spell_levels() {
			let levels = [];

			if (this.entity[`${this.tab}_spells`]) {
				if (this.tab === "caster") {
					for (const spell of Object.values(this.entity[`${this.tab}_spells`])) {
						if (!levels.includes(spell.level)) levels.push(spell.level);
					}
					levels = levels.sort();
				} else {
					for (const spell of Object.values(this.entity[`${this.tab}_spells`])) {
						if (spell.limit == 0) spell.limit = Infinity;
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
		...mapActions(["set_limitedUses"]),
		...mapActions("tutorial", ["completeStep"]),
	},
};
</script>

<style lang="scss" scoped></style>
