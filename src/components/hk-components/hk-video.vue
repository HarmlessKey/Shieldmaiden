<template>
  <div 
    v-if="play_animation"
    @click="replay()"
    @mouseover="video_hover = true" 
    @mouseleave="video_hover = false"
    class="video"
  >
    <div class="video-controls" v-if="video_hover">
      <span>
        <i aria-hidden="true" @click.stop="muted = !muted" class="fas" :class="muted ? 'fa-volume-slash' : 'fa-volume-up'"></i>
        <q-tooltip anchor="bottom middle" self="center middle">
          Mute
        </q-tooltip>
      </span>
      <span>
        <i aria-hidden="true" @click="replay()" class="fas fa-redo-alt"></i>
        <q-tooltip anchor="bottom middle" self="center middle">
          Replay
        </q-tooltip>
      </span>
    </div>
    <video 
      ref="video" class="animated-video" src="~assets/_vid/harmless-key-animation-transparent-compressed.webm" 
      :muted="muted" autoplay playsinline alt="Shieldmaiden logo animation"
    />
  </div>
  <img v-else class="logo" src="~assets/_img/logo/logo-cyan.svg" alt="Shieldmaiden logo" />
</template>

<script>
export default {
  name: "hk-video",
  data() {
    return {
      play_animation: true,
      muted: true,
      video_hover: false
    }
  },
  methods: {
    replay() {
      const player = this.$refs.video;
      player.currentTime = 0;
      player.play();
    }
  },
  mounted() {
    const navigator = window.navigator;
    const ua = navigator.userAgent.toLowerCase()
    const hasMediaCapabilities = !!(navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo)
    const isSafari = ((ua.indexOf('safari') != -1) && (!(ua.indexOf('chrome')!= -1) && (ua.indexOf('version/')!= -1)))
    this.play_animation = !(isSafari && hasMediaCapabilities);
  }
}
</script>

<style lang="scss" scoped>
.video {
  position: relative;
  
  .animated-video {
    width: 100%;
    pointer-events: none;
  }
  .video-controls {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 20px;
    z-index: 10;
    opacity: .3;
    
    i {
      padding: 5px;
      cursor: pointer;
    }
  }

  .logo {
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-top: 50px;
    width: 70%;
    max-width: 400px;
    filter: drop-shadow(2px 2px 1px $black);
  }
}
</style>