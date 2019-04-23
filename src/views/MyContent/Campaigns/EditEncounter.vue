<template>
	<div v-if="overencumbered" class='container-fluid'>
		<OverEncumbered/>
	</div>
	<div id="hasSide" v-else-if="encounter">
		<Sidebar/>
		<div class="container-fluid">
			<div class="info mb-4">
				<Crumble />

				<router-link :to="'/encounters/' + $route.params.campid"><i class="fas fa-arrow-left"></i> Back</router-link>

				<b-row class="mt-3">
					<b-col class="mb-2">
						<input class="form-control" 
							autocomplete="off"
							v-validate="'required'" 
							data-vv-as="Encounter Name" 
							type="text" name="name" 
							v-model="encounter.encounter"/>
						<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

						<input class="form-control mt-2"
							autocomplete="off" 
							v-validate="'url'" type="text" 
							name="backbround" 
							data-vv-as="Background"
							v-model="encounter.background" 
							placeholder="Background URL"/>
						<p class="validate red" v-if="errors.has('background')">{{ errors.first('background') }}</p>

						<button class="btn mt-2" @click="edit()">Save Name & Background</button>
					</b-col>
					<b-col sm="3" v-if="encounter.background">
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
									
									<div v-if="campaign && campaign.players === undefined">
										<h3 class="red"><i class="fas fa-users"></i> No Players Yet</h3>
										<p>Add players to your campaign first.</p>
										<router-link :to="'/campaigns/' + campaignId" class="btn btn-block">Go to campaign</router-link>
									</div>
									<a v-else class="btn btn-block mb-3" @click="addAllPlayers()">Add all</a>

									<ul class="entities hasImg" v-if="campaign && players && encounter">
										<li v-for="(player, key) in campaign.players" 
											:key="key" 
											class="d-flex justify-content-between">
											<div class="d-flex justify-content-left">
												<span v-if="players[key].avatar" class="img" :style="{ backgroundImage: 'url(\'' + players[key].avatar + '\')' }"></span>
												<span v-else class="img"><img src="@/assets/_img/styles/player.svg" /></span>
												{{ players[key].character_name }}
											</div>
											<template v-if="encounter.entities">
												<div class="actions">
													<a @click="showSlide('info', players[key])" v-b-tooltip.hover title="Show Info">
														<i class="fas fa-info"></i>
													</a>
													<a v-if="checkPlayer(key) < 0" class="gray-hover" 
													v-b-tooltip.hover 
													title="Add Character" 
													@click="add(key, 'player', players[key].character_name)">
														<i class="fas fa-plus"></i>
													</a>
												</div>
												<span>
													<span v-if="checkPlayer(key) >= 0" class="hover-hide">
														<i class="fas fa-check"></i>
														<small class="d-none d-md-inline ml-1 gray-hover">Added</small>
													</span>
													<i class="ml-3 far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
												</span>
											</template>	
											<div v-else class="actions">
												<a @click="showSlide('info', players[key])" v-b-tooltip.hover title="Show Info">
													<i class="fas fa-info"></i>
												</a>
												<a class="gray-hover" 
													v-b-tooltip.hover 
													title="Add Character" 
													@click="add(key, 'player', players[key].character_name)">
													<i class="fas fa-plus"></i>
													<span class="d-none d-md-inline ml-1">Add</span>
												</a>
											</div>
										</li>
									</ul>
									<div v-else class="loader"><span>Loading players...</span></div>
									
									<p>Missing players? <router-link :to="'/campaigns/'+campaignId">Add them to your campaign first</router-link>.</p>
								</div>
								<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
									<div class="input-group mb-3">
										<input type="text" autocomplete="off" v-model="search" @keyup="searchNPC()" placeholder="Search NPC" class="form-control"/>
										<div class="input-group-append">
											<button class="btn"><i class="fas fa-search"></i></button>
										</div>
									</div>
									<ul class="entities">
										<p v-if="noResult" class="red">{{ noResult }}</p>
										<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
											<div class="d-flex justify-content-left">
												{{ npc.name }}
											</div>
											<span>
												<span class="hover-hide">CR: {{ npc.challenge_rating }}</span>
												<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
											</span>
											<div class="actions justify-content-end">
												<a @click="showSlide('info', npc)" v-b-tooltip.hover title="Show Info">
													<i class="fas fa-info"></i>
												</a>
												<b-form-input class="multi_nr" autocomplete="off" v-b-tooltip.hover title="Add multiple npc's at once" type="number" min="1" name="name" placeholder="1" v-model="to_add[npc['.key']]" />
												<a class="gray-hover mx-1" v-b-tooltip.hover title="Add with average HP" @click="multi_add(npc['.key'], 'npc', npc.name, false)">
													<i class="fas fa-plus"></i>
												</a>
												<a class="gray-hover" v-b-tooltip.hover title="Add and roll HP" @click="multi_add(npc['.key'], 'npc', npc.name, false, true)">
													<i class="fas fa-dice-d20"></i>
												</a>
											</div>
										</li>
									</ul>
									<template v-if="npcs">
										<h2>Custom NPC's</h2>
										<ul class="entities hasImg">
											<li v-for="(npc, key) in npcs"
												:key="key" 
												class="d-flex justify-content-between">
												<div class="d-flex justify-content-left">
													<span v-if="npc.avatar" class="img" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></span>
													<img v-else src="@/assets/_img/styles/monster.png" class="img" />
													{{ npc.name }}
												</div>
												<span>
													<span class="hover-hide">CR: {{ npc.challenge_rating }}</span>
													<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
												</span>
												<div class="actions justify-content-end">
													<a @click="showSlide('info', npc)" v-b-tooltip.hover title="Show Info">
														<i class="fas fa-info"></i>
													</a>
													<b-form-input class="multi_nr" autocomplete="off" v-b-tooltip.hover title="Add multiple npc's at once" type="number" min="1" name="name" placeholder="1" value="1" v-model="to_add[key]" />
													<a class="gray-hover mx-1" v-b-tooltip.hover title="Add with average HP" @click="multi_add(key, 'npc', npc.name, true)">
														<i class="fas fa-plus"></i>
													</a>
													<a class="gray-hover" v-b-tooltip.hover title="Add and roll HP" @click="multi_add(key, 'npc', npc.name, true, true)">
														<i class="fas fa-dice-d20"></i>
													</a>
												</div>
											</li>
										</ul>
									</template>
								</div>
							</div>
						</div>
					</b-col>
					
					<!-- ADDED -->
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
							<ul class="entities hasImg mt-4" v-if="encounter">
								<li v-for="(entity, key) in encounter.entities" :key="key" class="d-flex justify-content-between">
									<div class="d-flex justify-content-left">
										<template v-if="entity.entityType == 'player'">
											<span v-if="players[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + players[entity.id].avatar + '\')' }"></span>
											<img v-else src="@/assets/_img/styles/player.png" class="img" />
										</template>
										<template v-else-if="entity.entityType == 'npc'">
											<span v-if="entity.avatar" class="img" :style="{ backgroundImage: 'url(\'' + entity.avatar + '\')' }"></span>
											<span v-else-if="entity.npc == 'custom' && npcs[entity.id].avatar" class="img" :style="{ backgroundImage: 'url(\'' + npcs[entity.id].avatar + '\')' }"></span>
											<img v-else-if="entity.friendly" src="@/assets/_img/styles/player.png" class="img" />
											<img v-else src="@/assets/_img/styles/monster.png" class="img" />
										</template>
										<i v-if="entity.friendly" class="fas fa-heart green mr-2"></i> {{ entity.name }}
									</div>
									<div class="actions">
										<a v-if="entity.entityType == 'npc'" @click="showSlide('edit', entity, key)" class="mr-2 gray-hover" v-b-tooltip.hover title="Edit">
											<i class="fas fa-pencil"></i>
										</a>
										<a class="gray-hover" v-b-tooltip.hover title="Remove Character" @click="remove(key, entity.name)">
											<i class="fas fa-minus"></i>
										</a>
									</div>
									<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
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
						<b-col md="4" class="d-flex justify-content-between">
							<span class="coins mr-2 yellow"><i class="fas fa-coins"></i></span>
							<input class="form-control" autocomplete="off" type="number" min="0" name="name" v-model="loot.gp" placeholder="GP"/>
						</b-col>
						<b-col md="4" class="d-flex justify-content-between">
							<span class="coins mr-2"><i class="fas fa-coins"></i></span> 
							<input class="form-control" autocomplete="off" type="number" min="0" name="name" v-model="loot.sp" placeholder="SP"/>
						</b-col>
						<b-col md="4" class="d-flex justify-content-between">
							<span class="coins mr-2 orange"><i class="fas fa-coins"></i></span>
							<input class="form-control" autocomplete="off" type="number" min="0" name="name" v-model="loot.cp" placeholder="CP"/>
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
					<div v-for="(item, index) in loot.items" :key="index">
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

					<button class="btn mt-2" @click="setLoot()">Save loot</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'

	import _ from 'lodash'

	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'
	import { difficulty } from '@/mixins/difficulty.js'
	import { dice } from '@/mixins/dice.js'
	import { attributes } from '@/mixins/attributes.js'

	export default {
		name: 'EditCampaign',
		mixins: [difficulty, attributes, dice],
		metaInfo: {
			title: 'Encounters'
		},
		components: {
			Sidebar,
			Crumble,
			OverEncumbered,
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
				to_add: {}
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
				'overencumbered',
			]),
			async _excludeFriendlies() {
				if(this.encounter) {
					var entities = await _.chain(this.encounter.entities)
									.filter(function(entity, key) {
										entity.key = key
										return !entity.friendly;
									})
									.sortBy('name' , 'asc')
									.value();

					return entities;
				}
			}
		},
		watch: {
			_excludeFriendlies() {
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
						type: 'edit',
						npc: npc,
						key: key,
					})
				}
			},
			multi_add(id,type,name,custom=false,rollHp=false) {
				if (!this.to_add[id]) {
					this.to_add[id] = 1
				}
				for (let i = 0; i < this.to_add[id]; i++ ) {
					this.add(id,type,name,custom,rollHp)
				}
				this.to_add[id] = 1
			},
			add(id, type, name, custom = false, rollHp = false) {
				var entity = {
					id: id,
					name: name,
					entityType: type,
					initiative: 0,
					active: true,
				}
				var HP = undefined;

				if(type == 'npc') {
					entity.active = true
					let last = -1
					let n = 0
					for (let i in this.encounter.entities) {
						let match = this.encounter.entities[i].name.match(/^([a-zA-Z\s]+)(\((\d+)\))*/)
						let id = this.encounter.entities[i].id
						if (match[1].trim() == entity.name) {
							n++
							if (parseInt(match[3]) > last) {
								last = parseInt(match[3])
							}
						}
					}
					if (last > 0) {
						entity.name = `${entity.name} (${++last})`
					} else if (n > 0) {
						entity.name = `${entity.name} (${n})`
						
					}
					
					if(custom == false) {
						var npc_data = this.monsters[id - 1];
						entity.npc = 'api'
						if(rollHp && npc_data.hit_dice) {
							let dice = npc_data.hit_dice.split('d');
							let mod = dice[0] * this.calcMod(npc_data.constitution)

							HP = this.rollD(dice[1], dice[0], mod)

							entity.curHp = HP.total
							entity.maxHp = HP.total
						}
						else {
							entity.curHp = npc_data.hit_points
							entity.maxHp = npc_data.hit_points
						}
						entity.ac = npc_data.armor_class
					}
					else {
						npc_data = this.npcs[id];
						entity.npc = 'custom'
						entity.ac = npc_data.ac

						if(rollHp && npc_data.hit_dice) {
							let dice = npc_data.hit_dice.split('d');
							let mod = dice[0] * this.calcMod(npc_data.constitution)

							HP = this.rollD(dice[1], dice[0], mod)
							
							entity.curHp = HP.total
							entity.maxHp = HP.total
						}
						else {
							entity.curHp = npc_data.maxHp
							entity.maxHp = npc_data.maxHp
						}
					}
					db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/entities').push(entity);
				}
				else if (type == 'player') {
					db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/entities').child(id).set(entity);
				}
				if(type == 'npc') {
					let notifyHP = [];

					if(HP) {
						notifyHP.total = HP.total
						notifyHP.throws = ' [' + HP.throws + '] '
						notifyHP.mod = HP.mod
					}
					else {
						notifyHP.total = entity.maxHp;
						notifyHP.throws = ''
						notifyHP.mod = ''
					}

					this.$snotify.success('HP: ' + notifyHP.total + notifyHP.throws + notifyHP.mod, 'NPC added', {
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

	span.left {
		width: 80px;
		display: inline-block;
	}
}


// Remove arrows from number field
input[type="number"]::-webkit-outer-spin-button, input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
 
input[type='number'] {
    -moz-appearance: textfield;
}

.multi_nr {
	width: 45px;
	height: 30px;
	text-align: center;
	margin-left: 4px;
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