<template>
	<div class="py-1" ref="entity" :class="{ smallWidth: is_small }" v-if="!entity.no_linked_npc">
		<template v-if="!is_current">
			<h2>
				{{ entity.name.capitalizeEach() }}
				<small v-if="entity.source">{{ entity.source }}</small>
			</h2>
			<i>
				<template v-if="entity.size">{{ entity.size }}</template>
				<template v-if="entity.type"> {{ entity.type }}</template>
				<span v-if="entity.subtype">({{ entity.subtype }})</span>
				<template v-if="entity.alignment">, {{ entity.alignment }}</template>
			</i>
			<hr>
			<p>
				<template v-if="entity.entityType === 'player'">
					<b>Level</b>: 
					<span> {{ entity.level || calculatedLevel(entity.experience) }}</span><br/>
				</template>
				<b>Armor Class</b>: 
				<span> {{ entity.armor_class ? entity.armor_class : entity.ac }}</span><br/>
				<template>
					<b>Hit Points</b>: 
					<span> {{ entity.hit_points ? entity.hit_points : entity.maxHp }}</span>
				</template>
				<template v-if="entity.hit_dice"> {{ entity.hit_dice ? `(${hitDiceStr(data)})` : '' }}</template>
				<template v-if="entity.old || entity.entityType === 'player'">
					<template v-if="entity.speed">
						<br/><b>Speed</b>: 
						<span> {{ entity.speed }}</span>
					</template>
				</template>
				<template v-else>
					<br/><b>Speed</b>: {{ entity.walk_speed ? entity.walk_speed : 0 }} ft.{{ 
						entity.swim_speed ? `, swim ${entity.swim_speed} ft.` : `` 
					}}{{ 
						entity.fly_speed ? `, fly ${entity.fly_speed} ft.` : `` 
					}}{{ 
						entity.burrow_speed ? `, burrow ${entity.burrow_speed} ft.` : `` 
					}}{{ 
						entity.climb_speed ? `, climb ${entity.climb_speed} ft.` : ``
					}}
				</template>
			</p>
			<hr>
			<div class="abilities">
				<hk-roll 
					v-for="(ability, index) in abilities" 
					:key="index" 
					tooltip="Roll"
					:roll="{
						d: 20, 
						n: 1, 
						m: modifier(data[ability]),
						title: `${ability.capitalize()} check`,
						entity_name: entity.name.capitalizeEach(), 
						notify: true
					}"
					:share="shares.includes('ability_rolls') ? { 
						encounter_id: encounterId,
						entity_key: entity.key
					} : null"
				>
					<div v-if="data[ability]" class="ability">
						<div class="abilityName">{{ ability.substring(0,3).toUpperCase() }}</div>
						{{ data[ability] }}
						({{ modifier(data[ability]) }})
					</div>
				</hk-roll>
			</div>
			<hr>

			<p v-if="!entity.old && entity.entityType !== 'player'">
				<template v-if="entity.saving_throws">
					<b>Saving Throws </b>
					<span class="saves">
						<hk-roll 
							tooltip="Roll save" 
							v-for="(ability, index) in entity.saving_throws" 
							:key="ability"
							:roll="{
								d: 20, 
								n: 1, 
								m: calcMod(data[ability]) + entity.proficiency,
								title: `${ability.capitalize()} save`, 
								entity_name: entity.name.capitalizeEach(), 
								notify: true
							}"
							:share="shares.includes('save_rolls') ? { 
								encounter_id: encounterId,
								entity_key: entity.key
							} : null"
						>
							<span class="save">
								{{ ability.substring(0,3).capitalize() }} 
								+{{ 
									calcMod(data[ability]) + entity.proficiency 
								}}{{ 
									index+1 &lt; entity.saving_throws.length ? "," : ""
								}}
							</span>
						</hk-roll>
					</span>
					<br/>
				</template>
				<template v-if="entity.skills">
					<b>Skills</b>
					<span class="saves">
						<hk-roll 
							v-for="(skill, index) in entity.skills" 
							:key="skill" 
							:tooltip="`Roll ${skill}`"
							:roll="{
								d: 20, 
								n: 1, 
								m: skillModifier(skillList[skill].ability, skill),
								title: `${skill} check`,
								entity_name: entity.name.capitalizeEach(),
								notify: true
							}"
							:share="shares.includes('skill_rolls') ? { 
								encounter_id: encounterId,
								entity_key: entity.key
							} : null"
						>
							<span class="save">
								{{ skill }} {{ skillModifier(skillList[skill].ability, skill) }}{{ index+1 &lt; entity.skills.length ? "," : "" }}
							</span>
						</hk-roll>
						<br/>
					</span>
				</template>
				<template v-if="entity.damage_vulnerabilities && entity.damage_vulnerabilities.length > 0">
					<b>Damage vulnerabilities</b> {{ entity.damage_vulnerabilities.join(", ") }}<br/>
				</template>
				<template v-if="entity.damage_resistances && entity.damage_resistances.length > 0">
					<b>Damage resistances</b> {{ entity.damage_resistances.join(", ") }}<br/>
				</template>
				<template v-if="entity.damage_immunities && entity.damage_immunities.length > 0">
					<b>Damage immunities</b> {{ entity.damage_immunities.join(", ") }}<br/>
				</template>
				<template v-if="entity.condition_immunities && entity.condition_immunities.length > 0">
					<b>Condition immunities</b> {{ entity.condition_immunities.join(", ") }}<br/>
				</template>

				<b>Senses</b> 
				<template v-if="entity.senses">
					<span v-for="(sense, key) in entity.senses" :key="key">
						{{ key }} {{ sense.range ? `${sense.range} ft.` : `` }}{{ 
							sense.comments ? `${sense.comments}` : ``
						}},
					</span>
				</template>
				passive Perception {{ passivePerception() }}<br/>

				<template v-if="entity.languages && entity.languages.length > 0"><b>Languages</b> {{ entity.languages.join(", ") }}<br/></template>
				<template v-if="entity.challenge_rating">
					<b>Challenge Rating</b> {{ entity.challenge_rating }} 
					({{ monster_challenge_rating[entity.challenge_rating].xp | numeral('0,0') }} XP)<br/>
				</template>
			</p>

			<!-- SKILLS -->
			<template v-if="!entity.old">
				<h3>Skills</h3>
				<div class="playerSkills">
					<hk-roll 
						v-for="(skill, key) in skillList" 
						:key="key" 
						tooltip="Roll"
						:roll="{
							d: 20, 
							n: 1, 
							m: skillModifier(skill, key),
							title: `${skill.skill} check`, 
							entity_name: entity.name.capitalizeEach(),
							notify: true
						}"
						:share="shares.includes('skill_rolls') ? { 
							encounter_id: encounterId,
							entity_key: entity.key
						} : null"
					>
						<span class="playerSkill">
							<span class="truncate">
								<template v-if="entity.skills && entity.skills.includes(key)">
									<i aria-hidden="true" v-if="entity.skills_expertise && entity.skills_expertise.includes(key)" class="far fa-dot-circle"></i>
									<i aria-hidden="true" v-else class="fas fa-circle"></i>
								</template>
								<i aria-hidden="true" v-else class="far fa-circle"></i>
								{{ skill.skill }}
							</span>
							<span>{{ skillModifier(skill, key) }}</span>
						</span>
					</hk-roll>
				</div>
				<hr>
			</template>
		</template>

		<!-- SPELLCASTING -->
		<template v-if="entity.caster_ability">
			<p v-if="!is_current">
				<b><i>
					Spellcasting
				</i></b>
				The {{ entity.name.capitalizeEach() }} is a {{ entity.caster_level | numeral('Oo')}}-level spellcaster.
				It's spellcasting ability is {{ entity.caster_ability.capitalize() }}
				(spell save DC {{ entity.caster_save_dc }}, 
				{{ entity.caster_spell_attack > 0 ? `+${entity.caster_spell_attack}` : entity.caster_spell_attack }} to hit with spell attacks). 
				The {{ entity.name.capitalizeEach() }} has the following spells prepared:
			</p>
			<template v-else>
				<div class="caster-info">
					<div>
						<div>Casting ability</div>
						<div class="value">{{ entity.caster_ability.substring(0,3).toUpperCase() }}</div>
					</div>
					<div class="mx-3">
						<div>Save DC</div>
						<div class="value">{{ entity.caster_save_dc }}</div>
					</div>
					<div>
						<div>Attack modifier</div>
						<div class="value">{{ (entity.caster_spell_attack > 0) ? `+${entity.caster_spell_attack}` : entity.caster_spell_attack }}</div>
					</div>
				</div>
				<b><i>Spells</i></b><br/>
			</template>
			<p>
				<template v-for="level in caster_spell_levels" >
					<div :key="`spell-${level}`">
						<template v-if="level === 0">
							Cantrips (at will):
						</template>
						<template v-else>
							{{ level | numeral('Oo') }} level ({{ entity.caster_spell_slots[level] }} slots):
						</template>
						<i aria-hidden="true" v-for="(spell, index) in spellsForLevel(level)" :key="spell.name">
							<hk-popover>
								{{ spell.name }}
								<template #content>
									<Spell :id="spell.key" />
								</template>
							</hk-popover>{{ index+1 &lt; spellsForLevel(level).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>

		<!-- INNATE SPELLCASTING -->
		<template v-if="entity.innate_ability">
			<p v-if="!is_current">
				<b><i>
					Innate spellcasting
				</i></b>
				The {{ entity.name.capitalizeEach() }}'s innate spellcasting ability is {{ entity.innate_ability.capitalize() }}
				(spell save DC {{ entity.innate_save_dc }}, 
				{{ entity.innate_spell_attack > 0 ? `+${entity.innate_spell_attack}` : entity.innate_spell_attack }} to hit with spell attacks). 
				The {{ entity.name.capitalizeEach() }} can cast the following spells, requiring no material components:
			</p>
			<template v-else>
				<div class="caster-info">
					<div>
						<div>Innate ability</div>
						<div class="value">{{ entity.innate_ability.substring(0,3).toUpperCase() }}</div>
					</div>
					<div class="mx-3">
						<div>Save DC</div>
						<div class="value">{{ entity.innate_save_dc }}</div>
					</div>
					<div>
						<div>Attack modifier</div>
						<div class="value">{{ (entity.innate_spell_attack > 0) ? `+${entity.innate_spell_attack}` : entity.innate_spell_attack }}</div>
					</div>
				</div>
				<b><i>Innate spells</i></b><br/>
			</template>
			<p>
				<template v-for="limit in innate_spell_levels" >
					<div :key="`spell-${limit}`">
						<template v-if="limit === Infinity">
							At will:
						</template>
						<template v-else>
							{{ limit }}/day each:
						</template>
						<i aria-hidden="true" v-for="(spell, index) in spellsForLimit(limit)" :key="spell.name">
							<hk-popover>
								{{ spell.name }}
								<template #content>
									<Spell :id="spell.key" />
								</template>
							</hk-popover>{{ index+1 &lt; spellsForLimit(limit).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>

		<div class="monster-actions" v-if="entity.entityType !== 'player'">
			<div v-for="{category, name} in actions" :key="category">
				<template v-if="entity[category] && entity[category].length > 0">
					<h3 v-if="category !== 'special_abilities'" class="d-flex justify-content-between">
						{{ name }}
						<div v-if="category === 'legendary_actions' && entity.legendary_count" class="slots pointer">
							<span 
								v-for="i in entity.legendary_count" 
								:key="`legendary-${i}`" 
								class="mr-1"
								@click="
									entity.limited_uses['legendary_actions'] && entity.limited_uses['legendary_actions'].legendaries_used >= i
									? spendLimited('legendary_actions', 'legendaries_used', true)
									: spendLimited('legendary_actions', 'legendaries_used')
								"
							>
								<i aria-hidden="true" class="far" :class="
									entity.limited_uses['legendary_actions'] && entity.limited_uses['legendary_actions'].legendaries_used >= i
									? 'fa-dot-circle' : 'fa-circle'
									"
								/>
								<q-tooltip anchor="top middle" self="center middle">
									{{ 
										entity.limited_uses['legendary_actions'] && entity.limited_uses['legendary_actions'].legendaries_used >= i
										? "Regain action" : "Spend action"
									}}
								</q-tooltip>
							</span>
						</div>
					</h3>
					<p v-if="entity.legendary_count && category === 'legendary_actions'">
						{{ entity.name.capitalizeEach() }} can take {{ entity.legendary_count }} legendary actions, choosing from the options below. 
						Only one legendary action option can be used at a time and only at the end of another creature's turn. {{ entity.name }} regains spent legendary actions at the start of their turn.
					</p>

					<!-- Action title -->
					<div v-for="(action, action_index) in entity[category]" :key="`${category}-${action_index}`" class="monster-action">
						<div class="monster-action-title">
							<template v-if="is_current && action.action_list && action.action_list[0] && action.action_list[0].type !== 'other' && action.action_list[0].rolls && action.action_list[0].rolls.length">
								<span v-if="action.versatile" class="roll-button" @click.stop>
									<q-popup-proxy :dark="$store.getters.theme === 'dark'">
										<div class="bg-neutral-8">
											<q-item>
												<q-item-section>
													<b>{{ action.name }}</b>
												</q-item-section>
											</q-item>
											<q-separator />
											<q-list :dark="$store.getters.theme === 'dark'">
												<q-item clickable v-close-popup>
													<q-item-section avatar>1</q-item-section>
													<q-item-section>
														<hk-roll 
															:tooltip="`${action.name} (${action.versatile_one || 'Option 1'})`"
															tooltipPosition="right"
															@roll="roll($event, acion_index, action, category, 0)"
															:disabled="!checkAvailable(category, action_index, action)"
														>
															{{ action.versatile_one || 'Option 1' }}
														</hk-roll>
													</q-item-section>
												</q-item>
												<q-item clickable v-close-popup>
													<q-item-section avatar>2</q-item-section>
													<q-item-section>
														<hk-roll 
															:tooltip="`${action.name} (${action.versatile_two || 'Option 2'})`"
															tooltipPosition="right"
															@roll="roll($event, action_index, action, category, 1)"
															:disabled="!checkAvailable(category, action_index, action)"
														>
															{{ action.versatile_two || 'Option 2' }}
														</hk-roll>
													</q-item-section>
												</q-item>
											</q-list>
										</div>
									</q-popup-proxy>
								</span>
								<hk-roll 
									v-else
									:tooltip="`Roll ${action.name}`" 
									@roll="roll($event, action_index, action, category)"
									:disabled="!checkAvailable(category, action_index, action)"
								>
									<span class="roll-button" />
								</hk-roll>
							</template>
							<div class="monster-action-title__name">
								<b><i>
									{{ action.name }}
									{{ action.recharge ? `(Recharge ${action.recharge === 'rest' ? "after a Short or Long Rest" : action.recharge})` : ``}}
									{{ action.limit ? `(${action.limit}/${action.limit_type ? action.limit_type.capitalize(): `Day`})` : ``}}
									{{ action.legendary_cost > 1 ? `(Costs ${action.legendary_cost} Actions)` : ``}}			
								</i></b>

								<template v-if="action.limit || action.recharge || action.legendary_cost">
									<template v-if="action.legendary_cost || action.recharge">
										<div 
											v-if="checkAvailable(category, action_index, action)"
											class="btn btn-xs btn-clear"
											@click.stop="spendLimited(
												category, 
												action.legendary_cost ? 'legendaries_used' : action_index,
												false,
												action.legendary_cost ? action.legendary_cost : 1
											)"
										>
											Spend
										</div>
										<i aria-hidden="true" v-else class="fas fa-ban neutral-2" />
									</template>
									<div v-else class="slots">
										<span 
											v-for="i in parseInt(action.limit)" 
											:key="`legendary-${i}`" 
											class="mr-1"
											@click.stop="
												entity.limited_uses[category] && entity.limited_uses[category][action_index] >= i
												? spendLimited(category, action_index, true)
												: spendLimited(category, action_index)
											"
										>
											<i aria-hidden="true" class="far" :class="
												entity.limited_uses[category] && entity.limited_uses[category][action_index] >= i
												? 'fa-dot-circle' : 'fa-circle'
												"
											/>
											<q-tooltip anchor="top middle" self="center middle">
												{{ 
													entity.limited_uses[category] && entity.limited_uses[category][action_index] >= i
													? "Regain" : "Spend"
												}}
											</q-tooltip>
										</span>
									</div>
								</template>
							</div>
						</div>
						<!-- Roll Summary -->
						<div v-if="is_current && action.action_list && action.action_list[0] && action.action_list[0].type !== 'other'">
							<span v-if="action.action_list[0].rolls">
								<span v-for="(roll, roll_index) in action.action_list[0].rolls" :key="`roll-${action_index}-${roll_index}`">
									(<i aria-hidden="true" :class="[
										action.action_list[0].type === 'healing' ? 'fas fa-heart green' : damage_type_icons[roll.damage_type],
										roll.damage_type
										]" /> 
									{{ roll.dice_count || "" }}{{ roll.dice_type ? `d${roll.dice_type}` : ``}}<template v-if="roll.fixed_val && roll.dice_count">
										{{ (roll.fixed_val &lt; 0) ? `- ${Math.abs(roll.fixed_val)}` : `+ ${roll.fixed_val}`  }})
									</template><template v-else>{{ roll.fixed_val }})</template>
									{{ roll_index+1 &lt; action.action_list[0].rolls.length ? "+" : "" }}
									<q-tooltip anchor="top middle" self="center middle">
										{{ action.action_list[0].type === "healing" ? "Healing" : `${roll.damage_type.capitalize()} damage` }}
									</q-tooltip>
								</span>
							</span>
							<!-- Reach -->
							<span v-if="action.reach">
								<span class="blue">|</span> {{action.reach}}<small class="neutral-2">ft.</small>
								<q-tooltip anchor="top middle" self="center middle">
									Reach
								</q-tooltip>
							</span>
							<!-- Range -->
							<span v-if="action.range">
								<span class="blue">|</span> {{ action.range }}<small class="neutral-2">ft.</small>
								<q-tooltip anchor="top middle" self="center middle">
									Range
								</q-tooltip>
							</span>
							<!-- Saving trow -->
							<span v-if="action.action_list[0].type === 'save' && action.action_list[0].save_dc">
								<span class="blue">|</span>
								<span v-if="action.action_list[0].save_ability">
									{{ action.action_list[0].save_ability.substring(0, 3).toUpperCase() }}
								</span>
								{{ action.action_list[0].save_dc }}
							</span>
							<!-- AOE -->
							<span v-if="action.aoe_type">
								<span class="blue">|</span>
								{{ action.aoe_size }}<small class="neutral-2">ft.</small>
								{{ action.aoe_type.capitalize() }}
								<q-tooltip anchor="top middle" self="center middle">
									Area of effect
								</q-tooltip>
							</span>
						</div>
						<hk-dice-text v-if="action.desc" :input_text="action.desc"/>
					</div>
				</template>
			</div>
		</div>
		<q-resize-observer @resize="setSize" />
	</div>
	<div v-else>
		There is no monster card for this entity.<br/>
		It was probably added during the encounter without linking a monster to it.
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import { skills } from '@/mixins/skills.js';
	import { monsterMixin } from '@/mixins/monster.js';
	import { experience } from '@/mixins/experience.js';
	import { abilities } from '@/mixins/abilities.js';
	import Spell from "@/components/compendium/Spell";

	export default {
		name: 'ViewEntity',
		mixins: [
			general, 
			dice, 
			experience, 
			skills, 
			monsterMixin,
			abilities
		],
		components: {
			Spell
		},
		props: {
			data: {
				type: Object,
				required: true
			},
			current: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				is_small: false,
				is_current: this.current,
				actions: [
					{ category: 'special_abilities', name: 'Special Abilities', name_single: 'Special ability' },
					{ category: 'actions', name: 'Actions', name_single: 'Action' },
					{ category: 'legendary_actions', name: 'Legendary Actions', name_single: 'Legendary action' },
					{ category: 'reactions', name: 'Reactions', name_single: 'Reaction' }
				],
			}
		},
		computed: {
			...mapGetters([
				"entities",
				"encounterId",
				"broadcast",
				"targeted",
			]),
			shares() {
				return this.broadcast.shares || [];
			},
			entity() {
				let entity = JSON.parse(JSON.stringify(this.data));
				if(entity.entityType === 'npc' && !entity.no_linked_npc && !entity.proficiency) {
					entity.proficiency = this.monster_challenge_rating[entity.challenge_rating].proficiency;
				}
				return entity;
			},
			spellCasting() {
				let casting = [];
				if(this.entity.innate_ability) casting.push({
					name: "innate",
					label: "Innate spellcasting"
				});
				if(this.entity.caster_ability) casting.push({
					name: "caster",
					label: "Spellcasting"
				});
				return casting;
			},
			caster_spell_levels() {
				if(this.entity.caster_spells) {
					let levels = [];
					for(const spell of Object.values(this.entity.caster_spells)) {
						if(!levels.includes(spell.level)) levels.push(spell.level);
					}
					return levels.sort();
				} return [];
			},
			innate_spell_levels() {
				if(this.entity.innate_spells) {
					let levels = [];
					for(const spell of Object.values(this.entity.innate_spells)) {
						const limit = (spell.limit) ? spell.limit : Infinity;
						if(!levels.includes(limit)) levels.push(limit);
					}
					return levels.sort().reverse();
				} return [];
			}
		},
		methods: {
			...mapActions([
				"setActionRoll",
				"set_limitedUses"
			]),
			setSize(size) {
				let width = size.width
				let small = 300;

				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = width;
			},
			modifier(score) {
				var mod = Math.floor((score - 10) / 2)
				if(mod > 0) {
					return '+' + mod;
				}
				else {
					return mod;
				}
			},
			passivePerception() {
				return 10 + parseInt(this.skillModifier('wisdom', 'perception'));
			},
			skillModifier(skill, key) {
				let mod = this.calculateSkillModifier(
					this.calcMod(this.data[skill.ability]),
					this.entity.skills ? (
					this.entity.skills.includes(key) ? 
					this.returnProficiency(this.entity.level ? this.entity.level : this.calculatedLevel(this.entity.experience)): 0) 
					: 0,
					this.entity.skills_expertise ? this.entity.skills_expertise.includes(key) : false
				);
				if(this.entity.skill_modifiers && this.entity.skill_modifiers[skill]) {
					mod = parseInt(mod) + parseInt(this.entity.skill_modifiers[skill]);
				}
				return mod;
			},
			spellsForLevel(level) {
				return Object.entries(this.entity.caster_spells).filter(([key, item]) => { 
						item.key = key;
						return item.level == level;
					}).map(item => { return item[1] });
			},
			spellsForLimit(limit) {
				return Object.entries(this.entity.innate_spells).filter(([key, item]) => { 
					item.key = key;
					if(item.limit === 0) item.limit = Infinity;
					return item.limit == limit;
				}).map(item => { return item[1] });
			},
			roll(e, action_index, action, category, versatile) {
				if(this.targeted && this.targeted.length) {
					let roll;
					const config = {
						type: "monster_action",
						versatile
					}

					// Roll once for AOE
					if(action.aoe_type) {
						roll = this.rollAction(e, action, config);
						if(this.share) this.shareRoll(roll, this.targeted);
					}

					// Check for limited uses
					if(action.limit || action.recharge) {
						this.spendLimited(category, action_index);
					}
					if(action.legendary_cost) {
						this.spendLimited(category, "legendaries_used", false, action.legendary_cost);
					}

					for(const key of this.targeted) {
						let newRoll = { ...roll };
	
						// Reroll for each target if it's not AOE
						if(!action.aoe_type) {
							newRoll = this.rollAction(e, action, config);
							if(this.share) this.shareRoll(newRoll, [key]);
						}
	
						// Set the target and current
						this.$set(newRoll, "target", this.entities[key]);
						this.$set(newRoll, "current", this.entity);
	
						this.setActionRoll(newRoll);
					}
				} else {
					this.$q.notify({
						message: "Select a target first.",
						color: "warning",
						position: "top",
						timeout: 1000
					});
				}
			},
			spendLimited(category, index, regain=false, cost=1) {
				this.set_limitedUses({key: this.entity.key, index, category, regain, cost});
			},
			checkAvailable(category, index, action) {
				// If there are not limits to the use, the ability is always available
				if(!action.limit && !action.recharge && !action.legendary_cost) return true;

				// Otherwise, check if the ability is available and can be used
				if(action.legendary_cost) {
					return !this.entity.limited_uses[category] || 
						!this.entity.limited_uses[category].legendaries_used || 
						(action.legendary_cost <= (this.entity.legendary_count - this.entity.limited_uses['legendary_actions'].legendaries_used));
				}
				if(action.limit) {
					return !this.entity.limited_uses[category] || (this.entity.limited_uses[category][index] < action.limit);
				}
				if(action.recharge) {
					return !this.entity.limited_uses[category] || !this.entity.limited_uses[category][index];
				}
			},
			shareRoll(roll, targets) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				let share = {
					key,
					type: "action_roll",
					entity_key: this.entity.key,
					encounter_id: this.encounterId,
					notification: {
						title: roll.name,
						targets,
						actions: []
					}
				};
				roll.actions.forEach((action, action_index) => {
					const type = (action.type === "healing") ? "healing" : "damage";

					share.notification.actions[action_index] = {
						rolls: [],
						type
					};
					// To hit
					if(action.toHit) {
						const toHit = action.toHit;
						share.notification.actions[action_index].toHit = {
							roll: toHit.roll,
							total: toHit.total
						}
						if(toHit.ignored) share.notification.actions[action_index].toHit.advantage_disadvantage = this.advantage(toHit.advantage_disadvantage);
					}

					//Rolls
					action.rolls.forEach((roll, roll_index) => {
						share.notification.actions[action_index].rolls[roll_index] = {
							damage_type: roll.damage_type || null,
							roll: roll.modifierRoll.roll,
							total: roll.modifierRoll.total,
						};
					});
				});
				this.set_share({ id: this.broadcast.live, share})
			},
			advantage(input) {
				return Object.keys(input)[0].charAt(0);
			}
		}
	};
