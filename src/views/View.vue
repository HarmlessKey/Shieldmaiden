<template>
<div>
	<div class="content">
		<Crumble />
		<div class="row q-col-gutter-md">		
			<div class="col-12" :class="{ 'col-md-9': !this.$route.meta || this.$route.meta.side !== false }">
        <router-view />
      </div>
      <div class="col-12 col-md-3" v-if="!this.$route.meta || this.$route.meta.side !== false">
				{{ this.$route.meta.side }}
				<ContentSideRight />
			</div>
    </div>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from "@/components/Footer.vue";
	import Crumble from "@/components/crumble";
	import ContentSideRight from "@/components/ContentSideRight";

	export default {
		name: "CompendiumRouterView",
		components: {
			Crumble,
			Footer,
			ContentSideRight
		},
		metaInfo() {
			return {
				title: this.$route.meta.title
			}
		}
	}
</script>