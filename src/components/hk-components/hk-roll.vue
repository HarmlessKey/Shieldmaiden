<template>
	<span>
		<span 
			class="hk-roll"
			:class="advantage ? advantage : ''"
			@mousemove="checkAdvantage($event)"
			@mouseout="clearAdvantage()"
			v-touch-hold.mouse="!disabled ? showDialog : null"
			@click="roll ? rollDice($event) : emit($event)"
		>
			<slot name="default"/>
			<q-tooltip :anchor="position.anchor" :self="position.self" v-if="tooltip">
				{{ tooltip }} {{ advantage ? `with ${advantage}` : `` }}
			</q-tooltip>
			<q-popup-proxy no-parent-event ref="rollPopup">
				<q-list class="bg-gray gray-light" square dark :breakpoint="576">
					<q-item>
						<q-item-section>
							<b>{{ roll ? roll.title : tooltip }}</b>
						</q-item-section>
					</q-item>
					<q-separator />
					<q-item 
						clickable v-close-popup 
						@click="rollDice($event, 'advantage')"
					>
						<q-item-section class="green">Advantage</q-item-section>
					</q-item>
					<q-item 
						clickable v-close-popup 
						@click="rollDice($event, 'disadvantage')"
					>
						<q-item-section class="red">Disadvantage</q-item-section>
					</q-item>
				</q-list>
			</q-popup-proxy>
		</span>
	</span>
</template>

<script>
	import { dice } from '@/mixins/dice.js';
	export default {
		name: 'hk-roll',
		mixins: [dice],
		props: {
			roll: {
				type: Object,
				required: false
			},
			tooltip: {
				type: String,
				required: false
			},
			tooltipPosition: {
				type: String,
				required: false,
				default: "top"
			},
			disabled: {
				type: Boolean,
				required: false,
				default: false
			}
		},
		data() {
			return {
				advantage: undefined,
				rollDialog: false
			}
		},
		computed: {
			position() {
				if(this.tooltipPosition === "right") {
					return {
						anchor: "center right", 
						self: "center left"
					}
				} else {
					return {
						anchor: "top middle", 
						self: "center middle"
					}
				}
			}
		},
		created() {
			this.$nextTick(function() {
				window.addEventListener('keyup', this.checkKeyPress);
				window.addEventListener('keydown', this.checkKeyPress);
			});
		},
		destroyed() {
			window.removeEventListener('keyup', this.checkKeypress);
			window.removeEventListener('keydown', this.checkKeypress);
		},
		methods: {
			checkKeyPress(e) {
				if(e.type === "keydown") {
					if(e.key === "Shift") {
						this.advantage = "advantage";
					} else if(e.key === "Control") {
						this.advantage = "disadvantage";
					}
				}
				if(e.type === "keyup") {
					if(e.key === "Shift" || e.key === "Control") {
						this.advantage = undefined;
					}
				}
			},
			checkAdvantage(e) {
				if(e.shiftKey) {
					this.advantage = "advantage"
				} else if(e.ctrlKey) {
					this.advantage = "disadvantage"
				} 			
			},
			clearAdvantage() {
				this.advantage = undefined;
			},
			showDialog() {
				this.$refs.rollPopup.show();
			},
			rollDice(e, advantage_disadvantage=undefined) {
				let advantage_object = (this.roll && this.roll.advantage) ? this.roll.advantage : {};

				if(advantage_disadvantage) {
					advantage_object[advantage_disadvantage] = true;
				}

				if(this.roll) {
					this.rollD(
						e,
						this.roll.d,
						this.roll.n,
						this.roll.m,
						this.roll.title,
						this.roll.notify ? this.roll.notify : false,
						advantage_object
					);
				} else {
					this.emit(e, advantage_object);
				}
			},
			emit(e, advantage_disadvantage) {
				this.$emit("roll", { e, advantage_disadvantage });
			}
		}
	}
</script>