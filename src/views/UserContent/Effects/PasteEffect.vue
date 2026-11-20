<template>
	<hk-card class="paste-effect">
		<div slot="header" class="card-header">
			<span>Create effect from JSON</span>
			<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat v-close-popup />
		</div>
		<div class="card-body">
			<p class="neutral-2">
				Paste an effect definition. It's checked against the effects schema and saved as a new custom
				effect. Only admins can do this before custom effects are released.
			</p>
			<q-input
				v-model="json"
				:dark="$store.getters.theme !== 'light'"
				type="textarea"
				filled
				autogrow
				input-class="paste-effect__input"
				placeholder='{ "name": "…", "sub_effects": [ … ] }'
			/>
			<div v-if="errors.length" class="mt-3">
				<p class="red mb-1">
					<i aria-hidden="true" class="fas fa-exclamation-triangle mr-1" />
					The effect can't be saved:
				</p>
				<ul class="mb-0">
					<li v-for="(error, i) in errors" :key="`paste-error-${i}`">{{ error }}</li>
				</ul>
			</div>
		</div>
		<div slot="footer" class="card-footer">
			<q-btn class="full-width" color="primary" no-caps :loading="saving" :disable="!json" @click="create">
				Create
			</q-btn>
		</div>
	</hk-card>
</template>

<script>
import { mapActions } from "vuex";
import { cleanEffectDefinition, schemaErrorMessages } from "src/utils/effectFunctions";
import { getEffectValidator } from "src/utils/effectValidator";
import { NotEnoughSlotsError, NOT_ENOUGH_SLOTS_MESSAGE } from "src/utils/errors";

/**
 * Admins' Paste JSON dialog for Effects under My content: validates a pasted definition
 * against the effects schema and saves it as a new custom effect. Emits "created" with its id.
 */
export default {
	name: "PasteEffect",
	data() {
		return {
			json: "",
			errors: [],
			saving: false,
		};
	},
	methods: {
		...mapActions("effects", ["add_effect"]),
		async create() {
			this.errors = [];
			let parsed;
			try {
				parsed = JSON.parse(this.json);
			} catch {
				this.errors = ["Not valid JSON"];
				return;
			}
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
				this.errors = ["Paste one effect: a JSON object"];
				return;
			}

			const effect = cleanEffectDefinition(parsed);
			const validate = await getEffectValidator();
			if (!validate(effect)) {
				this.errors = schemaErrorMessages(validate.errors);
				return;
			}

			this.saving = true;
			try {
				const id = await this.add_effect(effect);
				this.$snotify.success(`${effect.name} created.`, "Critical hit!", { position: "rightTop" });
				this.json = "";
				this.$emit("created", id);
			} catch (error) {
				if (error instanceof NotEnoughSlotsError) {
					this.errors = [NOT_ENOUGH_SLOTS_MESSAGE];
				} else {
					this.errors = ["Couldn't save the effect"];
					console.error(error);
				}
			} finally {
				this.saving = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.paste-effect {
	width: 700px;
	max-width: 100%;

	::v-deep .paste-effect__input {
		font-family: monospace;
		font-size: 12px;
		min-height: 200px;
		max-height: 50vh;
	}
}
</style>
