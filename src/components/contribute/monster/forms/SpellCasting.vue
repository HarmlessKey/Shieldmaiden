<template>
	<hk-card-deck>
		<hk-card v-for="casting in caster_types" :key="casting.category">
			<div slot="header" class="card-header d-flex justify-content-between">
				{{ casting.name }}
				<a class="gray-hover text-capitalize">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add spell</span>
				</a>
			</div>

			<q-select 
				dark filled square
				label="Casting ability"
				:options="abilities"
				v-model="npc[`${casting.category}_ability`]"
				class="mb-2"
			/>
			<div class="row q-col-gutter-sm">
				<div class="col" v-if="casting.category === 'caster'">
					<q-input 
						dark filled square
						label="Caster level"
						v-model="npc[`${casting.category}_level`]"
						type="number"
						class="mb-3"
					/>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						label="Save DC"
						v-model="npc[`${casting.category}_save_dc`]"
						type="number"
						class="mb-3"
					/>
				</div>
				<div class="col">
					<q-input 
						dark filled square
						label="Spell attack"
						v-model="npc[`${casting.category}_spell_attack`]"
						type="number"
						class="mb-3"
					/>
				</div>
			</div>
		</hk-card>
	</hk-card-deck>
</template>

<script>
	import { abilities } from '@/mixins/abilities.js';
	
	export default {
		name: 'npc-SpellCasting',
		props: ['value'],
		mixins: [abilities],
		data() {
			return {
				caster_types: [
					{ category: 'caster', name: 'Spellcasting' },
					{ category: 'innate', name: 'Innate spellcasting' },
				],
			}
		},
		computed: {
			npc: {
				get() {
					return this.value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			}
		},
		methods: {
	
		}
	}
</script>

<style lang="scss" scoped>
</style>