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
								<label for="condition">Condition</label>
								<b-form-select v-model="condition.condition"
									id="condition"
									name="condition"
									title="Condition"
									class="form-control mb-2"
									data-vv-as="condition Subtype"
									@change="$forceUpdate()">
									<option value="undefined" disabled>- Condition -</option>
									<option 
										v-for="(con, i) in conditionList"
										:key="`con-${i}`" :value="con.value"
									>
										{{ con.name }}
									</option>
								</b-form-select>
							</b-col>

							<!-- APPLIED WHEN -->
							<b-col md="6">
								<label for="condition">
									<span>Application</span>
									<a 
										v-b-popover.hover.top="'When should this condition be applied?'" 
										title="Apply condition"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="condition.application"
									id="application"
									name="Application"
									title="application"
									class="form-control mb-2"
									data-vv-as="application Subtype"
									@change="$forceUpdate()">
									<option value="undefined" disabled>- Application -</option>
									<option 
										v-for="(appl, i) in application"
										:key="`con-${i}`" :value="appl"
									>
										{{ appl }}
									</option>
								</b-form-select>
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
			immidiate: true,
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
	justify-content: space-between;
}
</style>
