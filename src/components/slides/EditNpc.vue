<template>
	<div class="pb-5">
		<h2>Edit <span class="blue">{{ npc.name }}</span></h2>
		<b-form-input 
			type="text" 
			name="name" 
			v-model="npc.name"
			:class="{'input': true, 'error': errors.has('name') }"
			v-validate="'required'"
			placeholder="Name"></b-form-input>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		<hr>
		<b-row class="mb-2">
			<b-col sm="2"><label>AC</label></b-col>
			<b-col>
				<b-form-input 
					type="text" 
					name="ac" 
					v-model="npc.ac"
					:class="{'input': true, 'error': errors.has('ac') }"
					v-validate="'required'"
					placeholder="Armor Class"></b-form-input>
				<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
			</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="2"><label>HP</label></b-col>
			<b-col>
				<b-form-input 
					type="text" 
					name="maxHp" 
					v-model="npc.maxHp"
					:class="{'input': true, 'error': errors.has('maxHp') }"
					v-validate="'required'"
					placeholder="Hit Points"></b-form-input>
					<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
			</b-col>
		</b-row>
		<button class="btn btn-block mb-2" @click="edit()">Save</button>
		<small>Slightly tweek your NPC for the current encounter. If you want to make a completely unique NPC, use our <router-link to="/npcs">NPC creator</router-link>.</small>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions } from 'vuex'

	export default {
		name: 'EditNpc',
		props: [
		'npc',
		'npcKey'
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						this.npc.curHp = this.npc.maxHp;
						
						db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.npcKey}`).set(
							this.npc
						);
						this.setSlide(false);
					}
					else {
						//console.log('Not valid');
					}
				})
			}
		}
	};
</script>

<style scoped>

</style>
