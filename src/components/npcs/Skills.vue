<template>
	<div>
		<hk-card>
			<div class="card-header d-flex justify-content-between" slot="header">
				<div>
					Skills
					<span>
						+<strong class="blue">{{ npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : "" }}</strong>
						<q-tooltip anchor="top middle" self="center middle">
							Proficiency bonus
					</q-tooltip>
					</span>
				</div>
				<a class="btn btn-sm bg-neutral-5" @click="setDialog()">
					<i aria-hidden="true" class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Modifiers</span>
					<q-tooltip anchor="top middle" self="center middle">
						Skill modifiers
					</q-tooltip>
				</a>
			</div>

			<div class="card-body">
				<div class="skills">
					<div v-for="(skill, key) in skillList" :key="key">
						<q-checkbox 
							size="xs" 
							:dark="$store.getters.theme === 'dark'"
							:val="key" 
							v-model="npc.skills_expertise" 
							:false-value="null" indeterminate-value="something-else"
							:disable="npc.skills ? !npc.skills.includes(key) : true"
							@input="$forceUpdate()"
						>
							<template slot:label>
								+{{ npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : "" }}
							</template>
							<q-tooltip anchor="top middle" self="center middle">
								Expertise
							</q-tooltip>
						</q-checkbox>

						<q-checkbox 
							size="xs" 
							:dark="$store.getters.theme === 'dark'"
							:val="key" 
							v-model="skills" 
							:false-value="null" indeterminate-value="something-else"
						>
							<template slot:label>
								<div class="skill">
									<div class="neutral-3 abillity">{{ skill.ability.substring(0,3) }}</div>
									{{ skill.skill  }}
									<div class="mod">
										{{ 
											skillModifier(skill, key) > 0 ? `+${skillModifier(skill, key)}` : skillModifier(skill, key)
										}}
									</div>
								</div>
							</template>
							<q-tooltip anchor="top middle" self="center middle">
								Proficiency
							</q-tooltip>
						</q-checkbox>
					</div>
				</div>
			</div>
		</hk-card>

		<q-dialog v-model="modifier_dialog" :dark="$store.getters.theme === 'dark'">
			<hk-card header="Skill modifiers">
				<div class="card-body">
					<div class="modifiers">
						<ValidationProvider v-for="(skill, key) in skillList" rules="between:-99,99" :name="skill.skill" v-slot="{ errors, invalid, validated }" :key="`mod-${key}`">
							<q-input
								:dark="$store.getters.theme === 'dark'" filled square
								class="mb-2"
								type="number"
								:label="skill.skill"
								v-model="npc.skill_modifiers[key]"
								@change="setModifier(key)"
								:error="invalid && validated"
								:error-message="errors[0]"
							>
								<i aria-hidden="true" class="fas fa-check green saved" slot="append" v-if="saved.includes(key)" @animationend="saved.splice(saved.indexOf(key), 1)" />
							</q-input>
						</ValidationProvider>
					</div>
				</div>
				<div class="card-footer d-flex justify-content-end" slot="footer">
					<q-btn class="bg-neutral-5" no-caps @click="modifier_dialog = false" label="Close" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import { general } from 'src/mixins/general.js';
	import { monsterMixin } from 'src/mixins/monster.js';
	import { skills } from "src/utils/generalConstants";
	import { calc_skill_mod } from "src/utils/generalFunctions";

	export default {
		name: 'npc-Skills',
		props: ['value'],
		mixins: [
			general,
			monsterMixin
		],
		data() {
			return {
				skillList: skills,
				modifier_dialog: false,
				saved: []
			}
		},
		computed: {
			npc: {
				get() {
					let value = this.value;
					if(!value.skills_expertise) value.skills_expertise = [];
					return value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			},
			skills: {
				get() {
					return this.npc.skills ? this.npc.skills : [];
				},
				set(newValue) {
					this.$set(this.npc, 'skills', newValue);
				}
			},
		},
		methods: {
			setDialog() {
				if(!this.npc.skill_modifiers) {
					this.$set(this.npc, "skill_modifiers", {});
				}
				this.modifier_dialog = true;
			},
			setModifier(skill) {
				let value = this.npc.skill_modifiers ? this.npc.skill_modifiers[skill] : null;
				if(value > 99) value = 99;
				if(value < -99) value = -99;
				this.saved.push(skill);

				if(value) {
					if(this.npc.skill_modifiers) {
						this.$set(this.npc.skill_modifiers, skill, parseInt(value));
					} else {
						let val = {};
						val[skill] = parseInt(value);
						this.$set(this.npc, "skill_modifiers", val);
					}
				} else {
					this.$delete(this.npc.skill_modifiers, skill);
				}
			},
			skillModifier(skill, key) {
				const ability_mod = this.calcMod(this.npc[skill.ability]);
				const proficiency = this.npc.challenge_rating ? this.monster_challenge_rating[this.npc.challenge_rating].proficiency : 0;
				const bonus = (this.npc.skill_modifiers && this.npc.skill_modifiers[key]) ? this.npc.skill_modifiers[key] : 0;
				const proficient = this.npc.skills ? this.npc.skills.includes(key) : false;
				const expertise = this.npc.skills_expertise ? this.npc.skills_expertise.includes(key) : false;
				
				return calc_skill_mod(
					ability_mod,
					proficiency,
					bonus,
					proficient,
					expertise
				);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.skills {
		columns: 3;

		.skill {
			width: 100%;
			display: grid;
			grid-template-columns: 45px 1fr max-content;

			.abillity {
				text-transform: uppercase;
				text-align: center;
			}
			.mod {
				margin-left: 8px;
			}
		}
	}
	.modifiers {
		columns: 2;
	}
	@media only screen and (max-width: 1250px) { 
		.skills {
			columns: 2;
		}
	}
	@media only screen and (max-width: 890px) { 
		.skills {
			columns: 1;
		}
	}
</style>