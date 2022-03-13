<template>
  <div class="content-side">
    <hk-card v-if="$route.path === '/content'" class="bg-neutral-9 overflow-hidden">
      <hk-video />
    </hk-card>

    <!-- COMPENDIUM -->
    <hk-card v-if="$route.path.split('/')[1] !== 'content'">
      <div slot="header" class="card-header">
        <h2><i aria-hidden="true" class="fas fa-swords mr-1" /> D&D Combat tracker</h2>
      </div>
      <div class="card-body overflow-x-hidden">
        <hk-video />
        <p class="neutral-2 mt-3 text-center">Try the most advanced initiative tracker on the internet.</p>

        <router-link class="btn btn-block btn-sm bg-green" to="/demo">Demo encounter</router-link>
      </div>
    </hk-card>

    <!-- CAMPAIGNS -->
    <hk-card v-if="$route.path === '/content/campaigns'">
      <div slot="header" class="card-header">
        <span>Share your adventures</span>
        <a class="btn btn-sm bg-neutral-5" @click="setSlide({show: true, type: 'PlayerLink'})">
          <i aria-hidden="true" class="fas fa-qrcode" />
        </a>
      </div>
      <div class="card-body">
       <PlayerLink :qr="false" :title="false" :info="false" />
      </div>
    </hk-card>

    <!-- SOCIAL -->
    <hk-card small header="Join our community">
      <div class="card-body">
        <a class="btn btn-block bg-neutral-8 mb-3" href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">
          <i aria-hidden="true" class="fab fa-discord discord-purple mr-2" /> Discord
        </a>
        <p class="neutral-2 text-center">
          Join others on our Discord and be amongst the first to know about new updates.
        </p>
        <hr>
        <div class="social d-flex justify-content-between">
          <a 
            v-for="{name, icon, url} in social_media" 
            class="btn bg-neutral-8"
            :class="{ 'btn-sm': width < 240 }"
            :key="name"
            :href="url" 
            target="_blank" rel="noopener"
          >
            <i aria-hidden="true" :class="icon" />
          </a>
        </div>
      </div>
    </hk-card>

    <!-- SUBSCRIPTION -->
    <hk-card v-if="user && tier && $route.path.split('/')[1] === 'content'" small>
      <div slot="header" class="card-header">
        Subscription
        <b>{{ tier.name }}</b>
      </div>
      <q-linear-progress 
        v-if="tier.name !== 'Deity'"
        :value="slots_used.used_slots / slots_used.available_slots"
        color="neutral-4"
        track-color="neutral-11"
      />
      <div>
        <Tier />
      </div>
      <div slot="footer" v-if="tier.name !== 'Deity'">
        <router-link 
          to="/patreon" 
          class="btn btn-block btn-square bg-patreon-red"
        >
          Upgrade
        </router-link>
      </div>
    </hk-card>
    <q-resize-observer @resize="setWidth"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ContentSideRight",
  props: {
    page: String
  },
  components: {
    PlayerLink: () => import("src/components/PlayerLink"),
    HkVideo: () => import("src/components/hk-components/hk-video"),
    Tier: () => import("src/components/userContent/Tier"),
  },
  data() {
    return {
      width: 0,
      social_media: [
					{
						name: "Patreon",
						icon: "fab fa-patreon patreon-red",
						url: "https://www.patreon.com/harmlesskey"
					},
					{
						name: "Instagram",
						icon: "fab fa-instagram",
						url: "https://www.instagram.com/harmlesskey"
					},
					{
						name: "Twitter",
						icon: "fab fa-twitter",
						url: "https://twitter.com/KeyHarmless"
					},
					{
						name: "Facebook",
						icon: "fab fa-facebook-f",
						url: "https://www.facebook.com/harmlesskey"
					},
					{
						name: "Reddit",
						icon: "fab fa-reddit-alien",
						url: "https://www.reddit.com/r/HarmlessKey"
					}
				]
    }
  },
  computed: {
    ...mapGetters(["user", "tier", "slots_used"]),
    filtered_content() {
      return this.content.filter(item => item.value !== this.page);
    }
  },
  methods: {
    ...mapActions([
      "setSlide"
    ]),
    setWidth(size) {
      this.width = size.width;
    }
  }
}
</script>