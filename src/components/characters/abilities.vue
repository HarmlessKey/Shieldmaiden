<template>
	<div>
		<h3 class="text-center">Base ability scores</h3>
		<div class="base_abilities input">
			<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
				<q-input
					dark filled square
					:label="label"
					:id="value" 
					@change="saveAbility(value)"
					autocomplete="off"  
					type="number"
					v-model="ability_scores[value]"
				/>
			</div>
		</div>

		<h3 class="text-center">Computed ability scores</h3>
		<div class="base_abilities">
			<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
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
			"computed",
			"playerId", 
			"userId",
			"modifiers"
		],
		data() {
			return {
				modifier: {}
			}
		},
		computed: {
			ability_scores() {
				return (this.base_abilities) ? this.base_abilities : {};
			}
		},
		methods: {
			...mapActions([
				"set_character_prop"
			]),
			saveAbility(ability) {
				const score = (this.ability_scores[ability]) ? parseInt(this.ability_scores[ability]) : 0;

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

		.ability {
			margin: 5px;
			text-align: center;
			min-width: 80px;
			max-width: 100px;

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