<template>
	<div>
		<h3>General Character Info</h3>
		<div class="form-item mb-3">
			<label for="player_name" class="required">Player name</label>
			<b-form-input 
				@change="savePlayerName()"
				autocomplete="off"  
				id="player_name" 
				type="text" 
				v-model="character.player_name" 
				v-validate="'max:30|required'" 
				maxlength="30"
				data-vv-as="Player name"
				name="player_name" 
				placeholder="Player name"/>
			<p class="validate red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>
		</div>
		<div class="form-item mb-3">
			<label for="character_name" class="required">Character name</label>
			<b-form-input 
				@change="saveCharacterName()"
				autocomplete="off"  
				id="character_name" 
				type="text" 
				v-model="character.character_name" 
				v-validate="'max:35|required'" 
				maxlength="35"
				data-vv-as="Character name"
				name="character_name" 
				placeholder="Character name"/>
			<p class="validate red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>
		</div>
		<div class="form-item mb-3">
			<label for="avatar" class="required">Avatar</label>
			<b-form-input
				@change="saveAvatar()"
				autocomplete="off"  
				id="avatar" 
				type="text" 
				:class="{'input': true, 'error': errors.has('avatar') }"
				v-model="character.avatar"
				v-validate="'url'"
				data-vv-as="Avatar"
				name="avatar"
				placeholder="Image URL"/>
			<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
		</div>
		<div class="form-item mb-3">
			<label for="avatar" class="required">Advancement</label>
			<div>
				<el-switch
					@change="saveAdvancement()"
					v-model="character.advancement"
					active-color="#2c97de"
					inactive-color="#2c97de"
					inactive-value="milestone"
					inactive-text="Milestone"
					active-value="experience"
					active-text="Experience">
				</el-switch>
			</div>
		</div>
		<div class="form-item mb-3">
			<label for="avatar" class="required">Hit point type</label>
			<div>
				<el-switch
					@change="saveHpType()"
					v-model="character.hit_point_type"
					active-color="#2c97de"
					inactive-color="#2c97de"
					active-value="rolled"
					active-text="Rolled"
					inactive-value="fixed"
					inactive-text="Fixed">
				</el-switch>
			</div>
		</div>
		<b-card header="Give out control">
			<GiveCharacterControl :playerId="playerId" :control="character.control" />
		</b-card>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterGeneral',
		props: [
			"general", 
			"classes",
			"playerId", 
			"userId"
		],
		components: {
			GiveCharacterControl
		},
		computed: {
			character() {
				return (this.general) ? this.general : {};
			}
		},
		created() {
			this.$validator.attach('player_name', 'required|max:30');
			this.$validator.attach('character_name', 'required|max:35');
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
				db.ref(`characters_base/${this.userId}/${this.playerId}/general/avatar`).set(this.character.avatar);
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/avatar`).set(this.character.avatar);
			},
			saveAdvancement() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/general/advancement`).set(this.character.advancement);
			},
			saveHpType() {
				if(this.character.hit_point_type === "rolled") {
					for(const classKey in this.classes) {
						const Class = this.classes[classKey];
						if(!Class.rolled_hit_points && Class.level > 1) {
							db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/rolled_hit_points/2`).set(0);
						}
					}
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/general/hit_point_type`).set(this.character.hit_point_type);
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>