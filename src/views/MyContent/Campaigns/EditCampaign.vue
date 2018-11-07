<template>
<div id="hasSide">
    <Sidebar/>
    <div id="my-content" class="container">
      <div class="info">
        <h2>Edit your campaign</h2>
        <div class="input-group mb-4">
          <input class="form-control" type="text" />
          <div class="input-group-append">
            <button class="btn" @click="changeName()">Change Name</button>
          </div>
        </div>
        <router-link to="/campaigns">Back to campaign overview</router-link>
      </div>

      <div id="add" class="bg-gray">
        <h2>All players</h2>
        <div v-if="loading == true" class="loader"><span>Loading Players...</span></div>
        <ul class="entities">
          <li v-for="player in players" :key="player['.key']" class="d-flex justify-content-between" :class="{ 'faded' : checkPlayer(player['.key']) }">
            <div class="d-flex justify-content-left">
              <span class="img" :style="{ backgroundImage: 'url(' + player.avatar + ')' }"></span>
              {{ player.character_name }}
            </div>
            
            <a v-if="!checkPlayer(player['.key'])" class="green" v-b-tooltip.hover title="Add Character" @click="addPlayer(player['.key'], player.character_name)"><i class="fas fa-plus-circle"></i></a>
            <span v-else>Added</span>
          </li>
        </ul>
      </div>

      <div id="added" class="bg-gray">
        <h2>{{ campaignPlayers.length }} Players in campaign</h2>
        <div v-if="loadingCampPlayers == true" class="loader"><span>Loading Players...</span></div>
        <ul class="entities">
          <li v-for="player in campaignPlayers" :key="player['.key']" class="d-flex justify-content-between">
            <div class="d-flex justify-content-left">
              <span class="img" :style="{ backgroundImage: 'url(' + getPlayer(player).avatar + ')' }"></span>
              {{ getPlayer(player).character_name }}
            </div>
            
            <a class="red" v-b-tooltip.hover title="Remove Character" @click="removePlayer(player['.key'], getPlayer(player).character_name)"><i class="fas fa-minus-circle"></i></a>
          </li>
        </ul>
      </div>


    </div>
</div>
</template>

<script>
import Sidebar from '@/components/SidebarMyContent.vue'
import firebase from 'firebase'
import { db } from '@/firebase'

export default {
  name: 'EditCampaign',
  components: {
    Sidebar,
  },
  data() {
    return {
      newCampaign: '',
      campaignId: this.$route.params.id,
      loading: true,
      loadingCampPlayers: true,
      userId: firebase.auth().currentUser.uid
    }
  },
  firebase() {
    return {
      campaign: db.ref('campaigns/' + this.userId + '/' + this.campaignId),
      players: {
				source: db.ref('players/' + this.userId),
				readyCallback: () => this.loading = false
      },
      campaignPlayers: {
				source: db.ref('campaigns/' + this.userId + '/' + this.campaignId + '/players'),
				readyCallback: () => this.loadingCampPlayers = false
      }
    }
  },
  methods: {
    changeName() {
      this.$firebaseRefs.campaign.child(campaignId).set(this.newCampaign);
    },
    addPlayer(id, name) {
			db.ref('campaigns/' + this.userId + '/' + this.campaignId + '/players').push({
				player: id
			});
			this.$snotify.success(name + ' added.', 'Critical hit!', {
					position: "rightTop"
			});
    },
    removePlayer(id, name) {
			db.ref('campaigns/' + this.userId + '/' + this.campaignId + '/players').child(id).remove();
			this.$snotify.success(name + ' removed.', 'Critical hit!', {
					position: "rightTop"
			});
		},
    getPlayer(participant) {
				var player = this.players.find(function(element) {
					return element['.key'] == participant.player
        });
				return player
    },
    checkPlayer(playerKey) {
			var participant = this.campaignPlayers.find(function(element) {
				return element.player == playerKey
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
	grid-template-rows:120px 1fr;
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
  padding: 15px 10px;
	grid-area: add;
}
.tab-content {
	padding:15px 10px;
}
#added {
		padding: 15px 10px;
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
	overflow: scroll;
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