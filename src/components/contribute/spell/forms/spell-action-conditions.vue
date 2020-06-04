<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-flame"/> Conditions <template v-if="conditions">( {{conditions.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				v-b-tooltip.hover title="Add Condition" 
				@click="add_condition()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</h2>
		<template v-for="(condition, con_index) in conditions">
			<div class="card" v-if="conditions && conditions.length > 0" :key="`condition-${con_index}`">
				<div v-b-toggle="'accordion-'+con_index" class="card-header collapse-header d-flex justify-content-between">
					<div class="gray-light" >
						<div class="caret blue"><i class="fas fa-caret-down" /></div>
						{{parseInt(con_index) + 1}}. {{ condition.condition }}
					</div>
					<a @click="remove_condition(con_index)"
						class="gray-hover text-capitalize"
						v-b-tooltip.hover title="Remove">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</div>
				<b-collapse visible :id="'accordion-'+con_index" accordion="my-accordion">
					<div class="card-body">
						<b-row>
							<!-- CONDITION -->
							<b-col md="6">
								<label class="required" for="condition">Condition</label>
								<b-form-select v-model="condition.condition"
									:id="`condition-${con_index}`"
									:name="`condition-${con_index}`"
									title="Condition"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Condition Subtype"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Condition -</option>
									<option 
										v-for="(con, i) in conditionList"
										:key="`con-${i}`" :value="con.value"
									>
										{{ con.name }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`condition-${con_index}`)">{{ errors.first(`condition-${con_index}`) }}</p>
							</b-col>

							<!-- APPLIED WHEN -->
							<b-col md="6">
								<label class="required" for="condition">
									<span>Application</span>
									<a 
										v-b-popover.hover.top="'When should this condition be applied?'" 
										title="Apply condition"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="condition.application"
									:id="`application-${con_index}`"
									:name="`application-${con_index}`"
									title="application"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Application Subtype"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Application -</option>
									<option 
										v-for="{label, value} in application"
										:key="value" :value="value"
									>
										{{ label }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`application-${con_index}`)">{{ errors.first(`application-${con_index}`) }}</p>
							</b-col>
							<!-- <span>{{ condition.application }}</span> -->
						</b-row>
						<template v-if="condition.application == 'hitpoint_based'">
							<b-row>
								<b-col md="3">
									<label :for="`dice_count-${con_index}`" class="required">Dice Count</label>
									<b-form-input v-model="condition.dice_count"
										autocomplete="off"
										:id="`dice_count-${con_index}`"
										:name="`dice_count-${con_index}`"
										class="form-control mb-2"
										title="Dice Count"
										type="number"
										v-validate="'required'"
										data-vv-as="Dice Count"
										@keyup="$forceUpdate()"
										></b-form-input>
										<p class="validate red" v-if="errors.has(`dice_count-${con_index}`)">{{ errors.first(`dice_count-${con_index}`) }}</p>
								</b-col>
								<b-col md="3">
									<!-- HITPOINTS DICE TYPE -->
									<label for="dice_type" class="required">Dice Type</label>
									<b-form-select v-model="condition.dice_type"
										:id="`dice_type-${con_index}`"
										:name="`dice_type-${con_index}`"
										title="Dice Type"
										class="form-control mb-2"
										v-validate="'required'"
										data-vv-as="Dice Type"
										@change="$forceUpdate()">
										<!-- <option value="undefined" disabled>- Subtype -</option> -->
										<option v-for="(val,i) in dice_type"
											:key="i" :value="val.value">{{ val.label }}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has(`dice_type-${con_index}`)">{{ errors.first(`dice_type-${con_index}`) }}</p>
								</b-col>
								<b-col md="3">
									<!-- HITPOINTS FIXED VALUE -->
									<label for="fixed_val">
										Fixed Value
										<a 
												class="ml-1"
												v-b-popover.hover.top="'Set the fixed value that is added on top of the rolled value.'" 
												title="Fixed"
											>
												<i class="fas fa-info-circle"></i>
											</a>
									</label>
									<b-form-input v-model="condition.fixed_val"
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
								<b-col md="3">
									<!-- HITPOINTS ORDER VALUE -->
									<label for="order" class="required">Order</label>
									<b-form-select v-model="condition.order"
										:id="`order-${con_index}`"
										:name="`order-${con_index}`"
										title="Order"
										class="form-control mb-2"
										v-validate="'required'"
										data-vv-as="Order"
										@change="$forceUpdate()">
										<option :value="undefined" disabled>- Order -</option>
										<option v-for="(val,i) in order"
											:key="i" :value="val.value">{{ val.label }}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has(`order-${con_index}`)">{{ errors.first(`order-${con_index}`) }}</p>
								</b-col>
							</b-row>

							<!-- LEVEL SCALING FOR HITPOINT BASED CONDITIONS -->
							<template v-if="level_scaling != undefined && level_scaling != 'none'">
								<!-- HIGHER LEVEL CONDITION -->
								<h2 class="d-flex justify-content-between mt-3">
										Scaling
										<a 
										v-if="level_tier_addable(con_index)"
										class="gray-hover text-capitalize" 
										v-b-tooltip.hover title="Add Level Tier" 
										@click="add_level_tier(con_index)">
											<i class="fas fa-plus green"></i>
											<!-- <span class="d-none d-md-inline ml-1">Add</span> -->
										</a>
								</h2>
								<template v-for="(level_tier, tier_index) in condition.level_tiers">
									<b-row v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
										<!-- HL LEVEL SCALE -->
										<b-col md="3">
											<label class="required" :for="`level-${con_index}`">{{level_scaling.capitalizeEach()}}</label>
											<b-form-input v-model="level_tier.level"
												autocomplete="off"
												:id="`level-${con_index}`"
												:name="`level-${con_index}`"
												class="form-control mb-2"
												:title="level_scaling"
												v-validate="'required'"
												type="number"
												:data-vv-as="level_scaling"
												@keyup="$forceUpdate()"
												></b-form-input>
												<p class="validate red" v-if="errors.has(`level-${con_index}`)">{{ errors.first(`level-${con_index}`) }}</p>
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
											<!-- HL CONDITION DICETYPE -->
											<label for="dice_type">Dice Type</label>
											<b-form-select v-model="level_tier.dice_type"
												id="dice_type"
												name="dice_type"
												title="Dice Type"
												class="form-control mb-2"
												data-vv-as="Dice Type"
												@change="$forceUpdate()">
												<option :value="undefined">- Dice type -</option>
												<option v-for="(val,i) in dice_type"
													:key="i" :value="val.value">{{ val.label }}</option>
											</b-form-select>
										</b-col>
										<b-col md="3">
											<!-- HL CONDITION FIXED VALUE -->
											<label for="fixed_val">Fixed Value</label>
											<div class="d-flex justify-content-between">
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

													<a @click="remove_level_tier(con_index, tier_index)"
														class="remove"
														v-b-tooltip.hover title="Remove">
														<i class="fas fa-trash-alt red"></i>
													</a>
											</div>
										</b-col>
									</b-row>
								</template>
								<!-- <p v-if="condition.level_tiers && condition.level_tiers.length > 0">
									<span v-for="(line, i) in create_spell_level_tier_description(condition.level_tiers)" :key="`tier-${i}`">
										{{line}}<br>
									</span>
								</p> -->
							</template>
						</template>
					</div>
				</b-collapse>
			</div>
		</template>
	</div>
