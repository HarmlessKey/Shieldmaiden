<template>
	<div class="hk-effects-form">
		<hk-input
			v-model="effect.name"
			rules="max:100|required"
			label="Name *"
			name="Name"
			class="mb-3"
			maxlength="101"
		/>
		<hk-input
			:value="effect.description"
			label="Description"
			name="Description"
			type="textarea"
			class="mb-3"
			autogrow
			@input="setField(effect, 'description', $event)"
		/>

		<SubEffectList v-if="effect.sub_effects" :value="effect.sub_effects" :min-items="1" />

		<!-- Optional effect-level configuration -->
		<ConfigurationList
			:target="effect"
			:configurations="configurations"
			:selected="selected"
			level="effect"
			class="mt-4"
			@add="add"
			@remove="remove"
		>
			<template v-slot:editor="{ configuration }">
				<template v-if="effect[configuration.key] !== undefined">
					<ConditionSetEditor
						v-if="['condition', 'ends_when'].includes(configuration.key)"
						:value="effect[configuration.key]"
						@input="$set(effect, configuration.key, $event)"
					/>
					<component :is="editors[configuration.key]" v-else :value="effect[configuration.key]" />
				</template>
			</template>
		</ConfigurationList>
	</div>
</template>

<script>
import editorMixin from "./hk-effects-form/editorMixin";
import AuraInput from "./hk-effects-form/AuraInput.vue";
import ConditionSetEditor from "./hk-effects-form/ConditionSetEditor.vue";
import ConfigurationList from "./hk-effects-form/ConfigurationList.vue";
import LevelTrackInput from "./hk-effects-form/LevelTrackInput.vue";
import StackingInput from "./hk-effects-form/StackingInput.vue";
import SubEffectList from "./hk-effects-form/SubEffectList.vue";
import SustainInput from "./hk-effects-form/SustainInput.vue";
import { effect_configurations } from "./hk-effects-form/fieldControls";

/**
 * Form for a custom effect definition (src/schemas/hk-effects-schema.json). The definition
 * is generic: no duration (set when the effect is applied), and no origin or scaling (set
 * when it's linked to a spell, action or ability). Edits the effect in place.
 */
export default {
	name: "hk-effects-form",
	components: {
		AuraInput,
		ConditionSetEditor,
		ConfigurationList,
		LevelTrackInput,
		StackingInput,
		SubEffectList,
		SustainInput,
	},
	mixins: [editorMixin],
	provide() {
		return { effectsForm: this.form };
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
		// Id of the custom effect being edited, so it can't reference itself
		effectKey: {
			type: String,
			default: undefined,
		},
	},
	data() {
		return {
			form: { effectKey: this.effectKey },
			configurations: effect_configurations,
			// Editor per configuration (condition and ends_when use ConditionSetEditor)
			editors: {
				stacking: "StackingInput",
				level: "LevelTrackInput",
				sustain: "SustainInput",
				aura: "AuraInput",
			},
		};
	},
	computed: {
		// A configuration is selected when its field is set
		selectedConfigurations() {
			return this.configurations.filter(({ key }) => this.effect[key] !== undefined);
		},
		selected() {
			return this.selectedConfigurations.map(({ key }) => key);
		},
		effect: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
	},
	methods: {
		add(key) {
			const configuration = this.configurations.find((c) => c.key === key);
			this.addBlock(this.effect, key, configuration.initial());
		},
		remove(key) {
			this.removeBlock(this.effect, key);
		},
	},
	watch: {
		effectKey(key) {
			this.form.effectKey = key;
		},
		value: {
			immediate: true,
			handler(effect) {
				if (effect && !Array.isArray(effect.sub_effects)) this.$set(effect, "sub_effects", []);
			},
		},
	},
};
</script>
