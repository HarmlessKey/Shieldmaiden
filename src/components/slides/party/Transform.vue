<template>
	<div class="pb-5">
		<h2>Transform</h2>
		
		<ValidationObserver v-slot="{ handleSubmit }">
			<q-form @submit="handleSubmit(edit)">
				<div class="row q-col-gutter-md mb-2">
					<div class="col">
						<ValidationProvider rules="between:1,99|required" name="AC" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Armor class"
								autocomplete="off"
								type="number" 
								min="1"
								max="99"
								v-model="transAc"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					
					<div class="col">
						<ValidationProvider rules="between:1,9999|required" name="HP" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Hit points"
								autocomplete="off"
								type="number"
								min="1"
								max="9999"
								v-model="transHp"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>
				<q-btn no-caps label="Save" class="full-width" color="primary" type="submit" />
			</q-form>
		</ValidationObserver>
		<div class="mt-3">
			<small>
				Transform the entity into another creature. You can use this for a druid's Wild Shape, or for the Polymorph spell. 
				Damage and healing is handled as the Player's Handbook describes it should work for Wild Shape (phb 67).
			</small>
		</div>
	</div>
</template>

<script>
	import { mapActions } from "vuex";

	export default {
		name: 'Transform',
		props: [
			'data',
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				entityKey: this.data,
				transHp: undefined,
				transAc: undefined
			}
		},
		methods: {
			...mapActions("campaigns", ["update_campaign_entity"]),
			edit() {
				const transform = {
					ac: parseInt(this.transAc),
					maxHp: parseInt(this.transHp),
					curHp: parseInt(this.transHp)
				}
				this.update_campaign_entity({ 
					uid: this.userId, 
					campaignId: this.campaignId, 
					type: "players",
					id: this.entityKey,
					property: "transformed",
					value: transform
				});
				this.$emit('close');
			}
		}
	};
</script>

<style scoped>

</style>
