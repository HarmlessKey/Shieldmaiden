<template>
	<hk-card>
		<div class="card-header" slot="header">

			<h1>{{ title }} for D&D 5e</h1>
      <slot name='create_btn'/>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${bg_img})` }">
      D&D {{ title }}
    </div>
		<div class="card-body">

      <slot />

    </div>
    <div slot="footer" class="card-footer">
      <slot btn_classes="full-width" name='create_btn' />
		</div>
	</hk-card>
</template>

<script>
	export default {
		name: 'ToolsPage',
    props: {
      title: String,
      bg_img: String,
    },
		data() {
			return {
      }
		}
	}
</script>

<style lang="scss" scoped>
.hk-card {
  .card-image {
    font-size: 50px;
    line-height: 55px;
    text-shadow: 1px 1px 10px $black;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    background-size: auto;
  }
}



@media only screen and (max-width: $md-breakpoint) {
  .hk-card .card-image {
    font-size: 30px;
    line-height: 30px;
  }
}


</style>
