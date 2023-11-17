<template>
	<ToolsPage title="DM Screen" bg_img="monster-tool-header.jpg">

		<h2>DM Screen</h2>
		<p>
			With our digital DM screen you have quick access to you D&D 5e rules, your custom encounters and a soundboard.
		</p>

		<q-img
			src="~assets/_img/tools/dm-screen/dm-screen.png"
			alt="Harmless Key DM Screen"
			fit="contain"
		/>

		<section class="mb-3" id="encounters">
			<h2>Encounters</h2>
			<p>
				You have access to your prepared encounters for the campaign. 
				Create new encounters with our <router-link to="/tools/encounter-builder">Encounter Builder</router-link>, edit existing and directly run the encounters in our 
				<router-link to="/tools/combat-tracker">Combat Tracker</router-link>.
			</p>
		</section>
		
		<section class="mb-3" id="players">
			<h2>Players</h2>
			<p>
				Keep track of your Players' statuses, see their current health, armor class, 
				modifiers on these stats and their passive abilities.
			</p>
			<p>
				From the player panel you can easily update your players. 
				Add temporary hit points or an AC modifier to multiple players at once for isntance.
			</p>
		</section>

		<section class="mb-3" id="resources">
			<h2>Resources</h2>
			<p>
				Rules / Conditions / Monsters / Spells / Items
			</p>
			<p>
				Quickly access our compendium and rules from the SRD 5.1.
				Do you always forget the AC bonus of half cover or how a grapple works? 
				There is no need to search through the Player Handbook anymore, 
				we have added all the important rules directly on the DM Screen.
			</p>
		</section>

		<section class="mb-3" id="soundboard">
			<h2>Soundboard</h2>
			<p>
				Create the perfect ambiance at your table with easily accesible sounds and music.
			</p>
			<p>
				Our first version of the soundboard is a Youtube link collection of music and ambience.
				Simply click on an icon to directly play the sound.
				If you have subscription you can add your own custom links to music and ambience sound you often use.
			</p>
			<p>
				We are currently working on a second version that will play the sounds in our platform. 
				In this improved version you can easily track what sounds you are playing and stop/start them 
				at any given time, without switching to another tab in your browser.
			</p>
		</section>

		<section class="mb-3" id="soundboard">
			<h2>Sharing</h2>
			<p>
				When you are running encounters you can share a live initiative list with your players. 
				When you are not running an encounter, your players see the <strong>public campaign overview</strong> 
				with the active players and their damage meters.<br/>
				From the DM Screen you can share all sorts of things while not running an encounter.
			</p>

			<h3 class="mb-1">Background</h3>
			<p>
				Create a fitting atmosphere of your scene by adding a background to the public campaign overview. 
				This can either be an image or a Youtube video.
			</p>

			<h3 class="mb-1">Share</h3>
			<p>
				Image / Video / Message
			</p>
			<p>
				Share something full screen on the public campaign overview.
				If your players find a written message, you can share it directly with them on the public campaign overview.
				Or maybe the found a map, you can share the image full screen with them.
			</p>

			<h3 class="mb-1">Weather</h3>
			<p>
				Rain / Snow / Lightning / Fog / and more
			</p>
			<p>
				Same as in your encounters, you can add weather effects to the public campaign overview.<br/>
				<router-link to="/weather-demo">Check out all our weather effects</router-link>
			</p>
		</section>
	</ToolsPage>
</template>

<script>
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsMonsterCreator",
	components: {
		ToolsPage,
	},
	data() {
		return {
			
		};
	},
	methods: {
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
}
</style>
