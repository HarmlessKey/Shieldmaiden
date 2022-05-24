<template>
	<hk-card header="General Character Info">
		<div class="card-body">
			<ValidationObserver>
				<q-form greedy>
					<ValidationProvider rules="required|max:30" name="Player name" v-slot="{ errors, invalid, validated }">
						<q-input 
							dark filled square
							label="Player name"
							@change="saveProp('general', 'player_name', character.player_name, !invalid)"
							autocomplete="off"  
							type="text" 
							v-model="character.player_name" 
							maxlength="30"
							class="mb-2"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>
					<ValidationProvider rules="required|max:35" name="Character name" v-slot="{ errors, invalid, validated }">
						<q-input 
							dark filled square
							label="Character name"
							@change="saveProp('general', 'character_name', character.character_name, !invalid)"
							autocomplete="off"  
							type="text" 
							v-model="character.character_name" 
							maxlength="35"
							class="mb-2"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>
					<div class="avatar mb-2">
						<div class="image">
							<i class="hki-player" aria-hidden="true" />
						</div>
						<ValidationProvider rules="url|max:2000" name="Avatar" v-slot="{ errors, invalid, validated }">
							<q-input
								dark filled square
								label="Avatar"
								@change="saveProp('general', 'avatar', character.avatar, !invalid)"
								autocomplete="off"
								type="text"
								v-model="character.avatar"
								maxlength="2000"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<q-select 
						dark filled square map-options emit-value
						@input="saveAdvancement()"
						v-model="character.advancement" 
						:options="advancement_options" 
						label="Advancement" 
						class="mb-4"
					/>
					<q-select 
						dark filled square map-options emit-value
						@input="saveHpType()"
						v-model="character.hit_point_type" 
						:options="hit_point_options" 
						label="Hit point type"
					/>
				</q-form>
			</ValidationObserver>
		</div>
	</hk-card>
</template>

<script>
	import { mapActions } from "vuex";
	import { db } from 'src/firebase';

	export default {
		name: 'CharacterGeneral',
		props: [
			"characterId", 
			"userId"
		],
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
		inject: ["characterState"],
		computed: {
			character() {
				return (this.characterState.base_values) ? this.characterState.base_values : {};
			},
			character_class() {
				return (this.characterState.base_values.class) ? this.characterState.base_values.class : {};
			}
		},
		methods: {
			...mapActions("characters", ["set_character_prop", "update_character"]),
			async saveProp(category, property, value, valid) {
				if(valid) {
					await this.update_character({
						uid: this.userId,
						id: this.characterId,
						character: this.character
					});
				}
			},
			saveAdvancement() {
				if(this.character.advancement === "experience" && !this.character_class.experience_points) {
					this.set_character_prop({
						userId: this.userId,
						key: this.characterId,
						category: "class",
						property: "experience_points",
						value: 0
					});
				}

				this.set_character_prop({
					userId: this.userId,
					key: this.characterId,
					category: "general",
					property: "advancement",
					value: this.character.advancement
				});
				this.$emit("change", "general.advancement");
			},
			saveHpType() {
				//Make sure the rolled HP object exists when type is rolled
				if(this.character.hit_point_type === "rolled") {
					for(const classKey in this.character_class.classes) {
						const Class = this.character_class.classes[classKey];
						const level = (classKey === 0) ? 2 : 1;
						if(!Class.rolled_hit_points) {
							db.ref(`characters_base/${this.userId}/${this.characterId}/class/classes/${classKey}/rolled_hit_points/${level}`).set(0);
						}
					}
				}
				this.set_character_prop({
					userId: this.userId,
					key: this.characterId,
					category: "general",
					property: "hit_point_type",
					value: this.character.hit_point_type
				});
				this.$emit("change", "general.advancementhit_point_type");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;

		.image {
			width: 55px;
			height: 55px;
			line-height: 55px;
			font-size: 40px;
			border: solid 1px $neutral-2;
			text-align: center;
		}
	}
</style>