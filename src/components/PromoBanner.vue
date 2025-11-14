<template>
	<a
		v-if="show_banner"
		class="promo-banner"
		href="https://www.patreon.com/shieldmaidenapp/membership"
		target="_blank"
		rel="noopener"
		@click="purchaseEvent"
	>
		<button v-if="closable" class="no-thanks" @click.stop.prevent="show_banner = false">
			no thanks
		</button>
		<div class="promo-banner__body">
			<div class="discount">
				<div class="discount__percentage">{{ active_promotion.discount }}</div>
				<div class="discount__off">OFF</div>
			</div>
			<div>
				<div class="code" @click="copyCode">
					Use promo code
					<div>
						{{ active_promotion.code }}
						<hk-icon icon="fas fa-copy" class="ml-1" />
					</div>
				</div>
			</div>
		</div>
		<div class="promo-banner__footer">
			<div class="remaining">
				Get your first month<template v-if="eligible_tier_names"> of <strong>{{ eligible_tier_names }}</strong></template> with a <strong>{{ active_promotion.discount }}%</strong> discount.
				<template v-if="hours_remaining <= 1">Less than </template>
				<span class="remaining__count">{{
					days_remaining ? days_remaining : hours_remaining
				}}</span>
				{{ days_remaining ? "days" : "hours" }} left.
			</div>
			<span class="btn bg-patreon-red">Subscribe now!</span>
		</div>
	</a>
</template>

<script>
import { mapGetters } from "vuex";
import { promotionService } from "src/services/promotions";

export default {
	name: "PromoBanner",
	props: {
		closable: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			active_promotion: undefined,
			code: "SHIELDMAIDEN80",
			now: new Date(),
			showSetter: undefined,
			timer: null,
			tiers: null,
		};
	},
	computed: {
		...mapGetters(["tier", "userInfo"]),
		show_banner() {
			if (!this.active_promotion) {
				return false;
			}

			// Check if promotion has eligible tiers restriction
			if (this.active_promotion.eligible_tiers && this.active_promotion.eligible_tiers.length > 0) {
				// User must have a tier order lower than the minimum eligible tier order
				// to be shown the promotion (encouraging upgrades)
				const userTierOrder = this.tier?.order ?? 0;
				const minEligibleTierOrder = this.getMinEligibleTierOrder();

				// Show promotion if user's tier is lower than the minimum eligible tier
				return userTierOrder < minEligibleTierOrder;
			}

			// No tier restriction, show to free users only
			return this.tier?.price === "Free" || !this.tier;
		},
		days_remaining() {
			const diff = this.active_promotion.active_until - this.now;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			return days >= 1 ? days : undefined;
		},
		hours_remaining() {
			const diff = this.active_promotion.active_until - this.now;
			const hours = Math.floor(diff / (1000 * 60 * 60));
			return hours;
		},
		eligible_tier_names() {
			if (!this.active_promotion?.eligible_tiers || !this.tiers) {
				return null;
			}

			const tierNames = this.active_promotion.eligible_tiers
				.map((tierId) => this.tiers[tierId]?.name)
				.filter(Boolean);

			if (tierNames.length === 0) {
				return null;
			}

			// Format the list: "A", "A and B", or "A, B, and C"
			if (tierNames.length === 1) {
				return tierNames[0];
			} else if (tierNames.length === 2) {
				return `${tierNames[0]} and ${tierNames[1]}`;
			} else {
				const lastTier = tierNames.pop();
				return `${tierNames.join(", ")}, and ${lastTier}`;
			}
		},
	},
	methods: {
		copyCode(event) {
			event.preventDefault();
			navigator.clipboard.writeText(this.active_promotion.code);
			this.$snotify.success("To clipboard", "Code Copied!", {
				position: "rightTop",
			});
		},
		async getActivePromotion() {
			return await promotionService.getFirstActivePromotion();
		},
		purchaseEvent() {
			this.$gtm.trackEvent({
				event: "purchase",
			});
		},
		getMinEligibleTierOrder() {
			if (!this.active_promotion.eligible_tiers || !this.tiers) {
				return Infinity;
			}

			// Find the minimum order among eligible tiers
			let minOrder = Infinity;
			for (const tierId of this.active_promotion.eligible_tiers) {
				const tier = this.tiers[tierId];
				if (tier && tier.order < minOrder) {
					minOrder = tier.order;
				}
			}
			return minOrder;
		},
	},
	async mounted() {
		this.tiers = await promotionService.getTiers();
		this.active_promotion = await this.getActivePromotion();
		this.timer = setInterval(() => {
			this.now = new Date();
		}, 60000);
	},
	beforeDestroy() {
		clearInterval(this.timer);
	},
};
</script>

<style lang="scss" scoped>
.promo-banner {
	display: block;
	border-radius: $border-radius;
	background-color: $neutral-9;
	color: $white;
	position: relative;

	.no-thanks {
		position: absolute;
		line-height: normal;
		color: $neutral-5;
		font-size: 12px;
		padding: 5px;
		top: 0;
		right: 0;

		&:hover {
			color: $neutral-4;
		}
	}
	&__body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		width: 100%;
		padding: 15px 25px;
		column-gap: 25px;
		row-gap: 10px;

		.code {
			color: $neutral-2;
			:hover {
				color: $primary;
			}

			> div {
				color: $white;
				display: inline-block;
				text-transform: uppercase;
				font-weight: bold;
				background-color: $neutral-6;
				border-radius: $border-radius-small;
				padding: 5px 10px;
				font-size: 20px;
			}
		}
		.discount {
			display: flex;
			align-items: center;
			&__percentage {
				font-size: 80px;
				line-height: 80px;
				font-weight: bold;
			}
			&__off {
				font-weight: bold;
				font-size: 30px;
				line-height: 30px;
				opacity: 0.8;
				&:before {
					content: "%";
					display: block;
				}
			}
		}
	}
	&__footer {
		border-bottom-left-radius: inherit;
		border-bottom-right-radius: inherit;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		padding: 15px 25px;
		gap: 15px;
		background-color: $neutral-6-transparent;

		.remaining {
			font-size: 18px;
			&__count {
				font-weight: bold;
				color: $patreon-red;
			}
		}
	}
}
</style>
