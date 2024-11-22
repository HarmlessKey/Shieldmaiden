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
				<hk-loader slot="loading" name="Promotions" />
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
									v-model="newPromotion.code"
									name="code"
									label="Code"
									:rules="[(val) => !!val || 'Field is required']"
								/>
								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									type="text"
									autocomplete="off"
									v-model="newPromotion.title"
									name="title"
									label="Title"
									:rules="[(val) => !!val || 'Field is required']"
								/>

								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									type="textarea"
									autocomplete="off"
									v-model="newPromotion.text"
									name="text"
									label="Text"
									:rules="[(val) => !!val || 'Field is required']"
								/>

								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									v-model="newPromotion.active_from"
									label="Active From (MM/DD/YYYY)"
									:rules="[(val) => !!val || 'Field is required']"
								>
									<template v-slot:append>
										<q-icon name="event" class="cursor-pointer">
											<q-popup-proxy cover transition-show="scale" transition-hide="scale">
												<q-date
													v-model="newPromotion.active_from"
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

								<q-input
									class="mb-2"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									v-model="newPromotion.active_until"
									label="Active Until (MM/DD/YYYY)"
									:rules="[(val) => !!val || 'Field is required']"
								>
									<template v-slot:append>
										<q-icon name="event" class="cursor-pointer">
											<q-popup-proxy cover transition-show="scale" transition-hide="scale">
												<q-date
													v-model="newPromotion.active_until"
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

export default {
	name: "Promotions",
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
					name: "code",
					label: "Code",
					field: "code",
					sortable: true,
					align: "left",
				},
				{
					name: "title",
					label: "Title",
					field: "title",
					sortable: true,
					align: "left",
				},
				{
					name: "text",
					label: "Text",
					field: "text",
					align: "left",
				},
				{
					name: "active_from",
					label: "Active From",
					field: "active_from",
					align: "left",
					sortable: true,
				},
				{
					name: "active_until",
					label: "Active Until",
					field: "active_until",
					align: "left",
					sortable: true,
				},
			],
		};
	},
	computed: {
		loading() {
			return this.loading_promotions;
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
