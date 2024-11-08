<template>
	<hk-card>
		<div class="card-header">
			<span>Manage Promotions</span>
			<button @click="add = !add" class="btn btn-sm bg-neutral-5">
				<i aria-hidden="true" class="fas fa-plus green" />
				<span class="d-none d-md-inline-block ml-1">New Promotion</span>
			</button>
		</div>
		<div class="card-body">
			<q-table
				:data="promotions"
				:columns="columns"
				row-key="key"
				card-class="bg-none"
				flat
				:dark="$store.getters.theme !== 'light'"
				:loading="loading"
				separator="none"
				:pagination="{ rowsPerPage: 15 }"
				wrap-cells
			>
				<div slot="no-data" />
				<hk-loader slot="loading" name="players" />
				<template v-slot:body="props">
					<q-tr :props="props" :class="props.row.disabled ? 'text-neutral-3' : ''">
						<q-td v-for="col in props.cols" :key="col.name" :props="props">
							{{ col.value }}
						</q-td>
						<q-td auto-width>
							<div class="d-flex justify-right">
								<a class="btn btn-sm bg-neutral-5 mr-2" @click="editPromotion(props.row)">
									<i class="fas fa-pencil" aria-hidden="true" />
									<q-tooltip anchor="top middle" self="center middle"> Edit promotion </q-tooltip>
								</a>
								<template>
									<a
										v-if="!props.row.disabled"
										class="btn btn-sm bg-neutral-5 mr-2"
										@click="disablePromotion(props.row.promotion)"
									>
										<i class="fas fa-times-square" aria-hidden="true" />
										<q-tooltip anchor="top middle" self="center middle">
											Disable Promotion
										</q-tooltip>
									</a>
									<a
										v-else
										class="btn btn-sm bg-neutral-5 mr-2"
										@click="enablePromotion(props.row.promotion)"
									>
										<i class="fas fa-check-square" aria-hidden="true" />
										<q-tooltip anchor="top middle" self="center middle">
											Enable promotion
										</q-tooltip>
									</a>
								</template>
								<a class="btn btn-sm bg-neutral-5" @click="deletePromotion(props.row.promotion)">
									<i class="fas fa-trash-alt" aria-hidden="true" />
									<q-tooltip anchor="top middle" self="center middle"> Delete promotion </q-tooltip>
								</a>
							</div>
						</q-td>
					</q-tr>
				</template>
			</q-table>

			<q-dialog square v-model="add">
				<div>
					<q-form @submit="addPromotion">
						<hk-card header="New Promotion" class="mb-0">
							<div class="card-body">
								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									:disable="update_promotion"
									type="text"
									autocomplete="off"
									v-model="newPromotion.promotion"
									name="promotion"
									label="Promotion"
									:rules="[(val) => !!val || 'Field is required']"
								/>
								<q-select
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									:options="tier_select"
									map-options
									emit-value
									type="text"
									autocomplete="off"
									v-model="newPromotion.tier"
									:rules="[(val) => !!val || 'Field is required']"
									label="Tier"
								/>
								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									type="number"
									autocomplete="off"
									v-model.number="newPromotion.duration"
									:rules="[(val) => !!val || 'Field is required']"
									label="Duration"
									suffix="Months"
								/>

								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									v-model="newPromotion.valid_until"
									label="Valid Until (MM/DD/YYYY)"
									:rules="[(val) => !!val || 'Field is required']"
								>
									<template v-slot:append>
										<q-icon name="event" class="cursor-pointer">
											<q-popup-proxy cover transition-show="scale" transition-hide="scale">
												<q-date
													v-model="newPromotion.valid_until"
													mask="MM/DD/YYYY"
													:dark="$store.getters.theme === 'dark'"
													filled
													square
												>
													<div class="row items-center justify-end">
														<q-btn v-close-popup label="Close" color="primary" flat />
													</div>
												</q-date>
											</q-popup-proxy>
										</q-icon>
									</template>
								</q-input>
							</div>
							<div slot="footer" class="card-footer d-flex justify-end">
								<q-btn v-close-popup no-caps label="Cancel" class="mr-1" />
								<q-btn type="submit" no-caps label="Add Promotion" class="mr-1" color="primary" />
							</div>
						</hk-card>
					</q-form>
				</div>
			</q-dialog>
		</div>
	</hk-card>
</template>

<script>
import { promotionService } from "src/services/promotions";
import { monsterMixin } from "src/mixins/monster";
import { legacy_tiers } from "src/utils/generalConstants";

export default {
	name: "GenerateSearchTable",
	mixins: [monsterMixin],
	data() {
		return {
			add: false,
			promotions: [],
			tiers: [],
			loading_promotions: true,
			loading_tiers: true,
			newPromotion: {},
			update_promotion: false,
			tierMap: {},
			columns: [
				{
					name: "promotion",
					label: "Promotion",
					field: "promotion",
					sortable: true,
					align: "left",
				},
				{
					name: "tier",
					label: "Tier",
					field: "tier",
					align: "left",
					sortable: true,
					format: (val) => this.tierMap[val],
				},
				{
					name: "duration",
					label: "Duration",
					field: "duration",
					align: "left",
					sortable: true,
				},
				{
					name: "valid_until",
					label: "Valid Until",
					field: "valid_until",
					align: "left",
					sortable: true,
				},
				{
					name: "times_used",
					label: "Times Used",
					field: "times_used",
					align: "left",
					sortable: true,
				},
			],
		};
	},
	computed: {
		tier_select() {
			let tier_list = this.tiers;
			tier_list.sort((a, b) => a.order - b.order);
			return tier_list
				.filter((tier) => tier.order > 0 && !legacy_tiers.includes(tier.id))
				.map((tier) => ({ label: tier.name, value: tier.id }));
		},
		loading() {
			return this.loading_promotions || this.loading_tiers;
		},
	},
	methods: {
		async addPromotion() {
			try {
				await promotionService.addNewPromotion(this.newPromotion);
				this.add = false;
				this.update_promotion = false;
				this.newPromotion = {};
			} catch (error) {
				this.$snotify.error(error);
			}
		},
		async getTierName(id) {
			return await promotionService.getTierName(id);
		},
		async deletePromotion(promotion_name) {
			await promotionService.deletePromotion(promotion_name);
		},
		async editPromotion(promotion) {
			this.add = true;
			this.update_promotion = true;
			this.newPromotion = promotion;
			console.log(newPromotion, promotion);
		},
		async enablePromotion(promotion_name) {
			await promotionService.enablePromotion(promotion_name);
		},
		async disablePromotion(promotion_name) {
			await promotionService.disablePromotion(promotion_name);
		},
		setPromotions(snapshot) {
			this.promotions = snapshot.val() ? Object.values(snapshot.val()) : [];
			this.loading_promotions = false;
		},
	},
	async mounted() {
		promotionService.getPromotionsWithCallback(this.setPromotions);
		const tiers_promise = await promotionService.getPromotionTiers();
		this.tiers = Object.entries(tiers_promise).map(([id, vals]) => ({ ...vals, id }));
		this.tierMap = Object.entries(tiers_promise).reduce(
			(acc, [id, tier]) => ({ ...acc, [id]: tier.name }),
			{}
		);
		this.loading_tiers = false;
	},
};
</script>
