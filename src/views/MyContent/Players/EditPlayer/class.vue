<template>
	<div>
		
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
		props: [
			"base_class",
			"computed",
			"playerId", 
			"userId"
		],
		components: {
			GiveCharacterControl
		},
		computed: {
			class() {
				return (this.base_class) ? this.base_class : {};
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>

</style>