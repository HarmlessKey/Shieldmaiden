<template>
  <q-banner
    :dark="$store.getters.theme !== 'light'"
    rounded inline-actions
    class="mb-3"
  >
    Welcome {{ userInfo.username }}
    <template slot="action">
      <q-btn 
        size="sm" 
        flat padding="sm"
        color="neutral-2"
        no-caps 
        icon="fas fa-cogs" 
        to="/settings" 
      >
        <q-tooltip anchor="top middle" self="center middle">
          Settings
        </q-tooltip>
      </q-btn>
      <q-btn 
        v-if="this.$route.name === 'profile'"
        size="sm" 
        flat padding="sm"
        color="neutral-2"
        no-caps 
        icon="fas fa-dungeon" 
        to="/content" 
      >
        <q-tooltip anchor="top middle" self="center middle">
          Content
        </q-tooltip>
      </q-btn>
      <q-btn 
        v-else
        size="sm" 
        flat padding="sm"
        color="neutral-2"
        no-caps 
        icon="fas fa-user" 
        to="/profile" 
      >
        <q-tooltip anchor="top middle" self="center middle">
          Profile
        </q-tooltip>
      </q-btn>
      <q-btn 
        size="sm" 
        flat padding="sm"
        color="neutral-2"
        no-caps 
        icon="fas fa-sign-out" 
        @click="signOut" 
      >
        <q-tooltip anchor="top middle" self="center middle">
          Sign out
        </q-tooltip>
      </q-btn>
    </template>
  </q-banner>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "UserBanner",
  computed: {
    ...mapGetters(["userInfo"]),
  },
  methods: {
    ...mapActions(["sign_out"]),
    signOut() {
				this.$router.replace("/");
				this.sign_out();
			}
  }
}
</script>