<template>
	<button
		class="hk-roll"
		tabindex="-1"
		:class="
			disabled ? 'disabled' : Object.keys(advantage).length === 1 ? Object.keys(advantage)[0] : ''
		"
		@mousemove="checkAdvantage"
		@mouseout="clearAdvantage()"
		v-touch-hold.mouse="!disabled ? showDialog : null"
		@click.stop.prevent="disabled ? null : roll ? rollDice($event) : emit($event)"
		@keydown="checkAdvantage"
    	@keyup="checkAdvantage"
		@mouseenter="checkAdvantage"
    	@mouseleave="checkAdvantage"
	>
		<slot name="default">
			<span class="roll-button" :class="`roll-button__${color}`" />
		</slot>
		<q-tooltip :anchor="position.anchor" :self="position.self" v-if="tooltip">
			{{ tooltip }}
			{{ Object.keys(advantage).length === 1 ? `with ${Object.keys(advantage)[0]}` : `` }}
		</q-tooltip>
		<q-popup-proxy
			:dark="$store.getters.theme === 'dark'"
			no-parent-event
			ref="rollPopup"
			:breakpoint="576"
		>
			<q-list class="bg-neutral-8" :dark="$store.getters.theme === 'dark'">
				<q-item>
					<q-item-section>
						<b>{{ roll ? roll.title : tooltip }}</b>
					</q-item-section>
				</q-item>
				<q-separator />
				<q-item clickable v-close-popup @click.prevent="rollDice($event, 'advantage')">
					<q-item-section class="green">Advantage</q-item-section>
				</q-item>
				<q-item clickable v-close-popup @click.prevent="rollDice($event, 'disadvantage')">
					<q-item-section class="red">Disadvantage</q-item-section>
				</q-item>
			</q-list>
		</q-popup-proxy>
	</button>
</template>

<script>
import { dice } from "src/mixins/dice.js";

export default {
	name: "hk-roll",
	mixins: [dice],
	props: {
		roll: {
			type: Object,
			required: false,
		},
		tooltip: {
			type: String,
			required: false,
		},
		tooltipPosition: {
			type: String,
			required: false,
			default: "top",
		},
		disabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		share: {
			type: Object,
			required: false,
			default: null,
		},
		color: {
			type: String,
			default: "cyan"
		}
	},
	data() {
		return {
			advantageSetter: undefined,
			rollDialog: false,
		};
	},
	computed: {
		advantage: {
			get() {
				let advantage =
					this.roll && this.roll.advantage ? JSON.parse(JSON.stringify(this.roll.advantage)) : {};
				return this.advantageSetter ? this.advantageSetter : advantage;
			},
			set(newValue) {
				let advantage =
					this.roll && this.roll.advantage
						? JSON.parse(JSON.stringify(this.roll.advantage))
						: newValue;
				this.advantageSetter = advantage;
			},
		},
		position() {
			if (this.tooltipPosition === "right") {
				return {
					anchor: "center right",
					self: "center left",
				};
			} else {
				return {
					anchor: "top middle",
					self: "bottom middle",
				};
			}
		},
	},
	mounted() {
		this.$nextTick(function () {
			window.addEventListener("keyup", this.checkKeyPress);
			window.addEventListener("keydown", this.checkKeyPress);
		});
	},
	destroyed() {
		window.removeEventListener("keyup", this.checkKeypress);
		window.removeEventListener("keydown", this.checkKeypress);
	},
	methods: {
		checkKeyPress(e) {
			if (e.type === "keydown") {
				if (e.key === "Shift") {
					this.$set(this.advantage, "advantage", true);
				} else if (e.key === "Control") {
					this.$set(this.advantage, "disadvantage", true);
				}
			}
			if (e.type === "keyup") {
				if (e.key === "Shift" || e.key === "Control") {
					this.advantage = {};
				}
			}
		},
		checkAdvantage(e) {
			if (e.shiftKey) {
				this.$set(this.advantage, "advantage", true);
			} else if (e.ctrlKey) {
				this.$set(this.advantage, "disadvantage", true);
			}
		},
		clearAdvantage() {
			this.advantage = {};
		},
		showDialog() {
			this.$refs.rollPopup.show();
		},
		rollDice(e, advantage_disadvantage = undefined) {
			let advantage_object =
				this.roll && this.roll.advantage ? JSON.parse(JSON.stringify(this.roll.advantage)) : {};

			if (advantage_disadvantage) {
				advantage_object[advantage_disadvantage] = true;
			}

			if (this.roll) {
				this.rollD(
					e,
					this.roll.d,
					this.roll.n,
					this.roll.m,
					this.roll.title,
					this.roll.entity_name,
					this.roll.notify ? this.roll.notify : false,
					advantage_object,
					this.share
				);
			} else {
				this.emit(e, advantage_object);
			}
		},
		emit(e, advantage_disadvantage) {
			this.$emit("roll", { e, advantage_disadvantage });
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-roll {
	background: none;
	border: none;
	padding: 0;

	&:focus {
		outline: none;
	}

	.roll-button {
		display: inline-block;
		cursor: pointer;
		background-image: url("../../assets/_img/logo/logo-icon-no-shield-cyan.svg");
		height: 20px;
		width: 20px;
		background-position: center;
		background-size: cover;
		vertical-align: -5px;
		user-select: none;

		&__yellow {
			background-image: url("../../assets/_img/logo/logo-icon-no-shield-yellow.svg");
		}
		&__blue {
			background-image: url("../../assets/_img/logo/logo-icon-no-shield-blue.svg");
		}
	}
	&.advantage .roll-button:hover,
	.advantage.hk-roll:focus .roll-button {
		background-image: url("../../assets/_img/logo/logo-icon-no-shield-green.svg") !important;
	}
	&.disadvantage .roll-button:hover,
	.disadvantage.hk-roll:focus .roll-button {
		background-image: url("../../assets/_img/logo/logo-icon-no-shield-red.svg") !important;
	}
}
</style>
