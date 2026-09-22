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
							:model-value="npc.senses && npc.senses[sense] ? npc.senses[sense][sense] : null"
							@update:model-value="setSense($event, sense)"
						/>
					</div>
					<div class="col">
						<ValidationProvider
							rules="between:0,999"
							name="Range"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								dense
								label="Range"
								autocomplete="off"
								type="number"
								:model-value="npc.senses && npc.senses[sense] ? npc.senses[sense].range : undefined"
								suffix="ft."
								:disable="!npc.senses || !npc.senses[sense]"
								@update:model-value="parseToInt($event, npc.senses[sense], 'range')"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider
							rules="max:999"
							name="Comments"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								dense
								label="Comments"
								autocomplete="off"
								:model-value="
									npc.senses && npc.senses[sense] ? npc.senses[sense].comments : undefined
								"
								:disable="!npc.senses || !npc.senses[sense]"
								@update:model-value="
									($event) => !$event || $set(npc.senses[sense], 'comments', $event)
								"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>
			</div>
		</hk-card>
	</div>
</template>

<script>
import { monsterMixin } from "src/mixins/monster.js";

export default {
	name: "npc-Senses",
	mixins: [monsterMixin],
	props: ["modelValue"],
	emits: ["update:modelValue"],
	computed: {
		npc: {
			get() {
				return this.modelValue;
			},
			set(newValue) {
				this.$emit("update:modelValue", newValue);
			},
		},
	},
	methods: {
		setSense(value, sense) {
			if (value) {
				let val = {};
				val[sense] = true;
				if (!this.npc.senses) this.$set(this.npc, "senses", {});
				this.$set(this.npc.senses, sense, val);
			} else {
				this.$delete(this.npc.senses, sense);
			}
		},
		parseToInt(value, object, property) {
			if (value === undefined || value === "") {
				this.$delete(object, property);
			} else {
				this.$set(object, property, parseInt(value));
			}
		},
	},
};
</script>
