<template>
	<div>
		<q-select 
			v-if="action_type !== 'healing spell'"
			dark filled square
			map-options
			emit-value
			label="Damage type"
			:options="damage_types"
			v-model="roll.damage_type"
			class="mb-2"
			:rules="[val => !!val || 'Select a damage type']"
			hint="Select the damage type"
		>
			<template v-slot:selected v-if="roll.damage_type">
				<span>
					<i :class="[damage_type_icons[roll.damage_type], roll.damage_type]"/>
					{{ roll.damage_type.capitalize() }}
				</span>
			</template>
			<template v-slot:option="scope">
				<q-item
					clickable
					v-ripple
					v-close-popup
					:active="roll.damage_type === scope.opt"
					@click="$set(roll, 'damage_type', scope.opt)"
				>
					<q-item-section avatar>
						<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt"/>
					</q-item-section>
					<q-item-section>
						<q-item-label v-html="scope.opt.capitalize()"/>
					</q-item-section>
				</q-item>
			</template>
		</q-select>
				
		<!-- ROLLS -->
		<div class="row q-col-gutter-md mb-3">
			<!-- DICE COUNT -->
			<div class="col">
				<q-input 
					dark filled square
					label="Dice count"
					v-model="roll.dice_count"
					autocomplete="off"
					name="dice_count"
					class="mb-2"
					type="number"
				/>
			</div>
			<div class="col">
				<!-- MODIFIER SUBTYPE -->
				<q-select 
					dark filled square
					map-options
					emit-value
					:options="dice_type"
					label="Dice type"
					v-model="roll.dice_type"
					class="mb-2"
				/>
			</div>
			<div class="col">
				<!-- MODIFIER FIXED VALUE -->
				<q-input 
					dark filled square
					label="Fixed value"
					v-model="roll.fixed_val"
					autocomplete="off"
					class="mb-2"
					type="number"
				>
					<template v-slot:append>
						<q-icon name="info" @click.stop>
							<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
								<q-card dark square>
									<q-card-section class="bg-gray-active">
										<b>Fixed</b>
									</q-card-section>
									<q-card-section>
										Set the fixed value that is added on top of the rolled value.
									</q-card-section>
								</q-card>
							</q-menu>
						</q-icon>
					</template>
				</q-input>
			</div>
		</div>

		<!-- FAIL MODIFIER -->
		<div class="col-12 col-md-3">
			<q-select 
				v-if="action_type === 'save'"
				dark filled square
				map-options
				emit-value
				label="Succesful save"
				:options="save_fail_mod"
				v-model="roll.save_fail_mod"
				class="mb-3"
				hint="The effect if the target makes a successful saving throw."
				:rules="[val => val !== undefined || 'What happens on a succesful save?']"
			/>
			<q-select 
				v-if="['spell_attack', 'melee_weapon', 'ranged_weapon'].includes(action_type)"
				dark filled square
				map-options
				emit-value
				label="Miss modifier"
				:options="save_fail_mod"
				v-model="roll.miss_mod"
				class="mb-3"
				hint="The effect if the attack is a miss."
				:rules="[val => val !== undefined || 'What happens on a miss?']"
			/>
		</div>

		<hr>
		<!-- SPECIAL ACTIONS -->
		<div class="col-12 col-md-3">
			<q-select 
				dark filled square
				map-options
				emit-value
				label="Special event"
				:options="Object.values(specials)"
				v-model="roll.special"
				class="mb-3"
				clearable
				hint="Select the special event that happens on a hit"
			>
				<template v-slot:append>
					<q-icon name="info" v-if="roll.special" @click.stop>
						<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
							<q-card dark square>
								<q-card-section class="bg-gray-active">
									<b>{{ specials[roll.special].label }}</b>
								</q-card-section>
								<q-card-section>
									{{ specials[roll.special].info }}
								</q-card-section>
							</q-card>
						</q-menu>
					</q-icon>
				</template>
			</q-select>
		</div>
	</div>
</template>

<script>
import { damage_types } from '@/mixins/damageTypes.js';

export default {
	name: 'monster-action-modifier',
	props: {
		value: Object,
		action_type: String,
	},
	mixins: [damage_types],
	computed: {
		roll: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit('input', newValue);
			}
		}
	},

	data() {
		return {
			modifier_type: [
				{label: "Damage", value: "damage"},
				{label: "Healing", value: "healing"}
			],
			dice_type: [
				{ label: "d4", value: 4 }, 
				{ label: "d6", value: 6 },
				{ label: "d8", value: 8 }, 
				{ label: "d10", value: 10 },
				{ label: "d12", value: 12 },
				{ label: "d20", value: 20 }
			],
			save_fail_mod: [
				{ label: "No effect", value: 0},
				{ label: "Half damage", value: 0.5},
				{ label: "Full damage", value: 1},
			],
			specials: {
				siphon: { label: "Heal caster", value: "siphon", info: "On a hit, the caster is healed for half of the damage done." },
				drain: { label: "Reduce max HP", value: "drain", info: "On a failed save the targets hit point maximum is reduced by an amount equal to the damage done." }
			}
		};
	}
};
</script>
