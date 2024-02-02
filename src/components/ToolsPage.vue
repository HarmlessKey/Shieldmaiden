<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>{{ title }} for D&D 5e</h1>
      <slot name='action_btn'/>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${img})` }">
      D&D {{ title }}
    </div>
		<div class="card-body">
      <SignedIn v-if="user && showSignedIn" />
      <slot />
    </div>
    <div slot="footer" class="card-footer">
      <slot btn_classes="full-width" name='action_btn' />
		</div>
	</hk-card>
</template>

<script>
  import { mapGetters } from "vuex";
  import SignedIn from "./userContent/SignedIn.vue";

	export default {
		name: 'ToolsPage',
    components: {
      SignedIn
    },
    props: {
      title: String,
      bg_img: String,
      showSignedIn: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      ...mapGetters(["user"]),
      img() {
        return require(`assets/_img/atmosphere/tool-header/${this.bg_img}`)
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
  &::v-deep h2 {
    font-size: 25px;
    border-bottom: solid 1px $neutral-3;
    font-family: 'Fredericka the Great', cursive;
  }
}



@media only screen and (max-width: $md-breakpoint) {
  .hk-card .card-image {
    font-size: 30px;
    line-height: 30px;
  }
}


</style>
