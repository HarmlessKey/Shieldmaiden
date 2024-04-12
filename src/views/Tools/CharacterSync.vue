<template>
	<ToolsPage
		title="Character Sync"
		bg_img="character-sync-tool-header.png"
		:showSignedIn="false"
	>
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn 
				color="primary" 
				:class="btn_classes" 
				no-caps push target="_blank" 
				rel="noopener" 
				href="https://chromewebstore.google.com/detail/dd-character-sync/jgcbbmbchbkdjbgiiheminkkkecjohpg">
				Get Extension
			</q-btn>
		</template>

		<h2>D&D Character Sync - Google Chrome Extension</h2>
		<p>
			With this extension you can store character sheets from different D&D apps. 
			Characters stored in your extension can be synced with your players in Shieldmaiden.
		</p>

		<q-img
			src="https://lh3.googleusercontent.com/Y8gYDzvz3eSONImO1dL0Se9E9zC-wfW27XPqVzSY3zfqcVVXlvwWHV5jCwtlQsy21iBQ2rY21rEC0T4mT2CEVY1Ow8U=s800-w800-h500"
			alt="Character Sync Extension Screenshot"
			fit="contain"
			class="small"
		/>

		<section class="mb-3" id="resources">
			<h2>Various resources</h2>
			<p>
				Sync your Dungeons & Dragons character's data from various platforms like 
				<strong>D&D Beyond</strong>, <strong>Dice Cloud</strong> and <strong>Shieldmaiden</strong>.
			</p>
		</section>

		<q-img
			src="~assets/_img/tools/character-sync/sync.gif"
			alt="Shieldmaiden DM Screen"
			fit="contain"
		/>
		
		<section class="mb-3" id="players">
			<h2>Sync with Shieldmaiden</h2>
			<p>
				You can link a character saved in the extension to one of your players in Shieldmaiden. 
				Once linked, the players kan be updated with one click.
			</p>
			<p>
				
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
	width: 100%;

	&::v-deep .q-img__content {
		> div {
			background: none;
		}
	}
	&.res-vul {
		width: 50%;
		max-width: 300px;
	}
	&.action {
		max-width: 600px;
		cursor: pointer;
	}
	&.small {
		max-width: 600px;
		border-radius: $border-radius;
	}
}
</style>
