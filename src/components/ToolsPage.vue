<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>{{ page_heading }}</h1>
			<slot name="action_btn" />
		</div>
		<div slot="image" class="card-image" :style="{ backgroundImage: `url(${img})` }"></div>
		<div class="card-body">
			<SignedIn v-if="user && showSignedIn" />
			<slot />
		</div>
		<div slot="footer" class="card-footer">
			<slot btn_classes="full-width" name="action_btn" />
		</div>
	</hk-card>
</template>

<script>
import { mapGetters } from "vuex";
import SignedIn from "./userContent/SignedIn.vue";

export default {
	name: "ToolsPage",
	components: {
		SignedIn,
	},
	props: {
		title: String,
		// Overrides the default "{title} for D&D 5e" H1 with an exact target term
		heading: String,
		bg_img: String,
		// SoftwareApplication JSON-LD properties for this tool (name, description, featureList)
		app_schema: Object,
		showSignedIn: {
			type: Boolean,
			default: true,
		},
	},
	meta() {
		const script = {
			breadcrumbs: {
				type: "application/ld+json",
				innerHTML: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "BreadcrumbList",
					itemListElement: [
						{
							"@type": "ListItem",
							position: 1,
							name: "Home",
							item: "https://shieldmaiden.app/",
						},
						{
							"@type": "ListItem",
							position: 2,
							name: "Tools",
							item: "https://shieldmaiden.app/tools",
						},
						{
							"@type": "ListItem",
							position: 3,
							name: this.page_heading,
						},
					],
				}),
			},
		};

		if (this.app_schema) {
			script.softwareApplication = {
				type: "application/ld+json",
				innerHTML: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "SoftwareApplication",
					applicationCategory: "GameApplication",
					operatingSystem: "Web browser",
					url: `https://shieldmaiden.app${this.$route.path}`,
					offers: {
						"@type": "Offer",
						price: "0",
						priceCurrency: "EUR",
					},
					...this.app_schema,
				}),
			};
		}

		return { script };
	},
	computed: {
		...mapGetters(["user"]),
		page_heading() {
			return this.heading || `${this.title} for D&D 5e`;
		},
		img() {
			return require(`assets/_img/atmosphere/tool-header/${this.bg_img}`);
		},
	},
};
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
		background-size: cover;
		font-weight: bold;
		min-height: unset;
		aspect-ratio: 5/2;
		background-repeat: no-repeat;
	}
	&::v-deep h2 {
		font-size: 25px;
		border-bottom: solid 1px $neutral-3;
	}
}

@media only screen and (max-width: $md-breakpoint) {
	.hk-card .card-image {
		font-size: 30px;
		line-height: 30px;
	}
}
</style>
