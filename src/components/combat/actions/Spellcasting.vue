<template>
	<div v-if="current">
		<q-tabs
			class="mt-3"
			v-model="tab"
			dark inline-label dense no-caps
		>
			<q-tab 
				v-for="({name, label}, index) in tabs"
				:key="`tab-${index}`" 
				:name="name" 
				:label="label"
			/>
		</q-tabs>

		<q-tab-panels v-model="tab" class="bg-transparent">
			<q-tab-panel :name="name" v-for="({name, label}, type_index) in tabs" :key="`panel-${type_index}`">
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
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { dice } from "@/mixins/dice.js";
	import { setHP } from "@/mixins/HpManipulations.js";
	import { damage_types } from '@/mixins/damageTypes.js';


	export default {
		name: "Spellcasting",
		mixins: [setHP, dice, damage_types],
		props: ["current"],
		data() {
			return {

			}
		},
		computed: {
			...mapGetters([

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
			}
		},
		methods: {
			...mapActions([

			]),
		
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

			.value {
				font-size: 18px;
				font-weight: bold;
			}
		}
	}
</style>