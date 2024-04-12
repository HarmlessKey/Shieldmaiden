<template>
	<ToolsPage
		title="Homebrew Creation"
		bg_img="homebrew-creation-tool-header.png"
		:showSignedIn="false"
	>
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn 
				color="primary" 
				:class="btn_classes" 
				no-caps push target="_blank" 
				rel="noopener" 
				href="https://homebrewcreation.com/">
				Checkout HBC <hk-icon icon="fas fa-external-link" class="ml-2" />
			</q-btn>
		</template>
		<section id="hbc">
			<h2>Adventure templates, homebrew content and DMing inspiration</h2>
			<p>
				One of our friends created a platform to offer several tools that are helpful for both beginning and experienced DMs.
			</p>

			<p>
				His philosophy: "The secret of D&D is: you can create everything yourself"
			</p>

			<q-img
				src="~assets/_img/tools/homebrew-creation/hbc-logo.webp"
				alt="Shieldmaiden DM Screen"
				fit="contain"
			/>

			<h3 class="text-bold mb-1">Adventure creation</h3>
			<p>
				A three step solution to help you create a one-shot or campaign. We've tried it ourselves and honestly, it was never easier or quicker to fully create a custom one-shot. 
				By answering a few questions your idea becomes a reality in no time. 
			</p>
			<p>
				<a href="https://homebrewcreation.com/" rel="noopener" target="_blank">Checkout the adventure creation templates</a>
			</p>

			<h3 class="text-bold mb-1">Homebrew content</h3>
			<p>
				He shares his own homebrew content including rules, monsters and classes as an inspiration to help other create their custom content.
			</p>
			<p>
				<a href="https://homebrewcreation.com/dnd-homebrew/" rel="noopener" target="_blank">See all shared homebrew creations</a>
			</p>

			<h3 class="text-bold mb-1">Articles</h3>
			<p>
				Besides sharing his own homebrew creations, he also writes articles. Both guides and opinionated pieces are shared, all about D&D and focussed on DMing.
			</p>
			<p>
				<a href="https://homebrewcreation.com/articles/" rel="noopener" target="_blank">Check the articles</a>
			</p>
		</section>
	</ToolsPage>
</template>

<script>
import { mapGetters } from "vuex";
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsMonsterCreator",
	components: {
		ToolsPage,
	},
	computed: {
		...mapGetters(["user"]),
	},
};
</script>

<style lang="scss" scoped>
.q-img {
	display: block;
	margin: 30px auto;
	max-width: 300px;
}
</style>
