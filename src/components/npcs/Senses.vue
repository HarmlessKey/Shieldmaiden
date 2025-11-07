<template>
	<div>
		<hk-card header="Senses">
			<div class="card-body">
				<div v-for="sense in monster_senses" :key="sense" class="row q-col-gutter-md mb-2">
					<div class="col-4 col-md-3">
						<q-checkbox 
							:dark="$store.getters.theme === 'dark'" 
							:label="sense.capitalize()" 
							:false-value="null" 
							indeterminate-value="something else"
							:value="npc.senses && npc.senses[sense] ? npc.senses[sense][sense] : null"
							@input="setSense($event, sense)"
						/>
					</div>
					<div class="col">
						<Field rules="between:0,999" name="Range" v-slot="{ errorMessage, meta }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square dense
								label="Range"
								autocomplete="off"
								type="number" 
								:value="npc.senses && npc.senses[sense] ? npc.senses[sense].range : undefined" 
								suffix="ft."
								:disable="!npc.senses || !npc.senses[sense]"
								@input="parseToInt($event, npc.senses[sense], 'range')"
								:error="!meta.valid && meta.validated"
								:error-message="errorMessage"
							/>
						</Field>
					</div>
					<div class="col">
						<Field rules="max:999" name="Comments" v-slot="{ errorMessage, meta }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square dense
								label="Comments"
								autocomplete="off"
								:value="npc.senses && npc.senses[sense] ? npc.senses[sense].comments : undefined"
								:disable="!npc.senses || !npc.senses[sense]"
								@input="$event => !$event || $set(npc.senses[sense], 'comments', $event)"
								:error="!meta.valid && meta.validated"
								:error-message="errorMessage"
							/>
						</Field>
					</div>
				</div>
			</div>
		</hk-card>
	</div>
</template>

<script>
import { monsterMixin } from 'src/mixins/monster.js';

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
					if(!this.npc.senses) this.npc["senses"] = {};
					this.npc.senses[sense] = val;
				} else {
					delete this.npc.senses[sense];
				}
			},
			parseToInt(value, object, property) {
				if(value === undefined || value === "") {
					delete object[property];
				} else {
					object[property] = parseInt(value);
				}
			}
		}
	}
</script>