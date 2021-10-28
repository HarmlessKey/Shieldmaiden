<template>
	<span>
		<span 
			class="hk-roll"
			:class="disabled ? 'disabled' : Object.keys(advantage).length === 1 ? Object.keys(advantage)[0] : ''"
			@mousemove="checkAdvantage($event)"
			@mouseout="clearAdvantage()"
			v-touch-hold.mouse="!disabled ? showDialog : null"
			@click.stop="disabled ? null : roll ? rollDice($event) : emit($event)"
		>
			<slot name="default"/>
			<q-tooltip :anchor="position.anchor" :self="position.self" v-if="tooltip">
				{{ tooltip }} {{ Object.keys(advantage).length === 1 ? `with ${Object.keys(advantage)[0]}` : `` }}
			</q-tooltip>
			<q-popup-proxy :dark="$store.getters.theme === 'dark'" no-parent-event ref="rollPopup" :breakpoint="576">
				<q-list class="bg-neutral-8" :dark="$store.getters.theme === 'dark'">
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
			},
			share: {
				type: Object,
				required: false,
				default: null
			}
		},
		data() {
			return {
				advantageSetter: undefined,
				rollDialog: false
			}
		},
		computed: {
			advantage: {
				get() {
					let advantage = (this.roll && this.roll.advantage) ? JSON.parse(JSON.stringify(this.roll.advantage)) : {};
					return (this.advantageSetter) ? this.advantageSetter : advantage;
				},
				set(newValue) {
					let advantage = (this.roll && this.roll.advantage) ? JSON.parse(JSON.stringify(this.roll.advantage)) : newValue;
					this.advantageSetter = advantage;
				}
			},
			position() {
				if(this.tooltipPosition === "right") {
					return {
						anchor: "center right", 
						self: "center left"
					}
				} else {
					return {
						anchor: "top middle", 
						self: "bottom middle"
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
						this.$set(this.advantage, "advantage", true);
					} else if(e.key === "Control") {
						this.$set(this.advantage, "disadvantage", true);
					}
				}
				if(e.type === "keyup") {
					if(e.key === "Shift" || e.key === "Control") {
						this.advantage = {};
					}
				}
			},
			checkAdvantage(e) {
				if(e.shiftKey) {
					this.$set(this.advantage, "advantage", true);
				} else if(e.ctrlKey) {
					this.$set(this.advantage, "disadvantage", true);
				} 			
			},
			clearAdvantage() {
				this.advantage = {};
			},
			showDialog() {
				this.$refs.rollPopup.show();
			},
			rollDice(e, advantage_disadvantage=undefined) {
				let advantage_object = (this.roll && this.roll.advantage) ? JSON.parse(JSON.stringify(this.roll.advantage)) : {};

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
			}
		}
	}
</script>