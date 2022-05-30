<template>
	<hk-card header="Ability scores">
		<div class="card-header" slot="header">
			<span>Abilities</span>
			<small class="saved green" v-if="saved" @animationend="saved = false">
				<i aria-hidden="true" class="fas fa-check" />
				Saved
			</small>
			<small class="saved orange" v-if="invalid" @animationend="invalid = false">
				<i aria-hidden="true" class="fas fa-times" />
				Couldn't save
			</small>
		</div>

		<div class="card-body">
			<q-select
				class="method"
				dark filled square
				label="Method"
				placeholder="Select method"
				:value="method" 
				:options="ability_score_methods" 
				emit-value
				map-options
				@input="confirmMethodChange($event)"
			/>

			<ValidationObserver v-if="method" v-slot="{ valid }">
				<q-form greedy>
					<h3 class="text-center">
						Base ability scores
					</h3>
					<div class="d-flex justify-content-center mb-4" v-if="method === 'manual'">
						<a class="btn" @click="roll_dialog = !roll_dialog">
							<i class="fas fa-dice-d20" /> Roll scores
						</a>
					</div>

					<!-- STANDARD ARRAY -->
					<div v-if="method === 'standard_array'" class="base_abilities input">
						<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
							<div>{{ label }}</div>
							<q-select
								dark filled square
								placeholder="-"
								:value="ability_scores[value]"
								:options="standard_array"
								emit-value
								map-options
								:option-disable="standardArrayDisable"
								@input="saveAbility($event, value, valid)"
								clearable
							/>
						</div>
					</div>

					<!-- POINT BUY -->
					<template v-if="method === 'point_buy'">
						<div class="base_abilities input">
							<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
								<div>{{ label }}</div>
								<q-select
									dark filled square
									placeholder="-"
									:value="ability_scores[value]"
									:options="point_buy.map(item => item.score)"
									:option-label="label"
									emit-value
									map-options
									:option-disable="opt => pointBuyDisable(opt, ability_scores[value])"
									@input="saveAbility($event, value, valid)"
								/>
							</div>
						</div>
						<h3 class="text-center mb-1">Points remaining</h3>
						<h3 class="text-center mt-0">
							<span class="white">{{ point_buy_remaining }}</span>/{{ point_buy_max }}
						</h3>
					</template>

					<!-- MANUAL -->
					<div v-if="method === 'manual'" class="base_abilities input">
						<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
							<div>{{ label }}</div>
							<ValidationProvider rules="between:1,20" :name="label" v-slot="{ errors, invalid, validated }">
								<q-input
									dark filled square
									placeholder="-"
									@change="saveAbility($event.target.value, value, valid)"
									autocomplete="off"  
									type="number"
									v-model="ability_scores[value]"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>

						<q-dialog v-model="roll_dialog">
							<hk-card>
								<div slot="header" class="card-header d-flex justify-content-between">
									<span>
										Roll ability scores
									</span>
									<q-btn flat v-close-popup round icon="close" size="xs" class="ml-2" />
								</div>

								<div class="card-body">
									<button 
										v-if="!rolls.filter(score => score.results.length).length"
										class="btn btn-block mb-3" 
										@click="rollAllAbilityScores()"
									>
										Roll all
									</button>
									<button v-else class="btn bg-red btn-block mb-3" @click="clearAllRolls()">Clear all</button>

									<div class="ability-rolls">
										<div v-for="i in [0, 1, 2, 3, 4, 5]" :key="`score-${i}`" class="score">
											<div class="rolls">
												<div class="d-flex justify-content-start">
													<div 
														v-for="roll in [0, 1, 2, 3]" 
														class="roll"
														:class="{ 
															rolled: rolls[i].results[roll],
															ignore: lowestRoll(rolls[i].results) === roll
														}"
														:key="`roll-${roll}`"
													>
														<hk-animated-integer v-if="rolls[i].results.length" :value="rolls[i].results[roll]" on-mount />
														<template v-else>-</template>
													</div>
												</div>
												<q-btn v-if="!rolls[i].results.length" flat size="sm" @click="rollAbilityScore(i)" icon="fas fa-dice-d20" />
												<hk-animated-integer v-else class="total" :value="rolledTotal(i)" on-mount />
											</div>

											<q-select 
												dark filled square dense
												clearable
												map-options
												emit-value
												:options="filterAbilities(i)"
												v-model="rolls[i].ability"
											/>
										</div>
									</div>
								</div>

								<div slot="footer" class="card-footer d-flex justify-content-end">
									<button class="btn bg-gray mr-2" @click="roll_dialog = false">Cancel</button>
									<button class="btn bg-green" @click="applyRolledScores()" :disabled="rolls.filter(score => score.ability && score.results.length).length < 6">Apply</button>
								</div>
							</hk-card>
						</q-dialog>
					</div>
					<h3 class="text-center">Computed ability scores</h3>
					<div class="base_abilities">
						<div class="ability computed" v-for="{value, label} in abilities" :key="`base-${value}`">
							<div class="label">
								{{ label.substring(3, 0).toUpperCase() }}
							</div>
							<h2 class="score">
								{{ computed.abilities[value] || 0 }}
							</h2>
						</div>
					</div>
				</q-form>
			</ValidationObserver>
			
			<template v-else>
				<h3>What method would you like to use?</h3>
				<p class="mt-3">Your DM probably told you what method you should use.</p>

				<h4>1. Standard array (phb 13)</h4>
				<p>
					You get a standard set of scores you can divide over the abilities.<br/>
					<strong>15</strong> | <strong>14</strong> | <strong>13</strong> | <strong>12</strong> | <strong>10</strong> | <strong>8</strong>
				</p>

				<h4>2. Point buy (phb 13)</h4>
				<p>
					You get 27 points to spend on your ability scores. The cost of each score is shown in the table below.<br/>
					With this method, 15 is the highest ability score you can end up with and you can't have a score lower than 8.
				</p>

				<table class="table">
					<tr>
						<th>Score</th>
						<th>Cost</th>
					</tr>
					<tbody>
						<tr v-for="{score, cost} in point_buy" :key="score">
							<td>{{ score }}</td>
							<td>{{ cost }}</td>
						</tr>
					</tbody>
				</table>

				<h4>3. Manual</h4>
				<p>Manually input the scores for each ability.</p>
			</template>
		</div>
	</hk-card>
