<template>
    <div id="my-content" class="container">
      <h1>My content</h1>
      <p>Welcome to your personal content.</p>
      
      <div class="input-group">
        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('newCampaign') }" v-model="newCampaign" v-validate="'min:5|required'" name="newCampaign" placeholder="Add new campaign" />
          <div class="input-group-append">
            <button class="btn" @click="addCampaign()"><i class="fas fa-plus"></i> Add</button>
          </div>        
      </div>
      <p class="validate bg-red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>

      <h2 class="mt-3">My campaigns</h2>
      <div v-if="loading == true" class="loader"><span>Loading Campaigns...</span></div>
      <ul id="campaigns" class="mt-3">
        <transition-group name="list" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
          <li class="bg-gray" v-for="(campaign, index) in campaigns" :key="index">
            <h2>{{ campaign.campaign }} <a v-b-tooltip.hover title="Delete" class="red" @click="deleteCampaign(campaign['.key'])"><i class="fas fa-trash-alt"></i></a></h2>
            <router-link :to="'/my-content/edit-campaign/'+campaign['.key']"> Edit</router-link>
            <router-link :to="'/my-content/encounters/'+campaign['.key']"> Encounters</router-link>
            <!-- <router-link :to="{ name: 'EditCampaign', params: {campaign-id: campaign['.key']} }"> Edit</router-link> -->
            <!-- PLAYERS IN CAMPAIGN -->
            <!-- <p v-for="(player, index) in campaign.players" :key="player['.key']">
              <span v-for="players in getPlayers" v-if="players['.key'] == index">{{ players.character_name }}</span>
            </p> -->
          </li>
        </transition-group>
      </ul>
    </div>
</template>

<script>
import { db } from '@/firebase'

export default {
  name: 'Campaigns',
  data() {
    return {
      userId: this.$store.getters.getUser.uid,
      newCampaign: '',
      loading: true,
    }
  },
  firebase() {
    return {
      getPlayers: db.ref('players/' + this.userId),
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
        } else {
          //console.log('Not valid');
        }
      })
    },
    deleteCampaign(key) {
        this.$snotify.error('Are you sure you want to delete the campaign?', 'Delete campaign', {
        buttons: [
            {text: 'Yes', action: (toast) => {db.ref('campaigns/'+ this.userId).child(key).remove(); this.$snotify.remove(toast.id); }, bold: false},
            {text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},        ]
        });
    },
    // getPlayer(playerId) {
    //   player = db.ref('players/' + this.userId + '/' + playerId)
    //   return player
    // }
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
</style>