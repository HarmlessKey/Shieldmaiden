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
      <ul id="campaigns" class="mt-3">
        <transition-group name="list" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
          <li class="bg-gray" v-for="(campaign, index) in campaigns" :key="index">
            <h2>{{ campaign.campaign }} <a class="red" @click="deleteCampaign(campaign['.key'])"><i class="fas fa-trash-alt"></i></a></h2>
            <router-link :to="'/my-content/edit-campaign/'+campaign['.key']"> Edit</router-link>
            <router-link :to="'/my-content/encounters/'+campaign['.key']"> Encounters</router-link>
            <!-- <router-link :to="{ name: 'EditCampaign', params: {campaign-id: campaign['.key']} }"> Edit</router-link> -->
            <!-- PLAYERS IN CAMPAIGN -->
            <p v-for="(player, index) in campaign.players" :key="player['.key']">
              <span v-for="players in getPlayers" v-if="players['.key'] == index">{{ players.character_name }}</span>
            </p>
          </li>
        </transition-group>
      </ul>
    </div>
</template>

<script>
import firebase from 'firebase'
import { db } from '@/firebase'

export default {
  name: 'Campaigns',
  data() {
    return {
      user: this.$store.getters.getUser,
      newCampaign: '',
    }
  },
  firebase() {
    const userId = firebase.auth().currentUser.uid
    return {
      campaigns: db.ref('campaigns/'+ userId),
      getPlayers: db.ref('players/'+ userId)
    }
  },
  methods: {
    addCampaign() {
      const userId = firebase.auth().currentUser.uid;
      this.$validator.validateAll().then((result) => {
        if (result) {
          db.ref('campaigns/'+userId).push({campaign: this.newCampaign});
          this.newCampaign = '';
        } else {
          console.log('Not valid');
        }
      })
    },
    deleteCampaign(key) {
      const userId = firebase.auth().currentUser.uid;
        const campaignId = this.$route.params.id;
        var vm = this;

        vm.$snotify.error('Are you sure you want to delete the campaign?', 'Delete campaign', {
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        buttons: [
            {text: 'Yes', action: (toast) => {db.ref('campaigns/'+userId).child(key).remove(); vm.$snotify.remove(toast.id); }, bold: false},
            {text: 'No', action: (toast) => {console.log('Clicked: No'); vm.$snotify.remove(toast.id); }, bold: true},        ]
        });
      
    },
    getPlayer(playerId) {
      player = db.ref('players/'+userId+'/'+playerId)
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
</style>