<template>
	<div class="manual">
		<div class="manual__input">
			<q-knob
				v-model="knob_value"
				:angle="180"
				size="110px"
				center-color="neutral-6"
				track-color="neutral-8"
				color="primary"
				:disable="!targeted?.length"
				@input="value = $event"
			/>
			<input
				ref="input"
				v-model.number="value"
				type="number"
				:disabled="!targeted?.length"
				@keypress="submitManual"
			/>
			<q-tooltip
				v-if="!targeted?.length"
				anchor="center middle"
				self="center middle"
				:offset="[0, -5]"
			>
				Select a target
			</q-tooltip>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";

export default {
	name: "ActionsManual",
	components: {},
	mixins: [setHP],
	props: {
		actor: {
			type: Object,
		},
	},
	data() {
		return {
			knob_value: 0,
			value: 0,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
	},
	methods: {
		...mapActions([]),
		...mapActions("tutorial", ["completeStep"]),
		submitManual(e, valid) {
			if (e.key === "Enter" && e.shiftKey) {
				this.setManual("healing", valid);
			} else if (e.key === "Enter") {
				this.setManual("damage", valid);
			}
		},
		async setManual(type) {
			if (this.value) {
				//Update HP
				for (const key of this.targeted) {
					let amount = {};
					amount[type] = this.value;

					// Set config for HpManipulation and log
					const config = {
						crit: this.crit,
						ability: "manual input",
						log: true,
						actions: [
							{
								type,
								manual: true,
								rolls: [
									{
										damage_type: this.damage_type,
										value: amount[type],
									},
								],
							},
						],
					};

					await this.setHP(amount, this.entities[key], this.actor, config);
				}

				//Reset input fields
				this.value = 0;
				this.knob_value = 0;
				this.$refs.input.blur();
			}

			// If a value is applied, complete the tutorial step
			if (this.get_step("run", "manual", "player")) {
				this.completeStep({ tutorial: "run" });
			}
		},
	},
	watch: {},
};
</script>

<style lang="scss" scoped>
.manual {
	&__input {
		background-color: $neutral-6;
		border-radius: 50%;
		margin: -50px 0;
		position: relative;
		border: solid 8px $neutral-9;

		input {
			position: absolute;
			border: none;
			background: none;
			height: 80px;
			width: 80px;
			text-align: center;
			border-radius: 50%;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 30px;

			&:focus {
				outline: none;
			}
		}
		::v-deep {
			.disabled,
			.disabled *,
			[disabled] {
				cursor: default !important;
			}
		}
	}
}
</style>
