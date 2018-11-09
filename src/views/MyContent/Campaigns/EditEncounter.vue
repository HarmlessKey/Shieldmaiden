<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container">
				<div class="info">
					<h1>Edit Encounters</h1>
					<p>Add players and monsters to your encounter.</p>
				</div>

				<!-- ADD PLAYERS AND MONSTERS -->
				<div id="add" class="bg-gray">
					<ul class="nav nav-tabs" id="myTab" role="tablist">
							<li class="nav-item">
									<a class="nav-link active" id="manual-tab" data-toggle="tab" href="#manual" role="tab" aria-controls="manual" aria-selected="true">Add Player</a>
							</li>
							<li class="nav-item">
									<a class="nav-link" id="select-tab" data-toggle="tab" href="#select" role="tab" aria-controls="select" aria-selected="false">Add Monsters</a>
							</li>
					</ul>
					<div class="tab-content">
						<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
								<div v-if="loading == true" class="loader"><span>Loading Players...</span></div>
								<ul class="entities">
										<li v-for="player in campaignPlayers" :key="player['.key']" class="d-flex justify-content-between" :class="{ 'faded' : checkParticipant(player.player) }">
												<div class="d-flex justify-content-left">
													<span class="img" :style="{ backgroundImage: 'url(' + getPlayer(player.player).avatar + ')' }"></span>
													{{ getPlayer(player.player).character_name }}
												</div>
												
												<a v-if="!checkParticipant(player.player)" class="green" v-b-tooltip.hover title="Add Character" @click="add(player.player, 'player', getPlayer(player.player).character_name)"><i class="fas fa-plus-circle"></i></a>
												<span v-else>Added</span>
										</li>
								</ul>
						</div>
						<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
							<div class="input-group mb-3">
								<input type="text" v-model="search" @change="searchMonster()" placeholder="Search Monster" class="form-control"/>
								<div class="input-group-append">
									<button class="btn"><i class="fas fa-search"></i></button>
								</div>
							</div>
							<ul class="entities">
								<p v-if="noResult" class="red">{{ noResult }}</p>
								<li v-for="monster in searchResults" class="d-flex justify-content-between">
									<div class="d-flex justify-content-left">
										<a @click="showMonster(monster)" class="mr-2" v-b-tooltip.hover title="Show Info"><i class="fas fa-info-circle"></i></a>
										{{ monster.name }}
									</div>
									<a class="green" v-b-tooltip.hover title="Add Monster" @click="add(monster.index, 'monster', monster.name)"><i class="fas fa-plus-circle"></i></a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div id="added" class="bg-gray">
					<div v-if="loadingParticipants == true" class="loader"><span>Loading Participants...</span></div>
					<ul class="entities">
						<li v-for="participant in participants" :key="participant['.key']" class="d-flex justify-content-between">
							<div class="d-flex justify-content-left">
								<span v-if="participant.type == 'player'" class="img" :style="{ backgroundImage: 'url(' + getPlayer(participant.participant).avatar + ')' }"></span>
								<img v-else src="@/assets/_img/styles/monster.svg" class="img" />
								{{ participant.name }}
							</div>
							<a class="red" v-b-tooltip.hover title="Remove Character" @click="remove(participant['.key'], participant.name)"><i class="fas fa-minus-circle"></i></a>
						</li>
					</ul>
				</div>
			<transition enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">	
				<div v-if="showSide == true" class="monster bg-gray" >
					<a @click="hideSide()">Hide</a>
					<Monster :monster="viewMonster[0]" />
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
import Sidebar from '@/components/SidebarMyContent.vue'
import Monster from '@/components/Monster.vue'
import firebase from 'firebase'
import axios from 'axios'
import { db } from '@/firebase'

export default {
	name: 'EditCampaign',
	components: {
			Sidebar,
			Monster
	},
	data() {
		return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				userId: firebase.auth().currentUser.uid,
				loading: true,
				loadingParticipants: true,
				search: '',
				searchResults: [],
				noResult: '',
				monsters: [],
				auto_monsters: [],
				viewMonster: [],
				showSide: false
		} 
	},
	mounted() {
		axios.get("http://www.dnd5eapi.co/api/monsters/")
				.then(response => {this.monsters = response.data.results})
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
			participants: {
				source: db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants').orderByChild('name'),
				readyCallback: () => this.loadingParticipants = false
			}
		}
	},
	methods: {
		add(id, type, name) {
			db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants').push({
				participant: id,
				name: name,
				type: type,
				initiative: 0
			});
			this.$snotify.success(name + ' added.', 'Critical hit!', {
					position: "rightTop"
			});
		},
		remove(id, name) {
			db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants').child(id).remove();
			this.$snotify.success(name + ' removed.', 'Critical hit!', {
					position: "rightTop"
			});
		},
		searchMonster() {
			this.searchResults = []
			for (var i in this.monsters) {
				var m = this.monsters[i]
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
		showMonster(monst) {
			this.viewMonster = []
			this.viewMonster.push(monst)
			this.showSide = true;
		},
		hideSide() {
			this.showSide = false;
		},
		getPlayer(participantKey) {
			var player = this.players.find(function(element) {
				return element['.key'] == participantKey
			});
			return player
		},
		checkParticipant(playerKey) {
			var participant = this.participants.find(function(element) {
				return element.participant == playerKey
			});
			return participant
		}
	}
}
</script>

<style lang="css" scoped>
.container {
	padding-top:20px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows:60px 1fr;
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
.monster {
	padding:15px;
	position:fixed;
	right:0;
	top:80px;
	height: calc(100vh - 80px);
	width:330px;
	z-index:99;
	overflow: auto;
	border-left:solid 1px #000;
	box-shadow: 0 10px 8px #000;
}

.slideInRight {
	transition-duration: 0.1s;
}

.slideOutRight {
	transition-duration: 0.1s;
}
.faded {
	opacity: .3;
}
</style>