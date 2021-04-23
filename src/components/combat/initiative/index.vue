<template>
	<div id="container" v-if="width > 576">
		<!-- <Turns /> -->
		<Turns 
			:next="_active[0]"
		/>
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
	<div v-else class="mobile-init">
		<Turns />
		
		<div class="menu bg-gray-dark">
			<q-select
				dark filled square
				v-model="panel"
				:options="panels"
			>
				<template v-slot:selected>
					<q-item>
						<q-item-section avatar>
							<q-icon :name="panels.filter( item => { return item.value === panel })[0].icon"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="panels.filter( item => { return item.value === panel })[0].label"/>
						</q-item-section>
					</q-item>
				</template>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="panel === scope.opt.value"
						@click="panel = scope.opt.value"
					>
						<q-item-section avatar>
							<q-icon :name="scope.opt.icon"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="scope.opt.label"/>
						</q-item-section>
					</q-item>
				</template>
			</q-select>
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
				<a class="btn btn-block mb-3" @click="set_turn({turn: 0, round: 1})">
					Start encounter
				</a>
        <Overview :active="_active" :idle="_idle" />
      </q-tab-panel>
		</q-tab-panels>
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
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				setShadowPlayer: 0,
				setShadowNPC: 0,
				setShadowOverview: 0,
				panel: "players",
				panels: [
					{
						label: "Players initiative",
						value: "players",
						icon: "fas fa-helmet-battle"
					},
					{
						label: "NPC's initiative",
						value: "npcs",
						icon: "fas fa-dragon"
					},
					{
						label: "Overview",
						value: "overview",
						icon: "fas fa-list-ul"
					}
				]
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
				'encounter',
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
	padding: 5px;
	width: 100vw;
	height: calc(100% - 50px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 60px auto;
	grid-gap: 5px;
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
@media only screen and (max-width: 900px) {
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

.mobile-init {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 60px 60px 1fr;
	height: calc(100vh - 50px);
	grid-template-areas:
		"turns"
		"menu"
		"overview";

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
		.menu {
			grid-area: menu;
		}
	}
	.transparent-bg {
		background: rgba(38, 38, 38, .8);
	}
	ul.entities {
		li {
			background-color:$gray-dark !important;
		}
	}
}
</style>