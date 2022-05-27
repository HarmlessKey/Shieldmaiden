<template>
	<hk-card>
		<div class="card-header" slot="header">
			<span>General characer info</span>
			<small class="saved green" v-if="saved" @animationend="saved = false">
				<i aria-hidden="true" class="fas fa-check" />
				Saved
			</small>
			<small class="saved orange" v-if="invalid" @animationend="invalid = false">
				<i aria-hidden="true" class="fas fa-times" />
				Couldn't save
			</small>
		</div>
		<div class="card-body">
			<ValidationObserver v-slot="{ valid }">
				<q-form greedy>	
					<ValidationProvider rules="required|max:30" name="Player name" v-slot="{ errors, invalid, validated }">
						<q-input 
							dark filled square
							label="Player name"
							autocomplete="off"  
							type="text" 
							@change="save(valid)"
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
							autocomplete="off"  
							type="text" 
							@change="save(valid)"
							v-model="character.character_name" 
							maxlength="35"
							class="mb-2"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>
					<div class="avatar mb-2">
						<div class="image" :style="character.avatar ? `background-image: url('${character.avatar}')` : ''">
							<i v-if="!character.avatar" class="hki-player" aria-hidden="true" />
						</div>
						<ValidationProvider rules="url|max:2000" name="Avatar" v-slot="{ errors, invalid, validated }">
							<q-input
								dark filled square
								label="Avatar"
								autocomplete="off"
								type="text"
								@change="save(valid)"
								v-model="character.avatar"
								maxlength="2000"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<q-select 
						dark filled square map-options emit-value
						@input="save(valid)"
						v-model="character.advancement" 
						:options="advancement_options" 
						label="Advancement" 
						class="mb-4"
					/>
					<q-select 
						dark filled square map-options emit-value
						@input="save(valid)"
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

	export default {
		name: 'CharacterGeneral',
		props: [
			"characterId",
			"userId"
		],
		data() {
			return {
				saved: false,
				invalid: false,
				character_copy: undefined,
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
				return this.characterState.character;
			}
		},
		methods: {
			...mapActions("characters", ["update_character"]),
			async save(valid) {
				if(valid) {
					this.$emit("save");
					this.saved = true;
				} else {
					this.invalid = true;
				}
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
			background-position: center top;
			background-size: cover;
		}
	}
</style>