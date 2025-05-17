<template>
	<div>
		<q-no-ssr>
			<PromoBanner class="mb-5" :closable="false" @discount="setDiscount" />
		</q-no-ssr>
		<div v-if="!loading">
			<div class="d-flex justify-content-center mb-4">
				<q-toggle v-model="annually" size="lg"> <strong>Pay annually</strong> (save 10%) </q-toggle>
			</div>
			<hk-card-deck>
				<template v-for="(t, key) in tiers">
					<hk-card
						v-if="!legacy_tiers.includes(t['.key'])"
						:key="key"
						:class="{ current: t.name === tier?.name }"
					>
						<div slot="header" class="card-header flex-col items-start">
							<strong>{{ t.name }}</strong>
							<span class="neutral-2">{{ t.description }}</span>
						</div>
						<div class="card-body">
							<div class="top">
								<span
									class="price"
									:class="{
										'patreon-red': t.name === 'Free',
										strike: discount && !annually && t.name !== 'Free',
									}"
									>{{ t.name === "Free" ? t.price : `$${price(t.price)}` }}</span
								>
								<span v-if="discount && !annually && t.name !== 'Free'" class="price"
									>${{ discountPrice(t.price) }}</span
								>
								<em v-if="t.price === 'Free'" class="neutral-2 sub">forever</em>
								<em v-else class="neutral-2 sub">{{
									discount && !annually ? "the first month" : "per month"
								}}</em>
							</div>
							<ul>
								<li v-for="(benefit, key) in default_benefits" :key="key">
									<i class="fas fa-check green" aria-hidden="true" />
									{{ benefit }}
								</li>
								<li v-for="(benefit, key) in benefits" :key="key">
									<i
										v-if="typeof t.benefits[key] === 'boolean'"
										aria-hidden="true"
										class="fas"
										:class="t.benefits[key] ? 'fa-check green' : 'fa-times neutral-3'"
									/>
									<template v-else>
										<i
											aria-hidden="true"
											v-if="t.benefits[key] === 'infinite'"
											class="green far fa-infinity"
										/>
										<strong v-else :class="t.benefits[key] === '-' ? 'neutral-3' : 'green'">{{
											t.benefits[key]
										}}</strong>
									</template>
									<span>
										{{ benefit.title }}
										<span v-if="key === 'character_sync'" class="neutral-3">*</span>
										<span v-if="key === 'ai_credits'" class="neutral-3">(per month)</span>
									</span>
								</li>
								<li>
									<i class="fas fa-check green" aria-hidden="true" />
									<span
										class="d-flex justify-content-between items-center pointer"
										@click="show_storage = !show_storage"
									>
										<span
											><strong>{{ storage_size[t.name] }}</strong> storage</span
										>
										<i
											class="fas fa-chevron-down"
											aria-hidden="true"
											:class="{ open: show_storage }"
										/>
									</span>
								</li>
							</ul>
							<q-slide-transition v-show="show_storage">
								<ul class="storage">
									<li v-for="storage_type in storage" :key="storage_type">
										<i
											aria-hidden="true"
											v-if="t.benefits[storage_type] == 'infinite'"
											class="green far fa-infinity"
										/>
										<span v-else class="green">{{ t.benefits[storage_type] }}</span>
										<span>
											<span
												v-if="['npcs', 'spells', 'reminders', 'items'].includes(storage_type)"
												class="neutral-3"
											>
												Custom
											</span>
											{{ storageType(storage_type, t.benefits[storage_type]) }}
											<span v-if="storage_type === 'encounters'" class="neutral-3">
												(per campaign)
											</span>
										</span>
									</li>
								</ul>
							</q-slide-transition>
						</div>
						<div slot="footer">
							<router-link
								v-if="t.price === 'Free'"
								class="btn btn-block btn-square bg-patreon-red"
								:to="!user ? '/sign-up' : '/content'"
							>
								Use for Free
							</router-link>
							<a
								v-else
								:href="`https://www.patreon.com/join/shieldmaidenapp/checkout?rid=${t['.key']}&cadence=${annually ? 12 : 1}`"
								target="_blank"
								rel="noopener"
								class="btn btn-block btn-square bg-patreon-red"
								@click="selectTier(t)"
								>Join {{ `$${price(t.price)}` }} tier</a
							>
						</div>
					</hk-card>
				</template>
			</hk-card-deck>
			<small class="d-block text-center">
				<span class="neutral-3">*</span> Character Sync requires <strong>Chrome</strong> as your
				browser and the
				<a
					href="https://chrome.google.com/webstore/detail/dd-character-sync/jgcbbmbchbkdjbgiiheminkkkecjohpg"
					target="_blank"
					rel="noopener"
				>
					D&D Character Sync Chrome Extension</a
				>.
			</small>
		</div>
		<hk-loader v-else name="tiers" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { db } from "src/firebase";
