<template>
	<q-layout view="Lhh lpR fff" container class="bg-gray">
		<q-header class="bg-black">
			<q-toolbar>
				<q-toolbar-title>{{ modifier['.key'] ? 'Edit' : 'New' }} modifier</q-toolbar-title>
				<q-btn flat v-close-popup round dense icon="close" />
			</q-toolbar>
		</q-header>

		<q-page-container>
			<q-page padding>
			<!-- MODIFIER -->
			<div v-if="!scaling">
				<div class="form-item mb-3">
					<div class="mb-3">Origin: {{ modifier_origin }}</div>
					<q-input
						dark filled square dense
						label="Name"
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
					<q-select dark filled square dense map-options emit-value v-model="modifier.type" :options="modifier_types" label="Type" />
				</div>
				<small class="d-block mt-1" v-if="modifier.type"><b>{{ modifier.type.capitalize() }}</b>: {{ type_info[modifier.type] }}</small>

				<template v-if="modifier.type">
					<!-- TARGET -->
					<div class="form-item my-3">
						<q-select dark filled square dense map-options emit-value v-model="modifier.target" :options="modifier_targets" label="Modifier target" />
					</div>

					<!-- ABILITES -->
					<div class="form-item mb-3" v-if="modifier.target === 'ability'">
						<q-select dark filled square dense map-options emit-value v-model="modifier.subtarget" :options="abilities" label="Ability" />
					</div>

					<!-- SKILLS -->
					<div class="form-item mb-3" v-if="modifier.target === 'skill'">
						<label for="type">Skill</label>
						<q-select dark filled square dense map-options emit-value option-value="value
						" option-label="skill" v-model="modifier.subtarget" :options="Object.values(skillList)" label="Skill" />
					</div>

					<!-- WEAPONS -->
					<div class="form-item mb-3" v-if="modifier.target === 'weapon'">
						<q-select dark filled square dense v-model="modifier.subtarget" :options="weaponList" label="Weapon">
							<template v-slot:option="scope">
								<q-item :key="`weapon-category-${scope.index}`">
									<q-item-section>
										<q-item-label overline class="text-weight-bold text-white">{{ scope.opt.category }}</q-item-label>
									</q-item-section>
								</q-item>

								<template v-for="weapon in scope.opt.weapons">
									<q-item
										:key="weapon.value"
										clickable
										v-ripple
										v-close-popup
										@click="modifier.subtarget = weapon.value"
										:active="modifier.subtarget === weapon.value"
									>
										<q-item-section>
											<q-item-label v-html="weapon.label" class="q-ml-lg" ></q-item-label>
										</q-item-section>
									</q-item>
								</template>
								<q-separator />
							</template>
						</q-select>
					</div>

					<!-- ARMOR -->
					<div class="form-item mb-3" v-if="modifier.target === 'armor'">
						<q-select dark filled square dense map-options emit-value v-model="modifier.subtarget" :options="armor_types" label="Armor" />
					</div>
					
					<!-- VALUE -->
					<div class="form-item mb-3" v-if="modifier.type === 'bonus' || modifier.type === 'set'">
						<div class="d-flex justify-content-between">
							<q-input 
								dark filled square dense
								label="Value"
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
						<q-select dark filled square dense map-options emit-value v-model="modifier.ability_modifier" :options="abilities" label="Ability modifier" />
					</div>

					<hr>

					<!-- RESTRICTIONS -->
					<div class="form-item my-3">
						<q-select dark filled square dense multiple clearable v-model="modifier.restrictions" :options="modifier_restrictions" label="Restrictions" />
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
					<q-input 
						dark filled square dense
						label="Initial value"
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
					<q-input 
						dark filled square dense
						label="Starting level"
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
					<q-select dark filled square dense map-options emit-value v-model="modifier.scaling_type" :options="scaling_types" label="Scaling type" />
				</div>
				
				<!-- LEVEL SCALING -->
				<div v-if="modifier.scaling_type === 'scale'" class="form-item mb-3">
					<div class="d-flex justify-content-between mb-2">
						<div>
							<q-input 
								dark filled square dense
								label="Scale size"
								autocomplete="off"  
								id="size" 
								type="number" 
								v-model="modifier.scale_size" 
								v-validate="'required'"
								name="size" 
							/>
						</div>
						<div>
							<q-input 
								dark filled square dense
								label="Scale value"
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
			</q-page>
		</q-page-container>

		<q-footer class="bg-black gray-light p-3 d-flex justify-content-end">
				<button class="btn bg-gray mr-2" v-close-popup>Cancel</button>
				<button class="btn" @click="saveModifier()">Save</button>
		</q-footer>
	</q-layout>
</template>

<script>
	import { db } from '@/firebase';
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
			classes: undefined,
			userId: {
				type: String,
				required: true
			},
			playerId: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				scaling: false,
				modifier_setter: undefined,
				modifier_types: [
					{
						value: "bonus",
						label: "Bonus"
					},
					{
						value: "set",
						label: "Set Score"
					},
					{
						value: "proficiency",
						label: "Proficiency"
					},
					{
						value: "ability",
						label: "Ability modifier"
					},
					{
						value: "expertise",
						label: "Expertise"
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
						label: "Must wear armor"
					},
					{
						value: "no_armor",
						label: "Can't wear armor"
					},
					{
						value: "shield",
						label: "Must wear a shield"
					},
					{
						value: "no_shield",
						label: "Can't wear a shield"
					}
				],
				scaling_types: [
					{
						value: "scale",
						label: "Level scaling"
					},
					{
						value: "steps",
						label: "Step changes"
					},
				]
			}
		},
		computed: {
			modifier: {
				get() {
					return (this.modifier_setter) ? this.modifier_setter : this.value;
				},
				set(newValue) {
					this.modifier_setter = newValue;
				}
			},
			modifier_targets() {
				return [
						{
							value: "ability",
							label: "Abillity Score",
							disable: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "skill",
							label: "Skill",
							disable: ["set"].includes(this.modifier.type)
						},
						{
							value: "ac",
							label: "Armor Class"
						},
						{
							value: "hp",
							label: "Hit Points",
							disable: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "armor",
							label: "Armor",
							disable: ["bonus", "set", "ability", "expertise"].includes(this.modifier.type)
						},
						{
							value: "weapon",
							label: "Weapon",
							disable: ["bonus", "set", "ability", "expertise"].includes(this.modifier.type)
						},
						{
							value: "speed",
							label: "Speed",
							disable: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "initiative",
							label: "Initiative"
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
			saveModifier() {
				let modifier = this.modifier;

				//Edit
				if(modifier['.key']) {
					const key = modifier['.key'];
					delete modifier['.key'];
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).set(modifier);
				}
				//New
				else {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(this.modifier);
				}
				this.$emit("save", "modifier.saved");
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>