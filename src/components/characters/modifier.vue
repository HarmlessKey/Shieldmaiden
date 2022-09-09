<template>
<div>
	<ValidationObserver v-slot="{ handleSubmit }">
		<q-form @submit="handleSubmit(saveModifier)" greedy>
			<hk-card :min-width="300" no-margin>
				<div slot="header" class="card-header d-flex justify-content-between">
					<span>
						{{ modifier['.key'] ? 'Edit' : 'New' }} modifier
					</span>
					<q-btn flat v-close-popup round icon="close" size="sm" class="ml-2" />
				</div>

				<div class="card-body">				
					<!-- MODIFIER -->
					<div v-if="!scaling">
						<div class="form-item mb-3">
							<div class="mb-3">Origin: {{ modifier_origin }}</div>
							<ValidationProvider rules="max:30|required" name="Name" v-slot="{ errors, invalid, validated }">
								<q-input
									autocomplete="off"
									dark filled square
									label="Name"
									type="text"
									v-model="modifier.name"
									maxlength="30"
									name="name"
									placeholder="Modifier name"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>

						<!-- TYPE -->
						<div class="form-item">
							<q-select dark filled square map-options emit-value v-model="modifier.type" :options="modifier_types" label="Type" />
						</div>
						<small class="d-block mt-1" v-if="modifier.type"><strong>{{ modifier.type.capitalize() }}</strong>: {{ type_info[modifier.type] }}</small>

						<template v-if="modifier.type">
							<!-- TARGET -->
							<div class="form-item my-3">
								<q-select dark filled square map-options emit-value v-model="modifier.target" :options="modifier_targets" label="Modifier target" />
							</div>

							<!-- ABILITIES -->
							<div class="form-item mb-3" v-if="['ability', 'saving_throw'].includes(modifier.target)">
								<q-select 
									dark filled square 
									map-options emit-value 
									v-model="modifier.subtarget" 
									:options="abilities" 
									multiple
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
									multiple
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
													<q-item-label v-text="weapon.label" class="q-ml-lg" />
												</q-item-section>
											</q-item>
										</template>
										<q-separator />
									</template>
								</q-select>
							</div>

							<!-- ARMOR -->
							<div class="form-item mb-3" v-if="modifier.target === 'armor'">
								<q-select 
									dark filled square 
									map-options emit-value 
									v-model="modifier.subtarget" 
									:options="armor_types" 
									multiple
									label="Armor"
								/>
							</div>
							
							<!-- VALUE -->
							<div class="form-item mb-3" v-if="modifier.type === 'bonus' || modifier.type === 'set'">
								<ValidationProvider rules="required" name="Value" v-slot="{ errors, invalid, validated }">
									<q-input 
										dark filled square
										label="Value"
										autocomplete="off"  
										id="value" 
										type="number" 
										v-model="modifier.value" 
										:error="invalid && validated"
										:error-message="errors[0]"
									>
										<a slot="after" @click="addScaling" class="btn btn-block">
											<i class="far fa-chart-line" aria-hidden="true"/>
											<q-tooltip anchor="top middle" self="center middle">
												Level scaling
											</q-tooltip>
										</a>
									</q-input>
								</ValidationProvider>
								
								<p class="mt-1" v-if="modifier.scaling && modifier.scaling.scale && modifier.scaling.scale.size && modifier.scaling.scale.value">
									<span v-html="scalingText()"/>
									<a @click="deleteScaling" class="red ml-1">
										<i class="fas fa-times" aria-hidden="true"/>
										<q-tooltip anchor="top middle" self="center middle">
											Remove scaling
										</q-tooltip>
									</a>
								</p>
							</div>

							<!-- ABILITIES -->
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
						<a @click="scaling = false"><i class="fas fa-chevron-left" aria-hidden="true" /> Edit modifier</a>
						<p class="mt-3">
							<strong>{{ modifier.name }} level scaling</strong><br/>
							Set how the value of this modifier changes as your character levels.
						</p>

						<!-- VALUE -->
						<div class="form-item mb-3">
							<ValidationProvider rules="required" name="Initial value" v-slot="{ errors, invalid, validated }">
								<q-input 
									dark filled square
									label="Initial value"
									autocomplete="off"
									type="number"
									v-model="modifier.value"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>
						
						<!-- STARTING LEVELS -->
						<div class="form-item mb-3" v-if="modifier.origin.split('.')[0] !== 'class'">
							<ValidationProvider rules="required" name="Start" v-slot="{ errors, invalid, validated }">
								<q-input 
									dark filled square
									label="Starting level"
									autocomplete="off"  
									type="number"
									v-model="modifier.scaling.start"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>

						<!-- SCALING TYPE -->
						<div class="form-item mb-3">
							<q-select 
								dark filled square 
								map-options emit-value 
								:value="modifier.scaling.type" 
								:options="scaling_types" 
								label="Scaling type"
								@input="setScalingType"
							/>
						</div>
						
						<!-- LEVEL SCALING -->
						<div v-if="modifier.scaling.type === 'scale'" class="form-item mb-3">
							<div class="row q-col-gutter-md mb-2">
								<div class="col-6">
									<ValidationProvider rules="required" name="Size" v-slot="{ errors, invalid, validated }">
										<q-input 
											dark filled square
											label="Scale size"
											autocomplete="off"  
											type="number" 
											v-model="modifier.scaling.scale.size" 
											:error="invalid && validated"
											:error-message="errors[0]"
										/>
									</ValidationProvider>
								</div>
								<div class="col-6">
									<ValidationProvider rules="required" name="Scale value" v-slot="{ errors, invalid, validated }">
										<q-input 
											dark filled square
											label="Scale value"
											autocomplete="off"  
											type="number" 
											v-model="modifier.scaling.scale.value" 
											:error="invalid && validated"
											:error-message="errors[0]"
										/>
									</ValidationProvider>
								</div>
							</div>
							
							<p v-if="modifier.scaling.scale.size && modifier.scaling.scale.value" v-html="scalingText()"/>
						</div>

						<!-- STEPS -->
						<div v-if="modifier.scaling.type === 'steps'">
						</div>
					</div>
				</div>
				<div slot="footer" class="card-footer d-flex justify-content-end">
					<q-btn class="mr-2" label="Cancel" v-close-popup />
					<q-btn type="submit" label="Save" no-caps color="primary" />
				</div>
			</hk-card>
		</q-form>
	</ValidationObserver>
