<template>
	<div>
		<hk-card>
			<div class="card-header" slot="header">
				Skills
				<span>
					+<b class="blue">{{ npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : "" }}</b>
					<q-tooltip anchor="top middle" self="center middle">
						Proficiency bonus
				</q-tooltip>
				</span>
			</div>

			<div class="skills">
				<div v-for="(skill, key) in skillList" :key="key" class="d-flex justify-content-start">
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
										calculateSkillModifier(
											calcMod(npc[skill.ability]),
											npc.skills ? (
											npc.skills.includes(key) ? 
											(npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : '')
											: 0) : 0,
											npc.skills_expertise ? npc.skills_expertise.includes(key) : false
										) 
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
		}
	}
</script>

<style lang="scss" scoped>
	.skills {
		columns: 3;

		.skill {
			width: 100%;
			display: grid;
			grid-template-columns: 45px 1fr min-content;

			.abillity {
				text-transform: uppercase;
				text-align: center;
			}
			.mod {
				margin-left: 8px;
			}
		}
	}
</style>