</template>

<script>
import { conditions } from '@/mixins/conditions.js';

export default {
	name: 'spell-action-conditions',
	mixins: [conditions],
	props: {
		value: Array,
		level_scaling: String,
		level: Number,
		action_type: String
	},
	computed: {
		application() {
			let hitFail = (this.action_type === 'spell save') ? { label: "Failed save", value: "fail" } : { label: "On a hit", value: "hit" };

			let application = [
				{ label: "Always", value: "always" },
				{ label: "Hitpoint based", value: "hitpoint_based" },
				hitFail,
			];

			return application;
		},
		conditions: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
		shown_level_tiers() {
			if (this.level_scaling == "spell scale") {
				return 1;
			}
			return 100;
		},
		validator() {
			return { "conditions": this.$validator };
		}
	},
	data() {
		return {
			dice_type: [
				{ label: "d4", value: 4 }, 
				{ label: "d6", value: 6 },
				{ label: "d8", value: 8 }, 
				{ label: "d10", value: 10 },
				{ label: "d12", value: 12 },
				{ label: "d20", value: 20 }
			],
			order: [
				{ label: "Asc", value: "asc" },
				{ label: "Desc", value: "desc" }
			],
		}
	},
	methods: {
		add_condition() {
			let conditions = this.conditions;
			if(conditions === undefined) {
				conditions = []
			}
			conditions.push({});
			this.$emit("input", conditions)
			this.$forceUpdate(); //IMPORTANT
		},
		remove_condition(index) {
			this.$delete(this.conditions, index)
			this.$forceUpdate()
		},
		add_level_tier(index) {
			if(!this.conditions[index].level_tiers) {
				this.conditions[index].level_tiers = [];
			}
			this.conditions[index].level_tiers.push({});
			this.$forceUpdate();
		},
		remove_level_tier(con_index, tier_index) {
			this.$delete(this.conditions[con_index].level_tiers, tier_index)
			this.$forceUpdate()
		},
		level_tier_addable(index) {
			if (this.level_scaling == "spell scale" && 
					this.conditions[index].level_tiers &&
					this.conditions[index].level_tiers.length >= 1) {
				return false
			}
			return true
		},
	},
	watch: {
		conditions: {
			handler() {
				let vm = this;
				this.$nextTick(() => {
					this.$emit('validation', this.validator);
				})
			},
			deep: true,
			immediate: true,
		}
	},
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px #5c5757;
	padding-bottom: 5px;
}
.card-header {
	cursor: pointer;
}
label {
	display: flex;
	justify-content: flex-start;
}
.card {
	.card-header {
		cursor: pointer;
		background-color: #191919;

		.caret {
			display: inline-block;
			padding-right: 5px;
		}
		&.collapsed {
			.caret {
				i.fa-caret-down {
					transform: rotate(-90deg);
				}
			}
		}
	}
	.card-body {
		background-color: #232323;
	}
}
</style>
