<template>
	<div class="content__edit" v-if="!loading">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveEffect)" greedy>
				<div>
					<div class="top">
						<q-icon v-if="!valid" name="error" color="red" size="sm" class="mr-2">
							<q-tooltip anchor="top middle" self="center middle">
								There are validation errors
							</q-tooltip>
						</q-icon>
					</div>

					<div class="form">
						<hk-card header="Custom effect">
							<div class="card-body">
								<hk-effects-form v-model="effect" />
							</div>
						</hk-card>
					</div>

					<!-- HANDLING -->
					<div class="save">
						<div class="buttons">
							<q-icon v-if="!valid" name="error" color="red" size="md" class="mr-2">
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
		};
	},
	async mounted() {
		if (this.effectId) {
			this.loading = true;
			await this.get_effect({ uid: this.userId, id: this.effectId }).then((effect) => {
				effect.name = effect.name ? effect.name.capitalizeEach() : undefined;
				this.effect = effect;
				this.effect_copy = JSON.parse(JSON.stringify(effect));
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
				if (!_.isEqual(newVal, this.effect_copy)) {
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
			this.effect = this.effect_copy;
		},
		/**
		 * Checks if a new Effect must be added, or an existing Effect must be saved.
		 **/
		saveEffect() {
			if (!this.effectId) {
				this.addEffect();
			} else {
				this.editEffect();
			}
		},
		addEffect() {
			console.log(this.effect);
			this.add_effect(this.effect)
				.then((key) => {
					// Set the effectId, so we know there is an existing effect
					// even though we are on the AddEffect route, this we won't create multiple when hitting save again
					this.$set(this, "effectId", key);

					this.$snotify.success("Effect Saved.", "Critical hit!", {
						position: "rightTop",
					});

					this.effect.name = this.effect.name ? this.effect.name.capitalizeEach() : undefined;
					this.effect_copy = JSON.parse(JSON.stringify(this.effect));
					this.unsaved_changes = false;
				})
				.catch((error) => {
					this.$snotify.error("Couldn't save effect.", "Save failed", {
						position: "rightTop",
					});
					console.error(error);
					console.log(this.effect);
				});
		},
		editEffect() {
			console.log(this.effect);
			this.edit_effect({
				id: this.effectId,
				effect: this.effect,
			}).then(() => {
				this.$snotify.success("Effect Saved.", "Critical hit!", {
					position: "rightTop",
				});

				this.unsaved_changes = false;

				// Capitalize before stringify so changes found isn't triggered
				this.effect.name = this.effect.name ? this.effect.name.capitalizeEach() : undefined;
				this.effect_copy = JSON.parse(JSON.stringify(this.effect));
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

<style lang="scss" scoped>
.content__edit {
	.top {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-bottom: 10px;

		.name {
			user-select: none;
			justify-content: flex-end;
			line-height: 35px;

			.img {
				width: 31px;
				height: 31px;
				background-position: center top;
				background-size: cover;
				border: solid 1px $neutral-4;
				margin: 2px 0 2px 5px;
				border-radius: 50%;
			}
		}
	}
}
</style>
