<template>
	<!-- MODIFIERS -->
	<div class="card">
		<div class="card-header d-flex justify-content-between">
			<span>Modifiers</span>
			<a 
			class="gray-hover text-capitalize" 
			v-b-tooltip.hover title="Add Modifiers" 
			@click="add_modifier()">
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</div>
		<div class="card-body">
			<!-- <span v-for="mod in modifiers">test<br></span> -->
			<div class="card" v-if="modifiers && modifiers.length > 0" v-for="(modifier, mod_index) in modifiers">
				<div v-b-toggle="'accordion-'+mod_index" class="card-header collapse-header mod_header d-flex justify-content-between">
					<div class="gray-light" >
						{{parseInt(mod_index) + 1}}.
						{{modifier.name}}
						{{modifier.dice_count}}{{modifier.dice_type}}{{modifier.fixed_val ? "+" : ""}}{{modifier.fixed_val}} 
						{{modifier.subtype}} {{modifier.type}}
					</div>
					<a @click="remove_modifier(mod_index)"
						class="gray-hover text-capitalize"
						v-b-tooltip.hover title="Remove">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</div>
					
					<!-- THIS BREAKS WHEN DELETE SPELL ACTION -->

				<b-collapse visible :id="'accordion-'+mod_index" accordion="my-accordion">
					<div class="card-body">
						<!-- <template v-if="modifier.spell_action != undefined"> -->
							<b-row>
								<b-col>
									<label for="mod_name">Modifier Name</label>
									<b-form-input v-model="modifier.name"
										id="mod_name"
										name="mod_name"
										title="Modifier Name"
										class="form-control mb-2 mr-5"
										v-validate="'required'"
										data-vv-as="Modifier Name"
										@keyup="$forceUpdate()">
										
									<!-- 	<option v-for="(val,i) in spell.actions"
											:key="i" :value="i">{{val.name || val.type}}</option> -->
									</b-form-input>
									<p class="validate red" v-if="errors.has('mod_name')">{{ errors.first('mod_name') }}</p>
								</b-col>
								<b-col md="4">
									<label for="modifier_subtype">Subtype</label>
									<b-form-select v-model="modifier.subtype"
										
										id="modifier_subtype"
										name="modifier_subtype"
										title="Modifier Subtype"
										class="form-control mb-2"
										data-vv-as="Modifier Subtype"
										@change="$forceUpdate()">
										<option value="undefined" disabled>- Subtype -</option>
										<option v-for="(val,i) in modifier_subtype"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
								</b-col>
								<b-col md="4">
									<label for="primary">Primary Stat</label>
									<div class="primary d-flex justify-content-between" name="primary">
										<a class="component_box" @click="setPrimary(modifier)"
											 :class="{'selected': modifier.primary === true}">
											<span>P</span>
										</a>
									</div>
								</b-col>
							</b-row>
							<b-row>
								<!-- DICE COUNT -->
								<b-col md="4">
									<label for="dice_count">Dice Count</label>
									<b-form-input v-model="modifier.dice_count"
										autocomplete="off"
										id="dice_count"
										name="dice_count"
										class="form-control mb-2"
										title="Dice Count"
										type="number"
										data-vv-as="Dice Count"
										@keyup="$forceUpdate()"
										></b-form-input>
								</b-col>
								<b-col md="4">
									<!-- MODIFIER SUBTYPE -->
									<label for="dice_type">Dice Type</label>
									<b-form-select v-model="modifier.dice_type"
										id="dice_type"
										name="dice_type"
										title="Dice Type"
										class="form-control mb-2"
										data-vv-as="Dice Type"
										@change="$forceUpdate()">
										<!-- <option value="undefined" disabled>- Subtype -</option> -->
										<option v-for="(val,i) in dice_type"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
								</b-col>
								<b-col md="4">
									<!-- MODIFIER FIXED VALUE -->
									<label for="fixed_val">Fixed Value</label>
									<b-form-input v-model="modifier.fixed_val"
										autocomplete="off"
										id="fixed_val"
										name="fixed_val"
										class="form-control mb-2"
										title="Fixed Value"
										type="number"
										data-vv-as="Fixed Value"
										@keyup="$forceUpdate()"
										></b-form-input>
								</b-col>
							</b-row>
							<template v-if="level_scaling != undefined && level_scaling != 'None'">
								<!-- HIGHER LEVEL MODIFIER -->
								<b-row>
									<b-col>
										<hr>
									</b-col>
									<b-col class="col-1" v-if="level_tier_addable(mod_index)">
										<a 
										class="gray-hover text-capitalize" 
										v-b-tooltip.hover title="Add Level Tier" 
										@click="add_level_tier(mod_index)">
											<i class="fas fa-plus green"></i>
											<!-- <span class="d-none d-md-inline ml-1">Add</span> -->
										</a>
									</b-col>
								</b-row>
								<b-row v-for="(level_tier, tier_index) in modifier.level_tiers" v-if="tier_index < shown_level_tiers">
									<!-- HL LEVEL SCALE -->
									<b-col md="3">
										<label for="level">{{level_scaling}}</label>
										<b-form-input v-model="level_tier.level"
											autocomplete="off"
											id="level"
											name="level"
											class="form-control mb-2"
											:title="level_scaling"
											v-validate="'required'"
											type="number"
											:data-vv-as="level_scaling"
											@keyup="$forceUpdate()"
											></b-form-input>
											<p class="validate red" v-if="errors.has('level')">{{ errors.first('level') }}</p>
									</b-col>
									<!-- HL DICE COUNT -->
									<b-col md="3">
										<label for="dice_count">Dice Count</label>
										<b-form-input v-model="level_tier.dice_count"
											autocomplete="off"
											id="dice_count"
											name="dice_count"
											class="form-control mb-2"
											title="Dice Count"
											type="number"
											data-vv-as="Dice Count"
											@keyup="$forceUpdate()"
											></b-form-input>
									</b-col>
									<b-col md="3">
										<!-- HL MODIFIER SUBTYPE -->
										<label for="dice_type">Dice Type</label>
										<b-form-select v-model="level_tier.dice_type"
											id="dice_type"
											name="dice_type"
											title="Dice Type"
											class="form-control mb-2"
											data-vv-as="Dice Type"
											@change="$forceUpdate()">
											<option value="undefined" disabled>- Subtype -</option>
											<option v-for="(val,i) in dice_type"
												:key="i" :value="val">{{val}}</option>
										</b-form-select>
									</b-col>
									<b-col md="2">
										<!-- HL MODIFIER FIXED VALUE -->
										<label for="fixed_val">Fixed Value</label>
										<b-form-input v-model="level_tier.fixed_val"
											autocomplete="off"
											id="fixed_val"
											name="fixed_val"
											class="form-control mb-2"
											title="Fixed Value"
											type="number"
											data-vv-as="Fixed Value"
											@keyup="$forceUpdate()"
											></b-form-input>
									</b-col>
									<b-col md='1' class="remove-link">
										<a @click="remove_level_tier(mod_index, tier_index)"
											class="gray-hover text-capitalize"
											v-b-tooltip.hover title="Remove">
											<i class="fas fa-trash-alt red"></i>
										</a>
									</b-col>
								</b-row>
								<p v-if="modifier.level_tiers && modifier.level_tiers.length > 0">
									<span v-for="line in create_spell_level_tier_description(modifier.level_tiers)">
										{{line}}<br>
									</span>
								</p>
							</template>
						<!-- </template> -->
					</div>  <!-- END MODIFIER CARD BODY -->
				</b-collapse>
			</div>
		</div>
	</div>
