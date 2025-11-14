<template>
	<div v-if="current">
		<q-btn-toggle
			:value="roll_type"
			class="mb-3"
			spread
			no-caps
			:dark="$store.getters.theme === 'dark'"
			dense
			square
			toggle-color="primary"
			:options="[
				{ label: 'Attack', value: 'attack' },
				{ label: 'Save', value: 'save' },
				{ label: 'Heal', value: 'heal' },
			]"
			@input="setType"
		/>
		<q-input
			v-if="roll_type === 'attack'"
			:dark="$store.getters.theme === 'dark'"
			dense
			filled
			square
			type="number"
			v-model="attack_bonus"
			label="Attack bonus"
		/>
		<div v-if="roll_type === 'save'" class="d-flex justify-content-between">
			<q-select
				:dark="$store.getters.theme === 'dark'"
				dense
				filled
				square
				map-options
				emit-value
				label="Save ability"
				:options="abilities"
				v-model="save_ability"
				class="mr-1"
			/>
			<q-input
				:dark="$store.getters.theme === 'dark'"
				dense
				filled
				square
				type="number"
				v-model="save_dc"
				label="Save DC"
			/>
		</div>

		<!-- CUSTOM ROLL -->
		<h3>
			Rolls
			<a @click="addRoll" aria-label="Add">
				<i aria-hidden="true" class="fas fa-plus green" />
			</a>
		</h3>

		<div v-for="(roll, index) in custom_rolls" class="custom-roll" :key="`roll-${index}`">
			<q-input
				:ref="index"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				dense
				label="Roll"
				autocomplete="off"
				v-model="custom_rolls[index].roll"
				lazy-rules
				:rules="[
					(val) => !!val || 'Roll is required',
					(val) => val.match(/^[0-9]+d[0-9]+(\+[0-9])?$/) || 'Allowed format: 2d6 or 2d6+1',
				]"
			/>

			<hk-dmg-type-select
				v-if="roll_type !== 'heal'"
				dense
				required
				v-model="custom_rolls[index].damage_type"
				label="Damage type"
				class="ml-1"
			/>

			<a v-if="index > 0" class="remove" aria-label="Remove" @click="removeRoll(index)">
				<i aria-hidden="true" class="fas fa-trash-alt" />
			</a>
		</div>

		<hk-roll
			v-if="targeted.length > 0"
			tooltip="Roll"
			tooltipPosition="right"
			class="full-width"
			@roll="roll($event)"
		>
			<span class="btn btn-block">Roll</span>
		</hk-roll>
		<div v-else class="text-center text-bold red">Select one ore more targets</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { dice } from "src/mixins/dice.js";
import { setHP } from "src/mixins/HpManipulations.js";
import { damage_types, abilities } from "src/utils/generalConstants";
import { runEncounter } from "src/mixins/runEncounter.js";

export default {
	name: "CustomRoll",
	mixins: [setHP, dice, runEncounter],
	props: ["current"],
	data() {
		return {
			damage_types: damage_types,
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			abilities: abilities,
			roll_type: "attack",
			save_dc: 10,
			save_ability: "strength",
			attack_bonus: undefined,
			custom_rolls: [
				{
					damage_type: "slashing",
					roll: undefined,
				},
			],
		};
	},
	computed: {
		...mapGetters(["targeted"]),
	},
	methods: {
		setType(value) {
			this.custom_rolls = [
				{
					damage_type: "slashing",
					roll: undefined,
				},
			];
			this.roll_type = value;
		},
		roll(e) {
			let isValid = true;

			//validate
			for (const index in this.custom_rolls) {
				if (this.$refs[index][0].hasError) {
					isValid = false;
				}
			}

			// Roll if there are no errors
			if (isValid) {
				const action = this.formatAction();

				this.roll_action({
					e,
					action,
					entity: this.current,
					targets: this.targeted,
				});
			}
		},
		formatAction() {
			let type;
			let aoe_type = undefined;
			if (this.roll_type === "attack") {
				type = "melee_weapon";
			} else if (this.roll_type === "save") {
				type = "save";
				aoe_type = "square";
			} else {
				type = "healing";
			}

			let custom_roll = {
				name: `Custom ${this.roll_type} roll`,
				action_list: [
					{
						type,
						attack_bonus: this.attack_bonus,
						save_dc: this.save_dc,
						save_ability: this.save_ability,
						aoe_type,
						rolls: [],
					},
				],
			};

			for (const roll of this.custom_rolls) {
				const [dice_type, fixed_val] = roll.roll.split("+");
				const dice_values = dice_type.split("d");
				const damage_type = type !== "healing" ? roll.damage_type : undefined;
				const miss_mod = this.roll_type === "attack" ? 0 : undefined;
				const save_fail_mod = this.roll_type === "save" ? 0.5 : undefined;

				custom_roll.action_list[0].rolls.push({
					damage_type,
					dice_count: parseInt(dice_values[0]),
					dice_type: parseInt(dice_values[1]),
					fixed_val: fixed_val ? parseInt(fixed_val) : null,
					miss_mod,
					save_fail_mod,
				});
			}
			return custom_roll;
		},
		addRoll() {
			this.custom_rolls.push({
				damage_type: "slashing",
				roll: undefined,
			});
		},
		removeRoll(index) {
			if (index != 0) this.$delete(this.custom_rolls, index);
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	border-bottom: solid 1px $neutral-4;
	margin: 15px 0 5px 0;
	display: flex;
	justify-content: space-between;
}
.custom-roll {
	display: flex;
	justify-content: space-between;

	.remove {
		color: $red;
		line-height: 40px;
		height: 40px;
		padding-left: 10px;
		text-align: right;
		display: block;
		font-size: 15px;
	}
}
.advantage:hover {
	.btn {
		background-color: $green;
	}
}
.disadvantage:hover {
	.btn {
		background-color: $red;
	}
}
.q-field {
	width: 100%;
}
</style>
