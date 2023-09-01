<template>
	<div>
		<h3 v-if="targeted.length === 0" class="red text-center">Select one or more targets</h3>
		<template v-else>
			<hk-dmg-type-select v-model="damage_type" placeholder="Damage type" clearable dense />
			<q-checkbox
				:dark="$store.getters.theme === 'dark'"
				v-model="crit"
				label="Critical hit"
				indeterminate-value="something-else"
			/>
			<q-checkbox
				:dark="$store.getters.theme === 'dark'"
				v-model="magical"
				label="Magical"
				indeterminate-value="something-else"
			/>

			<ValidationProvider rules="min_value:0" name="Input" v-slot="{ errors, invalid, validated }">
				<div class="manual">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						ref="input"
						filled
						square
						type="number"
						v-model="manualAmount"
						name="Manual Input"
						min="0"
						class="manual-input"
						@keypress="submitManual($event, !invalid)"
						autocomplete="off"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
					<button
						class="btn dmg bg-red white"
						:class="{ disabled: invalid || manualAmount === '' }"
						@click="setManual('damage', !invalid)"
						tabindex="-1"
					>
						Attack
						<i aria-hidden="true" class="hki-sword-break ml-3" />
						<q-tooltip anchor="center right" self="center left">[enter]</q-tooltip>
					</button>
					<button
						class="btn heal bg-green white"
						:class="{ disabled: invalid || manualAmount === '' }"
						@click="setManual('healing', !invalid)"
						tabindex="-1"
					>
						Heal
						<i aria-hidden="true" class="hki-heal" />
						<q-tooltip anchor="center right" self="center left">[shift] + [enter]</q-tooltip>
					</button>
				</div>
			</ValidationProvider>

			<div class="select-amount" :class="{ 'has-defenses': damage_type }">
				<div>Target</div>
				<div v-if="damage_type">
					<q-icon :name="damage_type_icons[damage_type]" :class="damage_type" />
					Defenses
				</div>
				<div>Multipliers</div>
				<div></div>
				<template v-for="key in targeted">
					<div class="name truncate" :key="`name-${key}`">
						{{ entities[key].name.capitalizeEach() }}
					</div>
					<div v-if="damage_type" class="defenses" :key="`defenses-${key}`">
						<div
							v-for="({ name }, defense_key) in defenses"
							:key="defense_key"
							class="option"
							@click.stop="setDefense(key, defense_key)"
							:class="[{ active: resistances[key] === defense_key }, defense_key]"
						>
							<i aria-hidden="true" class="fas fa-shield"></i>
							<span>{{ defense_key.capitalize() }}</span>
							<q-tooltip anchor="top middle" self="center middle">
								{{ name }}
							</q-tooltip>
						</div>
					</div>
					<div class="multipliers" :key="`multipliers-${key}`">
						<div
							v-for="{ value, name, label } in multipliers"
							@click="setMultiplier(key, value)"
							class="multiplier"
							:class="{ 'bg-blue': multiplier[key] === value }"
							:key="value"
						>
							{{ name }}
							<q-tooltip anchor="top middle" self="center middle">
								{{ label }}
							</q-tooltip>
						</div>
					</div>
					<div class="value" :key="`value-${key}`">
						{{ calculateAmount(key) }}
					</div>
				</template>
			</div>
		</template>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";
import { damage_types, damage_type_icons } from "src/utils/generalConstants";

