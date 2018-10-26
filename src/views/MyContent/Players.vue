<template>
  <div id="players" class="container">
    <h1>Your players</h1>
    <p>These are the players that you can use in your campaigns.</p>

    <a class="btn btn-block mb-3" v-b-modal.addModal><i class="fas fa-plus-square"></i> Add player</a>

    <ul class="players">
        <transition-group name="list" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
            <li class="bg-gray" v-for="(player, index) in players" :key="index">
            <span class="img" :style="{ backgroundImage: 'url(' + player.avatar + ')' }"></span>
            <div class="info">
                <h3>{{ player.character_name }}</h3>
                <p>
                    AC: {{ player.ac }} | HP: {{ player.maxhp }}
                </p>
                <a href="#">Edit</a>
            </div>
            <a class="red delete" v-b-modal.deleteModal><i class="fas fa-trash-alt"></i></a>
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

    <b-modal id="deleteModal" size="sm" title="Delete Character" ok-title="Delete">
        Are you sure you want to delete this character?
    </b-modal>

    

  </div>
</template>

<script>
import firebase from 'firebase'
import { db } from '@/firebase'

export default {
  name: 'Players',
  data() {
    return {
      user: this.$store.getters.getUser,
      player_name: '',
      character_name: '',
      ac: '',
      maxhp: '',
      avatar: '',
      beyond: ''
    }
  },
  firebase() {
    const userId = firebase.auth().currentUser.uid
    return {
      players: db.ref('players/'+ userId).orderByChild('character_name')
    }
  },
  methods: {
    addPlayer() {
      const userId = firebase.auth().currentUser.uid;
      this.$validator.validateAll().then((result) => {
        if (result) {
          db.ref('players/'+userId).push({
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
          console.log('Not valid');
        }
      })
    },
    deletePlayer(key) {
      const userId = firebase.auth().currentUser.uid;
      db.ref('players/'+userId).child(key).remove();
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