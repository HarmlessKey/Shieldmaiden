<template>
	<div>
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(edit)" greedy>
				<hk-card header="Edit campaign" :min-width="300">
					<div class="card-body">
						<ValidationProvider rules="required" name="Title" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Title *"
								autocomplete="off"
								type="text" 
								v-model="campaign.campaign"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>

						<q-select 
							:dark="$store.getters.theme === 'dark'" filled square
							label="Advancement"
							emit-value
							map-options
							class="my-2" 
							v-model="campaign.advancement" 
							:options="advancement_options" 
						/>

						<div class="background">
							<div 
								class="img pointer" 
								v-if="campaign.background" 
								:style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }"
								@click="image = true"
							>
							</div>
							<div class="img" v-else>
								<q-icon name="fas fa-image"/>
							</div>
							<div>
								<ValidationProvider rules="url" name="Background" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										autocomplete="off" 
										type="text" 
										v-model="campaign.background"
										placeholder="Background URL"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
						</div>

						<div class="mt-3 neutral-2 pointer" @click="setPrivate(!campaign.private)">
							<span class="btn btn-clear">
								<span :class="!campaign.private ? 'green' : 'neutral-2'">
									<i class="fas fa-eye"></i>
									Public
								</span>
							</span>
							/
							<span class="btn btn-clear mr-2">
								<span :class="campaign.private ? 'red' : 'neutral-2'">
									<i class="fas fa-eye-slash"></i>
									Private
								</span>
							</span>
							<hk-popover 
								header="Private vs Public"
							>
								<i class="fas fa-info-circle blue" />
								<template #content>
									<p>
										You can only share the inititiave list with your 
										players if your campaign is set to public.
									</p>
									Private campaigns are hidden from your followers.
								</template>
							</hk-popover>
						</div>

					</div>
					<div slot="footer" class="card-footer">
						<q-icon v-if="!valid" name="error" color="red" size="md" class="mr-2">
							<q-tooltip anchor="top middle" self="center middle">
								There are validation errors
							</q-tooltip>
						</q-icon>
						<q-btn class="bg-neutral-5 mr-2" label="Cancel" no-caps v-close-popup />
						<q-btn color="blue" type="submit" no-caps>Save</q-btn>
					</div>
				</hk-card>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { db } from "@/firebase";

	export default {
		name: "EditCampaign",
		props: ["campaignId"],
		data() {
			return {
				user: this.$store.getters.user,
				advancement_options: [
					{
						value: "experience",
						label: "Experience"
					},
					{
						value: "milestone",
						label: "Milestone"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'campaign',
				'players',
				'npcs'
			]),
		},
		mounted() {
			this.fetchCampaign({
				cid: this.campaignId, 
			});
		},
		methods: {
			...mapActions([
				'fetchCampaign'
			]),
			edit() {
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}`).update(this.campaign);
			},
			setPrivate(value) {
				//Has to be removed on false
				if(value === false) {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/private`).remove();
				} else {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/private`).set(value);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.background {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;
		font-size: 35px;
		text-align: center;

		.img {
			border: solid 1px $neutral-3;
			display: block;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}
</style>