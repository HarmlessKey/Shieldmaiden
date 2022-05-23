<template>
	<hk-card>
		<div slot="header" class="card-header d-flex justify-content-between">
			<span>
				{{ modifier['.key'] ? 'Edit' : 'New' }} modifier
			</span>
			<q-btn flat v-close-popup round icon="close" size="xs" class="ml-2" />
		</div>

		<!-- MODIFIER -->
			<div v-if="!scaling">
				<div class="form-item mb-3">
					<div class="mb-3">Origin: {{ modifier_origin }}</div>
					<q-input
						autocomplete="off"
						dark filled square
						label="Name"
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
					<q-select dark filled square map-options emit-value v-model="modifier.type" :options="modifier_types" label="Type" />
				</div>
				<small class="d-block mt-1" v-if="modifier.type"><b>{{ modifier.type.capitalize() }}</b>: {{ type_info[modifier.type] }}</small>

				<template v-if="modifier.type">
					<!-- TARGET -->
					<div class="form-item my-3">
						<q-select dark filled square map-options emit-value v-model="modifier.target" :options="modifier_targets" label="Modifier target" />
					</div>

					<!-- ABILITES -->
					<div class="form-item mb-3" v-if="['ability', 'saving_throw'].includes(modifier.target)">
						<q-select 
							dark filled square 
							map-options emit-value 
							v-model="modifier.subtarget" 
							:options="abilities" 
							label="Ability"
						/>
					</div>

					<!-- SKILLS -->
					<div class="form-item mb-3" v-if="modifier.target === 'skill'">
						<label for="type">Skill</label>
						<q-select 
							dark filled square 
							map-options emit-value 
							option-value="value"
							option-label="skill" v-model="modifier.subtarget" 
							:options="Object.values(skillList)" 
							label="Skill"
						/>
					</div>

					<!-- WEAPONS -->
					<div class="form-item mb-3" v-if="modifier.target === 'weapon'">
						<q-select dark filled square v-model="modifier.subtarget" :options="weaponList" label="Weapon">
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
						<q-select dark filled square map-options emit-value v-model="modifier.subtarget" :options="armor_types" label="Armor" />
					</div>
					
					<!-- VALUE -->
					<div class="form-item mb-3" v-if="modifier.type === 'bonus' || modifier.type === 'set'">
						<div class="row q-col-gutter-md">
							<div class="col-9">
								<q-input 
									dark filled square
									label="Value"
									autocomplete="off"  
									id="value" 
									type="number" 
									v-model="modifier.value" 
									v-validate="'required'"
									name="value" 
								/>
							</div>
							<div class="col-3">
								<a @click="scaling = true" class="btn btn-block">
									<i class="far fa-chart-line" aria-hidden="true"/>
									<q-tooltip anchor="top middle" self="center middle">
										Level scaling
									</q-tooltip>
								</a>
							</div>
						</div>
						<p class="validate red" v-if="errors.has('value')">{{ errors.first('value') }}</p>
						<p class="mt-1" v-if="modifier.scale_size && modifier.scale_value">
							<span v-html="scalingText()"/>
							<a @click="deleteScaling" class="red ml-1">
								<i class="fas fa-times" aria-hidden="true"/>
								<q-tooltip anchor="top middle" self="center middle">
									Remove scaling
								</q-tooltip>
							</a>
						</p>
					</div>

					<!-- ABILITES -->
					<div class="form-item mb-3" v-if="modifier.type === 'ability'">
						<q-select 
							dark filled square 
							map-options 
							emit-value 
							v-model="modifier.ability_modifier" 
							:options="abilities" 
							label="Ability modifier"
						/>
					</div>

					<hr>

					<!-- RESTRICTIONS -->
					<div class="form-item my-3">
						<q-select 
							dark filled square 
							emit-value
							map-options
							multiple 
							clearable 
							v-model="modifier.restrictions" 
							:options="modifier_restrictions" 
							label="Restrictions"
						/>
					</div>
				</template>
			</div>

			<!-- SCALING -->
			<div v-else>
				<a @click="scaling = false"><i class="fas fa-chevron-left"></i> Edit modifier</a>
				<p class="mt-3">
					<strong>{{ modifier.name }} level scaling</strong><br/>
					Set how the value of this modifier changes as your character levels.
				</p>

				<!-- VALUE -->
				<div class="form-item mb-3">
					<q-input 
						dark filled square
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
						dark filled square
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
					<q-select dark filled square map-options emit-value v-model="modifier.scaling_type" :options="scaling_types" label="Scaling type" />
				</div>
				
				<!-- LEVEL SCALING -->
				<div v-if="modifier.scaling_type === 'scale'" class="form-item mb-3">
					<div class="row q-col-gutter-md mb-2">
						<div class="col-6">
							<q-input 
								dark filled square
								label="Scale size"
								autocomplete="off"  
								id="size" 
								type="number" 
								v-model="modifier.scale_size" 
								v-validate="'required'"
								name="size" 
							/>
						</div>
						<div class="col-6">
							<q-input 
								dark filled square
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

			<div slot="footer" class="card-footer d-flex justify-content-end">
				<button class="btn bg-gray mr-2" v-close-popup>Cancel</button>
				<button class="btn" @click="saveModifier()">Save</button>
			</div>
	</hk-card>
</template>

<script>
	import { skills } from 'src/mixins/skills.js';
	import { abilities } from 'src/mixins/abilities.js';
	import { weapons } from 'src/mixins/armorAndWeapons.js';
	import numeral from 'numeral';
	import { mapActions } from 'vuex';

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
					},
					{
						value: "advantage",
						label: "Advantage"
					},
					{
						value: "disadvantage",
						label: "Disadvantage"
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
							label: "Abillity score",
							disable: ["ability", "proficiency", "expertise"].includes(this.modifier.type)
						},
						{
							value: "saving_throw",
							label: "Saving throw",
							disable: ["set", "expertise"].includes(this.modifier.type)
						},
						{
							value: "skill",
							label: "Skill",
							disable: ["set"].includes(this.modifier.type)
						},
						{
							value: "ac",
							label: "Armor Class",
							disable: ["advantage", "disadvantage"].includes(this.modifier.type)
						},
						{
							value: "hp",
							label: "Hit points",
							disable: ["ability", "proficiency", "expertise", "advantage", "disadvantage"].includes(this.modifier.type)
						},
						{
							value: "armor",
							label: "Armor",
							disable: ["bonus", "set", "ability", "expertise", "advantage", "disadvantage"].includes(this.modifier.type)
						},
						{
							value: "weapon",
							label: "Weapon",
							disable: ["bonus", "set", "ability", "expertise", "advantage", "disadvantage"].includes(this.modifier.type)
						},
						{
							value: "speed",
							label: "Speed",
							disable: ["ability", "proficiency", "expertise", "advantage", "disadvantage"].includes(this.modifier.type)
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
				return undefined;
			}
		},
		methods: {
			...mapActions([
				"add_modifier",
				"edit_modifier"
			]),
			saveModifier() {
				let modifier = this.modifier;

				//Edit
				if(modifier['.key']) {
					const key = modifier['.key'];
					delete modifier['.key']; // can't be pushed to firebase

					this.edit_modifier({
						userId: this.userId,
						key: this.playerId,
						modifier_key: key,
						modifier
					});
				}
				//New
				else {
					this.add_modifier({
						userId: this.userId,
						key: this.playerId,
						modifier
					});
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
			},
			deleteScaling() {
				this.modifier.scaling_type = null;
				this.modifier.scale_value = null;
				this.modifier.scale_size = null;
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>