</template>

<script>
	import { abilities } from "src/mixins/abilities.js";
	import { dice } from "src/mixins/dice.js";
	import { mapActions } from "vuex";
	import hkAnimatedInteger from '../../../../components/hk-components/hk-animated-integer.vue';

	export default {
  components: { hkAnimatedInteger },
		name: "CharacterAbilities",
		mixins: [abilities, dice],
		props: [
			"playerId", 
			"userId",
		],
		data() {
			return {
				modifier: {},
				saved: false,
				invalid: false,
				roll_dialog: false,
				point_buy_max: 27,
				ability_score_methods: [
					{
						label: "Standard array",
						value: "standard_array"
					},
					{
						label: "Point buy",
						value: "point_buy"
					},
					{
						label: "Manual",
						value: "manual"
					}
				],
				standard_array: [
					8,
					10,
					12,
					13,
					14,
					15
				],
				point_buy: [
					{
						score: 8,
						cost: 0
					},
					{
						score: 9,
						cost: 1
					},
					{
						score: 10,
						cost: 2
					},
					{
						score: 11,
						cost: 3
					},
					{
						score: 12,
						cost: 4
					},
					{
						score: 13,
						cost: 5
					},
					{
						score: 14,
						cost: 7
					},
					{
						score: 15,
						cost: 9
					}
				],
				rolls: [
					{
						results: [],
						ability: ""
					},
					{
						results: [],
						ability: ""
					},
					{
						results: [],
						ability: ""
					},
					{
						results: [],
						ability: ""
					},
					{
						results: [],
						ability: ""
					},
					{
						results: [],
						ability: ""
					},
				]
			}
		},
		inject: ["characterState"],
		computed: {
			character() {
				return this.characterState.character;
			},
			computed() {
				return this.characterState.computed_character;
			},
			ability_scores() {
				return (this.character.abilities) ? this.character.abilities : {};
			},
			method() {
				return this.character.ability_score_method;
			},
			point_buy_remaining() {
				let points = this.point_buy_max;

				// Remove all spent points from the total
				for(const score of Object.values(this.ability_scores)) {
					const cost = this.point_buy.filter(item => item.score === score).map(item => item.cost)[0];
					points = (cost !== undefined) ? points - cost : points;
				}

				return points;
			}
		},
		methods: {
			...mapActions([
				"set_character_prop"
			]),
			save(origin, valid) {
				if(valid) {
					this.$emit("save", origin);
					this.saved = true;
				} else {
					this.invalid = true;
				}
			},
			standardArrayDisable(value) {
				return (this.ability_scores) ? Object.values(this.ability_scores).includes(value) : false;
			},
			pointBuyDisable(value, ability_score) {
				const score = this.point_buy.filter(item => item.score === value).map(item => item.cost)[0];
				return (!this.ability_scores || ability_score > value) ? false : score > this.point_buy_remaining;
			},
			confirmMethodChange(method) {
				if(!this.method) {
					this.saveAbilityScoreMethod(method);
				} else {
					this.$snotify.error(
						`Are you sure you want to change the method? Current ability scores will be reset.`, `Change method`, 
						{
							buttons: [
								{ text: 'Yes', action: (toast) => { this.saveAbilityScoreMethod(method); this.$snotify.remove(toast.id); }, bold: false},
								{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
							]
						});
				}
			},
			saveAbilityScoreMethod(method) {
				const value = (method === "standard_array" || method === "manual") ? null : 8;

				// Reset ability scores
				for(const ability of this.abilities) {
					this.character.abilities[ability.value] = value;
				}

				// Set the method
				this.character.ability_score_method = method;
				this.save("abilities.method", true);
			},
			saveAbility(score, ability, valid) {
				score = (score !== null) ? parseInt(score) : score;

				this.$set(this.character.abilities, ability, score);

				this.save(`abilities.${ability}`, valid);
			},
			rollAbilityScore(i) {
				const roll = this.rollD({}, 6, 4, 0, "Ability score roll");
				this.rolls[i].results = roll.throws;
			},
			rollAllAbilityScores() {
				for(let i = 0; i < 6; i++) {
					this.rollAbilityScore(i);
				}
			},
			lowestRoll(rolls) {
				const lowest_value = Array.min(rolls);
				return rolls.indexOf(lowest_value);
			},
			filterAbilities(i) {
				const used = this.rolls.filter(roll => roll.ability).map(roll => roll.ability);

				return this.abilities.filter(ability => {
					return !used.includes(ability.value) || this.rolls[i].ability === ability.value;
				});
			},
			rolledTotal(i) {
				let throws = [...this.rolls[i].results];
				const lowest_index = this.lowestRoll(throws);
				throws.splice(lowest_index, 1);
				return throws.reduce((a, b) => a + b,0);
			},
			applyRolledScores() {
				this.rolls.forEach((roll, i) => {
					this.saveAbility(this.rolledTotal(i), roll.ability);
				});
				this.clearAllRolls();
				this.roll_dialog = false;
			},
			clearAllRolls() {
				for(const index in this.rolls) {
					this.$set(this.rolls[index], "ability", "");
					this.$set(this.rolls[index], "results", []);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 40px 0 20px 0 !important;
	}
	h4 {
		font-size: 18px;
	}
	.base_abilities {
		width: 100%;
		display: flex;
		justify-content: center;
		align-content: center;
		margin: -5px;
		flex-wrap: wrap;

		.ability {
			margin: 5px;
			text-align: center;
			min-width: 90px;
			width: 130px;

			&.computed {
				max-width: 100px;
			}

			.label {
				margin-bottom: 10px;
				font-weight: bold;
				font-size: 12px;
			}
			.q-field {
				text-align: center !important;
				font-size: 25px;
				font-weight: bold;
			}
			.score {
				font-family: 'Fredericka the Great', cursive !important;
				font-size: 45px;
				color: $white;
			}
		}
	}

	.table {
		max-width: 300px;
		border-spacing: 1px;

		td {
			text-align: center;
		}
	}

	.ability-rolls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: -5px;

		.score {
			background-color: $neutral-8;
			margin: 5px;
			min-width: 230px;

			.rolls {
				display: flex;
				justify-content: space-between;
				line-height: 30px;
				padding: 10px;

				.roll {
					background: $neutral-9;
					width: 30px;
					height: 30px;
					text-align: center;
					margin-right: 2px;
					color: $white;

					&.rolled {
						background-color: $blue;
					}
					&.ignore {
						opacity: .5;
					}
				}
				.total {
					color: $white;
					text-align: right;
					font-size: 25px;
				}
			}

		}
	}
</style>