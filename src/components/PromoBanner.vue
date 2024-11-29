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
				<div class="discount__percentage">{{ discount }}</div>
				<div class="discount__off">OFF</div>
			</div>
			<div>
				<div class="code">
					Use promo code
					<div>{{ code }}</div>
				</div>
			</div>
		</div>
		<div class="promo-banner__footer">
			<div class="remaining">
				Get your first month with a <strong>{{ discount }}%</strong> discount.
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
			code: "SHIELDMAIDEN80",
			discount: 80,
			now: new Date(),
			start: new Date("2024-11-15T00:00:00Z"),
			end: new Date("2024-12-03T07:59:59Z"),
			showSetter: undefined,
			timer: null,
		};
	},
	computed: {
		...mapGetters(["tier"]),
		show_banner: {
			get() {
				const show =
					(this.tier?.price === "Free" || !this.tier) &&
					this.now >= this.start &&
					this.now <= this.end;
				return this.showSetter !== undefined ? this.showSetter : show;
			},
			set(newVal) {
				this.showSetter = newVal;
			},
		},
		days_remaining() {
			const diff = this.end - this.now;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			return days >= 1 ? days : undefined;
		},
		hours_remaining() {
			const diff = this.end - this.now;
			const hours = Math.floor(diff / (1000 * 60 * 60));
			return hours;
		},
	},
	methods: {
		purchaseEvent() {
			this.$gtm.trackEvent({
				event: "purchase",
			});
		},
	},
	mounted() {
		if (this.show_banner) {
			this.$emit("discount", this.discount);
		}
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
