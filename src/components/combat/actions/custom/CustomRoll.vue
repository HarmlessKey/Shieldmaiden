<template>
	<div v-if="current">
		<q-btn-toggle
			v-model="roll_type"
			class="mb-3"
			spread no-caps dark dense square
			toggle-color="primary"
			color="gray"
			:options="[
				{label: 'Attack', value: 'attack'},
				{label: 'Save', value: 'save'},
				{label: 'Heal', value: 'heal'}
			]"
		/>
		<q-form>
			<q-input
				v-if="roll_type === 'attack'"
				dark dennse filled square dense
				type="number"
				v-model="attack_bonus"
				label="Attack bonus"
			/>
			<div v-if="roll_type === 'save'" class="d-flex justify-content-between">
				<q-select 
					dark filled square dense
					map-options
					emit-value
					label="Save ability"
					:options="abilities"
					v-model="save_ability"
					class="mr-1"
				/>
				<q-input
					dark dennse filled square dense
					type="number"
					v-model="save_dc"
					label="Save DC"
				/>
			</div>


			<!-- CUSTOM ROLL -->
			<h3>
				Rolls
				<a @click="addRoll">
					<i class="fas fa-plus green" />
				</a>
			</h3>
			
				<div 
					v-for="(roll, index) in custom_rolls"
					class="custom-roll"
					:key="`roll-${index}`"
				>
					<q-input 
						:ref="index"
						dark filled square dense
						label="Roll"
						autocomplete="off" 
						v-model="custom_rolls[index].roll" 
						lazy-rules
						:rules="[
							val => !!val || 'Roll is required',
							val => (val.match(/^[0-9]+d[0-9]+(\+[0-9])?$/)) || 'Allowed format: 2d6 or 2d6+1',
						]"
					/>

					<hk-dmg-type-select
						v-if="roll_type !== 'heal'"
						dense required
						v-model="custom_rolls[index].damage_type" 
						label="Damage type"
						class="ml-1"
					/>

					<a v-if="index > 0" class="remove" @click="removeRoll(index)">
						<i class="fas fa-trash-alt" />
					</a>
				</div>

				<hk-roll 
					v-if="targeted.length > 0"
					tooltip="Roll" 
					tooltipPosition="right"
					@roll="roll($event)"
				>
					<a class="btn btn-block">Roll</a>
				</hk-roll>
				<div v-else class="text-center text-bold red">Select a target</div>
		</q-form>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { dice } from "@/mixins/dice.js";
	import { setHP } from "@/mixins/HpManipulations.js";
	import { damage_types } from '@/mixins/damageTypes.js';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: "CustomRoll",
		mixins: [setHP, dice, damage_types, abilities],
		props: ["current"],
		data() {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				roll_type: "attack",
				save_dc: 10,
				save_ability: "strength",
				attack_bonus: undefined,
				custom_rolls: [
					{
						damage_type: "slashing",
						roll: undefined
					}
				]
			}
		},
		computed: {
			...mapGetters([
				"encounter",
				"entities",
				"turn",
				"targeted"
			])
		},
		methods: {
			...mapActions([
				"setSlide",
				"setActionRoll",
				"setShareRolls",
				"set_limitedUses"
			]),
			roll(e) {
				let isValid = true;

				//validate
				for(const index in this.custom_rolls) {
					if(this.$refs[index][0].hasError) {
						isValid = false;
					}
				}

				// Roll if there are no errors
				if(isValid) {
					let roll;
					const config = {
						type: "monster_action"
					}

					// Create an action with the custom rolls
					const action = this.formatAction();

					// Roll once for AOE
					if(this.roll_type === "save") {
						roll = this.rollAction(e, action, config);
					}

					// Loop over all targets
					for(const key of this.targeted) {
						let newRoll = { ...roll };

						// Reroll for each target if it's to hit or healing
						if(this.roll_type !== "save") {
							newRoll = this.rollAction(e, action, config);
						}

						// Set the target and current
						this.$set(newRoll, "target", this.entities[key]);
						this.$set(newRoll, "current", this.current);

						this.setActionRoll(newRoll);
					}
				}
			},
			formatAction() {
				const type = (this.roll_type === "attack") ? "melee_weapon" : (this.roll_type === "save") ? "save" : "healing";

				let custom_roll = {
					name: `Custom ${this.roll_type} roll`,
					action_list: [
						{
							type,
							attack_bonus: this.attack_bonus,
							save_dc: this.save_dc,
							save_ability: this.save_ability,
							rolls: []
						}
					]
				}

				for(const roll of this.custom_rolls) {
					const rolls = roll.roll.split("+");
					const dice = rolls[0].split("d");
					const fixed_val = (rolls[1]) ? roll[1] : undefined;
					const damage_type = (type !== "healing") ? roll.damage_type : undefined;
					const miss_mod = (this.roll_type === "attack") ? 0 : undefined;
					const save_fail_mod = (this.roll_type === "save") ? .5 : undefined;
					
					custom_roll.action_list[0].rolls.push({
						damage_type,
						dice_count: dice[0],
						dice_type: dice[1],
						fixed_val,
						miss_mod,
						save_fail_mod
					})
				}
				return custom_roll;
			},
			addRoll() {
				this.custom_rolls.push({
					damage_type: "slashing",
					roll: undefined
				});
			},
			removeRoll(index) {
				if(index != 0) this.$delete(this.custom_rolls, index);
			}
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		border-bottom: solid 1px $gray-hover;
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
			background-color:$red;
		}
	}
	.q-field {
			width: 100%;
		}
</style>