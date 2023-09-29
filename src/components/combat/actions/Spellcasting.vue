<template>
	<div v-if="entity">
		<q-tabs
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
			inline-label
			outside-arrows
			mobile-arrows
			dense
			no-caps
			:indicator-color="tabs.length === 1 ? 'transparent' : 'neutral-2'"
		>
			<q-tab
				v-for="({ name, label }, index) in tabs"
				:key="`tab-${index}`"
				:name="name"
				:label="label"
			/>
		</q-tabs>

		<q-tab-panels v-model="tab" class="bg-transparent" v-if="!loading">
			<q-tab-panel :name="name" v-for="({ name }, type_index) in tabs" :key="`panel-${type_index}`">
				<div class="caster-info">
					<div>
						<div>Casting ability</div>
						<div class="value">{{ entity[`${name}_ability`].substring(0, 3).toUpperCase() }}</div>
					</div>
					<div class="mx-3">
						<div>Save DC</div>
						<div class="value">{{ entity[`${name}_save_dc`] }}</div>
					</div>
					<div>
						<div>Attack modifier</div>
						<div class="value">
							{{
								entity[`${name}_spell_attack`] > 0
									? `+${entity[`${name}_spell_attack`]}`
									: entity[`${name}_spell_attack`]
							}}
						</div>
					</div>
				</div>

				<div v-if="tab === 'caster'" class="display-levels">
					<div
						class="level"
						@click="displayLevels = [...spell_levels]"
						:class="{ active: displayLevels.length === spell_levels.length }"
					>
						Show all
					</div>
					<div
						v-for="level in spell_levels"
						:key="`display-${level}`"
						class="level"
						:class="{
							active: displayLevels.includes(level) && displayLevels.length !== spell_levels.length,
						}"
						@click="setDisplayLevels(level)"
					>
						{{ level === 0 ? "Cantrips" : level }}
					</div>
				</div>

				<!-- SPELLS -->
				<template v-for="level in spell_levels">
					<div v-if="displayLevels.includes(level)" :key="`spell-${level}`">
						<div v-if="level == 0 || level === Infinity" class="spell-level">
							{{ tab === "caster" ? "Cantrips" : "At will" }}
						</div>
						<div v-else-if="tab === 'caster'" class="spell-level">
							{{ level | numeral("Oo") }} level
							<div class="slots">
								<span
									v-for="i in entity[`${tab}_spell_slots`][level]"
									:key="`slot-${i}`"
									class="ml-1"
									@click="
										entity.limited_uses[tab] && entity.limited_uses[tab][level] >= i
											? useSpellSlot(level, tab, true)
											: useSpellSlot(level, tab)
									"
								>
									<i
										aria-hidden="true"
										class="far"
										:class="
											entity.limited_uses[tab] && entity.limited_uses[tab][level] >= i
												? 'fa-dot-circle'
												: 'fa-circle'
										"
									/>
									<q-tooltip anchor="top middle" self="center middle">
										{{
											entity.limited_uses[tab] && entity.limited_uses[tab][level] >= i
												? "Regain slot"
												: "Spend slot"
										}}
									</q-tooltip>
								</span>
							</div>
						</div>
						<div v-else>{{ level }} each</div>
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
									<q-item-section
										:class="checkAvailable(tab, level, spell.key) ? '' : 'is-disabled'"
									>
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
									<Spell
										:data="spell"
										:title="false"
										v-if="showSpell === `${level}-${spell.key}`"
									/>
								</div>
							</q-expansion-item>
						</q-list>
					</div>
				</template>
			</q-tab-panel>
		</q-tab-panels>

		<q-dialog v-model="projectile_dialog">
			<Projectiles :projectile-count="rollObject.projectiles" @cancel="cancelRoll" @roll="roll" />
		</q-dialog>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { dice } from "src/mixins/dice.js";
import { setHP } from "src/mixins/HpManipulations.js";
import { damage_types } from "src/utils/generalConstants";
import Spell from "src/components/compendium/Spell";
import Projectiles from "./Projectiles";
import { runEncounter } from "src/mixins/runEncounter.js";

