<template>
	<div class="content__edit" v-if="!loading">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveNpc)" greedy>
				<div>
					<div class="top">
						<q-btn v-if="!user" color="accent" no-caps @click="sign_up_dialog = true">
							<i aria-hidden="true" class="fas fa-user-plus mr-2"></i>
							Create Account
						</q-btn>
						<div v-else />
						<div>
							<q-icon v-if="!valid" name="error" color="red" size="sm" class="mr-2">
								<q-tooltip anchor="top middle" self="center middle">
									There are validation errors
								</q-tooltip>
							</q-icon>
							<q-btn
								v-if="!npcId && userId"
								class="mx-1"
								color="neutral-5"
								no-caps
								@click="((create_dialog = true), (generate_monster = true))"
							>
								<i aria-hidden="true" class="fas fa-sparkles"></i>
								<q-tooltip anchor="top middle" self="center middle"> Generate NPC! </q-tooltip>
							</q-btn>
							<q-btn
								v-if="!npcId"
								class="mx-1"
								color="neutral-5"
								no-caps
								@click="copy_dialog = true"
							>
								<i aria-hidden="true" class="fas fa-copy mr-2"></i>
								Copy
							</q-btn>
						</div>
					</div>

					<div class="form">
						<BasicInfo v-model="npc" />

						<Senses v-model="npc" />

						<AbilityScores v-model="npc" />

						<Skills v-model="npc" />

						<Defenses v-model="npc" />

						<SpellCasting v-model="npc" />

						<Actions v-model="npc" />
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
								:to="user ? `/content/npcs` : `/tools/monster-creator`"
								class="btn bg-neutral-5 mr-2"
								>{{ unsaved_changes ? "Cancel" : "Back" }}</router-link
							>
							<q-btn v-if="user" label="Save" type="submit" color="primary" no-caps />
							<q-btn
								v-else
								:disabled="!valid"
								color="primary"
								no-caps
								@click="account_dialog = true"
							>
								Save
							</q-btn>
						</div>
						<div class="d-flex justify-content-start unsaved_changes">
							<template v-if="unsaved_changes">
								<div v-if="userId" class="orange truncate mr-2 d-none d-md-block">
									<i aria-hidden="true" class="fas fa-exclamation-triangle"></i> Unsaved changes
								</div>
								<a class="btn btn-sm bg-neutral-5" @click="user ? revertChanges() : reset()">
									<i aria-hidden="true" class="fas fa-undo" />
									{{ user ? "Revert" : "Reset" }}
								</a>
							</template>
						</div>
					</div>
				</div>
			</q-form>
		</ValidationObserver>

		<!-- COPY DIALOG -->
		<q-dialog v-model="copy_dialog">
			<hk-card class="create-dialog">
				<div slot="header" class="card-header">
					<span>Copy existing NPC</span>
					<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat v-close-popup />
				</div>
				<div class="card-body">
					<CopyContent @copy="copy" type="monster" />
				</div>
			</hk-card>
		</q-dialog>

		<q-dialog v-model="account_dialog">
			<hk-card class="account-dialog">
				<div slot="header" class="card-header">
					<span>Save your monster</span>
					<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat v-close-popup />
				</div>
				<div class="card-body">
					<p>Create an account to save your monster and use it in our Combat Tracker.</p>
					<button class="btn btn-block bg-accent" @click="sign_up_dialog = true">
						Create Free Account
					</button>
				</div>
				<div slot="footer" class="card-footer">
					<q-btn no-caps @click="download">
						Download <i aria-hidden="true" class="fas fa-arrow-alt-down ml-2" />
					</q-btn>
				</div>
			</hk-card>
		</q-dialog>

		<q-dialog v-model="create_dialog" persistent position="top">
			<hk-card class="create-dialog">
				<div slot="header" class="card-header">
					<div v-if="generating"><span class="loader">Generating your monster</span></div>
					<template v-else> How do you want to do this? </template>
				</div>
				<div
					v-if="!generate_monster"
					class="card-body"
					:class="{ generate: generate_monster, generating: generating }"
				>
					<template v-if="!copy_monster && !generate_monster">
						<button class="btn btn-lg btn-block" @click="copy_monster = true">
							Copy existing monster
						</button>
						<h2 class="text-center my-2">OR</h2>
						<button class="btn btn-lg btn-block" @click="create_dialog = false">
							Create from scratch
						</button>
						<h2 class="text-center my-2">OR</h2>
						<button
							class="btn btn-lg btn-block bg-accent mb-2"
							@click="generate_monster = true"
							:disabled="!userId"
						>
							Generate from description
						</button>
					</template>
					<template v-if="copy_monster">
						<h2>Copy an existing monster</h2>
						<CopyContent @copy="copy" type="monster" />
					</template>
				</div>
				<template v-if="generate_monster">
					<GenerateMonster @generating="setGenerating" @finished="finishedGenerate" />
				</template>
				<div v-if="copy_monster || generate_monster" class="card-footer" slot="footer">
					<button
						v-if="!generating"
						class="btn btn-sm bg-neutral-5"
						@click="((copy_monster = false), (generate_monster = false))"
					>
						<i class="fas fa-times mr-1" aria-hidden="true" />
						Cancel
					</button>
				</div>
			</hk-card>
		</q-dialog>

		<q-dialog v-model="sign_up_dialog">
			<SignUp @sign-up="handleSignUp" />
		</q-dialog>
	</div>
	<hk-card v-else header="Basic info">
		<hk-loader name="NPC" />
	</hk-card>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import { general } from "src/mixins/general.js";
