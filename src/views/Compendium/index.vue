<template>
<div>
	<div class="content">
		<Crumble />
		<div class="row q-col-gutter-md">		
			<div class="col-12 col-md-9">
        <router-view />
      </div>
      <div class="col-12 col-md-3">
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
		metaInfo: {
			title: "Compendium DnD 5e"
		},
		beforeMount() {
			//Because the component is loaded in another view, 
			//the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
	}
</script>