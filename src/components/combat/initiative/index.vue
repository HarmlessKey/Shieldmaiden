<template>
	<div id="container" v-if="width > 576">
		<Turns />
		<div class="players">
			<h2 
				class="componentHeader" :class="{ shadow : setShadowPlayer > 0 }">
				<span><i class="fas fa-helmet-battle"></i> Players</span>
			</h2>
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scrollPlayer"> 
				<Players :players="_players" />
			</q-scroll-area>
		</div>
		<div class="npcs">
			<h2 class="componentHeader" :class="{ shadow : setShadowNPC > 0 }">
				<span><i class="fas fa-dragon"></i> NPC's</span>
			</h2>
			<!-- <q-checkbox dark v-model="selected" :true-value="Object.keys(_npcs).map(Number)" :false-value="[]" label="Select all" /> -->
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scrollNPC">
				<NPCs :npcs="_npcs" />	
			</q-scroll-area>
		</div>
		<div class="set">
			<h2 class="componentHeader" :class="{ shadow : setShadowOverview > 0 }">
				<span>Active entities</span>
			</h2>
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scrollOverview">
				<Overview :active="_active" :idle="_idle" />
			</q-scroll-area>
		</div>
	</div>

	<!-- MOBILE -->
	<div v-else class="mobile">
		<div class="top bg-gray">
			<div class="left">
				<router-link v-if="!demo" :to="`/encounters/${$route.params.campid}`" class="mr-3">
					<i class="far fa-angle-left"></i>
				</router-link>
				<span 
					v-if="!demo" 
					@click="broadcast()" 
					class="live" 
					:class="{'active': broadcasting['.value'] == $route.params.campid }"
				>
					live
				</span>
			</div>

			Initiative

			<a @click="set_turn({turn: 0, round: 1})">
				Start <i class="far fa-angle-right"></i>
			</a>
		</div>
		<q-tab-panels
      v-model="panel"
      animated
      swipeable
      infinite
      class="transparent-bg"
    >
      <q-tab-panel name="players">
				<h2>Players</h2>
        <Players :players="_players" />
      </q-tab-panel>
      <q-tab-panel name="npcs">
				<h2>NPC's</h2>
        <NPCs :npcs="_npcs" />
      </q-tab-panel>
      <q-tab-panel name="overview">
				<a class="btn btn-block" @click="set_turn({turn: 0, round: 1})">
					Start encounter
				</a>
        <Overview :active="_active" :idle="_idle" />
      </q-tab-panel>
		</q-tab-panels>

		<div class="menu bg-gray-dark">
			<a 
				@click="switchTab('previous')"
				:class="{ disabled: panel === 'players' }"
			>
				<i class="fas fa-angle-left"></i>
			</a>
			{{ panel.capitalize() }}
			<a 
				@click="switchTab('next')"
				:class="{ disabled: panel === 'overview' }"
			>
				<i class="fas fa-angle-right"></i>
			</a>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { mapActions, mapGetters } from 'vuex';
	import { db } from '@/firebase';

	import Turns from '@/components/combat/Turns.vue';
	import Players from './Players.vue';
	import NPCs from './NPCs.vue';
	import Overview from './Overview.vue';

	export default {

		name: 'SetInitiative',
		props: ['_active', '_idle', 'width'],
		components: {
			Turns,
			Players,
			NPCs,
			Overview
		},
		data () {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.getUser.uid,
				setShadowPlayer: 0,
				setShadowNPC: 0,
				setShadowOverview: 0,
				panel: "players"
			}
		},
		firebase() {
			return {
				broadcasting: {
					source: db.ref(`broadcast/${this.userId}/live`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'entities',
				'path',
			]),
			_players: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.entityType == 'player' || entity.entityType == 'companion';
					})
					.sortBy('name' , 'desc')
					.value()
			},
			_npcs: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.entityType == 'npc';
					})
					.sortBy('name' , 'desc')
					.value()
			},
		},
		methods: {
			...mapActions([
				'set_turn'
			]),
			shadow() {
				this.setShadowPlayer = this.$refs.scrollPlayer.scrollPosition;
				this.setShadowNPC = this.$refs.scrollNPC.scrollPosition;
				this.setShadowOverview = this.$refs.scrollOverview.scrollPosition;
			},
			switchTab(direction) {
				if(this.panel === "players") {
					this.panel = (direction === "next") ? "npcs" : "players";
				} else if(this.panel === "npcs") {
					this.panel = (direction === "next") ? "overview" : "players";
				} else if(this.panel === "overview") {
					this.panel = (direction === "previous") ? "npcs" : "overview";
				}
			},
			broadcast() {
				//Save the current campaign that is being broadcasted
				if(this.broadcasting['.value'] == this.$route.params.campid) {
					db.ref(`broadcast/${this.userId}/live`).remove()
				} else {
					db.ref(`broadcast/${this.userId}/live`).set(this.$route.params.campid)
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
#container {
	padding: 10px;
	width: 100vw;
	height: calc(100% - 50px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 60px auto;
	grid-gap: 10px;
	grid-template-areas: 
	"turns turns turns"
	"players npcs set";
	position: absolute;

	.q-scrollarea{
		padding:0 0 15px 0;
		height: calc(100% - 45px);
	}
	
	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.9); 
			}
		}
	}
	.players, .npcs, .set {
		background: rgba(38, 38, 38, .8);
		overflow: hidden;
	}
	.players {
		grid-area: players;
	}
	.npcs {
		grid-area: npcs;
	}
	.set {
		grid-area: set;
	}
}
.initiative-move {
  transition: transform .5s;
}
@media only screen and (max-width: 600px) {
	#container {
		grid-template-columns: auto;
		grid-template-rows: 60px 1fr 1fr 1fr;
		grid-gap: 10px;
		grid-template-areas:
		"turns"
		"players"
		"npcs"
		"set";
	}
}

.mobile {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 60px 1fr 48px;

	.top {
		display: flex;
		justify-content: space-between;
		line-height: 60px;
		padding: 0 15px;

		.left {
			display: flex;
			justify-content: flex-start;
			align-items: center;
		}

		a {
			font-size: 25px;
		}
	}
	.transparent-bg {
		background: rgba(38, 38, 38, .8);
	}
	ul.entities {
		li {
			background-color: #191919 !important;
		}
	}
	.menu {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 60px;
		line-height: 60px;
		display: flex;
		justify-content: space-between;
		
		a {
			font-size: 25px;
			padding: 0 15px;

			&.disabled {
				opacity: .1;
				cursor: forbidden;
			}
		}
	}
}
</style>