</template>

<script>
	import numeral from 'numeral'

export default {

  name: 'spell-action-modifiers',
  props: {
  	value: Array,
  	level_scaling: String,
  	level: Number,
  },
  computed: {
  	modifiers: {
  		get() {
  			return this.value;
  		},
  		set(newValue) {
  			this.$emit("input", newValue);
  			return newValue;
  		}
  	},
  	shown_level_tiers() {
			if (this.level_scaling == "Spell Scale") {
				return 1;
			}
			return 100;
		},
  },

  data() {
    return {
    	modifier_type: ["Damage", "Healing"],
			modifier_subtype: ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning",
				"Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"],
			dice_type: ["D4", "D6", "D8", "D10", "D12", "D20"],
    };
  },
  methods: {
  	add_modifier() {
  		console.log(this.modifiers)
			let modifiers = this.modifiers;
			if(modifiers === undefined) {
				modifiers = []
			}
			modifiers.push({
				level_tiers: [],
			});
			this.$emit("input", modifiers)
			this.$forceUpdate(); //IMPORTANT
		},
		remove_modifier(index) {
			this.$delete(this.modifiers, index)
			this.$forceUpdate()
		},
		setPrimary(modifier) {
			if (modifier.primary == undefined) {
				modifier.primary = false
			}
			modifier.primary = !modifier.primary
			this.$forceUpdate(); //IMPORTANT
		},
		add_level_tier(index) {
			this.modifiers[index].level_tiers.push({});
			this.$forceUpdate();
		},
		remove_level_tier(mod_index, tier_index) {
			this.$delete(this.modifiers[mod_index].level_tiers, tier_index)
			this.$forceUpdate()
		},
		level_tier_addable(index) {
			if (this.level_scaling == "Spell Scale" && 
					this.modifiers[index].level_tiers &&
					this.modifiers[index].level_tiers.length >= 1) {
				return false
			}
			return true
		},
		create_spell_level_tier_description(level_tiers) {
			// Generates description for each level tier for spell level scaling
			let description = []
			if (this.level_scaling == "Character Level") {
				description = ["This spell's damage increases when your character reaches a higher level."]
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = `At ${numeral(tier.level).format('0o')} level, this spell modifier does ${tier.dice_count || "..."}${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`
					
					description.push(new_line)
				}
			} 
			else if (this.level_scaling == "Spell Scale") {
				let tier = level_tiers[0]
				let new_line = "When you cast this spell using a spell slot of "
				new_line += `${numeral(parseInt(this.level) + 1).format('0o')} level or higher, the damage of this modifier increases by `
				new_line += `${tier.dice_count || "..."}${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} `
				new_line += `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(this.level).format('0o')}.`
				
				description = [new_line]
			} 
			else if (this.level_scaling == "Spell Level") {
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = "When you cast this spell using a "
					new_line += `${numeral(tier.level).format('0o')}-level spell slot, this spell modifier does `
					new_line += `${tier.dice_count || "..."}${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`

					description.push(new_line)
				}
			}
			return description
		},
  }
};
</script>

<style lang="scss" scoped>
.mod_header {
	cursor: pointer;
}
</style>
