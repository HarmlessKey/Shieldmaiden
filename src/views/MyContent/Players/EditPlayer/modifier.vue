<template>
	<div>
		<div class="form-item mb-3">
			<label for="name" class="required">Name</label>
			<b-form-input 
				autocomplete="off"  
				id="name" 
				type="text" 
				v-model="modifier.name" 
				v-validate="'max:30|required'" 
				maxlength="30"
				name="name" 
			/>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		</div>

		<!-- TYPE -->
		<div class="form-item mb-3">
			<label for="type">Type</label>
			<b-form-select v-model="modifier.type" :options="modifier_types" />
		</div>

		<!-- REF -->

		<div class="form-item mb-3" v-if="modifier.type === 'bonus' || modifier.type === 'set'">
			<label for="value" class="required">Value</label>
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
	</div>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
		props: {
			value: {
				type: Object,
				required: true
			},
			origin: {
				type: Boolean,
				default: false
			},
			ref: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				modifier_types: [
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
						value: "expertise",
						text: "Expertise"
					}
				]
			}
		},
		computed: {
			modifier: {
				get() {
					return this.value;
				},
				set(newValue) {
					this.$emit('input', newvalue);
				}
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>

</style>