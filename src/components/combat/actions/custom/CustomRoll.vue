<template>
	<div v-if="current">
		<q-btn-toggle
			:value="roll_type"
			class="mb-3"
			spread no-caps :dark="$store.getters.theme === 'dark'" dense square
			toggle-color="primary"
			:options="[
				{label: 'Attack', value: 'attack'},
				{label: 'Save', value: 'save'},
				{label: 'Heal', value: 'heal'}
			]"
			@input="setType"
		/>
		<q-form>
			<q-input
				v-if="roll_type === 'attack'"
				:dark="$store.getters.theme === 'dark'" dennse filled square dense
				type="number"
				v-model="attack_bonus"
				label="Attack bonus"
			/>
			<div v-if="roll_type === 'save'" class="d-flex justify-content-between">
				<q-select 
					:dark="$store.getters.theme === 'dark'" filled square dense
					map-options
					emit-value
					label="Save ability"
					:options="abilities"
					v-model="save_ability"
					class="mr-1"
				/>
				<q-input
					:dark="$store.getters.theme === 'dark'" dennse filled square dense
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
						:dark="$store.getters.theme === 'dark'" filled square dense
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
	import { db } from "@/firebase";
	import { mapGetters, mapActions } from "vuex";
	import { dice } from "@/mixins/dice.js";
	import { setHP } from "@/mixins/HpManipulations.js";
	import { damage_types } from "@/mixins/damageTypes.js";
	import { abilities } from "@/mixins/abilities.js";

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
				"targeted",
				"broadcast"
			]),
			share() {
				return (this.broadcast.shares && this.broadcast.shares.includes("action_rolls")) || false;
			},
		},
		methods: {
			...mapActions([
				"setSlide",
				"setActionRoll",
				"setShareRolls",
				"set_limitedUses"
			]),
			setType(value) {
				this.custom_rolls = [
					{
						damage_type: "slashing",
						roll: undefined
					}
				];
				this.roll_type = value;
			},
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
						if(this.share) this.shareRoll(roll, this.targeted);
					}

					// Loop over all targets
					for(const key of this.targeted) {
						let newRoll = { ...roll };

						// Reroll for each target if it's to hit or healing
						if(this.roll_type !== "save") {
							newRoll = this.rollAction(e, action, config);
							if(this.share) this.shareRoll(newRoll, [key]);
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
			},
			shareRoll(roll, targets) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				let share = {
					key,
					type: "action_roll",
					entity_key: this.current.key,
					encounter_id: this.encounterId,
					notification: {
						title: roll.name,
						targets,
						actions: []
					}
				};
				roll.actions.forEach((action, action_index) => {
					const type = (action.type === "healing") ? "healing" : "damage";

					share.notification.actions[action_index] = {
						rolls: [],
						type
					};
					// To hit
					if(action.toHit) {
						const toHit = action.toHit;
						share.notification.actions[action_index].toHit = {
							roll: toHit.roll,
							total: toHit.total
						}
						if(toHit.ignored) share.notification.actions[action_index].toHit.advantage_disadvantage = this.advantage(toHit.advantage_disadvantage);
					}

					//Rolls
					action.rolls.forEach((roll, roll_index) => {
						share.notification.actions[action_index].rolls[roll_index] = {
							damage_type: roll.damage_type || null,
							roll: roll.modifierRoll.roll,
							total: roll.modifierRoll.total,
						};
					});
				});
				db.ref(`campaigns/${this.userId}/${this.broadcast.live}/shares`).set(share);
			},
			advantage(input) {
				return Object.keys(input)[0].charAt(0);
			}
		}
	}
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