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
				<p class="error red" v-if="errors.items && errors.items.length > 0">There is an error in your form.</p>
				<router-link to="/npcs" class="btn bg-gray mr-2">Cancel</router-link>
				<button v-if="$route.name == 'AddNPC'" class="btn" @click="addNpc()"><i class="fas fa-plus"></i> Add NPC</button>
				<button 
					v-else 
					:disabled="errors.items && errors.items.length > 0"
					class="btn" 
					@click="editNpc()"
				>
					<i class="fas fa-check"></i> Save
				</button>
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
				copy_dialog: false,
				npcId: this.$route.params.id,
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
					asObject: true
				},
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
		},
		methods: {
			...mapActions([
				'fetchCampaign',
				'setSlide'
			]),
			isOwner() {
				if (this.$route.name == 'Edit Companion')
					return false
				return true
			},
			searchNPC() {
				this.searchResults = []
				this.searching = true
				for (var i in this.npcs) {
					var m = this.npcs[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
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
			addNpc() {
				delete this.npc['.value'];
				delete this.npc['.key'];

				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('npcs/' + this.userId).push(this.npc);
						this.$router.replace('/npcs')
					} else {
						this.$snotify.error('There is something wrong in your form, scroll up to fix it.', 'Error', {
						});
					}
				})
			},
			editNpc() {
				delete this.npc['.key'];

				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`npcs/${this.userId}/${this.npcId}`).set(this.npc);
						if (this.isOwner()){
							this.$router.replace('/npcs')
						}
						else {
							this.$router.replace(`/characters/${this.npc.player_id}`)
						}
					} else {
						this.$snotify.error('There is something wrong in your form, scroll up to fix it.', 'Error', {
						});
					}
				})
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