import { legacy_tiers } from "src/utils/generalConstants";
import PromoBanner from "./PromoBanner.vue";

export default {
	name: "Tiers",
	components: {
		PromoBanner,
	},
	data() {
		return {
			loading: true,
			show_storage: false,
			discount: undefined,
			annually: false,
			default_benefits: [
				"Combat tracker",
				"Encounter builder",
				"Digital DM Screen",
				"Public Initiative List",
				"Monster creator",
				"Spell creator",
			],
			benefits: {
				character_sync: {
					title: "Character sync",
				},
				avatars: {
					title: "Avatar crop & upload",
				},
				background: {
					title: "Background effects",
				},
				import: {
					title: "Import content",
				},
				ai_credits: {
					title: "AI credits",
				},
			},
			storage_size: {
				Free: "Small",
				"Folk Hero": "Medium",
				Noble: "Large",
				Deity: "Infinite",
			},
			legacy_tiers,
			storage: ["campaigns", "encounters", "players", "npcs", "spells", "reminders", "items"],
		};
	},
	firebase() {
		return {
			tiers: {
				source: db.ref("tiers").orderByChild("order"),
				readyCallback: () => (this.loading = false),
			},
		};
	},
	computed: {
		...mapGetters(["user", "tier"]),
	},
	methods: {
		storageType(type, count) {
			type = type === "npcs" ? type.slice(0, -1).toUpperCase() : type.slice(0, -1).capitalize();
			return count === "infinite" || count > 1 ? `${type}s` : type;
		},
		selectTier(t) {
			this.$gtm.trackEvent({
				event: "purchase",
				tier: t.name,
				cadence: this.annually ? 12 : 1,
			});
		},
		setDiscount(discount) {
			this.discount = discount;
		},
		price(price) {
			price = Number(price.slice(1));
			return this.annually ? (price * 0.9).toFixed(2) : price;
		},
		discountPrice(price) {
			price = Number(price.slice(1));
			return (price * (1 - this.discount / 100)).toFixed(2);
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-card {
	&.current {
		border-color: $patreon-red !important;
	}
	.card-header {
		strong {
			font-size: 18px;
		}
	}
	.card-body {
		padding: 0 0 15px 0;

		.top {
			padding: 15px;

			.price {
				font-size: 25px;
				font-weight: bold;
				margin-right: 5px;

				&.strike {
					text-decoration: line-through;
					font-weight: normal;
					color: $neutral-2;
					font-size: 20px;
				}
			}
			i.sub {
				display: block;
			}
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;

			li {
				display: grid;
				grid-template-columns: 30px 1fr;
				line-height: 35px;
				align-items: center;
				font-size: 15px;
				padding: 0 15px;
				color: $neutral-1;
				margin-bottom: 1px;

				.fa-chevron-down {
					transition: all 0.2s linear;

					&.open {
						transform: rotate(-180deg);
					}
				}
			}
			&.storage {
				padding-left: 20px;

				li {
					font-size: 13px;
					line-height: 25px;
				}
			}
		}
	}
}
</style>
