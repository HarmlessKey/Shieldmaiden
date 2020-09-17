<template>
	<div>
		<h3>General Character Info</h3>
		<div class="form-item mb-3">
			<q-input 
				dark filled square
				label="Player name"
				@change="savePlayerName()"
				autocomplete="off"  
				type="text" 
				v-model="character.player_name" 
				v-validate="'max:30|required'" 
				maxlength="30"
				data-vv-as="Player name"
				name="player_name"/>
			<p class="validate red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>
		</div>
		<div class="form-item mb-3">
			<q-input 
				dark filled square
				label="Character name"
				@change="saveCharacterName()"
				autocomplete="off"  
				type="text" 
				v-model="character.character_name" 
				v-validate="'max:35|required'" 
				maxlength="35"
				data-vv-as="Character name"
				name="character_name"/>
			<p class="validate red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>
		</div>
		<div class="form-item mb-3 avatar">
			<div 
					class="image"
					:style="[
						character.avatar ? { backgroundImage: 'url(\'' + character.avatar + '\')' } : 
						{ backgroundImage: `url(${require('@/assets/_img/styles/player.svg')})`}
					]"
			/>
			<div>
				<q-input
					dark filled square
					label="Avatar"
					@change="saveAvatar()"
					autocomplete="off"  
					id="avatar" 
					type="text" 
					v-model="character.avatar"
					v-validate="'url'"
					data-vv-as="Avatar"
					name="avatar"
					placeholder="Input URL"/>
				<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
			</div>
		</div>
		<div class="form-item mb-3">
			<q-select 
				dark filled square
				@change="saveAdvancement()"
				v-model="character.advancement" 
				:options="advancement_options" 
				label="Advancement" 
			/>
		</div>
		<div class="form-item mb-3">
			<q-select 
				dark filled square
				@change="saveHpType()"
				v-model="character.hit_point_type" 
				:options="hit_point_options" 
				label="Advancement" 
			/>
		</div>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterGeneral',
		props: [
			"general", 
			"character_class",
			"playerId", 
			"userId"
		],
		components: {
			GiveCharacterControl
		},
		data() {
			return {
				advancement_options: [
					{
						value: "experience",
						label: "Experience"
					},
					{
						value: "milestone",
						label: "Milestone"
					}
				],
				hit_point_options: [
					{
						value: "fixed",
						label: "Fixed"
					},
					{
						value: "rolled",
						label: "Rolled"
					}
				]
			}
		},
		computed: {
			character() {
				return (this.general) ? this.general : {};
			}
		},
		created() {
			this.$validator.attach({ name:'player_name', rules: 'required|max:30' });
			this.$validator.attach({ name:'character_name', rules: 'required|max:35' });
			this.$validator.attach({ name:'avatar', rules: 'url' });
		},
		methods: {
			savePlayerName() {
				this.$validator.validate('player_name', this.character.player_name).then((result) => {
					if (result) {
						db.ref(`characters_base/${this.userId}/${this.playerId}/general/player_name`).set(this.character.player_name);
					}
				});
			},
			saveCharacterName() {
				this.$validator.validate('character_name', this.character.character_name).then((result) => {
					if (result) {
						db.ref(`characters_base/${this.userId}/${this.playerId}/general/character_name`).set(this.character.character_name);
						db.ref(`characters_computed/${this.userId}/${this.playerId}/display/character_name`).set(this.character.character_name);
					}
				});
			},
			saveAvatar() {
				this.$validator.validate('avatar', this.character.avatar).then((result) => {
					if(result) {
						db.ref(`characters_base/${this.userId}/${this.playerId}/general/avatar`).set(this.character.avatar);
						db.ref(`characters_computed/${this.userId}/${this.playerId}/display/avatar`).set(this.character.avatar);
					}
				});
			},
			saveAdvancement() {
				if(this.character.advancement === 'experience' && !this.character_class.experience_points) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/experience_points`).set(0);
				}

				db.ref(`characters_base/${this.userId}/${this.playerId}/general/advancement`).set(this.character.advancement);
				this.$emit("change", "general.advancement");
			},
			saveHpType() {
				//Make sure the rolled HP object exists when type is rolled
				if(this.character.hit_point_type === "rolled") {
					for(const classKey in this.character_class.classes) {
						const Class = this.character_class.classes[classKey];
						const level = (classKey === 0) ? 2 : 1;
						if(!Class.rolled_hit_points) {
							db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/rolled_hit_points/${level}`).set(0);
						}
					}
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/general/hit_point_type`).set(this.character.hit_point_type);
				this.$emit("change", "general.advancementhit_point_type");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		display: grid;
		grid-template-columns: 68px 1fr;
		grid-column-gap: 15px;

		.image {
			width: 68px;
			height: 68px;
			border: solid 1px #5c5757;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
		}
	}
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 40px 0 20px 0 !important;
	}
</style>