<template>
	<div class="manual">
		<div class="manual__modifiers">
			<!-- <q-checkbox
				:dark="$store.getters.theme === 'dark'"
				v-model="crit"
				label="CRITICAL"
				left-label
				size="xs"
				indeterminate-value="something-else"
			/>
			<q-checkbox
				:dark="$store.getters.theme === 'dark'"
				v-model="magical"
				label="MAGICAL"
				left-label
				size="xs"
				indeterminate-value="something-else"
			/> -->
			<div class="manual__modifiers-damage-type">
				<div class="manual__modifiers-damage-type__icon">
					<hk-icon
						:icon="damage_type ? damage_type_icons[damage_type] : 'fas fa-chevron-down'"
						:class="damage_type"
					/>
				</div>
				<q-popup-proxy
					:dark="$store.getters.theme === 'dark'"
					content-class="manual__select-damage-type"
					anchor="bottom middle"
					self="top middle"
					transition-show="jump-down"
					transition-hide="jump-up"
					:breakpoint="576"
					:offset="[0, 1]"
				>
					<q-list>
						<q-item
							v-for="type of damage_types"
							:key="type"
							clickable
							v-ripple
							v-close-popup
							@click="damage_type = type"
						>
							<q-item-section avatar>
								<q-icon :name="damage_type_icons[type]" :class="type" />
							</q-item-section>
							<q-item-section>
								<q-item-label v-text="typeLabel(type)" />
							</q-item-section>
						</q-item>
					</q-list>
				</q-popup-proxy>
			</div>
		</div>
		<div class="manual__input">
			<q-knob
				v-model="knob_value"
				:angle="180"
				:max="50"
				size="130px"
				color="primary"
				center-color="neutral-6"
				track-color="neutral-8"
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
		<div class="manual__buttons">
			<button
				class="btn btn-sm bg-red white"
				:class="{
					disabled: !targeted.length || !value,
				}"
				:disabled="!targeted.length || !value"
				tabindex="-1"
				@click="setManual('damage')"
			>
				Attack
				<i aria-hidden="true" class="hki-sword-break ml-2" />
				<q-tooltip anchor="center right" self="center left">[enter]</q-tooltip>
			</button>
			<button
				class="btn btn-sm bg-green white"
				:class="{
					disabled: !targeted.length || !value,
				}"
				:disabled="!targeted.length || !value"
				tabindex="-1"
				@click="setManual('healing')"
			>
				Heal
				<i aria-hidden="true" class="hki-heal" />
				<q-tooltip anchor="center right" self="center left">[shift] + [enter]</q-tooltip>
			</button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";
import { damage_types, damage_type_icons } from "src/utils/generalConstants";

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
			crit: false,
			magical: false,
			damage_type: undefined,
			damage_type_icons: damage_type_icons,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		damage_types() {
			return damage_types.filter((type) => !type.startsWith("non_magical"));
		},
	},
	methods: {
		...mapActions([]),
		...mapActions("tutorial", ["completeStep"]),
		typeLabel(type) {
			type = type.split("_");
			return type.join(" ").capitalizeEach();
		},
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
	display: flex;

	&__modifiers {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;

		&-damage-type {
			display: flex;
			align-items: center;
			height: 50px;
			width: 70px;
			border-top-left-radius: 9999px;
			border-bottom-left-radius: 9999px;
			background-color: $neutral-9;
			cursor: pointer;

			&__icon {
				width: 50px;
				font-size: 28px;
				padding-left: 5px;
				text-align: center;
			}
		}
		.q-checkbox {
			margin-right: 20px;
			font-size: 12px;
		}
	}
	&__input {
		background-color: $neutral-6;
		border-radius: 50%;
		position: relative;
		border: solid 5px $neutral-10;
		margin: 0 -20px;
		z-index: 10;

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
	&__buttons {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 5px;

		.btn {
			display: flex;
			justify-content: space-between;
			padding-left: 25px;
		}
	}
}
</style>