export default {
	name: "Spellcasting",
	mixins: [setHP, dice, runEncounter],
	props: ["current"],
	components: {
		Spell,
		Projectiles,
	},
	data() {
		return {
			damage_types: damage_types,
			displaySetter: undefined,
			showSpell: undefined,
			tabSetter: undefined,
			spells: {},
			loading: true,
			rollObject: {},
			projectile_dialog: false,
		};
	},
	computed: {
		...mapGetters(["encounter", "targeted"]),
		entity() {
			return JSON.parse(JSON.stringify(this.current));
		},
		tabs() {
			let tabs = [];
			if (this.entity.innate_ability)
				tabs.push({
					name: "innate",
					label: "Innate spellcasting",
				});
			if (this.entity.caster_ability)
				tabs.push({
					name: "caster",
					label: "Spellcasting",
				});
			return tabs;
		},
		tab: {
			get() {
				const tab = this.tabs.length > 1 ? "innate" : this.tabs[0].name;
				return this.tabSetter ? this.tabSetter : tab;
			},
			set(newVal) {
				this.tabSetter = newVal;
			},
		},
		displayLevels: {
			get() {
				return this.displaySetter ? this.displaySetter : [...this.spell_levels];
			},
			set(newValue) {
				this.displaySetter = newValue;
			},
		},
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
		...mapActions("api_spells", ["fetch_api_spell"]),
		...mapActions("spells", ["get_spell"]),
		focusButton(level, key) {
			const button = this.$refs[`${level}-${key}`]?.[0]?.$el;
			button?.focus();
		},
		async fetchSpells() {
			const spells = {};

			for (const type of this.tabs) {
				if (this.entity[`${type.name}_spells`]) {
					spells[type.name] = await Promise.all(
						Object.entries(this.entity[`${type.name}_spells`]).map(async ([key, value]) => {
							const spell = value.custom
								? // userId comes from setHP mixin
								  await this.get_spell({ uid: this.userId, id: key })
								: await this.fetch_api_spell(key);
							spell.key = key;

							if (type.name === "innate") {
								spell.limit = value.limit == 0 ? Infinity : value.limit;
							} else {
								spell.level = value.level;
							}
							return spell;
						})
					);
				}
			}
			return spells;
		},
		spellsForLevel(type, level) {
			if (this.spells[type]) {
				if (type === "caster") {
					return this.spells[type].filter((spell) => {
						if (level === 0) {
							return spell.level == level;
						} else {
							return spell.level > 0 && spell.level <= level;
						}
					});
				} else {
					return this.spells[type].filter((spell) => spell.limit == level);
				}
			}
			return [];
		},
		setDisplayLevels(level) {
			if (this.displayLevels.length === this.spell_levels.length) {
				this.displayLevels = [level];
			} else {
				if (this.displayLevels.includes(level))
					this.$delete(this.displayLevels, this.displayLevels.indexOf(level));
				else this.displayLevels.push(level);
			}
			this.$forceUpdate();
		},
		useSpellSlot(index, category, regain = false) {
			this.set_limitedUses({
				key: this.entity.key,
				index,
				category,
				regain,
			});
		},
		checkAvailable(type, level, key) {
			if (type === "caster") {
				return (
					!this.entity.limited_uses ||
					!this.entity.limited_uses[type] ||
					!this.entity.limited_uses[type][level] ||
					this.entity.limited_uses[type][level] < this.entity[`${type}_spell_slots`][level]
				);
			} else {
				return (
					!this.entity.limited_uses ||
					!this.entity.limited_uses[type] ||
					!this.entity.limited_uses[type][key] ||
					this.entity.limited_uses[type][key] < level
				);
			}
		},
		startRoll(e, projectiles, option, level, spell, category) {
			if (this.targeted && this.targeted.length) {
				this.rollObject = {
					e,
					projectiles,
					option,
					level,
					spell,
					category,
				};
				if (projectiles && projectiles > 1) {
					this.projectile_dialog = true;
				} else {
					this.roll();
				}
			} else {
				this.$q.notify({
					message: "Select a target first.",
					color: "warning",
					position: "top",
					timeout: 1000,
				});
			}
		},
		roll(assigned_projectiles) {
			this.roll_action({
				e: this.rollObject.e,
				action_index: this.rollObject.level,
				action: this.rollObject.spell,
				category: this.rollObject.category,
				entity: this.current,
				targets: assigned_projectiles || this.targeted,
				option: this.rollObject.option,
			});
			this.cancelRoll();
		},
		cancelRoll() {
			this.projectile_dialog = false;
			this.rollObject = {};
		},
	},
	async mounted() {
		this.spells = await this.fetchSpells();
		this.loading = false;
	},
};
</script>

<style lang="scss" scoped>
.q-tab-panel {
	padding: 15px 0;

	.caster-info {
		text-align: center;
		display: flex;
		justify-content: center;
		margin-bottom: 15px;

		.value {
			font-size: 18px;
			font-weight: bold;
			color: $neutral-1;
		}
	}
	.display-levels {
		display: flex;
		justify-content: center;
		margin-bottom: 15px;
		line-height: 20px;
		flex-wrap: wrap;
		gap: 3px;

		.level {
			background-color: $neutral-5;
			padding: 0 6px;
			cursor: pointer;
			user-select: none;

			&.active {
				background-color: $blue;
				color: $neutral-1;

				&:hover {
					background: $blue-hover;
				}
			}
			&:hover {
				background: $neutral-4;
			}
		}
	}
	.spell-level {
		display: flex;
		justify-content: space-between;
		line-height: 25px;
		margin-bottom: 2px;
	}
	.slots {
		span {
			cursor: pointer;
			&:hover {
				color: $blue;
			}
		}
	}
	.is-disabled {
		opacity: 0.3;
	}
	.roll-button {
		display: inline-block;
		cursor: pointer;
		background-image: url("../../../assets/_img/logo/logo-icon-no-shield-cyan.svg");
		height: 20px;
		width: 20px;
		background-position: center;
		background-size: cover;
		vertical-align: -5px;
		user-select: none;
	}
	.hk-roll {
		padding: 10px;
		margin: -10px;
		border-radius: 50%;

		&:focus {
			background: $neutral-5;
		}
	}
	.advantage .roll-button:hover,
	.advantage.hk-roll:focus .roll-button {
		background-image: url("../../../assets/_img/logo/logo-icon-no-shield-green.svg");
	}
	.disadvantage .roll-button:hover,
	.disadvantage.hk-roll:focus .roll-button {
		background-image: url("../../../assets/_img/logo/logo-icon-no-shield-red.svg");
	}
}
</style>
