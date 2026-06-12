<template>
	<div class="home-top">
		<div class="container">
			<h1>Run D&D Combat with ease.</h1>
			<h2>
				Build encounters for your campaign, and keep track of everything you need during combat
				using our advanced initiative tracker.
			</h2>

			<div class="buttons">
				<q-btn to="/sign-up" color="accent" size="lg" no-caps> Create Free Account </q-btn>
				<q-btn to="/demo" class="try-demo" size="lg" no-caps> Try Demo Encounter </q-btn>
			</div>

			<div class="tools-title">Shieldmaiden features</div>
			<div class="tools">
				<router-link v-for="{ title, to, icon } in tools" :key="to" :to="to" class="tool">
					<div class="tool__image">
						<i :class="icon" aria-hidden="true" />
					</div>
					<div class="tool__content">
						{{ title }}
					</div>
				</router-link>
			</div>
			<img
				class="hero-image"
				src="../../assets/_img/shieldmaiden.webp"
				alt="Shieldmaiden Hero Image"
				fetchpriority="high"
			/>
		</div>
	</div>
</template>

<script>
export default {
	name: "Top",
	props: {
		maintenance: [Boolean, String],
	},
	data() {
		return {
			tools: [
				{
					title: "Combat Tracker",
					to: "/demo/run-encounter",
					icon: "fas fa-swords",
				},
				{
					title: "Encounter Builder",
					to: "/tools/encounter-builder/build-encounter",
					icon: "fas fa-hammer-war",
				},
				{
					title: "Spell Creator",
					to: "/tools/spell-creator/create-spell",
					icon: "fas fa-wand-magic",
				},
				{
					title: "Monster Creator",
					to: "/tools/monster-creator/create-monster",
					icon: "fas fa-dragon",
				},
				{
					title: "Live Initiative List",
					to: "/tools/combat-tracker",
					icon: "fas fa-list-alt",
				},
				{
					title: "Character Sync",
					to: "/tools/character-sync",
					icon: "fas fa-sync-alt",
				},
			],
		};
	},
};
</script>
