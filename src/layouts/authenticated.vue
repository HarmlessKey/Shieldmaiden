<template>
	<q-no-ssr class="hk-layout">
		<div class="content">
			<Crumble v-if="$route.name !== 'home'" />
			<PaymentDeclined />
			<OverEncumbered v-if="show_overencumbered" />
			<div class="row q-col-gutter-md">
				<div class="col-12" :class="{ 'col-md-9': width > 978 && $route.meta.side !== false }">
					<PromoBanner class="mb-3" />
					<router-view :key="$route.fullPath" />
					<slot />
				</div>
				<div class="col-12 col-md-3" v-if="width > 978 && $route.meta.side !== false">
					<ContentSideRight />
				</div>
			</div>
			<q-resize-observer @resize="setSize" />
		</div>
		<Footer />
	</q-no-ssr>
</template>

<script>
import { mapGetters } from "vuex";
import Footer from "src/components/Footer";
import Crumble from "src/components/crumble";
import ContentSideRight from "src/components/ContentSideRight";
import OverEncumbered from "src/components/userContent/OverEncumbered";
import PaymentDeclined from "src/components/PaymentDeclined.vue";
import PatreonLinkDialog from "src/components/dialogs/PatreonLinkDialog.vue";
import PromoBanner from "src/components/PromoBanner.vue";

export default {
	name: "AuthenticatedLayout",
	components: {
		Crumble,
		Footer,
		ContentSideRight,
		OverEncumbered,
		PaymentDeclined,
		PromoBanner,
	},
	preFetch({ store, redirect }) {
		if (!store.getters.user) {
			redirect("/sign-in");
		} else if (!store.getters.userInfo) {
			redirect("/set-username");
		}
	},
	data() {
		return {
			width: 0,
		};
	},
	computed: {
		...mapGetters(["overencumbered", "userInfo"]),
		show_overencumbered() {
			const pathArray = this.$route.path.split("/");
			return pathArray[1] === "content" && this.overencumbered;
		},
		show_mobile_ad() {
			const pathArray = this.$route.path.split("/");
			return pathArray[1] !== "content" && this.width <= 978;
		},
	},
	methods: {
		setSize(size) {
			this.width = size.width;
		},
		linkPatreon() {
			this.$q.dialog({
				component: PatreonLinkDialog,
			});
		},
	},
	mounted() {
		if (this.userInfo.patron && !this.userInfo.patron.expired && !this.userInfo.patreon_id) {
			this.linkPatreon();
		}
	},
};
</script>
