<template>
<div>
	<div class="content">
		<Crumble />
		<OverEncumbered v-if="show_overencumbered" />
		<div class="row q-col-gutter-md">		
			<div class="col-12" :class="{ 'col-md-9': !this.$route.meta || this.$route.meta.side !== false }">
        <router-view />
      </div>
      <div class="col-12 col-md-3" v-if="width > 978 && (!this.$route.meta || this.$route.meta.side !== false)">
				<ContentSideRight />
			</div>
    </div>
		<q-resize-observer @resize="setSize" />
	</div>
	<Footer />
</div>
</template>

<script>
	import { mapGetters} from "vuex";
	import Footer from "@/components/Footer.vue";
	import Crumble from "@/components/crumble";
	import ContentSideRight from "@/components/ContentSideRight";
	import OverEncumbered from "@/components/userContent/OverEncumbered";

	export default {
		name: "CompendiumRouterView",
		components: {
			Crumble,
			Footer,
			ContentSideRight,
			OverEncumbered
		},
		data() {
			return {
				width: 0
			}
		},
		computed: {
			...mapGetters([
				"overencumbered"
			]),
			show_overencumbered() {
				const pathArray = this.$route.path.split("/");
				return pathArray[1] === "content" && this.overencumbered;
			}
		},
		methods: {
			setSize(size) {
				this.width = size.width;
			}
		}
	}
</script>