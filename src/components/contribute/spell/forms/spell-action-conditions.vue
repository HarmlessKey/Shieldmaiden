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
										v-for="(appl, i) in application"
										:key="`con-${i}`" :value="appl"
									>
										{{ appl }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`application-${con_index}`)">{{ errors.first(`application-${con_index}`) }}</p>
							</b-col>
						</b-row>
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
		action_type: String
	},
	data() {
		return {
			application: [
				"Always",
				"Failed save"
			]
		};
	},
	computed: {
		conditions: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
		validator() {
			return { "conditions": this.$validator };
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
