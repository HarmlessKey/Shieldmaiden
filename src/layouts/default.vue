<template>
<div class="hk-layout">
	<div class="content">
		<Crumble />
		<OverEncumbered v-if="show_overencumbered" />
		<hk-card v-if="show_mobile_ad" class="hk-ad">
			<div class="card-body">
				<img src="../assets/_img/logo/logo-icon-cyan.svg" alt="Harmless Key: D&D Combat Tracker" />
				<div class="right">
					<div class="mr-2">
						<div class="title">
							<i aria-hidden="true" class="fas fa-swords" /> Combat Tracker
						</div>
						<i aria-hidden="true" class="">Harmless Key</i>						
					</div>
					<router-link to="/demo" class="btn btn-sm bg-green my-2">Try demo</router-link>
				</div>
			</div>
		</hk-card>
		<div class="row q-col-gutter-md">		
			<div class="col-12" :class="{ 'col-md-9': width > 978 }">
        <router-view />
      </div>
      <div class="col-12 col-md-3" v-if="width > 978">
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
	import Footer from "src/components/Footer.vue";
	import Crumble from "src/components/crumble";
	import ContentSideRight from "src/components/ContentSideRight";
	import OverEncumbered from "src/components/userContent/OverEncumbered";

	export default {
		name: "DefaultLayout",
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
				"user",
				"overencumbered"
			]),
			show_overencumbered() {
				const pathArray = this.$route.path.split("/");
				return pathArray[1] === "content" && this.overencumbered;
			},
			show_mobile_ad() {
				const pathArray = this.$route.path.split("/");
				return pathArray[1] !== "content" && this.width <= 978 && !this.user;
			}
		},
		methods: {
			setSize(size) {
				this.width = size.width;
			}
		}
	}
</script>