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
							<router-link to="/contribute/spells" class="btn bg-neutral-5 mr-2"
								>Cancel</router-link
							>
							<q-btn label="Save" type="submit" color="primary" no-caps />
						</div>
						<div class="d-flex justify-content-start unsaved_changes">
							<template v-if="unsaved_changes">
								<div class="orange truncate mr-2 d-none d-md-block">
									<i aria-hidden="true" class="fas fa-exclamation-triangle"></i> Unsaved changes
								</div>
								<a class="btn btn-sm bg-neutral-5" @click="revertChanges()">
									<i aria-hidden="true" class="fas fa-undo" />
									Revert
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
import { db } from "src/firebase";
import BasicInfo from "src/components/spells/BasicInfo";
import SpellActions from "src/components/spells/Actions";

export default {
	name: "EditSpell",
	components: {
		BasicInfo,
		SpellActions,
	},
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			loading: true,
			spell_copy: undefined,
			spell: {},
			unsaved_changes: false,
		};
	},
	async mounted() {
		const spell_ref = db.ref(`new_spells/${this.id}`);
		await spell_ref.once("value", (snapshot) => {
			this.spell = snapshot.val() || {};
			this.spell_copy = JSON.stringify(this.spell);
		});
		this.loading = false;
	},
	watch: {
		spell: {
			deep: true,
			handler(newVal) {
				if (JSON.stringify(newVal) !== this.spell_copy) {
					this.unsaved_changes = true;
				} else {
					this.unsaved_changes = false;
				}
				this.$emit("set-unsaved", this.unsaved_changes);
			},
		},
	},
	methods: {
		setSpell(spell) {
			this.spell = { ...this.spell, ...spell };
		},
		revertChanges() {
			this.spell = this.spell_copy;
		},
		saveSpell() {
			console.log("Store spell called", this.spell);

			this.spell.metadata.changed = true;
			this.spell.metadata.checked = false;

			db.ref(`new_spells/${this.id}`)
				.set(this.spell)
				.then(() => {
					this.$snotify.success("Spell Saved.", "Critical hit!", {
						position: "rightTop",
					});
				})
				.catch((e) => {
					this.$snotify.error(e, "Save failed!", {
						position: "rightTop",
					});
				});
			this.spell_copy = JSON.stringify(this.spell);
			this.unsaved_changes = false;
			this.$emit("set-unsaved", this.unsaved_changes);
		},
	},

	// This is now handled in contribute/spells/edit
	// Eventually this will be needed here too
	beforeRouteLeave(to, from, next) {
		console.log("before route leave");
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
