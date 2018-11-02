<template>
<div id="hasSide">
    <Sidebar/>
    <div id="my-content" class="container">
      <h2>Edit your campaign</h2>
      <div class="input-group mb-4">
        <input class="form-control" type="text" v-model="newCampaign.campaign" />
        <div class="input-group-append">
          <button class="btn" @click="changeName()">Change Name</button>
        </div>
      </div>
      <router-link to="/my-content">Back to campaign overview</router-link>
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
  firebase() {
    const userId = firebase.auth().currentUser.uid;

    return {
      campaigns: db.ref('campaigns/'+userId),
      campaignsObj: {
        source: db.ref('campaigns/'+userId),
        asObject: true
      }
    }
  },
  data() {
    return {
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
    changeName() {
      this.$firebaseRefs.campaigns.child(this.$route.params.id).set(this.newCampaign);
      this.$router.push('/campaigns')
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