<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span>
				<i class="fas fa-flame"/> Conditions <template v-if="conditions">( {{conditions.length }} )</template>
			</span>
			<a 
				class="gray-light text-capitalize" 
				@click="add_condition()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="top middle" self="center middle">
					Add condition
				</q-tooltip>
			</a>
		</h2>

		<q-list dark square :class="`accordion`">
			<q-expansion-item
				v-for="(condition, con_index) in conditions"
				:key="`condition-${con_index}`"
				dark switch-toggle-side
				group="conditions"
			>
				<template v-slot:header>
					<q-item-section>
						{{ parseInt(con_index) + 1 }}.  {{ condition.condition }}
					</q-item-section>
					<q-item-section avatar>
						<a @click="remove_condition(con_index)" class="remove">
							<i class="fas fa-trash-alt red" />
							<q-tooltip anchor="top middle" self="center middle">
								Remove
							</q-tooltip>
						</a>
					</q-item-section>
				</template>

				<div class="accordion-body">
					<div class="row q-col-gutter-md">
						<!-- CONDITION -->
						<div class="col-12 col-md-6">
							<q-select 
								dark filled square dense
								map-options
								emit-value
								option-label="name"
								label="Condition"
								:options="conditionList"
								v-model="condition.condition"
								:name="`condition-${con_index}`"
								class="mb-2"
								v-validate="'required'"
								data-vv-as="Condition Subtype"
								@change="$forceUpdate()"
							/>
							<p class="validate red" v-if="errors.has(`condition-${con_index}`)">{{ errors.first(`condition-${con_index}`) }}</p>
						</div>

						<!-- APPLIED WHEN -->
						<div class="col-12 col-md-6">
							<q-select 
								dark filled square dense
								map-options
								emit-value
								label="Application"
								:options="application"
								v-model="condition.application"
								:name="`application-${con_index}`"
								class="mb-2"
								v-validate="'required'"
								data-vv-as="Application Subtype"
								@change="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>Apply condition</b>
												</q-card-section>

												<q-card-section>
													Select when this condition should be applied.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
							<p class="validate red" v-if="errors.has(`application-${con_index}`)">{{ errors.first(`application-${con_index}`) }}</p>
						</div>
						<!-- <span>{{ condition.application }}</span> -->
					</div>
					<template v-if="condition.application == 'hitpoint_based'">
						<div class="row q-col-gutter-md">
							<div class="col-12 col-md-3">
								<q-input 
									dark filled square dense
									label="Dice count"
									v-model="condition.dice_count"
									autocomplete="off"
									:name="`dice_count-${con_index}`"
									class="mb-2"
									type="number"
									v-validate="'required'"
									data-vv-as="Dice Count"
									@keyup="$forceUpdate()"
								/>
								<p class="validate red" v-if="errors.has(`dice_count-${con_index}`)">{{ errors.first(`dice_count-${con_index}`) }}</p>
							</div>
							<div class="col-12 col-md-3">
								<!-- HITPOINTS DICE TYPE -->
								<q-select 
									dark filled square dense
									emit-value
									map-options
									label="Dice type"
									:options="dice_type"
									v-model="condition.dice_type"
									:id="`dice_type-${con_index}`"
									:name="`dice_type-${con_index}`"
									class="mb-2"
									v-validate="'required'"
									data-vv-as="Dice Type"
									@change="$forceUpdate()"
								/>
								<p class="validate red" v-if="errors.has(`dice_type-${con_index}`)">{{ errors.first(`dice_type-${con_index}`) }}</p>
							</div>
							<div class="col-12 col-md-3">
								<!-- HITPOINTS FIXED VALUE -->
								<q-input 
									dark filled square dense
									label="Fixed value"
									v-model="condition.fixed_val"
									autocomplete="off"
									name="fixed_val"
									class="mb-2"
									type="number"
									data-vv-as="Fixed Value"
									@keyup="$forceUpdate()"
								>
									<template v-slot:append>
										<q-icon name="info" @click.stop>
											<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
												<q-card dark square>
													<q-card-section class="bg-gray-active">
														<b>Fixed value</b>
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
							<div class="col-12 col-md-3">
								<!-- HITPOINTS ORDER VALUE -->
								<q-select 
									dark filled square dense
									emit-value
									map-options
									label="Order"
									v-model="condition.order"
									:options="order"
									:name="`order-${con_index}`"
									class="mb-2"
									v-validate="'required'"
									data-vv-as="Order"
									@change="$forceUpdate()"
								/>
								<p class="validate red" v-if="errors.has(`order-${con_index}`)">{{ errors.first(`order-${con_index}`) }}</p>
							</div>
						</div>


						<!-- LEVEL SCALING FOR HITPOINT BASED CONDITIONS -->
						<template v-if="level_scaling != undefined && level_scaling != 'none'">
							<!-- HIGHER LEVEL CONDITION -->
							<h2 class="d-flex justify-content-between mt-3">
									Scaling
									<a 
									v-if="level_tier_addable(con_index)"
									class="gray-hover text-capitalize" 
									@click="add_level_tier(con_index)">
										<i class="fas fa-plus green"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Add level tier
										</q-tooltip>
									</a>
							</h2>
							<template v-for="(level_tier, tier_index) in condition.level_tiers">
								<div class="row q-col-gutter-md" v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
									<!-- HL LEVEL SCALE -->
									<div class="col-12 col-md-3">
										<q-input 
											dark filled square dense
											:label="level_scaling.capitalizeEach()"
											autocomplete="off"
											:name="`level-${con_index}`"
											class="mb-2"
											:title="level_scaling"
											v-validate="'required'"
											type="number"
											:data-vv-as="level_scaling"
											@keyup="$forceUpdate()"
											></q-input>
											<p class="validate red" v-if="errors.has(`level-${con_index}`)">{{ errors.first(`level-${con_index}`) }}</p>
									</div>
									<!-- HL DICE COUNT -->
									<div class="col-12 col-md-3">
										<q-input 
											dark filled square dense
											label="Dice count"
											v-model="level_tier.dice_count"
											autocomplete="off"
											id="dice_count"
											name="dice_count"
											class="mb-2"
											title="Dice Count"
											type="number"
											data-vv-as="Dice Count"
											@keyup="$forceUpdate()"
											></q-input>
									</div>
									<div class="col-12 col-md-3">
										<!-- HL CONDITION DICETYPE -->
										<q-select 
											dark filled square dense
											emit-value
											map-options
											:options="dice_type"
											label="Dice type"
											v-model="level_tier.dice_type"
											name="dice_type"
											class="mb-2"
											data-vv-as="Dice Type"
											@change="$forceUpdate()"
										/>
									</div>
									<div class="col-12 col-md-3">
										<!-- HL CONDITION FIXED VALUE -->
										<div class="d-flex justify-content-between">
											<q-input 
												dark filled square dense
												label="Fixed value"
												v-model="level_tier.fixed_val"
												autocomplete="off"
												name="fixed_val"
												class="mb-2"
												type="number"
												data-vv-as="Fixed Value"
												@keyup="$forceUpdate()"
											/>
											<a @click="remove_level_tier(con_index, tier_index)" class="remove">
												<i class="fas fa-trash-alt red"></i>
												<q-tooltip anchor="top middle" self="center middle">
													Remove
												</q-tooltip>
											</a>
										</div>
									</div>
								</div>
							</template>
							<!-- <p v-if="condition.level_tiers && condition.level_tiers.length > 0">
								<span v-for="(line, i) in create_spell_level_tier_description(condition.level_tiers)" :key="`tier-${i}`">
									{{line}}<br>
								</span>
							</p> -->
						</template>
					</template>
				</div>
			</q-expansion-item>
		</q-list>
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
	border-bottom: solid 1px$gray-hover;
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
		background-color:$gray-dark;

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
		background-color: $gray-darker;
	}
}
</style>
