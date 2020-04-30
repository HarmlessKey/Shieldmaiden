<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-hand-holding-magic"/> Effects <template v-if="effects">( {{ effects.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				v-b-tooltip.hover title="Add Effect" 
				@click="add_effect()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</h2>
		<template v-for="(effect, eff_index) in effects">
			<div class="card" v-if="effects && effects.length > 0" :key="`effect-${eff_index}`">
				<div v-b-toggle="'accordion-'+eff_index" class="card-header collapse-header d-flex justify-content-between">
					<div class="gray-light" >
						<div class="caret blue"><i class="fas fa-caret-down" /></div>
						{{parseInt(eff_index) + 1}}. 
						{{ effect.effect.type }} 
						{{ effect.effect.subtype }}
					</div>
					<a @click="remove_effect(eff_index)" class="gray-hover text-capitalize">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</div>
				<b-collapse visible :id="'accordion-'+eff_index" accordion="my-accordion">
					<div class="card-body">
						<EffectsForm v-model="effect.effect" />
						<b-row class="mt-3">
							<b-col sm="6">
								<label class="required" for="application">
									<span>Application</span>
									<a 
										class="ml-1"
										v-b-popover.hover.top="'When should this effect be applied?'" 
										title="Apply effect"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="effect.application"
									:id="`application-${eff_index}`"
									:name="`application-${eff_index}`"
									title="application"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="application"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Application -</option>
									<option 
										v-for="(appl, i) in application"
										:key="`appl-${i}`" :value="appl"
									>
										{{ appl }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`application-${eff_index}`)">{{ errors.first(`application-${eff_index}`) }}</p>
							</b-col>
							<b-col sm="6">
								<label class="required" for="target">
									<span>Target</span>
									<a 
										class="ml-1"
										v-b-popover.hover.top="'To whom should the effect be applied?'" 
										title="Target"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="effect.target"
									:id="`target-${eff_index}`"
									:name="`target-${eff_index}`"
									title="target"
									class="form-control mb-4"
									v-validate="'required'"
									data-vv-as="target"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Apply to -</option>
									<option 
										v-for="(target, i) in targets"
										:key="`target-${i}`" :value="target"
									>
										{{ target }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`target-${eff_index}`)">{{ errors.first(`target-${eff_index}`) }}</p>
							</b-col>
						</b-row>
					</div>
				</b-collapse>
			</div>
		</template>
	</div>
</template>

<script>
import EffectsForm from '@/components/EffectsForm';
import numeral from 'numeral';

export default {
	name: 'spell-action-effects',
	components: {
		EffectsForm
	},
	props: {
		value: Array,
		action_type: String,
		level: Number,
		level_scaling: String,
		spell: Object,
	},
  data() {
    return {
			application: [
				"Always",
				"Failed save"
			],
			targets: [
				"Target",
				"Caster"
			]
    };
	},
	computed: {
		effects: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
		validator() {
			return { "effects": this.$validator };
		}
	},
  methods: {
  	add_effect() {
  		let effects = this.effects;
			if(effects === undefined) {
				effects = []
			}
			effects.push({
				effect: {}
			});
			this.$emit("input", effects);
			this.$forceUpdate();
			this.$emit("spellUpdate");
		},
		remove_effect(index) {
			this.$delete(this.effects, index)
			this.$forceUpdate()
		},
		setValidation(validate) {
			this.validation = validate;
		}
  },
  watch: {
		effects: {
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
label {
	display: flex;
	justify-content: flex-start;
	&.var {
		border-bottom: solid 1px #5c5757;
		padding-bottom: 5px;
	}
}
.remove {
	padding-top: 7px;
	margin-left: 10px;
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
