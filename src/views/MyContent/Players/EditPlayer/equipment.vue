<template>
	<div class="equipment">
		<div class="gold">
			Gold
		</div>

		<div v-for="{name, label, icon, items} in types" :key="name" :class="name">
			<h3>
				<span>
					<i :class="icon"/> {{ label }}
				</span>
			</h3>
		</div>
	</div>
</template>

<script>
	import ModifierTable from './modifier-table.vue';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
		props: [
			"character_race",
			"modifiers",
			"feat_modifiers",
			"feats",
			"playerId", 
			"userId"
		],
		components: {
			Modifier,
			ModifierTable
		},
		data() {
			return {
				modifier: {},
				modal: false
			}
		},
		computed: {
			types() {
				const types = [
					{
						name: "weapons",
						label: "Weapons",
						icon: "fas fa-swords",
						items: []
					},
					{
						name: "Armor",
						label: "Weapons",
						icon: "fas fa-shield",
						items: []
					},
					{
						name: "other",
						label: "Other",
						icon: "fas fa-ring",
						items: []
					},
				];
				return types;
			}
		},
		methods: {
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 0 !important;
		display: flex;
		justify-content: space-between;
		border-bottom: solid 1px #b2b2b2;
	}

	.equipment {
		display: grid;
		grid-template-rows: 60px 1fr;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 10px;

		.gold {
			grid-column: span 3;
		}
	}
</style>