</div>
</template>

<script>
	import { abilities, skills } from 'src/utils/generalConstants';
	import { weapons } from 'src/mixins/armorAndWeapons.js';
	import numeral from 'numeral';

	export default {
		name: 'CharacterClass',
		mixins: [weapons],
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
			userId: {
				type: String,
				required: true
			},
			characterId: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				abilities: abilities,
				skillList: skills,
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
					set: "Input a number that target value will be set to, it is not added like a bonus.",
					proficiency: "Add the your proficiency as a bonus.",
					ability: "Add an ability modifier as a bonus",
					expertise: "Double the proficiency bonus of a skill. Only works on proficient skills."
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
			},
			character() {
				return this.characterState.character;
			}
		},
		inject: ["characterState"],
		methods: {
			saveModifier() {
				const modifier = this.modifier;

				// If there is an index property present we know we have to edit an existing modifier
				if(modifier.hasOwnProperty("index")) {
					this.character.edit_modifier(modifier);
				}
				// Create new
				else {
					this.character.add_modifier(modifier);
				}
				this.$emit("save", "modifier.saved");
			},
			scalingText() {
				if(this.modifier.scaling.type === "scale" && this.modifier.scaling.scale) {
					let text = `This modifier increases with <b>${this.modifier.scaling.scale.value}</b> for every `;
					
					if(this.modifier.origin.split('.')[0] === 'class') {
						const class_name = this.character.classes[this.modifier.origin.split('.')[1]].class;
						if(this.modifier.scaling.scale.size > 1) {
							text += `${this.modifier.scaling.scale.size} ${class_name} levels`;
						} else {
							text += `${class_name} level`;
						}
						text += " above "
						text += numeral(this.modifier.origin.split('.')[2]).format('0o');
					}	else {
						if(this.modifier.scaling.scale.size > 1) {
							text += `${this.modifier.scaling.scale.size} character levels`;
						} else {
							text += `character level`;
						}
						text += " above "
						text += numeral(this.modifier.scaling.start).format('0o');
					}
					return text+".";
				}
			},
			addScaling() {
				if(!this.modifier.scaling) {
					this.$set(this.modifier, "scaling", {});
				}
				this.scaling = true;
			},
			setScalingType(type) {
				this.$set(this.modifier.scaling, "type", type);
				if(type === "scale") {
					this.$set(this.modifier.scaling, "scale", {});
				} else {
					this.$set(this.modifier.scaling, "steps", []);
				}
				this.$forceUpdate();
			},
			deleteScaling() {
				this.$set(this.modifier, "scaling", null);
			},
		}
	}
</script>