</script>

<style lang="scss" scoped>
h2 {
	margin-bottom:5px !important;

	small {
		font-size: 12px;
	}
}
h3 {
	text-transform: none;
	font-weight: bold !important;
	border-bottom: solid 1px $neutral-4;
	padding-bottom: 3px;
}
a {
	color: $neutral-2 !important;
}
.abilities {
	user-select: none;
	display: grid;
	grid-template-columns: 	repeat(6, 40px);
	grid-column-gap: 15px;
	text-align: center;
	font-size: 12px;
	max-width: 650px;
	
	.abilityName {
		font-size: 15px;
		font-weight: bold;
	}
	.ability {
		cursor: pointer;
	}
	.advantage .ability:hover {
		color: $green
	}
	.disadvantage .ability:hover {
		color:$red
	}
}
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
.monster-action {
	margin-bottom: 20px;

	&-title {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin-bottom: 5px;
		width: 100%;

		&__name {
			width: 100%;
			display: flex; 
			justify-content: space-between;

			.slots {
				cursor: pointer;
			}
		}

		.roll-button {
			margin-right: 5px;
			display: inline-block;
			cursor: pointer;
			background-image: url('../../assets/_img/logo/logo-icon-no-shield-cyan.svg');
			height: 20px;
			width: 20px;
			background-position: center;
			background-size: cover;
			vertical-align: -5px;
			user-select: none;
		}
		.advantage .roll-button:hover {
			background-image: url('../../assets/_img/logo/logo-icon-no-shield-green.svg');
		}
		.disadvantage .roll-button:hover {
			background-image: url('../../assets/_img/logo/logo-icon-no-shield-red.svg');
		}
	}
}
.playerSkills {
	user-select: none;
	column-count: 3;
	column-gap: 20px;
	column-rule: 1px solid $neutral-5;


	.playerSkill {
		display: flex;
		justify-content: space-between;
		cursor: pointer;

		&:hover {
			color: $neutral-1;
		}
		i {
			
			&.fa-circle {
				margin: 0 3px;
				font-size: 6px;
				vertical-align: 2px;
			}
		}
	}
	.advantage .playerSkill:hover {
		color: $green
	}
	.disadvantage .playerSkill:hover {
		color:$red
	}
}
.skills .skill, .saves .hk-roll {
	&::after {
		content: ', ';
	}
	&:last-child::after {
		content: '';
	}
}
.saves {
	user-select: none;

	.save {
		cursor: pointer;
	}
	.advantage .save:hover {
		color: $green
	}
	.disadvantage .save:hover {
		color: $red
	}
}
.smallWidth {
	.abilities {
		grid-template-columns: 	repeat(3, auto);
		grid-template-rows: auto auto;
		grid-row-gap: 15px;
	}
	.playerSkills {
		column-count: 2;
	}
}

</style>
