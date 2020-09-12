<template>
	<!-- MODIFIER -->
	<div v-if="!scaling">
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

			<!-- WEAPONS -->
			<div class="form-item mb-3" v-if="modifier.target === 'weapon'">
				<label for="type">Weapon</label>
				<el-select 
					id="weapon"
					v-model="modifier.subtarget"
					collapse-tags
					filterable
					placeholder="Select the weapon">
					<el-option-group
						v-for="group in weaponList"
						:key="group.category"
						:label="group.category">
						<el-option
							v-for="item in group.weapons"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-option-group>
				</el-select>
			</div>

			<!-- ARMOR -->
			<div class="form-item mb-3" v-if="modifier.target === 'armor'">
				<label for="type">Armor</label>
				<el-select
					id="armor"
					v-model="modifier.subtarget"
					collapse-tags
					filterable
					placeholder="Armor">
					<el-option
						v-for="item in armor_types"
						:key="item.value"
						:label="item.label"
						:value="item.value">
					</el-option>
				</el-select>
			</div>
			
			<!-- VALUE -->
			<div class="form-item mb-3" v-if="modifier.type === 'bonus' || modifier.type === 'set'">
				<label for="value" class="required">Value</label>
				<div class="d-flex justify-content-between">
					<b-form-input 
						autocomplete="off"  
						id="value" 
						type="number" 
						v-model="modifier.value" 
						v-validate="'required'"
						name="value" 
					/>
					<a @click="scaling = true" class="ml-1 btn" v-b-tooltip.hover="`Level scaling`"><i class="far fa-chart-line"/></a>
				</div>
				<p class="validate red" v-if="errors.has('value')">{{ errors.first('value') }}</p>
				<p class="mt-1" v-if="modifier.scale_size && modifier.scale_value">
					<span v-html="scalingText()"/>
					<a @click="deleteScaling" class="red ml-1" v-b-tooltip.hover="'Delete scaling'"><i class="fas fa-times"/></a>
				</p>
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

	<!-- SCALING -->
	<div v-else>
		<a @click="scaling = false"><i class="fas fa-chevron-left"></i> Edit modifier</a>
		<p class="mt-3">
			<b>{{ modifier.name }} level scaling</b><br/>
			Set how the value of this modifier changes as your character levels.
		</p>

		<!-- VALUE -->
		<div class="form-item mb-3">
			<label for="value" class="required">Initial value</label>
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
		
		<!-- STARTING LEVELS -->
		<div class="form-item mb-3" v-if="modifier.origin.split('.')[0] !== 'class'">
			<label for="start" class="required">Starting level</label>
			<b-form-input 
				autocomplete="off"  
				id="start"
				type="number"
				v-model="modifier.scaling_start"
				v-validate="'required'"
				name="start"
			/>
			<p class="validate red" v-if="errors.has('start')">{{ errors.first('start') }}</p>
		</div>

		<!-- SCALING TYPE -->
		<div class="form-item mb-3">
			<label for="scaling_type">Scaling type</label>
			<b-form-select class="form-control" v-model="modifier.scaling_type" name="scaling_type">
				<option :value="null" disabled>Select the scaling type</option>
				<option v-for="{value, text} in scaling_types" :key="`ability-${value}`" :value="value">
					{{ text }}
				</option>
			</b-form-select>
		</div>
		
		<!-- LEVEL SCALING -->
		<div v-if="modifier.scaling_type === 'scale'" class="form-item mb-3">
			<div class="d-flex justify-content-between mb-2">
				<div>
					<label for="size" class="required">Scale size</label>
					<b-form-input 
						autocomplete="off"  
						id="size" 
						type="number" 
						v-model="modifier.scale_size" 
						v-validate="'required'"
						name="size" 
					/>
				</div>
				<div>
					<label for="scale_value" class="required">Scale value</label>
					<b-form-input 
						autocomplete="off"  
						id="scale_value" 
						type="number" 
						v-model="modifier.scale_value" 
						v-validate="'required'"
						name="scale_value" 
					/>
				</div>
			</div>
			<p class="validate red" v-if="errors.has('size')">{{ errors.first('size') }}</p>
			<p class="validate red" v-if="errors.has('scale_value')">{{ errors.first('scale_value') }}</p>
			
			<p v-if="modifier.scale_size && modifier.scale_value" v-html="scalingText()"/>
		</div>

		<!-- STEPS -->
		<div v-if="modifier.scaling_type === 'steps'">
		</div>
	</div>
</template>

<script>
	import { skills } from '@/mixins/skills.js';
	import { abilities } from '@/mixins/abilities.js';
	import { weapons } from '@/mixins/armorAndWeapons.js';
	import numeral from 'numeral';

	export default {
		name: 'CharacterClass',
		mixins: [skills, abilities, weapons],
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
			},
			classes: undefined
		},
		data() {
			return {
				scaling: false,
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
				],
				scaling_types: [
					{
						value: "scale",
						text: "Level scaling"
					},
					{
						value: "steps",
						text: "Step changes"
					},
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
			modifier_targets() {
				return [
						{
							value: null,
							text: "Select the target",
							disabled: true
						},
						{
							value: "ability",
							text: "Abillity Score",
							disabled: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "skill",
							text: "Skill",
							disabled: ["set"].includes(this.modifier.type)
						},
						{
							value: "ac",
							text: "Armor Class"
						},
						{
							value: "hp",
							text: "Hit Points",
							disabled: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "armor",
							text: "Armor",
							disabled: ["bonus", "set", "ability", "expertise"].includes(this.modifier.type)
						},
						{
							value: "weapon",
							text: "Weapon",
							disabled: ["bonus", "set", "ability", "expertise"].includes(this.modifier.type)
						},
						{
							value: "speed",
							text: "Speed",
							disabled: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "initiative",
							text: "Initiative"
						}
					]
			},
			modifier_origin() {
				if(this.modifier.origin) {
					const originArray = (this.modifier) ? this.modifier.origin.split(".") : [];
					let returnString = "";

					for(const index in originArray) {
						const origin = originArray[index];
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
			},
			scalingText() {
				if(this.modifier.scaling_type === 'scale') {
					let text = `This modifier increases with <b>${this.modifier.scale_value}</b> for every `;
					
					if(this.modifier.origin.split('.')[0] === 'class') {
						const class_name = this.classes[this.modifier.origin.split('.')[1]].name;
						text += `${this.modifier.scale_size > 1 ? `${this.modifier.scale_size} ${class_name} levels` : `${class_name} level`} above `;
						text += numeral(this.modifier.origin.split('.')[2]).format('0o');
					}	else {
						text += `${this.modifier.scale_size > 1 ? `${this.modifier.scale_size} character levels` : `character level`} above `;
						text += numeral(this.modifier.scaling_start).format('0o');
					}
					text += ".";
					return text;
				}
			},
			deleteScaling() {
				delete this.modifier.scaling_type;
				delete this.modifier.scaling_start;
				delete this.modifier.scale_size;
				delete this.modifier.scale_value;

				this.$emit('input', this.modifier);
				this.$forceUpdate();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.el-select, .form-control {
		width: 100% !important;
	}
</style>