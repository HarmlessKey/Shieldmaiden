<!-- EDIT NPC IN EDIT ENCOUNTER SCREEN -->

<template>
	<div class="pb-5">
		<h2>Edit <span class="blue">{{ npc.name }}</span></h2>
			<q-input 
				:dark="$store.getters.theme === 'dark'" filled square
				label="Name"
				type="text" 
				name="name" 
				id="name" 
				v-model="npc.name"
				:class="{'input': true, 'error': errors.has('name') }"
				v-validate="'required'"
				placeholder="Name"/>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		<hr>
			<q-input
				:dark="$store.getters.theme === 'dark'" filled square
				label="Avatar"
				type="text" 
				:class="{'input': true, 'error': errors.has('avatar') }" 
				v-model="npc.avatar" 
				v-validate="'url'" 
				data-vv-as="Avatar"
				name="avatar" 
				id="avatar" 
				placeholder="Input URL"
			/>
			<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
		<hr>
			<q-input
				:dark="$store.getters.theme === 'dark'" filled square
				v-model="npc.color_label"
				label="Color label"
				readonly
			>
				<template v-slot:append>
					<q-icon name="colorize" class="cursor-pointer">
						<q-popup-proxy transition-show="scale" transition-hide="scale">
							<q-color v-model="npc.color_label" :palette="hkColors" default-view="palette" />
						</q-popup-proxy>
					</q-icon>
				</template>
			</q-input>
		<hr>

		<q-checkbox :dark="$store.getters.theme === 'dark'" v-model="npc.friendly" label="Friendly NPC" color="positive" />

		<hr>
			<div class="d-flex justify-content-between">
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Armor class"
					class="mr-2"
					type="number" 
					name="ac" 
					data-vv-as="Armor Class"
					v-model="npc.ac"
					v-validate="'required'"
				>
					<template v-slot:append>
						<i class="fas fa-shield"/>
					</template>
				</q-input>

				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Hit points"

					type="text" 
					name="maxHp" 
					data-vv-as="Hit Points"
					v-model="npc.maxHp"
					v-validate="'required'"
					placeholder="Hit Points">
					<template v-slot:append>
						<q-icon name="favorite"/>
					</template>
				</q-input>
			</div>
			<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
			<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
		<button class="btn btn-block my-2" @click="edit()">Save</button>
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
		'data'
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				npc: this.data,
				hkColors: [
					"#88b3ce",
					"#9ac16a",
					"#c45e66",
					"#db815e",
					"#e2da5f",
					"#9b7aba"
				]
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
						
						db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.npc.key}`).set(
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
