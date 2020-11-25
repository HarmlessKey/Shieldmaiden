<template>
	<div>
		<q-tabs
			v-model="tab"
			dark
			inline-label
			dense
			no-caps
		>
			<q-tab 
				v-for="({name, label}, index) in tabs"
				:key="`tab-${index}`" 
				:name="name" 
				:label="label"
			/>
		</q-tabs>
		<q-tab-panels 
			v-model="tab" 
			class="bg-transparent"
		>
			<q-tab-panel name="roller">
				<Roller />
			</q-tab-panel>
			<q-tab-panel name="rolls">
				<Rolls :rolls="rolls" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import Roller from './Roller';
	import Rolls from './Rolls';

	export default {
		name: "rollSlide",
		components: {
			Roller,
			Rolls
		},
		computed: {
			...mapGetters([
				'rolls'
			])
		},
		data() {
			return {
				tab: "roller",
				tabs: [
					{
						label: "Dice roller",
						name: "roller"
					},
					{
						label: "Rolls",
						name: "rolls"
					}
				]
			}
		}
	};
</script>

<style lang="scss" scoped>
</style>