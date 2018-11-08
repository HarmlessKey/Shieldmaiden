<template>
  <div>
    <div class="container" v-if="encountersObj[encounterId].round == 0">
      <h2>Set Initiative</h2>
      <ul>
        <li v-for="player in participants">
          {{ player.name }}
        </li>
      </ul>
    </div>
    <div v-else>
      <Turns :round="encountersObj[encounterId].round"/>
      <div id="combat">
        <Current />
        <Targets />
        <Actions />
        <Side />
      </div>
    </div>
  </div>
</template>

<script>
import Actions from '@/components/combat/Actions.vue'
import Turns from '@/components/combat/Turns.vue'
import Current from '@/components/combat/Current.vue'
import Targets from '@/components/combat/Targets.vue'
import Side from '@/components/combat/Side.vue'
import firebase from 'firebase'
import { db } from '@/firebase'

export default {
  name: 'app',
  components: {
    Actions,
    Turns,
    Current,
    Targets,
    Side,
  },
  firebase() {
    return {
      encounters: db.ref('encounters/' + this.userId + '/' + this.campaignId),
      participants: db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants'),
      encountersObj: {
        source: db.ref('encounters/' + this.userId + '/' + this.campaignId),
        asObject: true
      }
    }
  },
  data() {
    return {
      userId: firebase.auth().currentUser.uid,
      campaignId: this.$route.params.campid,
      encounterId: this.$route.params.encid,
    }
  },
  created() {
    // let encounter = this.encountersObj[this.encounterId];
    // this.newEncounter = encounter
  },
  methods: {
    setAll() {

    },
    setInitiative() {
      
    }
  }
}
</script>

<style>
#combat {
  width: calc(100vw - 10px);
  height: calc(100vh - 185px);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-gap: 10px;
  grid-template-areas: 
    "current targets actions side";
}

@media only screen and (max-width: 600px) {
  #combat {
    grid-template-rows: 1fr 3fr 3fr 3fr 3fr;
    grid-template-columns: auto;
    grid-gap: 5px;
    grid-template-areas: 
      "header"
      "current"
      "targets"
      "actions"
      "side";
  }
}

</style>
