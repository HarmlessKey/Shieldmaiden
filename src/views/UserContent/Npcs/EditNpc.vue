<template>
	<div class="content__edit" v-if="!loading">
		<ValidationObserver  v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveNpc)" greedy>
				<div>
					<div class="top">
						<q-icon v-if="!valid" name="error" color="red" size="sm" class="mr-2">
							<q-tooltip anchor="top middle" self="center middle">
								There are validation errors
							</q-tooltip>
						</q-icon>
						<q-btn v-if="!npcId" class="mx-1" color="neutral-5" no-caps @click="copy_dialog = true">
							<i aria-hidden="true" class="fas fa-copy mr-2"></i>
							Copy
						</q-btn>
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
							<router-link :to="`/content/npcs`" class="btn bg-neutral-5 mr-2">Cancel</router-link>
							<q-btn label="Save" type="submit" color="primary" no-caps />
						</div>
						<div class="d-flex justify-content-start unsaved_changes">
							<template v-if="unsaved_changes">
								<div  class="orange truncate mr-2 d-none d-md-block">
									<i aria-hidden="true" class="fas fa-exclamation-triangle"></i> Unsaved changes
								</div>	
								<a class="btn btn-sm bg-neutral-5" @click="revert_changes()">
									<i aria-hidden="true" class="fas fa-undo" />
									Revert
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
					<span>Copy existing NPC</span>
					<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat v-close-popup />
				</div>
				<div class="card-body">
					<CopyContent @copy="copy" type="monster" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
	<hk-card v-else header="Basic info">
		<hk-loader name="NPC" />
	</hk-card>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';
	import BasicInfo from '@/components/npcs/BasicInfo';
	import Senses from '@/components/npcs/Senses';
	import AbilityScores from '@/components/npcs/AbilityScores';
	import Skills from '@/components/npcs/Skills';
	import Defenses from '@/components/npcs/Defenses';
	import SpellCasting from '@/components/npcs/SpellCasting';
	import Actions from '@/components/npcs/Actions';
	import CopyContent from "@/components/CopyContent";

	export default {
		name: 'EditNpc',
		mixins: [general],
		components: {
			BasicInfo,
			Senses,
			AbilityScores,
			Skills,
			Defenses,
			SpellCasting,
			Actions,
			CopyContent
		},
		data() {
			return {
				userId: this.$route.params.userid || this.$store.getters.user.uid,
				npcId: this.$route.params.id,
				npc: {},
				loading: false,
				npc_copy: {},
				copy_dialog: false,
				copy_resource_setter: undefined,
				import_dialog: false,
				unsaved_changes: false
			}
		},
		async mounted() {
			if(this.npcId) {
				this.loading = true;
				await this.get_npc({ uid: this.userId, id: this.npcId }).then(npc => {
					npc.name = npc.name.capitalizeEach();
					this.npc = npc;
					this.npc_copy = JSON.stringify(npc);
					this.unsaved_changes = false;
					this.loading = false;
				});
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters("npcs", ["npc_count"])
		},
		watch: {
			npc: {
				deep: true,
				handler(newVal) {
					if (JSON.stringify(newVal) !== this.npc_copy) {
						this.unsaved_changes = true;
					} else {
						this.unsaved_changes = false;
					}
					
					// Capitalize name
					this.npc.name = this.npc.name.capitalizeEach();
				}
			}
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("api_monsters", ["get_monsters", "get_monster"]),
			...mapActions("npcs", ["add_npc", "edit_npc", "get_npc"]),
			isOwner() {
				if (this.$route.name == 'Edit Companion') {
					return false;
				} return true;
			},
			copy({ result }) {
				this.copy_dialog = false;
				this.npc = result;
			},
			revert_changes() {
				this.npc = JSON.parse(this.npc_copy);
				this.npc_copy = JSON.stringify(this.npc);
				this.unsaved_changes = false;
			},
			/**
			 * Checks if a new NPC must be added, or an existing NPC must be saved.
			**/
			saveNpc() {
				if(this.$route.name === "Add NPC" && !this.npcId) {
					this.addNpc();
				} else {
					this.editNpc();
				}
			},
			addNpc() {
				this.add_npc(this.npc).then((res) => {
					// Set the npcId, so we know there is an existing NPC
					// even though we are on the AddNPC route, this we won't create multiple when hitting save again
					this.$set(this, "npcId", res);

					this.$snotify.success('Monster Saved.', 'Critical hit!', {
						position: "rightTop"
					});

					// Capitalize before stringyfy so changes found isn't triggered
					this.npc.name = this.npc.name.capitalizeEach();
					this.npc_copy = JSON.stringify(this.npc);
					this.unsaved_changes = false;
				}).catch(error => {
					this.$snotify.error('Couldn\'t save mosnter.', 'Save failed', {
						position: "rightTop"
					});
					console.error(error);
					console.log(this.npc);
				});
			},
			editNpc() {
				this.edit_npc({ 
					uid: this.userId,
					id: this.npcId,
					npc: this.npc
				}).then(() => {
					this.$snotify.success('Monster Saved.', 'Critical hit!', {
						position: "rightTop"
					});

					this.unsaved_changes = false;
	
					// Capitalize before stringyfy so changes found isn't triggered
					this.npc.name = this.npc.name.capitalizeEach();
					this.npc_copy = JSON.stringify(this.npc);
				});
			},
		},
		beforeRouteLeave(to, from, next) {
			if (this.unsaved_changes) {
				this.$snotify.error('There are unsaved changes in the form.\n Would you like to continue?', 'Unsaved Changes', {
					buttons: [
					{ text: 'Leave', action: (toast) => { next(); this.$snotify.remove(toast.id); }, bold: false},
					{ text: 'Stay', action: (toast) => { next(false); this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			} else {
				next()
			}
		},
	}
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