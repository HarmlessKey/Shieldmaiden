<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container">
			<div class="info">
				<Crumble />
				<h1>Edit Encounters</h1>
				<p>Add players and NPC's to your encounter.</p>
			</div>

			<!-- ADD PLAYERS AND NPC'S -->
			<div id="add" class="bg-gray">
				<ul class="nav nav-tabs" id="myTab" role="tablist">
					<li class="nav-item">
						<a class="nav-link active" id="manual-tab" data-toggle="tab" href="#manual" role="tab" aria-controls="manual" aria-selected="true">Add Player</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" id="select-tab" data-toggle="tab" href="#select" role="tab" aria-controls="select" aria-selected="false">Add NPC's</a>
					</li>
				</ul>
				<div class="tab-content">
					<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
						<div v-if="loading == true" class="loader"><span>Loading Players...</span></div>
						<ul class="entities">
							<li v-for="player in campaignPlayers" :key="player['.key']" class="d-flex justify-content-between" :class="{ 'faded' : checkEntity(player.player) }">
								<div class="d-flex justify-content-left">
									<span class="img" :style="{ backgroundImage: 'url(' + getPlayer(player.player).avatar + ')' }"></span>
									{{ getPlayer(player.player).character_name }}
								</div>
								
								<a v-if="!checkEntity(player.player)" class="green" v-b-tooltip.hover title="Add Character" @click="add(player.player, 'player', getPlayer(player.player).character_name)"><i class="fas fa-plus-circle"></i></a>
								<span v-else><i class="fas fa-check"></i></span>
							</li>
						</ul>
					</div>
					<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
						<div class="input-group mb-3">
							<input type="text" v-model="search" @change="searchNPC()" placeholder="Search NPC" class="form-control"/>
							<div class="input-group-append">
								<button class="btn"><i class="fas fa-search"></i></button>
							</div>
						</div>
						<ul class="entities">
							<p v-if="noResult" class="red">{{ noResult }}</p>
							<li v-for="npc in searchResults" class="d-flex justify-content-between">
								<div class="d-flex justify-content-left">
									<a @click="showNPC(npc)" class="mr-2" v-b-tooltip.hover title="Show Info"><i class="fas fa-info-circle"></i></a>
									{{ npc.name }}
								</div>
								<a class="green" v-b-tooltip.hover title="Add NPC" @click="add(npc.index, 'npc', npc.name)"><i class="fas fa-plus-circle"></i></a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div id="added" class="bg-gray">
				<div v-if="loadingEntities == true" class="loader"><span>Loading Entities...</span></div>
				<ul class="entities">
					<li v-for="entity in entities" :key="entity['.key']" class="d-flex justify-content-between">
						<div class="d-flex justify-content-left">
							<span v-if="entity.type == 'player'" class="img" :style="{ backgroundImage: 'url(' + getPlayer(entity.id).avatar + ')' }"></span>
							<img v-else src="@/assets/_img/styles/monster.svg" class="img" />
							{{ entity.name }}
						</div>
						<span>
							<a v-if="entity.type == 'npc'" class="mr-2" v-b-tooltip.hover title="Edit (Coming Soon)"><i class="fas fa-pencil-alt"></i></a>
							<a class="red" v-b-tooltip.hover title="Remove Character" @click="remove(entity['.key'], entity.name)"><i class="fas fa-minus-circle"></i></a>
						</span>
					</li>
				</ul>
			</div>
			<transition enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">	
				<div v-if="showSide == true" class="npc bg-gray" >
					<a @click="hideSide()">Hide</a>
					<NPC :npc="viewNPC[0]" />
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
	import NPC from '@/components/NPC.vue'
	import firebase from 'firebase'
	import axios from 'axios'
	import { db } from '@/firebase'

	export default {
		name: 'EditCampaign',
		components: {
			Sidebar,
			Crumble,
			NPC
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				userId: firebase.auth().currentUser.uid,
				loading: true,
				loadingEntities: true,
				search: '',
				searchResults: [],
				noResult: '',
				npcs: [],
				auto_npcs: [],
				viewNPC: [],
				showSide: false
			} 
		},
		mounted() {
			axios.get("http://www.dnd5eapi.co/api/monsters/")
			.then(response => {this.npcs = response.data.results})
		},
		firebase() {
			return {
				players: {
					source: db.ref('players/' + this.userId),
					readyCallback: () => this.loading = false
				},
				campaignPlayers: {
					source: db.ref('campaigns/' + this.userId + '/' + this.campaignId + '/players'),
					readyCallback: () => this.loadingCampPlayers = false
				},
				entities: {
					source: db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities').orderByChild('name'),
					readyCallback: () => this.loadingEntities = false
				}
			}
		},
		methods: {
			async getNPC(id) {
				return await axios.get("http://www.dnd5eapi.co/api/monsters/" + id)
				.then(response => {return response.data})
			},
			async add(id, type, name) {
				var entity = {
					id: id,
					name: name,
					type: type,
					initiative: 0,
					active: true,
				}
				if(type == 'npc') {
					var npc_data = await this.getNPC(id);
					entity.str = npc_data.strength
					entity.dex = npc_data.dexterity
					entity.con = npc_data.constitution
					entity.int = npc_data.intelligence
					entity.wis = npc_data.wisdom
					entity.cha = npc_data.charisma
					entity.maxhp = npc_data.hit_points
					entity.curhp = npc_data.hit_points
					entity.ac = npc_data.armor_class
					entity.active = false
				}
				else if (type == 'player') {
					entity.curhp = this.getPlayer(id).maxhp
				}
				db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities').push(entity);
			},
			remove(id, name) {
				db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities').child(id).remove();
			},
			searchNPC() {
				this.searchResults = []
				for (var i in this.npcs) {
					var m = this.npcs[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase())) {
						axios.get(m.url).then(response => {
							this.noResult = ''
							this.searchResults.push(response.data)
						})
					}
					if(this.searchResults == '') {
						this.noResult = 'No results for "' + this.search + '"';
					}
				}
			},
			showNPC(npc) {
				this.viewNPC = []
				this.viewNPC.push(npc)
				this.showSide = true;
			},
			hideSide() {
				this.showSide = false;
			},
			getPlayer(entityKey) {
				var player = this.players.find(function(element) {
					return element['.key'] == entityKey
				});
				return player
			},
			checkEntity(playerKey) {
				var entity = this.entities.find(function(element) {
					return element.id == playerKey
				});
				return entity
			}
		}
	}
</script>

<style lang="css" scoped>
.container {
	padding-top:20px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows:auto 1fr;
	grid-gap: 20px;
	grid-template-areas: 
	"info info"
	"add added";
}
.info {
	grid-area:info;
}
.nav { 
	background:#191919;
}
#add {
	grid-area: add;
}
.tab-content {
	padding:15px 10px;
}
#added {
	margin-top:33px;
	padding:15px 10px;
	grid-area:added;
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
ul.entities li a {
	font-size:18px;
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
.slideInRight {
	animation-duration: 0.5s;
}
.slideOutRight {
	animation-duration: 0.5s;
}
.faded {
	opacity: .3;
}
</style>