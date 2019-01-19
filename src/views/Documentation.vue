<template>
	<div class="container">
		<h1>Documentation</h1>
		<p>Here we will explain why we made certain choices and how </p>
		
		<section id="campaigns">
			<h2>Campaigns</h2>
			<p><b>Why do I have to make a campaign?</b> Since it's very possible someone is running multiple campaigns, 
			we decided creating one is mandatory. This way your encounters are grouped under a campaign, so when running multiple campaigns there is some structrure to it.</p>

			<p><b>Why do I have to add players to my campaigns?</b> To make it easier to quicly add players to your encounters 
			we made it so that players have to be added to a campaign. When creating an encounter under a campaign, 
			only the players of this campaign will show up and they can be quicly added with one click of a button.</p>
		</section>

		<section id="players">
			<h2>Players</h2>

		</section>

		<section id="npcs">
			<h2>NPC's</h2>
			<p><b>Why call them NPC's?</b> We decided to name it NPC's and not monsters, because friendlies can be added aswell. 
			Say your group has recruited a mighty hero to fight with them in an upcomming battle, 
			you can add this hero as an NPC that you can control and keep track of during the encounter.</p>

			<p><b>Why can't I find the monster I'm looking for?</b> We use an API for the monsters you can use 
			(<a href="http://www.dnd5eapi.co/" target="_blank">D&D 5e API</a>). 
			We're not allowed to use anything outside of the SRD, so if you can't find your monster, 
			it's probably because of that.</p>

		</section>

		<section id="encounters">
			<h2>Encounters</h2>

		</section>

		<section id="run-encounter">
			<h2>Running an encounter</h2>
			<h3>Setting initiatve</h3>
			<p>Nothing special going on here. We decided that initiative for players cannot be rolled. 
				Players usualy like to roll themselves and you as a DM will have to enter their rolls manualy.</p>

			<p>When rolling for an NPC, we add their dexterity modifier to the roll. When rolling some NPC's as a group, 
				we use the lowest dexterity as the modifier.</p>

			<p>In the view of setting the initative, players and NPC's alike can be set to either <u>idle</u> or <u>active</u>. 
				The idle entities will not enter the encounter untill you want them to. This way you can create an encounter with waves of monsters and add the waves whenever you want. 
				Or maybe you have a monster that can summon some sort of entity, 
				you can allready add them to the encounter, but just set them to idle. Check the section on tracking initiative to see how we handle adding entities during an encounter.</p>

				<h3>Tracking initiative</h3>
				<p></p>
				
		</section>
	</div>
</template>

<script>

	export default {
		name: 'PrivacyPolicy',
		metaInfo: {
			title: 'Privacy Policy'
		},
	}
</script>

<style lang="scss" scoped>

.container {
	padding-top:20px;
	line-height: 25px;
	font-size: 15px; 
	font-weight:  lighter;

	section {
		// background: #262626;
		// padding: 20px;
		// margin-bottom: 20px;
	}
}

</style>