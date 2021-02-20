<template>
	<div v-if="overencumbered" class='container'>
		<OverEncumbered/>
	</div>
	<div v-else-if="npc && npc.old" class="deprecated">
		<h2 class="red">Deprecated NPC</h2>
	</div>
	<q-form 
		v-else-if="npc || $route.name == 'AddNPC'" 
		@submit="{ ($route.name === 'AddNPC') ? addNPC() : editNPC() }"
	>
		<div class="content">
			<div class="form">
				<a v-if="$route.name === 'AddNPC'" class="btn btn-block" @click="copy_dialog = true">
					<i class="fas fa-copy"></i>
					Copy existing NPC
				</a>

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
				<div class="d-flex justify-content-start">
					<div v-if="unsaved_changes" class="red unsaved_changes">
						<i class="fas fa-exclamation-triangle"></i> Unsaved changes
					</div>	
					<a v-if="unsaved_changes" class="btn bg-gray" @click="revert_changes()">Revert</a>
				</div>
				<div>
					<router-link :to="`/npcs`" class="btn bg-gray mr-2">Cancel</router-link>
					<q-btn label="Save" type="submit" color="primary"/>
				</div>
			</div>

			<!-- COPY DIALOG -->
			<q-dialog v-model="copy_dialog">
				<hk-card header="Copy Existing NPC">
					<q-input 
						dark filled square dense
						label="Search NPC"
						type="text" 
						autocomplete="off" 
						v-model="search" 
						@keyup="searchNPC()"
						class="mb-3"
					>
						<template v-slot:append>
							<q-icon name="fas fa-search" size="xs" @click="searchNPC()" />
						</template>
					</q-input>
					<p v-if="noResult" class="red">{{ noResult }}</p>
					<q-list dark>
						<q-item v-for="(npc, index) in searchResults" :key="index">
							<q-item-section>
								{{ npc.name.capitalizeEach() }}
							</q-item-section>
							<q-item-section avatar>
								<a class="gray-hover" @click="copy(npc)">
								<i class="fas fa-copy blue"/>
								<q-tooltip anchor="top middle" self="center middle">
									Copy NPC
								</q-tooltip>
							</a>
							</q-item-section>
						</q-item>
					</q-list>
				</hk-card>
			</q-dialog>
		</div>
	</q-form>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';
	import BasicInfo from '@/components/contribute/monster/forms/BasicInfo';
	import Senses from '@/components/contribute/monster/forms/Senses';
	import AbilityScores from '@/components/contribute/monster/forms/AbilityScores';
	import Skills from '@/components/contribute/monster/forms/Skills';
	import Defenses from '@/components/contribute/monster/forms/Defenses';
	import SpellCasting from '@/components/contribute/monster/forms/SpellCasting';
	import Actions from '@/components/contribute/monster/forms/Actions';

	export default {
		name: 'Npcs',
		mixins: [general],
		metaInfo: {
			title: 'NPC\'s'
		},
		components: {
			OverEncumbered,
			BasicInfo,
			Senses,
			AbilityScores,
			Skills,
			Defenses,
			SpellCasting,
			Actions,
		},
		data() {
			return {
				userId: this.$route.params.userid || this.$store.getters.user.uid,
				npcId: this.$route.params.id,
				npc: {},
				npc_copy: {},
				copy_dialog: false,
				unsaved_changes: false,
				quick: false,
				search: '',
				searchResults: [],
				noResult: '',
			}
		},
		mounted() {
			var npcs_ref = db.ref(`monsters`);
			npcs_ref.on('value', async (snapshot) => {
				let npcs = snapshot.val();

				let custom = db.ref(`npcs/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customNpcs = snapshot.val();
					for(let key in customNpcs) {
						npcs.push(customNpcs[key]);
					}
				});
				this.npcs = npcs;
				this.loadingNpcs = false;
			});
		},
		firebase() {
			return {
				abilities: db.ref('abilities'),
				npc: {
					source: db.ref(`npcs/${this.userId}/${this.npcId}`),
					asObject: true,
					readyCallback: () => {
						this.loading = false
						this.npc_copy = JSON.stringify(this.npc);
						this.unsaved_changes = false
					}
				},
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
		},
		watch: {
			npc: {
				deep: true,
				handler() {
					if (JSON.stringify(this.npc) !== this.npc_copy) {
						this.unsaved_changes = true;
					} else {
						this.unsaved_changes = false;
					}
					
					// Capitalize name
					if (this.npc.name) {
						this.npc.name = this.npc.name.capitalizeEach();
					}
				},
			}
		},
		methods: {
			...mapActions([
				'fetchCampaign',
				'setSlide'
			]),
			isOwner() {
				if (this.$route.name == 'Edit Companion') {
					return false;
				} return true;
			},
			searchNPC() {
				this.searchResults = [];
				this.searching = true;
				for (var i in this.npcs) {
					var m = this.npcs[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = '';
						this.searchResults.push(m);
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
			},
			copy(npc) {
				this.npc = npc;
				this.searchResults = [];
				this.search = '';
			},
			revert_changes() {
				this.npc = JSON.parse(this.npc_copy);
				this.unsaved_changes = false;
			},
			addNpc() {
				delete this.npc['.value'];
				delete this.npc['.key'];

				db.ref('npcs/' + this.userId).push(this.npc);
					
				this.$snotify.success('Monster Saved.', 'Critical hit!', {
					position: "rightTop"
				});

				this.unsaved_changes = false;

				// Capitalize before stringyfy so changes found isn't triggered
				this.monster.name = this.monster.name.capitalizeEach();
				this.fb_monster_json = JSON.stringify(this.monster);
			},
			editNpc() {
				delete this.npc['.key'];

				db.ref(`npcs/${this.userId}/${this.npcId}`).set(this.npc);
					
				this.$snotify.success('Monster Saved.', 'Critical hit!', {
					position: "rightTop"
				});

				this.unsaved_changes = false;

				// Capitalize before stringyfy so changes found isn't triggered
				this.monster.name = this.monster.name.capitalizeEach();
				this.fb_monster_json = JSON.stringify(this.monster);
			},
			add(type) {
				if(type == 'actions') {
					if(this.npc.actions == undefined) {
						this.npc.actions = [];
					}
					this.npc.actions.push({
						name: 'New Action',
					});
				}
				else if(type == 'legendary_actions') {
					if(this.npc.legendary_actions === undefined) {
						this.npc.legendary_actions = [];
					}
					this.npc.legendary_actions.push({
						name: 'New Legendary Action',
					});
				}
				else if(type == 'special_abilities') {
					if(this.npc.special_abilities === undefined) {
						this.npc.special_abilities = [];
					}
					this.npc.special_abilities.push({
						name: 'New Special Ability',
					});
				}
				this.$forceUpdate(); //IMPORTANT
			},
			remove(index, type) {
				if(type == 'actions'){
					this.$delete(this.npc.actions, index);
				}
				else if(type == 'special_abilities'){
					this.$delete(this.npc.special_abilities, index);
				}
				else if(type == 'legendary_actions'){
					this.$delete(this.npc.legendary_actions, index);
				}
				this.$forceUpdate(); //IMPORTANT
			},
			setQuick(input) {
				if(input == 0) {
					this.quick = false
				}
				else {
					this.quick = true
				}
			},
			returnString(name) {
				var str = name.toString()
				return str
			},
		},
		beforeRouteLeave (to, from, next) {
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
		}
	}
</script>

<style lang="scss" scoped>
.content {
	display: grid;
	height: calc(100vh - 50px) !important;
	grid-template-rows: auto 60px;

	.form {
		overflow-x: hidden;
		overflow-y: scroll;

		&::-webkit-scrollbar {
			display: none;
		}

		ul {
			padding: 0;

			&.entities {
				li {
					margin-bottom: 3px;
				}
			}
		}
		a.tab {
			display: inline-block;
			padding: 10px;
			margin-bottom: 1px;

			&.active {
				background-color:$gray;
				color: $gray-light !important;
			}
		}
		.avatar {
			display: grid;
			grid-template-columns: 56px 1fr;
			grid-column-gap: 10px;

			.img {
				border: solid 1px $gray-light;
				width: 56px;
				height: 56px;
				background-size: cover;
				background-position: center top;
			}
		}
		.skills {
			columns: 2;
		}
	}
	.save {
		display: flex;
		justify-content: flex-end;
		padding-top: 20px;
		border-top: solid 1px$gray-hover;

		.error {
			margin: 0 10px 0 0;
			line-height: 40px;
		}
	}
}



</style>