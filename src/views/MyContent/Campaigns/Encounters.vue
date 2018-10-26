<template>
    <div id="my-content" class="container">
      <h1>Campaign: {{ newCampaign.campaign }}</h1>
      <p>Manage the encounters in your campaign "{{ newCampaign.campaign }}".</p>
      
      <div class="input-group">
        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('newEncounter') }" v-model="newEncounter" v-validate="'required'" name="newEncounter" placeholder="Encounter Title" />
          <div class="input-group-append">
            <button class="btn" @click="addEncounter()"><i class="fas fa-plus"></i> Add Encounter</button>
          </div>        
      </div>
      <p class="validate bg-red" v-if="errors.has('newEncounter')">{{ errors.first('newEncounter') }}</p>

      <!-- SHOW ENCOUNTERS -->
      <h2 class="mt-3">Encounters</h2>
      <table class="table">
        <thead>
            <th>#</th>
            <th>Encounter</th>
            <th></th>
        </thead>
        <tbody>
            <tr v-for="(encounter, index) in encounters" :key="encounter['.key']" v-if="encounter.finished == false">
                <td>{{ index + 1 }}</td>
                <td>{{ encounter.encounter }}</td>
                <td class="text-right">
                    <router-link class="green" :to="'/my-content/run-encounter/' + campaignId + '/' + encounter['.key']" v-b-tooltip.hover title="Run Encounter"><i class="fas fa-play-circle"></i></router-link>
                    <router-link class="mx-2" :to="'/my-content/encounter/'+encounter['.key']" v-b-tooltip.hover title="Edit"><i class="fas fa-edit"></i></router-link>
                    <a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter['.key'])"><i class="fas fa-trash-alt"></i></a>
                </td>
            </tr>
        </tbody>
      </table>

      <h2>Finished Encounters</h2>
      <table class="table">
        <thead>
            <th>#</th>
            <th>Encounter</th>
            <th></th>
        </thead>
        <tbody>
            <tr v-for="(encounter, index) in encounters" :key="encounter['.key']" v-if="encounter.finished == true">
                <td>{{ index + 1 }}</td>
                <td>{{ encounter.encounter }}</td>
                <td class="text-right">
                    <router-link class="mx-2" :to="'/my-content/encounter-statistics/'+encounter['.key']" v-b-tooltip.hover title="View Statistics"><i class="fas fa-chart-area"></i></router-link>
                    <a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter['.key'])"><i class="fas fa-trash-alt"></i></a>
                </td>
            </tr>
        </tbody>
      </table>
    </div>
</template>

<script>
import firebase from 'firebase'
import { db } from '@/firebase'

export default {
  name: 'EditCampaign',
  firebase() {
    const userId = firebase.auth().currentUser.uid;
    const campaignId = this.$route.params.id

    return {
      campaigns: db.ref('campaigns/'+userId),
      campaignsObj: {
        source: db.ref('campaigns/'+userId),
        asObject: true
      },
      encounters: db.ref('encounters/'+userId).child(campaignId)
    }
  },
  data() {
    return {
        newEncounter: '',
        campaignId: this.$route.params.id,
      newCampaign: {}
    }
  },
  created() {
    let campaign = this.campaignsObj[this.$route.params.id]
    this.newCampaign = {
       campaign: campaign.campaign
    }
  },
  methods: {
    addEncounter() {
      const userId = firebase.auth().currentUser.uid;
      const campaignId = this.$route.params.id;

      this.$validator.validateAll().then((result) => {
        if (result) {
          db.ref('encounters/'+userId+'/'+campaignId).push({encounter: this.newEncounter, round: 0, turn: 0, finished: false});
          this.newEncounter = '';
          this.$snotify.success('Succes!');
        } else {
          console.log('Not valid');
        }
      })
    },
    deleteEncounter(key) {
        const userId = firebase.auth().currentUser.uid;
        const campaignId = this.$route.params.id;
        var vm = this;

        vm.$snotify.confirm('Are you sure you want to delete the encounter?', 'Delete encounter', {
        timeout: 5000,
        showProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        buttons: [
            {text: 'Yes', action: () => db.ref('encounters/' + userId + '/' + campaignId).child(key).remove(), bold: false},
            {text: 'No', action: () => console.log('Clicked: No')},
        ]
        });
        

        
    }
  }
}
</script>

<style lang="css" scoped>
.container {
  padding-top:20px;
}
table router-link, table a {
    font-size:15px;
}
th:first-child, td:first-child {
    width:10px;
}
</style>