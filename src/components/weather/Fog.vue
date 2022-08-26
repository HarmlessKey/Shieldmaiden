<template>
	<div class="wrapper" :class="[intensityClass, {'smoke': smoke}]">
		<div id="foglayer_01" class="fog">
			<div class="image01"></div>
			<div class="image02"></div>
		</div>
		<div id="foglayer_02" class="fog">
			<div class="image01"></div>
			<div class="image02"></div>
		</div>
		<div id="foglayer_03" class="fog">
			<div class="image01"></div>
			<div class="image02"></div>
		</div>
	</div>
</template>

<script>
	export default {
    name: "Fog",
    props: {
			intensity: {
				type: Number,
				default: 1
			},
      smoke: {
        type: Boolean,
        default: false
      }
		},
		computed: {
			intensityClass() {
				const intensities = ["light", "medium", "heavy"];
				const index = this.intensity - 1;
				return intensities[index];	
			}
		}
	};
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  position: absolute;
  top: 0;
  width: 100%;
  filter: blur(1px) grayscale(0.2) saturate(1.2) sepia(0.2);
  
  &.light {
    background: rgba(168, 168, 168, .1);

    &.smoke {
      background: rgba(43, 43, 43, .3);
    }
  }
  &.medium {
    background: rgba(168, 168, 168, .3);

    &.smoke {
      background: rgba(43, 43, 43, .6);
    }
  }
  &.heavy {
    background: rgba(168, 168, 168, .6);

    &.smoke {
      background: rgba(43, 43, 43, .8);
    }
  }

  #foglayer_01, #foglayer_02, #foglayer_03 {
    height: 100%;
    position: absolute;
    width: 200%;
  }
  #foglayer_01 .image01, #foglayer_01 .image02,
  #foglayer_02 .image01, #foglayer_02 .image02,
  #foglayer_03 .image01, #foglayer_03 .image02 {
    float: left;
    height: 100%;
    width: 50%;
  }
  #foglayer_01 {
    animation: foglayer_01_opacity 10s linear infinite, foglayer_moveme 25s linear infinite;
  }
  #foglayer_02, #foglayer_03 {
    animation: foglayer_02_opacity 21s linear infinite, foglayer_moveme 20s linear infinite;
  }

  &.smoke {
    #foglayer_01, #foglayer_02, #foglayer_03 {
      filter: invert(1);
    }
  }

  /* ---------- Moving Fog ---------- */
  /*
    'size: cover' || 'size: 100%'; results remain the same
    'attachment: scroll' can be added or removed; results remain the same
    'attachment: fixed' causing unexpected results in Chrome
    'repeat-x' || 'no-repeat'; results remain the same
  */ 
  #foglayer_01 .image01, #foglayer_01 .image02 {
    background: url("../../assets/_img/styles/fog1.png") center center/cover no-repeat transparent;
  }
  #foglayer_02 .image01, #foglayer_02 .image02,
  #foglayer_03 .image01, #foglayer_03 .image02{
    background: url("../../assets/_img/styles/fog2.png") center center/cover no-repeat transparent;
  }
}

/* ---------- Keyframe Layer 1 ---------- */
@keyframes foglayer_01_opacity {
  0% { opacity: .1; }
  22% { opacity: .5; }
  40% { opacity: .28; }
  58% { opacity: .4; }
  80% { opacity: .16; }
  100% { opacity: .1; }
}
/* ---------- Keyframe Layer 2 ---------- */
@keyframes foglayer_02_opacity {
  0% { opacity: .6; }
  25% { opacity: .3; }
  50% { opacity: .2; }
  80% { opacity: .4; }
  100% { opacity: .6; }
}
/* ---------- Keyframe Layer 3 ---------- */
@keyframes foglayer_03_opacity {
  0% { opacity: .9; }
  27% { opacity: .3; }
  52% { opacity: .7; }
  68% { opacity: .4; }
  100% { opacity: .9; }
}
/* ---------- Keyframe moveMe ---------- */
@keyframes foglayer_moveme {
  0% { left: 0; }
  100% { left: -100%; }
}

@media only screen
  and (min-width: 280px)
  and (max-width: 767px) {
    #foglayer_01 .image01, #foglayer_01 .image02,
    #foglayer_02 .image01, #foglayer_02 .image02,
    #foglayer_03 .image01, #foglayer_03 .image02 {
      width: 100%;
    }
  }
</style>