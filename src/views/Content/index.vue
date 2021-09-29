<template>
  <div class="content">
    <Crumble />
    <div class="row q-col-gutter-md">		
			<div class="col-12 col-md-9">
        <OverEncumbered v-if="overencumbered" />
        <router-view />
      </div>
      <div class="col-12 col-md-3">
				<ContentSideRight />
			</div>
    </div>
  </div>
</template>

<script>
  import ContentSideRight from "@/components/ContentSideRight";
	import Crumble from "@/components/crumble";
  import OverEncumbered from "@/components/OverEncumbered.vue";
  import { mapGetters } from "vuex";

export default {
  name: "content",
  components: {
    ContentSideRight,
    Crumble,
    OverEncumbered
  },
  computed: {
    ...mapGetters([
      "overencumbered"
    ])
  }
}
</script>

<style>

</style>