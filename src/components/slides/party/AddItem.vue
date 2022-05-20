<template>
	<div>
		<div class="mb-2">
			<a class="btn btn-sm btn-clear" @click="cancel">
				<i aria-hidden="true" class="fas fa-times red mr-1" />
				Cancel
			</a>
		</div>

		<h2>New Item</h2>
		<ValidationObserver v-slot="{ handleSubmit, validate, valid }">
			<q-form @submit="valid ? handleSubmit(addItem) : validate()" greedy>
				<ValidationProvider rules="required" name="Name" v-slot="{ errors, invalid, validated }">
					<q-input
						:dark="$store.getters.theme === 'dark'" filled square
						label="Public name *"
						class="mb-3"
						type="text" 
						v-model="item.public_name"
						:error="invalid && validated"
						:error-message="errors[0]"
					>
						<hk-popover 
							slot="append" 
							header="Public name" 
							content="The public name is visible for players after you have awarded the item. You decide when you also want to share the information of the linked item."
						>
							<q-icon name="info" @click.stop class="pointer" />
						</hk-popover>
					</q-input>
				</ValidationProvider>

				<ValidationProvider rules="max:2000" name="Name" v-slot="{ errors, invalid, validated }">
					<q-input
						:dark="$store.getters.theme === 'dark'" filled square
						autogrow
						label="Public description"
						class="mb-3" 
						v-model="item.public_description" 
						rows="4"
						name="desc"
						maxlength="2000"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
				</ValidationProvider>

				<div class="linked mb-3">
					<LinkedItem v-if="item.linked_item" :linked-item="item.linked_item">
						<a class="btn btn-sm bg-neutral-5 mr-2" @click="item.linked_item = null">
							<i aria-hidden="true" class="fas fa-unlink red" />
							<q-tooltip anchor="top middle" self="center middle">
								Unlink
							</q-tooltip>
						</a>
					</LinkedItem>
					<a v-else class="btn bg-neutral-5" @click="link_dialog = true">
						<i aria-hidden="true" class="fas fa-link mr-1" /> Link item
					</a>
				</div>

				<q-btn class="full-width" color="primary" type="submit" no-caps label="Add item" />
			</q-form>
		</ValidationObserver>

		<q-dialog v-model="link_dialog">
			<hk-card header="Link item" :min-width="320">
				<div class="card-body">
					<CopyContent @copy="linkItem" type="item" return-id button="link" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import CopyContent from "src/components/CopyContent";
	import LinkedItem from "./LinkedItem";

	export default {
		name: 'AddItemCampaign',
		components: {
			CopyContent,
			LinkedItem
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				item: {},
				link_dialog: false
			}
		},
		methods: {
			...mapActions("campaigns", [
				"add_campaign_item"
			]),
			async linkItem({ id, resource }) {
				const item = { 
					key: id,
					custom: resource === "custom" ? true : null
				};
				this.$set(this.item, "linked_item", item);
				this.link_dialog = false;
			},
			async addItem() {	
				await this.add_campaign_item({
					campaignId: this.campaignId,
					item: this.item
				})
				this.$emit('close', true);
			},
			cancel() {
				this.$emit('close', false);
			}
		}
	};
</script>