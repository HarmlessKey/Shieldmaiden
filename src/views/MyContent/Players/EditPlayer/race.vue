<template>
	<div>
		<h3>Race</h3>
		<div class="form-item mb-3">
			<label for="race" class="required">Race</label>
			<b-form-input 
				@change="saveRaceName()"
				autocomplete="off"  
				id="race" 
				type="text" 
				v-model="race.race_name" 
				placeholder="Race"/>
		</div>
		<div class="form-item mb-3">
			<label for="race_description" class="required">Description</label>
			<b-form-textarea
				autocomplete="off"
				id="race_description"
				v-model="race.race_description"
				placeholder="Race description"
			/>
		</div>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
		props: [
			"character_race", 
			"playerId", 
			"userId"
		],
		components: {
			GiveCharacterControl
		},
		computed: {
			race() {
				return (this.character_race) ? this.character_race : {};
			}
		},
		methods: {
			saveRaceName() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/race_name`).set(this.race.race_name);
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>