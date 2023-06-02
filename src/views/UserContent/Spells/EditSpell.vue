<template>
	<div class="content__edit" v-if="!loading">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveSpell)" greedy>
				<div>
					<div class="top">
						<q-icon v-if="!valid" name="error" color="red" size="sm" class="mr-2">
							<q-tooltip anchor="top middle" self="center middle">
								There are validation errors
							</q-tooltip>
						</q-icon>
						<button v-if="!spellId" class="btn bg-neutral-5" @click.prevent="copy_dialog = true">
							<i aria-hidden="true" class="fas fa-copy mr-2"></i>
							Copy
						</button>
						<button
							class="btn bg-neutral-5 ml-2"
							@click.prevent="setSlide({ show: true, type: 'compendium/Spell', data: spell })"
						>
							<i aria-hidden="true" class="fas fa-eye" />
						</button>
					</div>

					<div class="form">
						<BasicInfo v-model="spell" />
						<SpellActions v-model="spell" />
					</div>

					<!-- HANDLING -->
					<div class="save">
						<div class="buttons">
							<q-icon v-if="!valid" name="error" color="red" size="md" class="mr-2">
								<q-tooltip anchor="top middle" self="center middle">
									There are validation errors
								</q-tooltip>
							</q-icon>
							<router-link
								:to="userId ? `/content/spells` : `/tools/spell-creator`"
								class="btn bg-neutral-5 mr-2"
								>{{ unsaved_changes ? "Cancel" : "Back" }}</router-link
							>
							<q-btn v-if="userId" label="Save" type="submit" color="primary" no-caps />
							<q-btn v-else :disabled="!valid" color="primary" no-caps @click="download">
								Download <i aria-hidden="true" class="fas fa-arrow-alt-down ml-2" />
							</q-btn>
						</div>
						<div class="d-flex justify-content-start unsaved_changes">
							<template v-if="unsaved_changes">
								<div v-if="userId" class="orange truncate mr-2 d-none d-md-block">
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

		<!-- COPY DIALOG -->
		<q-dialog v-model="copy_dialog">
			<hk-card :minWidth="320">
				<div slot="header" class="card-header">
					<span>Copy existing Spell</span>
					<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat v-close-popup />
				</div>
				<div class="card-body">
					<CopyContent @copy="copy" type="spell" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
	<hk-card v-else>
		<hk-loader />
	</hk-card>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import BasicInfo from "src/components/spells/BasicInfo";
import SpellActions from "src/components/spells/Actions";
import CopyContent from "src/components/CopyContent";
import { downloadJSON } from "src/utils/generalFunctions";

export default {
	name: "EditSpell",
	components: {
		BasicInfo,
		SpellActions,
		CopyContent,
	},
	data() {
		return {
			userId:
				this.$store.getters && this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			spellId: this.$route.params.id,
			spell: {},
			loading: false,
			spell_copy: {},
			copy_dialog: false,
			unsaved_changes: false,
		};
	},
	async mounted() {
		if (this.spellId) {
			this.loading = true;
			await this.get_spell({ uid: this.userId, id: this.spellId }).then((spell) => {
				spell.name = spell.name ? spell.name.capitalizeEach() : undefined;
				this.spell = spell;
				this.spell_copy = JSON.parse(JSON.stringify(spell));
				this.unsaved_changes = false;
				this.loading = false;
			});
		}
	},
	computed: {
		...mapGetters(["tier", "overencumbered"]),
		...mapGetters("spells", ["spell_count"]),
	},
	watch: {
		spell: {
			deep: true,
			handler(newVal) {
				if (!_.isEqual(newVal, this.spell_copy)) {
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
		...mapActions("api_spells", ["fetch_spells", "fetch_spell"]),
		...mapActions("spells", ["add_spell", "edit_spell", "get_spell"]),
		download() {
			downloadJSON(this.spell);
		},
		copy({ result }) {
			this.copy_dialog = false;
			this.spell = { ...result };
		},
		reset() {
			this.spell = {};
		},
		revertChanges() {
			this.spell = this.spell_copy;
		},
		/**
		 * Checks if a new Spell must be added, or an existing Spell must be saved.
		 **/
		saveSpell() {
			if (!this.spellId) {
				this.addSpell();
			} else {
				this.editSpell();
			}
		},
		addSpell() {
			console.log(this.spell);
			this.add_spell({ spell: this.spell })
				.then((key) => {
					// Set the spellId, so we know there is an existing spell
					// even though we are on the AddSpell route, this we won't create multiple when hitting save again
					this.$set(this, "spellId", key);

					this.$snotify.success("Spell Saved.", "Critical hit!", {
						position: "rightTop",
					});

					this.spell.name = this.spell.name ? this.spell.name.capitalizeEach() : undefined;
					this.spell_copy = JSON.parse(JSON.stringify(this.spell));
					this.unsaved_changes = false;
				})
				.catch((error) => {
					this.$snotify.error("Couldn't save spell.", "Save failed", {
						position: "rightTop",
					});
					console.error(error);
					console.log(this.spell);
				});
		},
		editSpell() {
			console.log(this.spell);
			this.edit_spell({
				id: this.spellId,
				spell: this.spell,
			}).then(() => {
				this.$snotify.success("Spell Saved.", "Critical hit!", {
					position: "rightTop",
				});

				this.unsaved_changes = false;

				// Capitalize before stringify so changes found isn't triggered
				this.spell.name = this.spell.name ? this.spell.name.capitalizeEach() : undefined;
				this.spell_copy = JSON.parse(JSON.stringify(this.spell));
			});
		},
	},

	// This is now handled in contribute/spells/edit
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
