<template>
	<div>
		<h3 class="text-center">Base ability scores</h3>
		<div class="base_abilities">
			<div class="ability" v-for="{value, label} in abilities" :key="`base-${value}`">
				<label :for="value">{{ label.toUpperCase()  }}</label>
				<b-form-input
					:id="value" 
					@change="saveAbility(value)"
					autocomplete="off"  
					type="number"
					v-model="ability_scores[value]"
				/>
			</div>
		</div>
	</div>
</template>

<script>
	import VueMarkdown from 'vue-markdown';
	import { abilities } from '@/mixins/abilities.js';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterAbilities',
		mixins: [abilities],
		props: [
			"base_abilities",
			"computed",
			"playerId", 
			"userId",
			"modifiers"
		],
		components: {
			Modifier
		},
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
			saveAbility(ability) {
				const score = (this.ability_scores[ability]) ? parseInt(this.ability_scores[ability]) : 0;
				db.ref(`characters_base/${this.userId}/${this.playerId}/abilities/${ability}`).set(score);
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
		display: grid;
		grid-template-columns: repeat(6, 100px);
		grid-column-gap: 10px;
		justify-content: center;
		align-content: center;

		.ability {
			text-align: center;

			label {
				margin-bottom: 0;
				font-weight: bold;
				font-size: 12px;
			}
			.form-control {
				text-align: center;
				font-size: 25px;
				height: 50px;
				font-weight: bold;
			}
		}
	}
	@media only screen and (max-width: 950px) {
		.base_abilities {
			grid-template-columns: repeat(3, 100px);
			grid-template-rows: auto;
			grid-row-gap: 20px;
		}
	}
</style>