import BasicInfo from "src/components/npcs/BasicInfo";
import Senses from "src/components/npcs/Senses";
import AbilityScores from "src/components/npcs/AbilityScores";
import Skills from "src/components/npcs/Skills";
import Defenses from "src/components/npcs/Defenses";
import SpellCasting from "src/components/npcs/SpellCasting";
import Actions from "src/components/npcs/Actions";
import CopyContent from "src/components/CopyContent";
import { downloadJSON } from "src/utils/generalFunctions";
import SignUp from "src/components/SignUp.vue";
import GenerateMonster from "src/components/npcs/GenerateMonster.vue";

export default {
	name: "EditNpc",
	mixins: [general],
	components: {
		BasicInfo,
		Senses,
		AbilityScores,
		Skills,
		Defenses,
		SpellCasting,
		Actions,
		CopyContent,
		SignUp,
		GenerateMonster,
	},
	data() {
		return {
			userId:
				this.$store.getters && this.$store.getters.user
					? this.$route.params.userid || this.$store.getters.user.uid
					: undefined,
			npcId: this.$route.params.id,
			npc: {},
			loading: false,
			npc_copy: {},
			generate_monster: false,
			copy_dialog: false,
			unsaved_changes: false,
			create_dialog: false,
			account_dialog: false,
			sign_up_dialog: false,
			copy_monster: false,
			monster_description: "",
			generating: false,
			generate_error: null,
		};
	},
	async mounted() {
		if (this.npcId) {
			this.loading = true;
			await this.get_npc({ uid: this.userId, id: this.npcId }).then((npc) => {
				npc.name = npc.name ? npc.name.capitalizeEach() : undefined;
				this.npc = npc;
				this.npc_copy = JSON.parse(JSON.stringify(npc));
				this.unsaved_changes = false;
				this.loading = false;
			});
		} else {
			this.create_dialog = true;
		}
	},
	computed: {
		...mapGetters(["user", "tier", "overencumbered"]),
		...mapGetters("npcs", ["npc_count"]),
	},
	watch: {
		npc: {
			deep: true,
			handler(newVal) {
				if (!_.isEqual(newVal, this.npc_copy)) {
					this.unsaved_changes = true;
				} else {
					this.unsaved_changes = false;
				}

				// Capitalize name
				this.npc.name = this.npc.name ? this.npc.name.capitalizeEach() : undefined;
			},
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("api_monsters", ["fetch_monsters", "fetch_monster"]),
		...mapActions("npcs", ["add_npc", "edit_npc", "get_npc"]),
		isOwner() {
			return this.$route.name !== "Edit Companion";
		},
		download() {
			downloadJSON(this.npc);
		},
		copy({ result }) {
			this.copy_dialog = false;
			this.create_dialog = false;
			this.npc = JSON.parse(JSON.stringify({ ...result }));
			this.npc = this.convertVersatileToOptions(this.npc);
		},
		setGenerating(value) {
			this.generating = value;
		},
		finishedGenerate(npc) {
			console.log(npc);
			this.npc = npc;
			this.generating = false;
			this.create_dialog = false;
		},
		reset() {
			this.npc = {};
		},
		revertChanges() {
			this.npc = JSON.parse(this.npc_copy);
			this.npc_copy = JSON.parse(JSON.stringify(this.npc));
			this.unsaved_changes = false;
		},
		convertVersatileToOptions(npc) {
			if (npc.actions.length > 0) {
				for (const action of npc.actions) {
					if (action.versatile === true) {
						const versTwoName = action.versatile_two;
						action.options = [action.versatile_one, action.versatile_two];
						delete action.versatile;
						delete action.versatile_one;
						delete action.versatile_two;

						for (const sub_action of action.action_list) {
							for (const roll of sub_action.rolls) {
								roll.options = {
									[versTwoName]: {
										damage_type: roll.versatile_damage_type || null,
										dice_count: roll.versatile_dice_count || null,
										dice_type: roll.versatile_dice_type || null,
										fixed_val: roll.versatile_fixed_val || null,
									},
								};
								delete roll.versatile_damage_type;
								delete roll.versatile_dice_count;
								delete roll.versatile_dice_type;
								delete roll.versatile_fixed_val;
							}
						}
					}
				}
			}
			return npc;
		},
		/**
		 * Checks if a new NPC must be added, or an existing NPC must be saved.
		 **/
		saveNpc() {
			if (!this.npcId) {
				this.addNpc();
			} else {
				this.editNpc();
			}
		},
		addNpc() {
			this.add_npc({ npc: this.npc })
				.then((key) => {
					// Set the npcId, so we know there is an existing NPC
					// even though we are on the AddNPC route, this we won't create multiple when hitting save again
					this.$set(this, "npcId", key);

					this.$snotify.success("Monster Saved.", "Critical hit!", {
						position: "rightTop",
					});

					// Capitalize before stringify so changes found isn't triggered
					this.npc.name = this.npc.name ? this.npc.name.capitalizeEach() : undefined;
					this.npc_copy = JSON.parse(JSON.stringify(this.npc));
					this.unsaved_changes = false;
				})
				.catch((error) => {
					this.$snotify.error("Couldn't save monster.", "Save failed", {
						position: "rightTop",
					});
					console.error(error);
					console.log(this.npc);
				});
		},
		editNpc() {
			this.edit_npc({
				uid: this.userId,
				id: this.npcId,
				npc: this.npc,
			}).then(() => {
				this.$snotify.success("Monster Saved.", "Critical hit!", {
					position: "rightTop",
				});

				this.unsaved_changes = false;

				// Capitalize before stringify so changes found isn't triggered
				this.npc.name = this.npc.name ? this.npc.name.capitalizeEach() : undefined;
				this.npc_copy = JSON.parse(JSON.stringify(this.npc));
			});
		},
		handleSignUp(e) {
			if (e === "success") {
				this.account_dialog = false;
				this.sign_up_dialog = false;
			}
		},
	},
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
		justify-content: space-between;
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
.hk-card.create-dialog {
	max-width: 95vw;
	width: 576px;
	margin-top: 100px;

	.loader {
		color: $neutral-1;
		font-weight: bold;
	}

	.card-body {
		overflow: hidden;
		z-index: 0;
	}
}
.hk-card.account-dialog {
	width: 100%;
	max-width: 360px;
}
</style>
