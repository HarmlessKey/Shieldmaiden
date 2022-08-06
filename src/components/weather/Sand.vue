<template>
	<div class="wrapper" :class="intensityClass">
    <template v-for="i in 3">
      <div :id="`sandlayer_0${i}`" class="sand" :key="i">
        <div class="image01"/>
        <div class="image02"/>
      </div>
			<div  class="particles a" :class="`layer${i}`" :key="`particles-${i}-a`" />
			<div class="particles" :class="`layer${i}`" :key="`particles-${i}`"/>
		</template>
	</div>
</template>

<script>
	export default {
    name: "Sand",
    props: {
			intensity: {
				type: Number,
				default: 1
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
  position: absolute;
  top: 0;
  left: -50px;
  width: calc(150% + 100px);
  height: 150%;
  // filter: blur(1px) saturate(1.2) sepia(1);

  $s1:"";
  $s2:"";
  $s3:"";

  @for $i from 1 through 800 {
    $s1: $s1 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + rgb(129, 97, 28);
    $s2: $s2 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + rgb(129, 97, 28);
    $s3: $s3 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + rgb(129, 97, 28);

    @if $i < 800 {
      $s1: $s1 + ",";
      $s2: $s2 + ",";
      $s3: $s3 + ",";
    }
  }

  .particles {
    border-radius: 50%;
    opacity: 0.9;
    position: absolute;
    // top:-100vh;
    animation-name: particles;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .layer1 {
    width: 40px;
    height: 1px;
    box-shadow: #{$s1};
    animation-duration: 2s;
    opacity: .5;

    &.a {
      animation-delay: -1s;
    }
  }
  .layer2 {
    width: 20px;
    height: 1px;
    box-shadow: #{$s2};
    animation-duration: 3s;
    opacity: .4;

    &.a {
      animation-delay: -2s;
    }
  }
  .layer3 {
    width: 10px;
    height: 1px;
    box-shadow: #{$s3};
    animation-duration: 4s;
    opacity: .3;

    &.a {
      animation-delay: -3s;
    }
  }
  
  &.light {
    background: rgba(168, 168, 168, .2);

    #sandlayer_01 {
      animation: sandlayer_01_opacity 10s linear infinite, sandlayer_moveme 7s linear infinite;
    }
    #sandlayer_02, #sandlayer_03 {
      animation: sandlayer_02_opacity 21s linear infinite, sandlayer_moveme 3s linear infinite;
    }
  }
  &.medium {
    background: rgba(168, 168, 168, .4);

    #sandlayer_01 {
      animation: sandlayer_01_opacity 10s linear infinite, sandlayer_moveme 6s linear infinite;
    }
    #sandlayer_02, #sandlayer_03 {
      animation: sandlayer_02_opacity 21s linear infinite, sandlayer_moveme 2s linear infinite;
    }

    .layer1 {
      width: 60px;
      animation-duration: 1s;

      &.a {
        animation-delay: -.5s;
      }
    }
    .layer2 {
      width: 50px;
      animation-duration: 2s;

      &.a {
        animation-delay: -1.5s;
      }
    }
    .layer3 {
      width: 40px;
      animation-duration: 3s;

      &.a {
        animation-delay: -2.5s;
      }
    }
  }
  &.heavy {
    background: rgba(168, 168, 168, .6);

    #sandlayer_01 {
      animation: sandlayer_01_opacity 10s linear infinite, sandlayer_moveme 5s linear infinite;
    }
    #sandlayer_02, #sandlayer_03 {
      animation: sandlayer_02_opacity 21s linear infinite, sandlayer_moveme 1s linear infinite;
    }

    .layer1 {
      width: 160px;
      animation-duration: .3s;

      &.a {
        animation-delay: -.2s;
      }
    }
    .layer2 {
      width: 110px;
      animation-duration: .4s;

      &.a {
        animation-delay: -.3s;
      }
    }
    .layer3 {
      width: 90px;
      animation-duration: .6s;

      &.a {
        animation-delay: -.4s;
      }
    }
  }

  #sandlayer_01, #sandlayer_02, #sandlayer_03 {
    height: 100%;
    position: absolute;
    width: 200%;
  }
  #sandlayer_01 .image01, #sandlayer_01 .image02,
  #sandlayer_02 .image01, #sandlayer_02 .image02,
  #sandlayer_03 .image01, #sandlayer_03 .image02 {
    float: left;
    height: 100%;
    width: 50%;
  }

  /* ---------- Moving Sand ---------- */
  #sandlayer_01 .image01, #sandlayer_01 .image02 {
    background: url("../../assets/_img/styles/fog1.png") center center/cover no-repeat transparent;
  }
  #sandlayer_02 .image01, #sandlayer_02 .image02,
  #sandlayer_03 .image01, #sandlayer_03 .image02{
    background: url("../../assets/_img/styles/fog2.png") center center/cover no-repeat transparent;
  }
}

/* ---------- Keyframe Layer 1 ---------- */
@keyframes sandlayer_01_opacity {
  0% { opacity: .1; }
  22% { opacity: .5; }
  40% { opacity: .28; }
  58% { opacity: .4; }
  80% { opacity: .16; }
  100% { opacity: .1; }
}
/* ---------- Keyframe Layer 2 ---------- */
@keyframes sandlayer_02_opacity {
  0% { opacity: .6; }
  25% { opacity: .3; }
  50% { opacity: .2; }
  80% { opacity: .4; }
  100% { opacity: .6; }
}
/* ---------- Keyframe Layer 3 ---------- */
@keyframes sandlayer_03_opacity {
  0% { opacity: .9; }
  27% { opacity: .3; }
  52% { opacity: .7; }
  68% { opacity: .4; }
  100% { opacity: .9; }
}
/* ---------- Keyframe moveMe ---------- */
@keyframes sandlayer_moveme {
  0% { left: 0; }
  100% { left: -100%; }
}

@keyframes particles {
    100% {
      transform: translateX(230vw); 
    }
}

@media only screen
  and (min-width: 280px)
  and (max-width: 767px) {
    #sandlayer_01 .image01, #sandlayer_01 .image02,
    #sandlayer_02 .image01, #sandlayer_02 .image02,
    #sandlayer_03 .image01, #sandlayer_03 .image02 {
      width: 100%;
    }
  }
</style>