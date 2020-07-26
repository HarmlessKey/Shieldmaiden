<template>
	<div>
		<div class="form-item mb-3">
			<div class="gray-hover mb-3">Mod Origin: {{ modifier.origin }}</div>
			<label for="name" class="required">Name</label>
			<b-form-input 
				autocomplete="off"  
				id="name" 
				type="text" 
				v-model="modifier.name" 
				v-validate="'max:30|required'" 
				maxlength="30"
				name="name" 
			/>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		</div>

		<!-- TYPE -->
		<div class="form-item">
			<label for="type">Type</label>
			<b-form-select v-model="modifier.type" :options="modifier_types" />
		</div>
		<small class="d-block mt-1" v-if="modifier.type"><b>{{ modifier.type.capitalize() }}</b>: {{ type_info[modifier.type] }}</small>

		<!-- TARGET -->
		<div class="form-item my-3">
			<label for="type">Modifier target</label>
			<b-form-select v-model="modifier.target" :options="modifier_targets" />
		</div>

		<!-- ABILITES -->
		<div class="form-item mb-3" v-if="modifier.target === 'ability'">
			<label for="ability">Ability</label>
			<select class="form-control" v-model="modifier.subtarget" name="ability">
				<option v-for="{value, label} in abilities" :key="`ability-${value}`" :value="value">
					{{ label }}
				</option>
			</select>
		</div>

		<!-- SKILLS -->
		<div class="form-item mb-3" v-if="modifier.target === 'skill'">
			<label for="type">Skill</label>
			<select class="form-control" v-model="modifier.subtarget" name="skills">
				<option v-for="({skill}, key) in skillList" :key="`${key}`" :value="key">
					{{ skill }}
				</option>
			</select>
		</div>
		
		<div class="form-item mb-3" v-if="modifier.type === 'bonus' || modifier.type === 'set'">
			<label for="value" class="required">Value</label>
			<b-form-input 
				autocomplete="off"  
				id="value" 
				type="number" 
				v-model="modifier.value" 
				v-validate="'required'"
				name="value" 
			/>
			<p class="validate red" v-if="errors.has('value')">{{ errors.first('value') }}</p>
		</div>

		<!-- ABILITES -->
		<div class="form-item mb-3" v-if="modifier.type === 'ability'">
			<label for="ability_modifier">Ability modifier</label>
			<select class="form-control" v-model="modifier.ability_modifier" name="ability_modifier">
				<option v-for="{value, label} in abilities" :key="`modifier-${value}`" :value="value">
					{{ label }}
				</option>
			</select>
		</div>
	</div>
</template>

<script>
	import { skills } from '@/mixins/skills.js';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: 'CharacterRace',
		mixins: [skills, abilities],
		props: {
			value: {
				type: Object,
				required: true
			},
			origin: {
				type: Boolean,
				default: false
			},
			reference: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				setTarget: undefined,
				setSubtarget: undefined,
				modifier_types: [
					{
						value: "bonus",
						text: "Bonus"
					},
					{
						value: "set",
						text: "Set Score"
					},
					{
						value: "proficiency",
						text: "Proficiency"
					},
					{
						value: "ability",
						text: "Ability modifier"
					},
					{
						value: "expertise",
						text: "Expertise"
					}
				],
				type_info: {
					bonus: "Input a number value to add as a bonus.",
					set: "Input a number that target will be set to, it is not added like a bonus.",
					proficiency: "Add the your proficiency as bonus.",
					ability: "Add an ability modifier as a bonus",
					expertise: "Add the proficiency bonus once more, only works on proficient skills."
				},
				modifier_targets: [
					{
						value: "ability",
						text: "Abillity Score"
					},
					{
						value: "skill",
						text: "Skill"
					},
					{
						value: "ac",
						text: "Armor Class"
					},
					{
						value: "speed",
						text: "Speed"
					},
					{
						value: "initiative",
						text: "Initiative"
					}
				],
				modifier_restriction: [
					{
						value: "armor",
						text: "Must wear armor"
					},
					{
						value: "no_armor",
						text: "Can't wear armor"
					}
				]
			}
		},
		computed: {
			modifier: {
				get() {
					return this.value;
				},
				set(newValue) {
					this.$emit('input', newvalue);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>