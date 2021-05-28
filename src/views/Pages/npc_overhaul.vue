<template>
<div class="grid">
	<div class="content">
		<h1>New NPCs have arrived</h1>
		<p>
			The last few months we've been working on a complete overhaul of our NPC objects and we're finally ready to release it to the public.<br/> 
			On this page you will find some information about the <a href="#overhaul">the process</a>, <a href="#features">the new features</a> and <a href="#info">what this will mean for you</a>.
		</p>
		<h2 id="overhaul">The overhaul</h2>
		<p>
			For a while now we've been wanting to add more functionality to our NPCs. Things like damage types, resistances/vulnerabilities, spell slots, and the likes.<br/>
			We knew this would not be possible with the current data model that we have and that major changes had to be made. This meant carefully planning out a new data model
			that would suit all of our needs but also would be flexible enough so that we can easily add more features to it in the future (we still have a lot of ideas).<br/>
			Then, with the help of some of our supporters, we've manually converted all existing NCPs from the old model to the new.
		</p>
		<h2 id="features">The features</h2>
		<p>
			<b>Damage types</b><br>
			All monster damaging abilities now include a damage type, an attack can even have multiple rolls for different types of damage (2d6 slashing + 1d4 fire) .
		</p>
		<p>
			<b>Improved combat log</b><br>
			The combat log now shows the damage types for every attack. On top of that we also track misses and whether or not a saving throw was successful or failed.
		</p>
		<p>
			<b>Resistance, vulnerability and immunity</b><br>
			Because of damage types, we can now automatically reduce or increase damage rolls based on the entities defenses. Of course the power is still in your hands, you can always decide a defense does not count and you want to apply the original damage value.
		</p>
		<p>
			<b>Recharge</b><br>
			A recharge ability is now disabled once it's used. At the start of an entities turn we roll the recharge to see if use of the ability is regained.
		</p>
		<p>
			<b>Legendary action tracking</b><br>
			We track how many legendary actions an entity has used and we reset them at the start of an entities turn.
		</p>
		<p>
			<b>Spellcasting</b><br>
			NPCs can now be build with spellcasting and innate spellcasting. Spells can't be rolled yet, this is an update we are still working on, don't worry it is coming.
		</p>
		<p>
			<b>Custom healing rolls</b><br>
			Custom rolls can now also heal instead of just apply damage.
		</p>
		<p>
			<b>Quick rolls</b><br>
			Simply roll any dice directly from ability descriptions.
		</p>
		<p>
			<b>Reroll dice</b><br>
			You can now simply reroll any die rolled with an ability. Maybe you didn't want your player to take that much damage, or you might've created a sorcerer type NPC who can reroll some low rolls.
		</p>

		<h2 id="info">What this means for you</h2>
		<p>
			<b>All of your NPCs are safe!</b> <br>
			- When you go to your NPC overview page, you will receive a prompt that will ask you to convert them. <br>
			- All of your custom NPCs will have to be converted to our new NPC model before you can edit them. Don't worry, we've written a parser that autmatically does most of the work for you, you just have to double check it.<br/>
			- If you don't convert your NPCs, you can still use them in your encounter, although some information might not be displayed as you're used to.<br>
			- If you have a session really soon after the update and you don't have the time to convert them, don't worry, you can convert them afterwards<br>
			- When you've parsed all your NPCs and there are some NPCs with an error tag in front of it, please reach out to us on discord, you've encountered something we havn't thought of in our parser <br>
		</p>
		
		
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'NPC Overhaul',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'NPC Overhaul'
		},
	}
</script>

<style lang="scss" scoped>
.grid {
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.content {
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;
	}
}
</style>