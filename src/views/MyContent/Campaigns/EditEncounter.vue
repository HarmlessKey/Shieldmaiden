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
                        <ul class="players">
                            <li v-for="player in players" :key="player['.key']" class="d-flex justify-content-between">
                                <span class="img" :style="{ backgroundImage: 'url(' + player.avatar + ')' }"></span>
                                {{ player.character_name }}
                                <a class="green" v-b-tooltip.hover title="Add Character" @click="add(player['.key'], 'player')"><i class="fas fa-plus-circle"></i></a>
                            </li>
                        </ul>
                    </div>
                    <div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
                        <div class="input-group">
                            <input type="text" v-model="search" placeholder="Search" class="form-control"/>
                            <div class="input-group-append">
                                <button class="btn" @click="addCampaign()"><i class="fas fa-search"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="added" class="bg-gray">
                <div v-if="loadingParticipants == true" class="loader"><span>Loading Participants...</span></div>
                <ul class="players">
                    <li v-for="participant in participants" :key="participant['.key']" class="d-flex justify-content-between">
                        Player: {{ participant.participant }}
                        <a class="red" v-b-tooltip.hover title="Remove Character" @click="remove(participant['.key'], participant.type)"><i class="fas fa-minus-circle"></i></a>
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
        campaignId: this.$route.params.campid,
        encounterId: this.$route.params.encid,
        userId: firebase.auth().currentUser.uid,
        loading: true,
        loadingParticipants: true,
        search: '',
    }
  },
  firebase() {
    return {
      players: {
        source: db.ref('players/' + this.userId),
        readyCallback: () => this.loading = false
      },
      participants: {
        source: db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants'),
        readyCallback: () => this.loadingParticipants = false
      }
    }
  },
  methods: {
    add(id, type) {
        db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants').push({participant: id, type: type});
        this.$snotify.success(type + ' added.', 'Critical hit!', {
            position: "rightTop"
        });
    },
    remove(id, type) {
        db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants').child(id).remove();
        this.$snotify.success(type + ' removed.', 'Critical hit!', {
            position: "rightTop"
        });
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
ul.players {
    list-style:none;
    padding:0;
    line-height:30px;
}
ul.players li {
    margin-bottom:5px;
}
ul.players .img {
    width:30px;
    height:30px;
    display:block;
    background-size:cover;
    background-position:top center;
    border:solid 1px #b2b2b2;
}
ul.players li a {
    font-size:18px;
}
</style>