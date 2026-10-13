<template>
	<div class="content__edit" v-if="!loading">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveEffect)" greedy>
				<div>
					<div class="form">
						<hk-card header="Custom effect">
							<div slot="header" class="card-header d-flex justify-content-between">
								<span>
									Custom effect
									<q-icon v-if="!valid" name="error" size="sm" class="mr-2 red">
										<q-tooltip anchor="top middle" self="center middle">
											There are validation errors
										</q-tooltip>
									</q-icon>
								</span>
								<router-link
									to="/documentation/effects"
									target="_blank"
									class="btn btn-sm bg-neutral-5"
								>
									<i aria-hidden="true" class="fas fa-question-circle mr-1" />
									How effects work
								</router-link>
							</div>
							<div class="card-body">
								<hk-effects-form v-model="effect" :effect-key="effectId" />
								<div v-if="schema_errors.length" class="schema-errors mt-3">
									<p class="red mb-1">
										<i aria-hidden="true" class="fas fa-exclamation-triangle mr-1" />
										The effect can't be saved:
									</p>
									<ul class="mb-0">
										<li v-for="(error, i) in schema_errors" :key="`schema-error-${i}`">{{ error }}</li>
									</ul>
								</div>
							</div>
						</hk-card>
					</div>

					<!-- HANDLING -->
					<div class="save">
						<div class="buttons">
							<q-icon v-if="!valid" name="error" size="md" class="mr-2 red">
								<q-tooltip anchor="top middle" self="center middle">
									There are validation errors
								</q-tooltip>
							</q-icon>
							<router-link to="/content/effects" class="btn bg-neutral-5 mr-2">{{
								unsaved_changes ? "Cancel" : "Back"
							}}</router-link>
							<q-btn label="Save" type="submit" color="primary" no-caps />
						</div>
						<div class="d-flex justify-content-start unsaved_changes">
							<template v-if="unsaved_changes">
								<div class="orange truncate mr-2 d-none d-md-block">
									<i aria-hidden="true" class="fas fa-exclamation-triangle"></i> Unsaved changes
								</div>
								<a class="btn btn-sm bg-neutral-5" @click="userId ? revertChanges() : reset()">
									<i aria-hidden="true" class="fas fa-undo" />
									{{ userId ? "Revert" : "Reset" }}
								</a>
							</template>
						</div>
					</div>
				</div>
			</q-form>
		</ValidationObserver>
	</div>
	<hk-card v-else>
		<hk-loader />
	</hk-card>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import { cleanEffectDefinition, schemaErrorMessages } from "src/utils/effectFunctions";

let validateEffect;

/**
 * Schema validator for effect definitions, loaded on first use so Ajv and the schema
 * stay out of the main bundle
 */
async function getEffectValidator() {
	if (!validateEffect) {
		const [{ default: Ajv }, { default: schema }] = await Promise.all([
			import("ajv"),
			import("src/schemas/hk-effects-schema.json"),
		]);
		validateEffect = new Ajv({ allErrors: true, strict: false }).compile(schema);
	}
	return validateEffect;
}

export default {
	name: "EditEffect",
	components: {},
	data() {
		return {
			userId:
				this.$store.getters && this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			effectId: this.$route.params.id,
			effect: {},
			loading: false,
			effect_copy: {},
			unsaved_changes: false,
			schema_errors: [],
		};
	},
	async mounted() {
		if (this.effectId) {
			this.loading = true;
			await this.get_effect({ uid: this.userId, id: this.effectId }).then((stored) => {
				// A copy: the form edits in place, and the store caches the stored effect
				const effect = cleanEffectDefinition(stored);
				effect.name = effect.name ? effect.name.capitalizeEach() : undefined;
				this.effect = effect;
				this.effect_copy = cleanEffectDefinition(effect);
				this.unsaved_changes = false;
				this.loading = false;
			});
		}
	},
	computed: {
		...mapGetters(["tier", "overencumbered"]),
		...mapGetters("effects", ["effect_count"]),
	},
	watch: {
		effect: {
			deep: true,
			handler(newVal) {
				// Compared as saved, so empty blocks the form adds don't count as changes
				if (!_.isEqual(cleanEffectDefinition(newVal), this.effect_copy)) {
					this.unsaved_changes = true;
				} else {
					this.unsaved_changes = false;
				}
				this.$emit("set-unsaved", this.unsaved_changes);
			},
		},
	},
	methods: {
		...mapActions(["setSlide"]),
		...mapActions("api_effects", ["fetch_effects", "fetch_effect"]),
		...mapActions("effects", ["add_effect", "edit_effect", "get_effect"]),
		reset() {
			this.effect = {};
		},
		revertChanges() {
			// A copy: the form edits the effect in place
			this.effect = cleanEffectDefinition(this.effect_copy);
		},
		/**
		 * Cleans the effect and validates it against the effects schema. Shows the schema
		 * errors when it fails.
		 *
		 * @returns {Promise<object|undefined>} The effect to save, undefined when it's invalid
		 */
		async validEffect() {
			const effect = cleanEffectDefinition(this.effect);
			const validate = await getEffectValidator();
			this.schema_errors = validate(effect) ? [] : schemaErrorMessages(validate.errors);
			if (this.schema_errors.length) {
				this.$snotify.error("The effect has errors, see the list below the form.", "Can't save", {
					position: "rightTop",
				});
				return undefined;
			}
			return effect;
		},
		/**
		 * The effect is saved: the form now matches the stored effect
		 */
		saved() {
			this.$snotify.success("Effect Saved.", "Critical hit!", {
				position: "rightTop",
			});
			// Capitalize before copying so changes found isn't triggered
			this.effect.name = this.effect.name ? this.effect.name.capitalizeEach() : undefined;
			this.effect_copy = cleanEffectDefinition(this.effect);
			this.unsaved_changes = false;
		},
		/**
		 * Checks if a new Effect must be added, or an existing Effect must be saved.
		 **/
		async saveEffect() {
			const effect = await this.validEffect();
			if (!effect) return;

			if (!this.effectId) {
				this.addEffect(effect);
			} else {
				this.editEffect(effect);
			}
		},
		addEffect(effect) {
			this.add_effect(effect)
				.then((key) => {
					// Set the effectId, so we know there is an existing effect
					// even though we are on the AddEffect route, this we won't create multiple when hitting save again
					this.$set(this, "effectId", key);
					this.saved();
				})
				.catch((error) => {
					this.$snotify.error("Couldn't save effect.", "Save failed", {
						position: "rightTop",
					});
					console.error(error);
				});
		},
		editEffect(effect) {
			this.edit_effect({
				id: this.effectId,
				effect,
			})
				.then(() => this.saved())
				.catch((error) => {
					this.$snotify.error("Couldn't save effect.", "Save failed", {
						position: "rightTop",
					});
					console.error(error);
				});
		},
	},

	// This is now handled in contribute/effects/edit
	// Eventually this will be needed here too
	beforeRouteLeave(to, from, next) {
		if (this.unsaved_changes) {
			this.$snotify.error(
				"There are unsaved changes in the form.\n Would you like to continue?",
				"Unsaved Changes",
				{
					buttons: [
						{
							text: "Leave",
							action: (toast) => {
								next();
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "Stay",
							action: (toast) => {
								next(false);
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		} else {
			next();
		}
	},
};
</script>
