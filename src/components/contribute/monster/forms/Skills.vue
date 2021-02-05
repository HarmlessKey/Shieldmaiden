<template>
	<div>
		<hk-card>
			<div class="card-header d-flex justify-content-between" slot="header">
				<div>
					Skills
					<span>
						+<b class="blue">{{ npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : "" }}</b>
						<q-tooltip anchor="top middle" self="center middle">
							Proficiency bonus
					</q-tooltip>
					</span>
				</div>
				<a class="gray-hover text-capitalize" @click="modifier_dialog = true">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Modifiers</span>
					<q-tooltip anchor="top middle" self="center middle">
						Skill modifiers
					</q-tooltip>
				</a>
			</div>

			<div class="skills">
				<div v-for="(skill, key) in skillList" :key="key">
					<q-checkbox 
						size="xs" 
						dark
						:val="key" 
						v-model="npc.skills_expertise" 
						:false-value="null" indeterminate-value="something-else"
						:disable="npc.skills ? !npc.skills.includes(key) : true"
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
						dark
						:val="key" 
						v-model="skills" 
						:false-value="null" indeterminate-value="something-else"
					>
						<template slot:label>
							<div class="skill">
								<div class="gray-hover abillity">{{ skill.ability.substring(0,3) }}</div>
								{{ skill.skill  }}
								<div class="mod">
									{{ 
										skillModifier(skill, key)
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
		</hk-card>

		<q-dialog v-model="modifier_dialog" dark square>
			<hk-card header="Skill modifiers">
				<div class="modifiers">
					<q-input
						v-for="(skill, key) in skillList"
						:key="`mod-${key}`"
						dark filled square
						class="mb-2"
						type="number"
						:label="skill.skill"
						:value="npc.skill_modifiers ? npc.skill_modifiers[key] : null"
						@input="setModifier($event, key)"
					/>
				</div>
				<div class="card-footer d-flex justify-content-end" slot="footer">
					<q-btn class="bg-gray" @click="modifier_dialog = false" label="Close" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { skills } from '@/mixins/skills.js';
	import { monsterMixin } from '@/mixins/monster.js';

	export default {
		name: 'npc-Skills',
		props: ['value'],
		mixins: [
			general,
			skills,
			monsterMixin
		],
		data() {
			return {
				modifier_dialog: false
			}
		},
		computed: {
			npc: {
				get() {
					return this.value;
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
			setModifier(value, skill) {
				if(value > 99) value = 99;
				if(value < -99) value = -99;

				if(value) {
					if(this.npc.skill_modifiers) {
						this.$set(this.npc.skill_modifiers, skill, value);
					} else {
						let val = {};
						val[skill] = value;
						this.$set(this.npc, "skill_modifiers", val);
					}
				} else {
					this.$delete(this.npc.skill_modifiers, skill);
				}
			},
			skillModifier(skill, key) {
				let mod = this.calculateSkillModifier(
					this.calcMod(this.npc[skill.ability]),
					this.npc.skills ? (
					this.npc.skills.includes(key) ? 
					(this.npc.challenge_rating ?this. monster_challenge_rating[this.npc.challenge_rating].proficiency : '')
					: 0) : 0,
					this.npc.skills_expertise ? this.npc.skills_expertise.includes(key) : false
				);

				if(this.npc.skill_modifiers && this.npc.skill_modifiers[key]) {
					mod = parseInt(mod) + parseInt(this.npc.skill_modifiers[key]);
				}
				return (mod) >= 0 ? '+' + parseInt(mod) : parseInt(mod);
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