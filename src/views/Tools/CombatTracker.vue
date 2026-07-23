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

		<h2>How the Shieldmaiden combat tracker works</h2>
		<p>
			The Shieldmaiden combat tracker runs a D&D 5e encounter from start to finish in a single
			screen. You add your players and NPCs, roll or enter their initiative, and the tracker sorts
			everyone into turn order automatically. On each turn you apply damage or healing, roll monster
			actions with one click, add conditions, and set reminders for effects like concentration.
		</p>
		<p>
			Every change is logged, so you can see exactly what happened and undo mistakes without
			rebuilding the encounter. Hit points, temporary hit points, and maximum hit point modifiers are
			calculated for you, and damage is automatically adjusted for resistances, vulnerabilities, and
			immunities. When you are ready, you can share a live initiative list with your players on a
			second screen that updates in real time as the fight unfolds.
		</p>

		<h2>5e conditions the combat tracker helps you handle</h2>
		<p>
			Forgetting a condition is one of the most common ways combat slows down. Shieldmaiden lets you
			attach any of the 15 official Dungeons &amp; Dragons 5e conditions to a combatant so their
			effect is visible every round. The table below summarises what each condition does, based on
			the
			<a
				href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
				target="_blank"
				rel="noopener noreferrer nofollow"
				>System Reference Document 5.1</a
			>.
		</p>
		<div class="table-wrapper">
			<table class="conditions-table">
				<thead>
					<tr>
						<th>Condition</th>
						<th>Main mechanical effect in 5e</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="condition in conditions" :key="condition.name">
						<td>
							<router-link :to="`/compendium/conditions/${condition.slug}`">{{
								condition.name
							}}</router-link>
						</td>
						<td>{{ condition.effect }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p>
			Each condition you add stays pinned to the combatant until you remove it, and you can open the
			<router-link to="/compendium/conditions">conditions compendium</router-link> for the full rules
			text at any time.
		</p>

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

		<h2>Frequently asked questions</h2>
		<div v-for="item in faq" :key="item.question" class="faq-item">
			<h3>{{ item.question }}</h3>
			<p>{{ item.answer }}</p>
		</div>

		<h2>How Shieldmaiden compares to other D&D combat trackers</h2>
		<p>
			Shieldmaiden is built for running detailed in-person combat, where conditions, custom monsters,
			resistances, and a shared player view all matter in the same fight. It is not the only good
			tool, and the right pick depends on what you need at the table.
		</p>
		<ul>
			<li>
				<strong>Improved Initiative</strong> is a fast, no-account initiative tracker with a clean
				player view. It is excellent for quick turn order, but does less with custom monsters,
				damage-type maths, and spell scaling than Shieldmaiden.
			</li>
			<li>
				<strong>D&D Beyond's Encounter Builder</strong> is the natural choice if your whole group
				already lives in D&D Beyond and uses its official content and character sheets. Shieldmaiden
				focuses more on the moment-to-moment running of combat and works with your own homebrew.
			</li>
			<li>
				<strong>Kobold Fight Club (Koboldplus)</strong> is a lightweight encounter and difficulty
				calculator. If all you want is a fast CR calculation it is hard to beat; Shieldmaiden pairs
				encounter building with actually running the encounter afterwards.
			</li>
			<li>
				<strong>D&D Battle Tracker</strong> is a simple browser tracker for basic initiative and hit
				points. Shieldmaiden goes further with conditions, reminders, a combat log with undo, and a
				live initiative list for players.
			</li>
		</ul>
		<p>
			If your fights are short and you only need turn order, a lighter tool may be all you need.
			Shieldmaiden is strongest when combat has many moving parts and you want one tool to build the
			encounter, run it, and keep your players in the loop.
		</p>
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
			conditions: [
				{
					name: "Blinded",
					slug: "blinded",
					effect:
						"Can't see and automatically fails sight-based checks; attacks against the creature have advantage and its own attacks have disadvantage.",
				},
				{
					name: "Charmed",
					slug: "charmed",
					effect:
						"Can't attack the charmer or target them with harmful effects; the charmer has advantage on social checks with the creature.",
				},
				{
					name: "Deafened",
					slug: "deafened",
					effect: "Can't hear and automatically fails any ability check that requires hearing.",
				},
				{
					name: "Exhaustion",
					slug: "exhaustion",
					effect:
						"Six cumulative levels of penalties, from disadvantage on checks up to death, tracked as a value rather than on/off.",
				},
				{
					name: "Frightened",
					slug: "frightened",
					effect:
						"Has disadvantage on checks and attacks while the source of fear is in sight, and can't willingly move closer to it.",
				},
				{
					name: "Grappled",
					slug: "grappled",
					effect: "Speed becomes 0 and can't benefit from any bonus to speed.",
				},
				{
					name: "Incapacitated",
					slug: "incapacitated",
					effect: "Can't take actions or reactions.",
				},
				{
					name: "Invisible",
					slug: "invisible",
					effect:
						"Can't be seen without special senses; attacks against it have disadvantage and its attacks have advantage.",
				},
				{
					name: "Paralyzed",
					slug: "paralyzed",
					effect:
						"Incapacitated, can't move or speak, fails Strength and Dexterity saves, and melee hits against it are automatic critical hits.",
				},
				{
					name: "Petrified",
					slug: "petrified",
					effect:
						"Turned to solid substance, incapacitated, resistant to all damage, and immune to poison and disease.",
				},
				{
					name: "Poisoned",
					slug: "poisoned",
					effect: "Has disadvantage on attack rolls and ability checks.",
				},
				{
					name: "Prone",
					slug: "prone",
					effect:
						"Can only crawl; disadvantage on attacks; melee attacks against it have advantage, ranged have disadvantage.",
				},
				{
					name: "Restrained",
					slug: "restrained",
					effect:
						"Speed 0, disadvantage on attacks and Dexterity saves, and attacks against it have advantage.",
				},
				{
					name: "Stunned",
					slug: "stunned",
					effect:
						"Incapacitated, can't move, fails Strength and Dexterity saves, and attacks against it have advantage.",
				},
				{
					name: "Unconscious",
					slug: "unconscious",
					effect:
						"Incapacitated and prone, unaware of surroundings, drops what it holds, and melee hits against it are critical hits.",
				},
			],
			faq: [
				{
					question: "Is the Shieldmaiden combat tracker free?",
					answer:
						"Yes. Shieldmaiden's core combat tracking features are free forever, with no credit card required. Optional paid tiers add higher content limits for very active dungeon masters, but you can track full encounters, conditions, and concentration without ever paying.",
				},
				{
					question: "Do I need an account to use the combat tracker?",
					answer:
						"No account is needed to try it. Our demo encounter lets you run a full fight in the tracker without signing up. You only need a free account when you want to save encounters, monsters, and players between sessions.",
				},
				{
					question: "Can my players see the initiative order?",
					answer:
						"Yes. Shieldmaiden can share a live initiative list on a separate screen that updates in real time as you play. Your players always see whose turn it is, along with the status information you choose to reveal, which is ideal at the table or on stream.",
				},
				{
					question: "Does it work on a phone or tablet at the table?",
					answer:
						"Yes. Shieldmaiden runs in any modern web browser, so it works on phones, tablets, and laptops. Many dungeon masters run the tracker on a laptop and cast the shared initiative list to a tablet or TV for their players.",
				},
				{
					question: "Can I import my D&D Beyond characters?",
					answer:
						"Yes. Our free Character Sync browser extension imports characters from D&D Beyond and Dice Cloud, then syncs their stats into Shieldmaiden. You can update a player's character in the tracker with a single click when they level up or change gear.",
				},
				{
					question: "Can I use custom monsters?",
					answer:
						"Yes. You can build custom monsters in our monster creator, complete with rollable actions, defenses, and spellcasting, and drop them straight into an encounter. You can also import monsters shared by other Shieldmaiden users.",
				},
				{
					question: "Does it track concentration automatically?",
					answer:
						"Yes. Set a concentration reminder on a spellcaster and Shieldmaiden notifies you the moment that creature takes damage, prompting the Constitution saving throw. The save DC is 10 or half the damage taken, whichever is higher.",
				},
				{
					question: "Can I undo a mistake mid-combat?",
					answer:
						"Yes. Every damage and healing action is recorded in the combat log, so you can see what happened and when. If you apply the wrong amount or hit the wrong target, you can undo the action without rebuilding the encounter.",
				},
				{
					question: "Does the combat tracker handle damage types and resistances?",
					answer:
						"Yes. You can set resistances, vulnerabilities, and immunities per creature, and Shieldmaiden automatically halves, doubles, or ignores incoming damage by type. The combat log records the damage type of every hit so you can always check the maths.",
				},
				{
					question: "Can I run several encounters in one campaign?",
					answer:
						"Yes. With a free account you can build and save multiple encounters, players, and custom content per campaign, then load any encounter into the tracker when you need it. This keeps prep for different sessions organised and ready to run.",
				},
			],
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
			script: {
				faqPage: {
					type: "application/ld+json",
					innerHTML: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: this.faq.map((item) => ({
							"@type": "Question",
							name: item.question,
							acceptedAnswer: {
								"@type": "Answer",
								text: item.answer,
							},
						})),
					}),
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
	margin-top: 30px;
}
h3 {
	line-height: normal;
	margin-bottom: 5px;
}
.table-wrapper {
	overflow-x: auto;
	margin-bottom: 20px;
}
.conditions-table {
	width: 100%;
	border-collapse: collapse;

	th,
	td {
		text-align: left;
		padding: 8px 12px;
		border-bottom: solid 1px $neutral-6;
		vertical-align: top;
	}
	th {
		white-space: nowrap;
	}
}
.faq-item {
	margin-bottom: 15px;
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
