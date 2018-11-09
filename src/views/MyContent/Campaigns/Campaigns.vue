<template>
  <div id="hasSide">
    <Sidebar/>
    <div id="my-content" class="container">
      <h1>My content</h1>
      <p>Welcome to your personal content.</p>
      
      <div class="input-group">
        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('newCampaign') }" v-model="newCampaign" v-validate="'required'" name="newCampaign" placeholder="Add new campaign" />
          <div class="input-group-append">
            <button class="btn" @click="addCampaign()"><i class="fas fa-plus"></i> Add</button>
          </div>        
      </div>
      <p class="validate red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>

      <h2 class="mt-3">My campaigns</h2>
      <div v-if="loading == true" class="loader"><span>Loading Campaigns...</span></div>
      <ul id="campaigns" class="mt-3">
        <transition-group name="list" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
          <li class="bg-gray" v-for="(campaign, index) in campaigns" :key="index">
            <h2>{{ index + 1 }}. {{ campaign.campaign }} <a v-b-tooltip.hover title="Delete" class="red" @click="deleteCampaign(campaign['.key'])"><i class="fas fa-trash-alt"></i></a></h2>
            <router-link :to="'/campaigns/'+campaign['.key']"> Edit</router-link>
            <router-link :to="'/encounters/'+campaign['.key']"> Encounters</router-link>

            <!-- PLAYERS IN CAMPAIGN -->
            <h2 class="players">Players</h2>
            <div class="d-flex justify-content-center">
              <span v-for="player in campaign.players" :key="player['.key']" v-b-tooltip.hover :title="getPlayer(player.player).character_name" class="img" :style="{ backgroundImage: 'url(' + getPlayer(player.player).avatar + ')' }"></span>
            </div>
          </li>
        </transition-group>
      </ul>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/SidebarMyContent.vue'
import { db } from '@/firebase'

export default {
  name: 'Campaigns',
  components: {
    Sidebar,
  },
  data() {
    return {
      userId: this.$store.getters.getUser.uid,
      newCampaign: '',
      loading: true,
    }
  },
  firebase() {
    return {
      players: db.ref('players/' + this.userId),
      campaigns: {
        source: db.ref('campaigns/' + this.userId),
        readyCallback: () => this.loading = false
      }
    }
  },
  methods: {
    addCampaign() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          db.ref('campaigns/' + this.userId).push({campaign: this.newCampaign});
          this.newCampaign = '';
          this.$snotify.success('Campaign added.', 'Critical hit!', {
            position: "rightTop"
          });
        } else {
          //console.log('Not valid');
        }
      })
    },
    deleteCampaign(key) {
        this.$snotify.error('Are you sure you want to delete the campaign?', 'Delete campaign', {
          buttons: [
              {text: 'Yes', action: (toast) => {db.ref('campaigns/'+ this.userId).child(key).remove(); this.$snotify.remove(toast.id); }, bold: false},
              {text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
          ]
        });
    },
    getPlayer(participantKey) {
      let player = this.players.find(function(element) {
        return element['.key'] == participantKey
      });
      return player
		}
  }
}
</script>

<style lang="css" scoped>
.container {
  padding-top:20px;
}
ul#campaigns {
  list-style:none;
  padding:0;
}
ul#campaigns li {
  padding:10px;
  margin-bottom:15px
}
a {
  cursor:pointer;
}
.img {
		width: 50px;
		height: 50px;
		display: block;
		background-size: cover;
		background-position: top center;
		border: solid 1px #b2b2b2;
		background-color: #000;
    margin-right: 10px;
    margin:2px;
}
h2.players {
  margin-bottom: 5px !important;
  text-align: center;
}
</style>