<!-- EDIT NPC IN EDIT ENCOUNTER SCREEN -->

<template>
	<div class="pb-5">
		<h2>Edit <span class="blue">{{ npc.name }}</span></h2>
		<b-row>
			<b-col class="col-2">
				<label for="name">Name</label>
			</b-col>
			<b-col>
				<b-form-input 
					type="text" 
					name="name" 
					id="name" 
					v-model="npc.name"
					:class="{'input': true, 'error': errors.has('name') }"
					v-validate="'required'"
					placeholder="Name"></b-form-input>
				<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
			</b-col>
		</b-row>
		<hr>
		<b-row>
			<b-col class="col-2">
				<label for="avatar">Avatar</label>
			</b-col>
			<b-col>
				<b-form-input 
					v-b-tooltip.hover title="Avatar"
					type="text" 
					class="form-control" 
					:class="{'input': true, 'error': errors.has('avatar') }" 
					v-model="npc.avatar" 
					v-validate="'url'" 
					data-vv-as="Avatar"
					name="avatar" 
					id="avatar" 
					placeholder="Image URL"></b-form-input>
				<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
			</b-col>
		</b-row>
		<hr>

		<b-form-checkbox name="friendly" v-model="npc.friendly">Friendly NPC</b-form-checkbox>

		<hr>
		<b-row class="mb-2">
			<b-col class="text-center">
				<label for="ac">Armor Class</label>
				<b-form-input 
					type="text" 
					name="ac" 
					data-vv-as="Armor Class"
					v-model="npc.ac"
					:class="{'input': true, 'error': errors.has('ac') }"
					v-validate="'required'"
					placeholder="Armor Class"></b-form-input>
				<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
			</b-col>
			<b-col class="text-center">
				<label for="maxHp">Hit Points</label>
				<b-form-input 
					type="text" 
					name="maxHp" 
					id="maxHp" 
					data-vv-as="Hit Points"
					v-model="npc.maxHp"
					:class="{'input': true, 'error': errors.has('maxHp') }"
					v-validate="'required'"
					placeholder="Hit Points"></b-form-input>
					<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
			</b-col>
		</b-row>
		<button class="btn btn-block mb-2" @click="edit()">Save</button>
		<small>Slightly tweak your NPC for the current encounter. If you want to make a completely unique NPC, use our <router-link to="/npcs">NPC creator</router-link>.</small>
		<div class="img-container"><img :src="npc.avatar" /></div>
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
	.img-container, img {
		margin-top: 10px;
		width: 100%;
	}
</style>
