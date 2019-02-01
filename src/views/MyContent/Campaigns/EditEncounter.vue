<template>
	<div id="hasSide" v-if="encounter">
		<Sidebar/>
		<div class="container-fluid">
			<div class="info mb-4">
				<Crumble />

				<router-link :to="'/encounters/' + $route.params.campid"><i class="fas fa-arrow-left"></i> Back</router-link>

				<b-row class="mt-3">
					<b-col>
						<input class="form-control" 
							v-validate="'required'" 
							data-vv-as="Encounter Name" 
							type="text" name="name" 
							v-model="encounter.encounter"/>
						<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

						<input class="form-control mt-2" 
							v-validate="'url'" type="text" 
							name="backbround" 
							data-vv-as="Background"
							v-model="encounter.background" 
							placeholder="Background URL"/>
						<p class="validate red" v-if="errors.has('background')">{{ errors.first('background') }}</p>

						<button class="btn mt-2" @click="edit()">Save</button>
					</b-col>
					<b-col v-if="encounter.background">
						<div class="img-container"><img :src="encounter.background" /></div>
					</b-col>
				</b-row>
			</div>

			<!-- ADD PLAYERS AND NPC'S -->
			<b-card header="Entities">
				<b-row>
					<b-col md="6">
						<div id="add" class="bg-gray">
							<ul class="nav nav-tabs" id="myTab" role="tablist">
								<li class="nav-item">
									<a class="nav-link active" id="manual-tab" data-toggle="tab" href="#manual" role="tab" aria-controls="manual" aria-selected="true">Add Players</a>
								</li>
								<li class="nav-item">
									<a class="nav-link" id="select-tab" data-toggle="tab" href="#select" role="tab" aria-controls="select" aria-selected="false">Add NPC's</a>
								</li>
							</ul>
							<div class="tab-content">
								<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
									<h2>In Campaign</h2>
									<a class="btn btn-block mb-3" @click="addAllPlayers()">Add all</a>
									<ul class="entities" v-if="campaign && players && encounter">
										<li v-for="(player, key) in campaign.players" 
											:key="key" 
											class="d-flex justify-content-between">
											<div class="d-flex justify-content-left">
												<span v-if="players[key].avatar" class="img" :style="{ backgroundImage: 'url(\'' + players[key].avatar + '\')' }"></span>
												{{ players[key].character_name }}
											</div>
											<template v-if="encounter.entities">
												<a v-if="checkPlayer(key) < 0" class="gray-hover" 
												v-b-tooltip.hover 
												title="Add Character" 
												@click="add(key, 'player', players[key].character_name)">
													<i class="fas fa-plus green"></i>
													<span class="d-none d-md-inline ml-1">Add</span>
												</a>
												<span v-else>
													<i class="fas fa-check green"></i>
													<small class="d-none d-md-inline ml-1 gray-hover">Added</small>
												</span>
											</template>	
											<a v-else class="gray-hover" 
												v-b-tooltip.hover 
												title="Add Character" 
												@click="add(key, 'player', players[key].character_name)">
												<i class="fas fa-plus green"></i>
												<span class="d-none d-md-inline ml-1">Add</span>
											</a>
										</li>
									</ul>
									<div v-else class="loader"><span>Loading players...</span></div>
									<div v-if="campaign && campaign.players === undefined">
										<h3><i class="fas fa-users red"></i> No Players Yet</h3>
										<p>Add players to your campaign first.</p>
										<router-link :to="'/campaigns/' + campaignId" class="btn btn-block">Go to campaign</router-link>
									</div>
									<h2>Not in Campaign</h2>
									<ul class="entities">
											<li v-for="(player, key) in players" 
											:key="key" 
											class="d-flex justify-content-between" v-if="Object.keys(campaign.players).indexOf(key) < 0">
												<div class="d-flex justify-content-left">
													<span v-if="player.avatar" class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></span>
													{{ player.character_name }}
												</div>
											<template v-if="encounter.entities">
												<a v-if="checkPlayer(key) < 0" class="gray-hover" 
												v-b-tooltip.hover 
												title="Add Character" 
												@click="add(key, 'player', player.character_name)">
													<i class="fas fa-plus green"></i>
													<span class="d-none d-md-inline ml-1">Add</span>
												</a>
													<span v-else>
														<i class="fas fa-check green"></i>
														<small class="d-none d-md-inline ml-1 gray-hover">Added</small>
													</span>
												</a>
											</template>	
											<a v-else class="gray-hover" 
												v-b-tooltip.hover 
												title="Add Character" 
												@click="add(key, 'player', player.character_name)">
													<i class="fas fa-plus green"></i>
													<span class="d-none d-md-inline ml-1">Add</span>
											</a>
											</li>
									</ul>
								</div>
								<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
									<div class="input-group mb-3">
										<input type="text" v-model="search" @keyup="searchNPC()" placeholder="Search NPC" class="form-control"/>
										<div class="input-group-append">
											<button class="btn"><i class="fas fa-search"></i></button>
										</div>
									</div>
									<ul class="entities">
										<p v-if="noResult" class="red">{{ noResult }}</p>
										<li v-for="npc in searchResults" class="d-flex justify-content-between">
											<div class="d-flex justify-content-left">
												<a @click="showSlide('info', npc)" class="mr-2" v-b-tooltip.hover title="Show Info">
													<i class="fas fa-info-circle"></i>
												</a>
												{{ npc.name }}
											</div>
											<span>
												CR: {{ npc.challenge_rating }}
												<a class="gray-hover ml-2" v-b-tooltip.hover title="Add NPC" @click="add(npc['.key'], 'npc', npc.name)">
													<i class="fas fa-plus green"></i>
													<span class="d-none d-md-inline ml-1">Add</span>
												</a>
											</span>
										</li>
									</ul>
									<template v-if="npcs">
										<h2>Custom NPC's</h2>
										<ul class="entities">
											<li v-for="(npc, key) in npcs" 
												:key="key" 
												class="d-flex justify-content-between">
												<div class="d-flex justify-content-left">
													<span v-if="npc.avatar" class="img" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></span>
													{{ npc.name }}
												</div>
												<span>
													CR: {{ npc.challenge_rating }}
													<a class="gray-hover ml-2" v-b-tooltip.hover title="Add Character" @click="add(key, 'npc', npc.name, true)">
														<i class="fas fa-plus green"></i>
														<span class="d-none d-md-inline ml-1">Add</span>
													</a>
												</span>
											</li>
										</ul>
									</template>
								</div>
							</div>
						</div>
					</b-col>
					
					<b-col sm="6">
						<div id="added" class="bg-gray" v-if="encounter">
							<template>
								<div class="diff d-flex justify-content-between">
									<span>
										Difficulty: 
										<span v-if="encDifficulty" class="text-capitalize" :class="{ 
											'red': encDifficulty[0] == 'error' || encDifficulty[0] == 'deadly', 
											'orange':  encDifficulty[0] == 'hard', 
											'yellow':  encDifficulty[0] == 'medium', 
											'green':  encDifficulty[0] == 'easy'}">
											{{ encDifficulty[0] }}
										</span>
									</span>
									<a data-toggle="collapse" href="#info" role="button" aria-expanded="false"><i class="fas fa-caret-down"></i></a>
								</div>
								<div class="collapse diff-info" id="info" v-if="encDifficulty">
									{{ encDifficulty[1] }}
									<template v-if="encDifficulty['easy']">
										<p>
											<b>Party XP tresholds</b><br/>
											<span class="left">Easy:</span> <span :class="{ 'blue': encDifficulty[0] == 'easy'}">{{ encDifficulty['easy'] }}</span><br/>
											<span class="left">Medium:</span> <span :class="{ 'blue': encDifficulty[0] == 'medium'}">{{ encDifficulty['medium'] }}</span><br/>
											<span class="left">Hard:</span> <span :class="{ 'blue': encDifficulty[0] == 'hard'}">{{ encDifficulty['hard'] }}</span><br/>
											<span class="left">Deadly:</span> <span :class="{ 'blue': encDifficulty[0] == 'deadly'}">{{ encDifficulty['deadly'] }}</span>
										</p>
										Total encounter XP: <span class="blue">{{ encDifficulty['compare'] }}</span>
									</template>
								</div>
							</template>
							<ul class="entities mt-4" v-if="encounter">
								<li v-for="(entity, key) in encounter.entities" :key="key" class="d-flex justify-content-between">
									<div class="d-flex justify-content-left">
										<template v-if="entity.entityType == 'player'">
											<span v-if="players[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + players[entity.id].avatar + '\')' }"></span>
											<img v-else src="@/assets/_img/styles/player.png" class="img" />
										</template>
										<span v-if="entity.avatar" class="img" :style="{ backgroundImage: 'url(\'' + entity.avatar + '\')' }"></span>
										<template v-else-if="entity.entityType == 'npc'">
											<span v-if="entity.npc == 'custom' && npcs[entity.id].avatar != ''" class="img" :style="{ backgroundImage: 'url(\'' + npcs[entity.id].avatar + '\')' }"></span>
											<img v-else src="@/assets/_img/styles/monster.png" class="img" />
										</template>
										{{ entity.name }}
									</div>
									<span>
										<a v-if="entity.entityType == 'npc'" @click="showSlide('edit', entity, key)" class="mr-2 gray-hover" v-b-tooltip.hover title="Edit">
											<i class="fas fa-hammer-war blue"></i>
											<span class="d-none d-md-inline ml-1">Edit</span>
										</a>
										<a class="gray-hover" v-b-tooltip.hover title="Remove Character" @click="remove(key, entity.name)">
											<i class="fas fa-minus red"></i>
											<span class="d-none d-md-inline ml-1">Remove</span>
										</a>
									</span>
								</li>
							</ul>
							<div v-else class="loader"><span>Loading entities...</span></div>
						</div>
					</b-col>
				</b-row>
			</b-card>

			<div class="card loot">
				<div class="card-header">
					<i class="fas fa-treasure-chest"></i> Loot
				</div>
				<div class="card-body">
					<h2>Currency</h2>
					<b-row class="mb-5">
						<b-col class="d-flex justify-content-between">
							<span class="coins mr-2 yellow"><i class="fas fa-coins"></i></span>
							<input class="form-control" type="number" min="0" name="name" v-model="loot.gp" placeholder="GP"/>
						</b-col>
						<b-col class="d-flex justify-content-between">
							<span class="coins mr-2"><i class="fas fa-coins"></i></span> 
							<input class="form-control" type="number" min="0" name="name" v-model="loot.sp" placeholder="SP"/>
						</b-col>
						<b-col class="d-flex justify-content-between">
							<span class="coins mr-2 orange"><i class="fas fa-coins"></i></span>
							<input class="form-control" type="number" min="0" name="name" v-model="loot.cp" placeholder="CP"/>
						</b-col>
					</b-row>

					<h2 class="d-flex justify-content-between">
						Items
						<a class="gray-hover" @click="addItem()">
							<i class="fas fa-plus green"></i>
							<span class="d-none d-md-inline ml-1">Add</span>
						</a>
					</h2>
					<hr>
					<div v-for="item, index in loot.items">
						<h2 class="d-flex justify-content-between">
							{{ index + 1 }}. {{ item.name }}
							<a @click="removeItem(index)" 
								class="gray-hover"
								v-b-tooltip.hover title="Remove">
								<i class="fas fa-minus red"></i>
								<span class="d-none d-md-inline ml-1">Remove</span>
							</a>
						</h2>
						<b-row class="mb-2">
							<b-col sm="2">
								<label for="name">Name</label>
							</b-col>
							<b-col sm="10">
								<b-form-input
									id="name"
									type="text" 
									v-model="item.name" 
									name="name" 
									placeholder="Name"></b-form-input>
							</b-col>
						</b-row>
						<b-row class="mb-2">
							<b-col sm="2">
								<label for="desc">Description</label>
							</b-col>
							<b-col sm="10">
								<textarea
									id="desc"
									class="form-control" 
									v-model="item.desc" 
									rows="4"
									name="desc" 
									placeholder="Description"></textarea>
							</b-col>
						</b-row>
					</div>

					<button class="btn mt-2" @click="setLoot()">Save</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import firebase from 'firebase'
	import axios from 'axios'
	import { db } from '@/firebase'
	import { difficulty } from '@/mixins/difficulty.js'

	export default {
		name: 'EditCampaign',
		mixins: [difficulty],
		metaInfo: {
			title: 'Encounters'
		},
		components: {
			Sidebar,
			Crumble,
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser,
				search: '',
				searchResults: [],
				noResult: '',
				auto_npcs: [],
				viewNPC: [],
				slide: this.$store.getters.getSlide,
				searching: false,
				encDifficulty: undefined,
			} 
		},
		firebase() {
			return {
				loot: {
					source: db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`),
					asObject: true
				},
				monsters: db.ref(`monsters`),
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'campaign',
				'players',
				'npcs',
			]),
			entitiesAmount: function() {
				if (this.encounter) {
					return Object.keys(this.encounter.entities).length
				}
				return 0
			}
		},
		watch: {
			entitiesAmount(newVal, oldVal) {
				this.setDifficulty()
			}
		},
		mounted() {
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			}),
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		methods: {
			...mapActions([
				'fetchEncounter',
				'fetchCampaign',
				'setSlide'
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}`).set(
							this.encounter
						);
						this.$snotify.success('Saved.', 'Critical hit!', {
							position: "rightTop"
						});
					}
					else {

					}
				})
			},
			showSlide(type, npc, key) {
				event.stopPropagation();
				if(type == 'info') {
					this.setSlide({
						show: true,
						type: 'npc',
						entity: npc
					})
				}
				else if(type == 'edit') {
					this.setSlide({
						show: true,
						type: 'editNpc',
						npc: npc,
						key: key,
					})
				}
			},
			add(id, type, name, custom = false) {
				var entity = {
					id: id,
					name: name,
					entityType: type,
					initiative: 0,
					active: true,
				}
				if(type == 'npc') {
					entity.active = true
					
					if(custom == false) {
						var npc_data = this.monsters[id - 1];
						entity.npc = 'api'
						entity.curHp = npc_data.hit_points
						entity.maxHp = npc_data.hit_points
						entity.ac = npc_data.armor_class
					}
					else {
						var npc_data = this.npcs;
						entity.npc = 'custom'
						entity.curHp = npc_data[id].maxHp
						entity.maxHp = npc_data[id].maxHp
						entity.ac = npc_data[id].ac
					}
					db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/entities').push(entity);
				}
				else if (type == 'player') {
					var player_data = this.players;
					entity.curHp = player_data[id].maxHp
					entity.maxHp = player_data[id].maxHp
					entity.ac = player_data[id].ac
					db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/entities').child(id).set(entity);
				}
				if(type == 'npc') {
					this.$snotify.success(entity.name, 'NPC added', {
						position: "centerTop"
					});
				}
			},
			remove(id) {
				db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/entities').child(id).remove();
			},
			searchNPC() {
				this.searchResults = []
				this.searching = true
				for (var i in this.monsters) {
					var m = this.monsters[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
			},
			addAllPlayers() {
				for(let player in this.campaign.players) {
					let name = this.players[player].character_name;
					this.add(player, 'player', name)
				}
			},
			checkPlayer(id) {
				return (Object.keys(this.encounter.entities).indexOf(id))
			},
			setLoot() {
				delete this.loot['.key'];
				delete this.loot['.value'];

				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`).set(
					this.loot
				);
				this.$snotify.success('Loot saved.', 'Critical hit!', {
					position: "rightTop"
				});
			},
			addItem() {
				if(this.loot.items == undefined) {
					this.loot.items = [];
				}
				this.loot.items.push({
					name: 'New Item',
				});
				this.$forceUpdate(); //IMPORTANT
			},
			removeItem(index) {
				this.$delete(this.loot.items, index);
				this.$forceUpdate(); //IMPORTANT
			},
			async setDifficulty() {
				this.encDifficulty = await this.difficulty(this.encounter.entities)
			},
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

}
ul.nav {
	a.nav-link {
		&.active {
			background: #302f2f !important;
		}
	}
}
.tab-content {
	background: #302f2f !important;
	padding: 15px;
}
#added {
	margin-top:33px;
	padding:15px 10px;
}

.diff-info {
	background: #302f2f;
	padding: 10px;
	margin-top: 10px;
	display: block;

	span.left {
		width: 80px;
		display: inline-block;
	}
}
ul.entities {
	list-style:none;
	padding:0;
	line-height:30px;
}
ul.entities li {
	margin-bottom:5px;
}
ul.entities .img {
	width: 30px;
	height: 30px;
	display: block;
	background-size: cover;
	background-position: top center;
	border: solid 1px #b2b2b2;
	background-color: #000;
	margin-right: 10px;
}
.npc {
	padding: 15px;
	position: fixed;
	right: 0;
	top: 50px;
	height: calc(100vh - 50px);
	width: 330px;
	z-index: 99;
	overflow: auto;
	border-left: solid 1px #000;
	box-shadow: 0 10px 8px #000;
}
.img-container {
	width: 100%;

	img {
		width: 100%;
	}
}
.loot {
	h2 {
		a {
			font-size: 15px;
		}
	}
}
.faded {
	opacity: .3;
}
.coins {
	line-height: 40px !important;
	font-size: 20px;
}

</style>