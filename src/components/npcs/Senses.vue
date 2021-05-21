<template>
	<div>
		<hk-card header="Senses">
			<div v-for="sense in monster_senses" :key="sense" class="row q-col-gutter-md mb-2">
				<div class="col-4 col-md-3">
					<q-checkbox 
						dark 
						:label="sense.capitalize()" 
						:false-value="null" 
						indeterminate-value="something else"
						:value="npc.senses && npc.senses[sense] ? npc.senses[sense][sense] : null"
						@input="setSense($event, sense)"
					/>
				</div>
				<div class="col">
					<q-input 
						dark filled square dense
						label="Range"
						autocomplete="off"
						type="number" 
						:value="npc.senses && npc.senses[sense] ? npc.senses[sense].range : undefined" 
						suffix="ft."
						:disable="!npc.senses || !npc.senses[sense]"
						@input="$event => !$event || $set(npc.senses[sense], 'range', $event)"
						:rules="[val => !val || val <= 999 || 'Max length is 999']"
					/>
				</div>
				<div class="col">
					<q-input 
						dark filled square dense
						label="Comments"
						autocomplete="off"
						:value="npc.senses && npc.senses[sense] ? npc.senses[sense].comments : undefined"
						:disable="!npc.senses || !npc.senses[sense]"
						@input="$event => !$event || $set(npc.senses[sense], 'comments', $event)"
						:rules="[val => !val || val.length <= 100 || 'Max length is 100']"
					/>
				</div>
			</div>
		</hk-card>
	</div>
</template>

<script>
import { monsterMixin } from '@/mixins/monster.js';

	export default {
		name: 'npc-Senses',
		mixins: [monsterMixin],
		props: ['value'],
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
			setSense(value, sense) {
				if(value) {
					let val = {};
					val[sense] = true;
					if(!this.npc.senses) this.$set(this.npc, "senses", {});
					this.$set(this.npc.senses, sense, val);
				} else {
					this.$delete(this.npc.senses, sense);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>