<template>
	<div>
		<div class="form-item mb-3">
			<div class="gray-hover mb-3">Origin: {{ modifier_origin }}</div>
			<label for="name" class="required">Name</label>
			<b-form-input
				autocomplete="off"
				id="name"
				type="text"
				v-model="modifier.name"
				v-validate="'max:30|required'"
				maxlength="30"
				name="name"
				placeholder="Modifier name"
			/>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		</div>

		<!-- TYPE -->
		<div class="form-item">
			<label for="type">Type</label>
			<b-form-select v-model="modifier.type" :options="modifier_types" />
		</div>
		<small class="d-block mt-1" v-if="modifier.type"><b>{{ modifier.type.capitalize() }}</b>: {{ type_info[modifier.type] }}</small>

		<template v-if="modifier.type">
			<!-- TARGET -->
			<div class="form-item my-3">
				<label for="type">Modifier target</label>
				<b-form-select v-model="modifier.target" :options="modifier_targets" />
			</div>

			<!-- ABILITES -->
			<div class="form-item mb-3" v-if="modifier.target === 'ability'">
				<label for="ability">Ability</label>
				<b-form-select class="form-control" v-model="modifier.subtarget" name="ability">
					<option :value="null" disabled>Select the ability</option>
					<option v-for="{value, label} in abilities" :key="`ability-${value}`" :value="value">
						{{ label }}
					</option>
				</b-form-select>
			</div>

			<!-- SKILLS -->
			<div class="form-item mb-3" v-if="modifier.target === 'skill'">
				<label for="type">Skill</label>
				<select class="form-control" v-model="modifier.subtarget" name="skills">
					<option :value="null" disabled>Select the skill</option>
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
					<option :value="null" disabled>Select the ability</option>
					<option v-for="{value, label} in abilities" :key="`modifier-${value}`" :value="value">
						{{ label }}
					</option>
				</select>
			</div>

			<hr>

			<!-- RESTRICTIONS -->
			<div class="form-item my-3">
				<label for="restrictions">Restrictions</label>
				<el-select
					id="restrictions"
					v-model="modifier.restrictions"
					multiple
					collapse-tags
					placeholder="Select restrictions">
					<el-option
						v-for="item in modifier_restrictions"
						:key="item.value"
						:label="item.text"
						:value="item.value"
						:disabled="disabledRestriction(item.value)"
					>
					</el-option>
				</el-select>
			</div>
		</template>
	</div>
</template>

<script>
	import { skills } from '@/mixins/skills.js';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: 'CharacterClass',
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
				modifier_types: [
					{
						value: null,
						text: "Select the type",
						disabled: true
					},
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
					expertise: "Double the proficiency bonus. Only works on proficient skills."
				},
				modifier_targets: [
					{
						value: null,
						text: "Select the target",
						disabled: true
					},
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
				modifier_restrictions: [
					{
						value: "armor",
						text: "Must wear armor"
					},
					{
						value: "no_armor",
						text: "Can't wear armor"
					},
					{
						value: "shield",
						text: "Must wear a shield"
					},
					{
						value: "no_shield",
						text: "Can't wear a shield"
					}
				]
			}
		},
		computed: {
			modifier: {
				get() {
					let value = this.value;

					//Set undefined variables to null
					value.type = (value.type) ? value.type : null;
					value.target = (value.target) ? value.target : null;
					value.subtarget = (value.subtarget) ? value.subtarget : null;
					value.ability_modifier = (value.ability_modifier) ? value.ability_modifier : null;

					return value;
				},
				set(newValue) {
					this.$emit('input', newValue);
					this.$forceUpdate();
				}
			},
			modifier_origin() {
				if(this.modifier.origin) {
					const originArray = this.modifier.origin.split(".");
					let returnString = "";

					for(const index in originArray) {
						const origin = originArray[index];

						if(index === 1 && origin === "feat") {

						}
						returnString += (index > 0) ? ` > ${origin.capitalize()}` : origin.capitalize();
					}
					return returnString;
				}
			}
		},
		methods: {
			disabledRestriction(value) {
				if(this.modifier.restrictions) {
					if(value === "armor" && this.modifier.restrictions.includes("no_armor")) {
						return true;
					}
					if(value === "no_armor" && this.modifier.restrictions.includes("armor")) {
						return true;
					}
					if(value === "shield" && this.modifier.restrictions.includes("no_shield")) {
						return true;
					}
					if(value === "no_shield" && this.modifier.restrictions.includes("shield")) {
						return true;
					}
				}
				return false;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.el-select {
		width: 100%;
	}
</style>