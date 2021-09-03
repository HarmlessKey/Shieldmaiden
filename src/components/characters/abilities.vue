<template>
	<div>
		<q-select
			dark filled square
			label="Method"
			:value="ability_score_method" 
			:options="ability_score_methods" 
			emit-value
			map-options
			@input="confirmMethodChange($event)"
		/>
		<h3 class="text-center">Base ability scores</h3>

		<!-- STANDARD ARRAY -->
		<div v-if="ability_score_method === 'standard_array'" class="base_abilities input">
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
					@input="saveAbility($event, value)"
					clearable
				/>
			</div>
		</div>

		<!-- POINT BUY -->
		<template v-if="ability_score_method === 'point_buy'">
			<div class="base_abilities input">
				<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
					<div>{{ label }}</div>
					<q-select
						dark filled square
						placeholder="-"
						:value="ability_scores[value]"
						:options="point_buy.map(item => item.score)"
						emit-value
						map-options
						:option-disable="opt => pointBuyDisable(opt, ability_scores[value])"
						@input="saveAbility($event, value)"
					/>
				</div>
			</div>
			<h3 class="text-center mb-1">Points remaining</h3>
			<h3 class="text-center mt-0">
				<span class="white">{{ point_buy_remaining }}</span>/{{ point_buy_max }}
			</h3>
		</template>

		<!-- MANUAL -->
		<div v-if="ability_score_method === 'manual'" class="base_abilities input">
			<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
				<div>{{ label }}</div>
				<q-input
					dark filled square
					placeholder="-"
					:id="value" 
					@change="saveAbility($event.target.value, value)"
					autocomplete="off"  
					type="number"
					:value="ability_scores[value]"
				/>
			</div>
		</div>

		<h3 class="text-center">Computed ability scores</h3>
		<div class="base_abilities">
			<div class="ability computed" v-for="{value, label} in abilities" :key="`base-${value}`">
				<div class="label">
					{{ label.substring(3, 0).toUpperCase() }}
				</div>
				<h2 class="score">
					{{ computed[value] || 0 }}
				</h2>
			</div>
		</div>
	</div>
</template>

<script>
	import { abilities } from "@/mixins/abilities.js";
	import { mapActions } from "vuex";

	export default {
		name: "CharacterAbilities",
		mixins: [abilities],
		props: [
			"base_abilities",
			"method",
			"computed",
			"playerId", 
			"userId",
			"modifiers"
		],
		data() {
			return {
				modifier: {},
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
				]
			}
		},
		computed: {
			ability_scores() {
				return (this.base_abilities) ? this.base_abilities : {};
			},
			ability_score_method() {
				return (this.method) ? this.method : "standard_array";
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
			standardArrayDisable(value) {
				return (this.ability_scores) ? Object.values(this.ability_scores).includes(value) : false;
			},
			pointBuyDisable(value, ability_score) {
				const score = this.point_buy.filter(item => item.score === value).map(item => item.cost)[0];
				return (!this.ability_scores || ability_score > value) ? false : score > this.point_buy_remaining;
			},
			confirmMethodChange(method) {
				this.$snotify.error(
					`Are you sure you want to change the method? Current ability scores will be reset.`, `Change method`, 
					{
						buttons: [
							{ text: 'Yes', action: (toast) => { this.saveAbilityScoreMethod(method); this.$snotify.remove(toast.id); }, bold: false},
							{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
						]
					});
			},
			saveAbilityScoreMethod(method) {
				const value = (method === "standard_array" || method === "manual") ? null : 8;

				// Reset ability scores
				for(const ability of this.abilities) {
					this.set_character_prop({
						userId: this.userId,
						key: this.playerId,
						category: "abilities",
						property: ability.value,
						value
					});
				}

				// Set the method
				this.set_character_prop({
					userId: this.userId,
					key: this.playerId,
					category: "general",
					property: "ability_score_method",
					value: method
				});
				this.$emit("change", `abilities.ability_scores`);
			},
			saveAbility(score, ability) {
				score = parseInt(score);

				this.set_character_prop({
					userId: this.userId,
					key: this.playerId,
					category: "abilities",
					property: ability,
					value: score
				});
				this.$emit("change", `abilities.${ability}`);
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
			width: 140px;

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
	@media only screen and (max-width: 950px) {
		.base_abilities.input {
			grid-template-columns: repeat(3, 100px);
			grid-template-rows: auto;
			grid-row-gap: 20px;
		}
	}
</style>