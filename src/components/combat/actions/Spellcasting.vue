<template>
	<div v-if="current">
		<h3 class="blue text-center">
			<i class="fas fa-info-circle" /> Rollable spells are under development.
		</h3>
		<q-tabs
			v-model="tab"
			dark inline-label dense no-caps
			:indicator-color="tabs.length === 1 ? 'transparent' : 'gray-light'"
		>
			<q-tab 
				v-for="({name, label}, index) in tabs"
				:key="`tab-${index}`" 
				:name="name" 
				:label="label"
			/>
		</q-tabs>

		<q-tab-panels v-model="tab" class="bg-transparent">
			<q-tab-panel :name="name" v-for="({name}, type_index) in tabs" :key="`panel-${type_index}`">
				<div class="caster-info">
					<div>
						<div>Casting ability</div>
						<div class="value">{{ current[`${name}_ability`].substring(0,3).toUpperCase() }}</div>
					</div>
					<div class="mx-3">
						<div>Save DC</div>
						<div class="value">{{ current[`${name}_save_dc`] }}</div>
					</div>
					<div>
						<div>Attack modifier</div>
						<div class="value">{{ (current[`${name}_spell_attack`] > 0) ? `+${current[`${name}_spell_attack`]}` : current[`${name}_spell_attack`] }}</div>
					</div>
				</div>

				<div v-if="tab === 'caster'" class="display-levels">
					<div 
						class="level" @click="displayLevels = [...spell_levels]"
						:class="{ active: displayLevels.length === spell_levels.length }"
					>
						Show all
					</div>
					<div 
						v-for="level in spell_levels" 
						:key="`display-${level}`" 
						class="level"
						:class="{ active: (displayLevels.includes(level) && displayLevels.length !== spell_levels.length) }"
						@click="setDisplayLevels(level)"
					>
						{{ (level === 0) ? "Cantrips" : level }}
					</div>
				</div>
				
				<!-- SPELLS -->
				<template v-for="level in spell_levels">
					<div v-if="displayLevels.includes(level)" :key="`spell-${level}`">
						<div v-if="level == 0" class="spell-level">
							{{ (tab === "caster") ? "Cantrips" : "At will" }}
						</div>
						<div v-else-if="tab === 'caster'" class="spell-level">
							{{ level | numeral('Oo') }} level
							<div class="slots">
								<span 
									v-for="i in current[`${tab}_spell_slots`][level]" 
									:key="`slot-${i}`" 
									class="ml-1"
									@click="
										(current.limited_uses[tab] && current.limited_uses[tab][level] >= i)
										? useSpellSlot(level, tab, true)
										: useSpellSlot(level, tab)
									"
								>
									<i class="far" :class="
										current.limited_uses[tab] && current.limited_uses[tab][level] >= i
										? 'fa-dot-circle'
										: 'fa-circle'
										"
									/>
									<q-tooltip anchor="top middle" self="center middle">
										{{ 
											current.limited_uses[tab] && current.limited_uses[tab][level] >= i
											? "Regain slot"
											: "Spend slot"
										}}
									</q-tooltip>
								</span>
							</div>
						</div>
						<div v-else>
							{{ level }} each
						</div>
						<q-list dark square class="accordion mb-3">
							<q-expansion-item 
								v-for="spell in spellsForLevel(tab, level)" 
								:key="`${level}-${spell.key}`"
								dark switch-toggle-side
								expand-icon-class="hidden-toggle"
								@show="showSpell = `${level}-${spell.key}`"
								:group="tab"
								:name="name"
							>
								<template v-slot:header>
									<q-item-section :class="checkAvailable(tab, level, spell.key) ? '' : 'is-disabled'">
										<q-item-label>
											{{ spell.name.capitalizeEach() }}
										</q-item-label>
									</q-item-section>
									<q-item-section avatar v-if="tab === 'caster' && level > 0">
										<a v-if="checkAvailable(tab, level, spell.key)" @click.stop="useSpellSlot(level, tab)">
											Cast
										</a>
									</q-item-section>
									<q-item-section avatar v-else-if="level > 0">
										<div class="slots">
											<span 
												v-for="i in level" :key="`limited-${i}`" 
												class="ml-1"
												@click.stop="
													(current.limited_uses[tab] && current.limited_uses[tab][spell.key] >= i)
													? useSpellSlot(spell.key, tab, true)
													: useSpellSlot(spell.key, tab)
												"
											>
												<i class="far" :class="
													current.limited_uses[tab] && current.limited_uses[tab][spell.key] >= i
													? 'fa-dot-circle'
													: 'fa-circle'
													"
												/>
												<q-tooltip anchor="top middle" self="center middle">
													{{ 
														current.limited_uses[tab] && current.limited_uses[tab][spell.key] >= i
														? "Regain"
														: "Spend"
													}}
												</q-tooltip>
											</span>
										</div>
									</q-item-section>
								</template>
								<div class="accordion-body description">
									<Spell :id="spell.key" :title="false" v-if="showSpell === `${level}-${spell.key}`" />
								</div>
							</q-expansion-item>
						</q-list>				
					</div>
				</template>
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { dice } from "@/mixins/dice.js";
	import { setHP } from "@/mixins/HpManipulations.js";
	import { damage_types } from "@/mixins/damageTypes.js";
	import Spell from "@/components/compendium/Spell"

	export default {
		name: "Spellcasting",
		mixins: [setHP, dice, damage_types],
		props: ["current"],
		components: {
			Spell
		},
		data() {
			return {
				displaySetter: undefined,
				showSpell: undefined
			}
		},
		computed: {
			...mapGetters([
				"spells"
			]),
			tabs() {
				let tabs = [];
				if(this.current.innate_ability) tabs.push({
					name: "innate",
					label: "Innate spellcasting"
				});
				if(this.current.caster_ability) tabs.push({
					name: "caster",
					label: "Spellcasting"
				});
				return tabs;
			},
			tab() {
				return (this.tabs.length > 1) ? "innate" : this.tabs[0].name;
			},
			spell_levels() {
				let levels = [];

				if(this.current[`${this.tab}_spells`]) {
					if(this.tab === "caster") {
						for(const spell of Object.values(this.current[`${this.tab}_spells`])) {
							if(!levels.includes(spell.level)) levels.push(spell.level);
						}
					} else {
						for(const spell of Object.values(this.current[`${this.tab}_spells`])) {
							if(!levels.includes(spell.limit)) levels.push(spell.limit);
						}
					}
					levels = levels.sort();
				} 
				return levels;
			},
			displayLevels: {
				get() {
					return (this.displaySetter) ? this.displaySetter : [...this.spell_levels];
				},
				set(newValue) {
					this.displaySetter = newValue;
				}
			}
		},
		methods: {
			...mapActions([
				"set_limitedUses"
			]),
			spellsForLevel(type, level) {
				if(type === "caster") {
					return Object.entries(this.current[`${type}_spells`]).filter(([key, item]) => { 
						item.key = key;
						return item.level <= level;
					}).map(item => { return item[1] });
				} else {
					return Object.entries(this.current[`${type}_spells`]).filter(([key, item]) => {
						item.key = key;
						return item.limit == level;
					}).map(item => { return item[1] });
				}
			},
			setDisplayLevels(level) {
				if(this.displayLevels.length === this.spell_levels.length) {
					this.displayLevels = [level];
				} else {
					if(this.displayLevels.includes(level)) this.$delete(this.displayLevels, this.displayLevels.indexOf(level));
					else this.displayLevels.push(level);
				}
				this.$forceUpdate();
			},
			useSpellSlot(index, category, regain=false) {
				this.set_limitedUses({
					key: this.current.key, 
					index, 
					category, 
					regain 
				});
			},
			checkAvailable(type, level, key) {
				if(type === 'caster') {
					return !this.current.limited_uses 
						|| !this.current.limited_uses[type] 
						|| !this.current.limited_uses[type][level]
						|| this.current.limited_uses[type][level] < this.current[`${type}_spell_slots`][level]
				} else {
					return !this.current.limited_uses 
						|| !this.current.limited_uses[type] 
						|| !this.current.limited_uses[type][key]
						|| this.current.limited_uses[type][key] < level
				}
			}
		},
	}
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
				color: $white;
			}
		}
		.display-levels {
			display: flex;
			justify-content: center;
			margin-bottom: 15px;
			line-height: 20px;

			.level {
				background-color: $gray-dark;
				padding: 0 6px;
				margin-right: 3px;
				cursor: pointer;
				user-select: none;

				&.active {
					background-color: $blue;
					color: $white;

					&:hover {
						background: $blue-hover;
					}
				}
				&:hover {
					background: $gray-darker;
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
			opacity: .3;
		}
	}
</style>