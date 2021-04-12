<template>
	<div class="content" v-if="npc">
		<div class="form">
			<BasicInfo v-model="npc" />

			<Senses v-model="npc" />

			<AbilityScores v-model="npc" />

			<Skills v-model="npc" />
			
			<Defenses v-model="npc" />

			<SpellCasting v-model="npc" />

			<Actions v-model="npc" />
		</div>
	</div>
</template>

<script>
	import BasicInfo from './BasicInfo';
	import Senses from './Senses';
	import AbilityScores from './AbilityScores';
	import Skills from './Skills';
	import Defenses from './Defenses';
	import SpellCasting from './SpellCasting';
	import Actions from './Actions';
	
	export default {
		name: 'EditNpcForm',
		props: ['monster'],
		components: {
			BasicInfo,
			Senses,
			AbilityScores,
			Skills,
			Defenses,
			SpellCasting,
			Actions,
		},
		computed: {
			npc: {
				get() {
					return this.monster;
				},	
				set(newValue) {
					this.$emit('update', newValue);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.content {
	padding: 0 !important;

	.form {
		overflow-x: hidden;
		overflow-y: auto;
	}
}
</style>