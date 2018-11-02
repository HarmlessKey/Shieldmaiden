<template>
    <div id="hasSide">
        <Sidebar/>
        <div id="players" class="container">
            <h1>Add Player</h1>

            <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('player_name') }" v-model="player_name" v-validate="'alpha_spaces|required'" name="player_name" placeholder="Player Name" />
            <p class="validate red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>

            <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('character_name') }" v-model="character_name" v-validate="'alpha_spaces|required'" name="character_name" placeholder="Character Name" />
            <p class="validate red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>

            <h2 class="mt-4">Stats</h2>
            <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('maxhp') }" v-model="maxhp" v-validate="'numeric|required'" name="maxhp" placeholder="Maximum Hit Points" />
            <p class="validate red" v-if="errors.has('maxhp')">{{ errors.first('maxhp') }}</p>

            <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('ac') }" v-model="ac" v-validate="'numeric|required'" name="ac" placeholder="Armor Class" />
            <p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

            <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('avatar') }" v-model="avatar" v-validate="'url'" name="avatar" placeholder="Image URL" />
            <p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>

            <input type="text" class="form-control" :class="{'input': true, 'error': errors.has('beyond') }" v-model="beyond" v-validate="'url'" name="beyond" placeholder="DnD Beyond URL" />
            <p class="validate red" v-if="errors.has('beyond')">{{ errors.first('beyond') }}</p>
            
            <router-link to="/my-content/players" class="btn bg-gray mr-2">Cancel</router-link>
            <button class="btn" @click="addPlayer()"><i class="fas fa-plus"></i> Add Player</button>
        </div>
    </div>
</template>

<script>
import Sidebar from '@/components/SidebarMyContent.vue'
import { db } from '@/firebase'

export default {
  name: 'Players',
  components: {
      Sidebar,
  },
  data() {
    return {
      userId: this.$store.getters.getUser.uid,
      player_name: '',
      character_name: '',
      ac: '',
      maxhp: '',
      avatar: '',
      beyond: '',
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
            this.$router.replace('/my-content/players')
        } else {
          //console.log('Not valid');
        }
      })
    }
  }
}
</script>

<style lang="css" scoped>
.container {
    padding-top:20px;
}
.btn {
    margin-top:20px;
}
input {
    margin-top: 15px;
}
</style>