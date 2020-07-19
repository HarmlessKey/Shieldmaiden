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

		<!-- TARGET -->
		<div class="form-item mb-3">
			<label for="type">Modifier target</label>
			<b-form-select v-model="modifier.target" :options="modifier_targets" />
		</div>

		<!-- ABILITES -->
		<div class="form-item mb-3" v-if="modifier.target === 'ability'">
			<label for="type">Ability</label>
			<b-form-select v-model="modifier.subtarget" :options="abilities" />
		</div>

		<!-- SKILLS -->
		<div class="form-item mb-3" v-if="modifier.target === 'skill'">
			<label for="type">Skill</label>
			<select class="form-control" v-model="modifier.subtarget" name="skills">
				<option v-for="({skill}, key) in skillList" :key="`${key}`" :value="key">
					{{ skill }}
				</option>
			</select>
		</div>

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
	import { skills } from '@/mixins/skills.js';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: 'CharacterRace',
		mixins: [skills, abilities],
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
			}
		},
		data() {
			return {
				setTarget: undefined,
				setSubtarget: undefined,
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
				],
				modifier_targets: [
					{
						value: "ability",
						text: "Abillity Score"
					},
					{
						value: "skill",
						text: "Skill"
					},
					{
						value: "ac",
						text: "Armor Class"
					},
					{
						value: "speed",
						text: "Speed"
					}
				],
				modifier_restriction: [
					{
						value: "armor",
						text: "Must wear armor"
					},
					{
						value: "no_armor",
						text: "Can't wear armor"
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
		}
	}
</script>

<style lang="scss" scoped>

</style>