<template>
	<ToolsPage
		title="Combat Tracker"
		heading="D&D Combat Tracker"
		bg_img="combat-tracker-header.webp"
		:app_schema="app_schema"
	>
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn color="primary" :class="btn_classes" no-caps push to="/demo">Try Demo Encounter</q-btn>
		</template>

		<p>
			Shieldmaiden is probably the most advanced combat tracker for Dungeons & Dragons. Designed
			specifically for in-person play, our tools can be of some use to almost any dungeon master.
		</p>
		<p>
			Of course basic stats basic stats, like initiative and hit points are tracked, but one of the
			key features that sets Shieldmaiden apart, is the tracking of important details like bonuses
			and setting reminders. With just a few clicks, you can add or remove combatants, track damage,
			and manage other aspects of the battle. This saves time and ensures that combat encounters run
			smoothly and efficiently and you have time to focus more on what's really important in your
			games.
		</p>
		<p>
			Overall, Shieldmaiden is a versatile tool that can enhance your Dungeons & Dragons gameplay
			experience in numerous ways. Whether you're a dungeon master looking to streamline combat
			encounters and focus on the action and adventure of your game, or a player who wants to stay
			on top of the battle and make informed decisions, Shieldmaiden has the features you need to
			take your game to the next level.
		</p>

		<h2>Features of our Initiative Tracker</h2>
		<q-img
			class="mb-3"
			src="~assets/_img/tools/combat-tracker/combat-tracker.png"
			alt="Shieldmaiden Combat Tracker"
			fit="contain"
		/>

		<q-list :dark="$store.getters.theme === 'dark'" class="accordion mb-3">
			<q-expansion-item
				v-for="{ name, icon, title, text } in tracker"
				:dark="$store.getters.theme === 'dark'"
				switch-toggle-side
				:group="name"
				:key="`feature-${name}`"
			>
				<template v-slot:header>
					<q-item-section avatar>
						<i :class="icon" class="neutral-2" aria-hidden="true" />
					</q-item-section>
					<q-item-section v-text="title" />
				</template>
				<div class="accordion-body" v-html="text" />
			</q-expansion-item>
		</q-list>

		<p>
			These are some of our features, but our combat tracker has a lot more to offer.<br />
			Test <router-link to="/demo">our demo</router-link> encounter to see for yourself what the
			possibilities are.
		</p>

		<h2>Share the initiative list</h2>
		<q-img
			class="mb-3"
			src="~assets/_img/tools/combat-tracker/live-initiative.png"
			alt="Shieldmaiden Live Initiative Tracker"
			fit="contain"
		/>

		<q-list :dark="$store.getters.theme === 'dark'" class="accordion mb-3">
			<q-expansion-item
				v-for="{ name, icon, title, text } in share"
				:dark="$store.getters.theme === 'dark'"
				switch-toggle-side
				:group="name"
				:key="`feature-${name}`"
			>
				<template v-slot:header>
					<q-item-section avatar>
						<i :class="icon" class="neutral-2" aria-hidden="true" />
					</q-item-section>
					<q-item-section v-text="title" />
				</template>
				<div class="accordion-body" v-html="text" />
			</q-expansion-item>
		</q-list>

		<em
			>To fully use our Combat Tracker you need an account, but you can try out all it has to offer
			in our demo encounter.</em
		>

		<h2>Combat rules Shieldmaiden handles for you</h2>
		<p>
			The combat tracker automates the fiddly rules that are easy to forget mid-encounter, so you can
			keep the game moving.
		</p>
		<ul>
			<li>
				<strong>Concentration.</strong> When a concentrating creature takes damage it must make a
				Constitution saving throw with a DC equal to 10 or half the damage taken, whichever is
				higher (SRD, "Concentration"). Set a concentration reminder and Shieldmaiden prompts you the
				moment that creature is damaged.
			</li>
			<li>
				<strong>Resistance, vulnerability and immunity.</strong> Resistance halves damage of a type,
				vulnerability doubles it, and immunity ignores it. Define a creature's defenses once and the
				tracker applies the maths every time you deal that damage type.
			</li>
			<li>
				<strong>Temporary hit points.</strong> Temporary hit points are not added to your current
				hit points and are lost first when you take damage. Shieldmaiden tracks them separately from
				current and maximum HP, including maximum hit point modifiers.
			</li>
			<li>
				<strong>Multi-target actions.</strong> Effects like <em>fireball</em> hit several
				creatures at once. Select every target in the area, apply the damage in one action, and
				still halve it individually for anyone who succeeds on their saving throw.
			</li>
		</ul>
	</ToolsPage>
</template>

<script>
import { combat_tracker_texts, live_initiative_texts } from "src/utils/generalConstants";
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsCombatTracker",
	components: {
		ToolsPage,
	},
	data() {
		return {
			tracker: combat_tracker_texts.filter((item) => item.name !== "more"),
			share: live_initiative_texts,
			app_schema: {
				name: "Shieldmaiden Combat Tracker",
				description:
					"Free D&D 5e combat tracker for initiative, hit points, conditions and concentration.",
				featureList: [
					"Initiative tracking",
					"Hit point and temporary HP tracking",
					"Condition tracking",
					"Concentration reminders",
					"Damage type resistances, vulnerabilities and immunities",
					"Combat log with undo",
					"Multi-target actions",
					"Shared live initiative list for players",
				],
			},
		};
	},
	meta() {
		return {
			meta: {
				twitterImage: {
					name: "twitter:image",
					content: require(`assets/_img/meta/shieldmaiden-combat-tracker.png`),
				},
				ogImage: {
					property: "og:image",
					content: require(`assets/_img/meta/shieldmaiden-combat-tracker.png`),
				},
				ogImageAlt: {
					property: "og:image:alt",
					content: "Shieldmaiden Combat Tracker",
				},
			},
		};
	},
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 25px;
	border-bottom: solid 1px $neutral-3;
}
h3 {
	line-height: normal;
	margin-bottom: 5px;
}
.hk-card {
	height: 100%;
	.card-image {
		font-size: 50px;
		line-height: 55px;
		text-shadow: 1px 1px 10px $black;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		text-transform: uppercase;
		background-size: auto;
	}
}
</style>
