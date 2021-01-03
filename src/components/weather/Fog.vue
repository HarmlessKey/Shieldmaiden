<template>
	<div class="wrapper">
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
		name: "Fog"
	};
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  position: absolute;
  top: 0;
  width: 100%;
  filter: blur(1px) grayscale(0.2) saturate(1.2) sepia(0.2);
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
  animation: foglayer_01_opacity 10s linear infinite, foglayer_moveme 15s linear infinite;
}
#foglayer_02, #foglayer_03 {
  animation: foglayer_02_opacity 21s linear infinite, foglayer_moveme 13s linear infinite;
}

/* ---------- Moving Fog ---------- */
/*
  'size: cover' || 'size: 100%'; results remain the same
  'attachment: scroll' can be added or removed; results remain the same
  'attachment: fixed' causing unexpected results in Chrome
  'repeat-x' || 'no-repeat'; results remain the same
*/ 
#foglayer_01 .image01, #foglayer_01 .image02 {
  background: url("https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog1.png") center center/cover no-repeat transparent;
}
#foglayer_02 .image01, #foglayer_02 .image02,
#foglayer_03 .image01, #foglayer_03 .image02{
  background: url("https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog2.png") center center/cover no-repeat transparent;
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
  0% { opacity: .5; }
  25% { opacity: .2; }
  50% { opacity: .1; }
  80% { opacity: .3; }
  100% { opacity: .5; }
}
/* ---------- Keyframe Layer 3 ---------- */
@keyframes foglayer_03_opacity {
  0% { opacity: .8; }
  27% { opacity: .2; }
  52% { opacity: .6; }
  68% { opacity: .3; }
  100% { opacity: .8; }
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