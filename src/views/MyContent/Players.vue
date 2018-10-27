<template>
  <div id="players" class="container">
    <h1>Your players</h1>
    <p>These are the players that you can use in your campaigns.</p>

    <a class="btn btn-block mb-3" v-b-modal.addModal><i class="fas fa-plus-square"></i> Add player</a>

    <div v-if="loading == true" class="loader"><span>Loading Players...</span></div>
    <ul class="players">
        <transition-group name="list" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
            <li class="bg-gray" v-for="(player, index) in players" :key="index">
            <span class="img" :style="{ backgroundImage: 'url(' + player.avatar + ')' }"></span>
            <div class="info">
                <h3>{{ player.character_name }}</h3>
                <p>AC: {{ player.ac }} | HP: {{ player.maxhp }}</p>
                <a href="#">Edit</a>
            </div>
            <a class="red" v-b-tooltip.hover title="Delete" @click="deletePlayer(player['.key'], player.character_name)"><i class="fas fa-trash-alt"></i></a>
        </li>
        </transition-group>
    </ul>

    <b-modal id="addModal" title="Add Player">
        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('player_name') }" v-model="player_name" v-validate="'alpha_spaces|required'" name="player_name" placeholder="Player Name" />
        <p class="validate bg-red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>

        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('character_name') }" v-model="character_name" v-validate="'alpha_spaces|required'" name="character_name" placeholder="Character Name" />
        <p class="validate bg-red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>

        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('maxhp') }" v-model="maxhp" v-validate="'numeric|required'" name="maxhp" placeholder="Maximum Hit Points" />
        <p class="validate bg-red" v-if="errors.has('maxhp')">{{ errors.first('maxhp') }}</p>

        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('ac') }" v-model="ac" v-validate="'numeric|required'" name="ac" placeholder="Armor Class" />
        <p class="validate bg-red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('avatar') }" v-model="avatar" v-validate="'url'" name="avatar" placeholder="Image URL" />
        <p class="validate bg-red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>

        <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('beyond') }" v-model="beyond" v-validate="'url'" name="beyond" placeholder="DnD Beyond URL" />
        <p class="validate bg-red" v-if="errors.has('beyond')">{{ errors.first('beyond') }}</p>

        <button class="btn btn-block mt-3" @click="addPlayer()"><i class="fas fa-plus"></i> Add Player</button>
    </b-modal>
  </div>
</template>

<script>
import { db } from '@/firebase'

export default {
  name: 'Players',
  data() {
    return {
      userId: this.$store.getters.getUser.uid,
      player_name: '',
      character_name: '',
      ac: '',
      maxhp: '',
      avatar: '',
      beyond: '',
      loading: true,
    }
  },
  firebase() {
    return {
      players: {
        source: db.ref('players/'+ this.userId).orderByChild('character_name'),
        readyCallback: () => this.loading = false
      }
    }
  },
  methods: {
    addPlayer() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          db.ref('players/' + this.userId).push({
              player_name: this.player_name,
              character_name: this.character_name,
              maxhp: this.maxhp,
              ac: this.ac,
              avatar: "'" + this.avatar + "'",
              beyond: this.beyond
            });
          this.player_name = '';
          this.character_name = '';
          this.maxhp = '';
          this.ac = '';
          this.avatar = '';
          this.beyond = '';
          
        } else {
          //console.log('Not valid');
        }
      })
    },
    deletePlayer(key, player) {
      this.$snotify.error('Are you sure you want to delete ' + player + '?', 'Delete player', {
        timeout: false,
        buttons: [
            {text: 'Yes', action: (toast) => { db.ref('players/' + this.userId).child(key).remove(); this.$snotify.remove(toast.id); }, bold: false},
            {text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},        ]
        });
      }
  }
}
</script>

<style lang="css" scoped>
.container {
    padding-top:20px;
}
ul.players {
    padding:0;
    list-style:none;
}
ul.players li {
    padding:10px;
    margin-bottom:10px;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns:70px 1fr 10px;
    grid-gap: 10px;
    grid-template-areas: 
      "img info delete";
}
.info h3, .info p {
    margin-bottom:5px !important;
}
.img {
    width:70px;
    height:70px;
    display:block;
    background-size:cover;
    background-position:top center;
    grid-area: img;
    border:solid 1px #b2b2b2;
}
.info {
    grid-area: info;
}
input {
    margin-top: 15px;
}
</style>