export default {
	name: "Manual",
	mixins: [setHP],
	props: ["current"],
	data() {
		return {
			damage_types: damage_types,
			damage_type_icons: damage_type_icons,
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			manualAmount: "",
			damage_type: undefined,
			magical: false,
			crit: false,
			log: undefined,
			multiplierSetter: undefined,
			resistances: {},
			defenses: {
				v: { name: "Vulnerable", value: "damage_vulnerabilities" },
				r: { name: "Resistant", value: "damage_resistances" },
				i: { name: "Immune", value: "damage_immunities" },
			},
			multipliers: [
				{ value: 0.5, name: "½", label: "Half" },
				{ value: 1, name: "1", label: "Full" },
				{ value: 2, name: "2", label: "Double" },
			],
		};
	},
	computed: {
		...mapGetters(["entities", "targeted"]),
		multiplier: {
			get() {
				let returnValue = {};
				for (const key of this.targeted) {
					returnValue[key] = 1;
				}
				return this.multiplierSetter ? this.multiplierSetter : returnValue;
			},
			set(newValue) {
				this.multiplierSetter = newValue;
			},
		},
	},
	watch: {
		targeted(newTargets) {
			// Add new targets to multiplier list
			for (const key of newTargets) {
				// By default set multiplier to 1
				if (!Object.keys(this.multiplier).includes(key)) {
					this.$set(this.multiplier, key, 1);
				}
				// Check the reistances of a target
				if (this.damage_type && !Object.keys(this.resistances).includes(key)) {
					this.checkDefenses(key);
				}
			}
			// Remove untargeted from multiplier list
			for (let key in this.multiplier) {
				if (!newTargets.includes(key)) {
					this.$delete(this.multiplier, key);
				}
			}
			// Remove untargeted from resistances list
			for (let key in this.resistances) {
				if (!newTargets.includes(key)) {
					this.$delete(this.resistances, key);
				}
			}
		},
		damage_type() {
			this.resistances = {};
			for (const target of this.targeted) {
				this.checkDefenses(target);
			}
		},
		magical() {
			this.resistances = {};
			for (const target of this.targeted) {
				this.checkDefenses(target);
			}
		},
	},
	methods: {
		checkDefenses(target) {
			const entity = JSON.parse(JSON.stringify(this.entities[target]));
			for (const [key, defense] of Object.entries(this.defenses)) {
				let resistances = entity[defense.value];
				if (resistances) {
					resistances.forEach(
						(resistance, i) =>
							(resistances[i] = this.magical ? resistance : resistance.replace(/non_magical_/, ""))
					);
				}
				if (resistances && resistances.includes(this.damage_type)) {
					this.$set(this.resistances, target, key);
				}
			}
		},
		setMultiplier(key, multiplier) {
			this.$set(this.multiplier, key, multiplier);
			this.$forceUpdate();
		},
		setDefense(target, defense) {
			if (this.resistances[target] === defense) this.$delete(this.resistances, target);
			else this.$set(this.resistances, target, defense);
			this.$forceUpdate();
		},
		submitManual(e, valid) {
			if (e.key === "Enter" && e.shiftKey) {
				this.setManual("healing", valid);
			} else if (e.key === "Enter") {
				this.setManual("damage", valid);
			}
		},
		calculateAmount(target, type) {
			let value = this.manualAmount ? parseInt(this.manualAmount) : 0;
			value = value * this.multiplier[target];

			if ((!type || type === "damage") && this.resistances[target]) {
				switch (this.resistances[target]) {
					case "v":
						value = value * 2;
						break;
					case "r":
						value = value * 0.5;
						break;
					case "i":
						value = value * 0;
						break;
				}
			}
			return Math.floor(value);
		},
		async setManual(type, valid) {
			if (valid && this.manualAmount != "") {
				//Update HP
				for (let i in this.targeted) {
					let key = this.targeted[i];
					let amount = {};
					amount[type] = this.calculateAmount(key, type);

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

					await this.setHP(amount, this.entities[key], this.current, config);
				}

				//Reset input fields
				this.manualAmount = "";
				this.damage_type = "";
				this.crit = false;
				this.$refs.input.blur();
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.manual {
	display: grid;
	grid-template-columns: 1fr max-content;
	grid-template-rows: 40px 40px;
	grid-gap: 10px;
	grid-template-areas:
		"input btn-dmg"
		"input btn-heal";
	margin-bottom: 30px;

	.heal {
		grid-area: btn-heal;
	}
	.dmg {
		grid-area: btn-dmg;
	}
	.dmg,
	.heal {
		display: flex;
		justify-content: space-between;
	}
}
.select-amount {
	display: grid;
	grid-auto-rows: 28px;
	grid-template-columns: 1fr repeat(2, max-content);
	row-gap: 2px;

	&.has-defenses {
		grid-template-columns: 1fr repeat(3, max-content);
	}

	.name {
		background: $neutral-8;
		padding: 5px;
	}
	.defenses {
		background: $neutral-8;
		display: grid;
		grid-template-columns: 18px 18px 18px auto;
		grid-column-gap: 5px;
		user-select: none;
		line-height: 28px;
		padding-right: 10px;

		.type {
			padding-left: 10px;
		}

		.option {
			cursor: pointer;
			position: relative;
			width: 18px;
			font-size: 18px;
			text-align: center;
			line-height: 28px;
			color: $neutral-2;

			span {
				font-size: 12px;
				text-align: center;
				font-weight: bold;
				position: absolute;
				width: 18px;
				line-height: 28px;
				top: 0;
				left: 0;
				color: $neutral-8;
			}

			&.active {
				&.i,
				&.r {
					color: $green;
				}
				&.v {
					color: $red;
				}
				span {
					color: $neutral-1;
				}
			}
		}
	}
	.multipliers {
		display: flex;
		justify-content: flex-end;
		background: $neutral-8;

		.multiplier {
			padding: 0 8px;
			margin-left: 1px;
			line-height: 28px;
			background: $neutral-5;
			color: $neutral-1;
			user-select: none;
			cursor: pointer;
		}
	}
	.value {
		line-height: 28px;
		padding-left: 8px;
		text-align: right;
		font-weight: bold;
		font-size: 15px;
		color: $blue;
	}
}

[data-theme="light"] {
	.select-amount {
		.defenses {
			.option {
				color: $neutral-4;

				&.active {
					span {
						color: $neutral-11;
					}
				}
			}
		}
	}
}
</style>
