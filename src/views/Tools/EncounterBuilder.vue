<template>
	<ToolsPage
		title="Encounter Builder"
		heading="D&D Encounter Builder"
		bg_img="encounter-builder-header.webp"
		:app_schema="app_schema"
	>
		<template v-slot:action_btn="{ btn_classes }">
			<q-btn
				color="primary"
				:class="btn_classes"
				no-caps
				push
				to="/tools/encounter-builder/build-encounter"
			>
				Create encounter
			</q-btn>
		</template>

		<section>
			<h2>Encounter Builder</h2>
			<p>
				Our Dungeons & Dragons encounter builder is a tool designed to help dungeon masters create
				exciting and challenging combat encounters for their players and run them in our
				<router-link to="/tools/combat-tracker">Combat Tracker</router-link>. With our easy-to-use
				interface, you can quickly and easily build encounters using a variety of monsters,
				atmospheric features, and other elements.
			</p>
			<p>
				The encounter builder allows you to add monsters with either rolled or average hit points,
				depending on your preference. This gives you greater flexibility and control over your
				encounters.
			</p>

			<q-img
				class="media large"
				src="~assets/_img/tools/encounter-builder/example-encounter.png"
				alt="Example encounter"
				fit="contain"
			/>
		</section>

		<section class="d-lg-flex justify-between mt-5">
			<div>
				<h2>Encounter Difficulty Calculator</h2>
				<p>
					One of the features of our encounter builder is the built-in difficulty calculator. This
					tool uses the official rules to analyze your encounter and calculate its difficulty level
					based on your party's size, level, and other factors. This makes it easy to ensure that
					your encounters are appropriately challenging for your players, without overwhelming them
					or making combat encounters too easy.
				</p>
			</div>
			<video
				class="video media small"
				src="~assets/_img/tools/encounter-builder/difficulty.mp4"
				muted
				autoplay
				playsinline
				alt="Shieldmaiden logo animation"
				loop
			/>
		</section>

		<em class="mb-0">To save encounters, you need an account.</em>

		<h2>How the D&D 5e encounter builder works</h2>
		<p>
			The Shieldmaiden encounter builder helps you assemble a balanced Dungeons &amp; Dragons 5e
			encounter and see its difficulty before your players ever roll initiative. You add your party,
			drop in monsters from the SRD or your own custom creations, and choose rolled or average hit
			points for each one. As you add creatures, the difficulty calculator updates live so you always
			know whether a fight is easy, medium, hard, or deadly for your party.
		</p>
		<p>
			When the encounter is ready, you can run it directly in our
			<router-link to="/tools/combat-tracker">D&D combat tracker</router-link>, so there is no
			retyping stat blocks between planning and play. With a free account you can save encounters per
			campaign and load them whenever you need them.
		</p>

		<h2>How encounter difficulty and XP thresholds work in 5e</h2>
		<p>
			D&D 5e rates encounter difficulty using experience point (XP) thresholds per character, based
			on level. You add up each player's threshold for a difficulty band to get the party's total
			threshold, then compare it against the adjusted XP of the monsters (the encounter multiplier
			increases the effective XP as you add more monsters). The table below lists the per-character
			XP thresholds from the SRD.
		</p>
		<div class="table-wrapper">
			<table class="xp-table">
				<thead>
					<tr>
						<th>Character level</th>
						<th>Easy</th>
						<th>Medium</th>
						<th>Hard</th>
						<th>Deadly</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in xpThresholds" :key="row.level">
						<td>{{ row.level }}</td>
						<td>{{ row.easy }}</td>
						<td>{{ row.medium }}</td>
						<td>{{ row.hard }}</td>
						<td>{{ row.deadly }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="table-source">
			Source: XP thresholds by character level, from the
			<a
				href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
				target="_blank"
				rel="noopener noreferrer nofollow"
				>System Reference Document 5.1</a
			>, © Wizards of the Coast, used under the
			<a
				href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
				target="_blank"
				rel="noopener noreferrer nofollow"
				>Open Game License 1.0a</a
			>.
		</p>
		<p>
			Shieldmaiden does this maths for you: enter your party and monsters and the difficulty is
			calculated automatically, including the multiplier for multi-monster encounters.
		</p>

		<h2>Encounter building tips</h2>
		<ul>
			<li>
				Aim a little above medium for a memorable fight; deadly does not always mean lethal, but it
				leaves less room for bad dice.
			</li>
			<li>
				Watch the multiplier: six weak monsters can be far more dangerous than their raw XP suggests
				because of how 5e scales groups.
			</li>
			<li>
				Mix roles — a controller, a striker, and some minions play better than one big bag of hit
				points.
			</li>
			<li>
				Save a few variant encounters per session so you can adjust difficulty on the fly if the
				party is stronger or weaker than expected.
			</li>
		</ul>
	</ToolsPage>
</template>

<script>
import ToolsPage from "src/components/ToolsPage.vue";

export default {
	name: "ToolsEncounterBuilder",
	components: {
		ToolsPage,
	},
	data() {
		return {
			app_schema: {
				name: "Shieldmaiden Encounter Builder",
				description:
					"Free D&D 5e encounter builder with instant difficulty and CR calculation for SRD and custom monsters.",
				featureList: [
					"Encounter building with SRD and custom monsters",
					"Instant encounter difficulty calculation",
					"Rolled or average monster hit points",
					"Run built encounters in the combat tracker",
				],
			},
			xpThresholds: [
				{ level: 1, easy: "25", medium: "50", hard: "75", deadly: "100" },
				{ level: 2, easy: "50", medium: "100", hard: "150", deadly: "200" },
				{ level: 3, easy: "75", medium: "150", hard: "225", deadly: "400" },
				{ level: 4, easy: "125", medium: "250", hard: "375", deadly: "500" },
				{ level: 5, easy: "250", medium: "500", hard: "750", deadly: "1,100" },
				{ level: 6, easy: "300", medium: "600", hard: "900", deadly: "1,400" },
				{ level: 7, easy: "350", medium: "750", hard: "1,100", deadly: "1,700" },
				{ level: 8, easy: "450", medium: "900", hard: "1,400", deadly: "2,100" },
				{ level: 9, easy: "550", medium: "1,100", hard: "1,600", deadly: "2,400" },
				{ level: 10, easy: "600", medium: "1,200", hard: "1,900", deadly: "2,800" },
				{ level: 11, easy: "800", medium: "1,600", hard: "2,400", deadly: "3,600" },
				{ level: 12, easy: "1,000", medium: "2,000", hard: "3,000", deadly: "4,500" },
				{ level: 13, easy: "1,100", medium: "2,200", hard: "3,400", deadly: "5,100" },
				{ level: 14, easy: "1,250", medium: "2,500", hard: "3,800", deadly: "5,700" },
				{ level: 15, easy: "1,400", medium: "2,800", hard: "4,300", deadly: "6,400" },
				{ level: 16, easy: "1,600", medium: "3,200", hard: "4,800", deadly: "7,200" },
				{ level: 17, easy: "2,000", medium: "3,900", hard: "5,900", deadly: "8,800" },
				{ level: 18, easy: "2,100", medium: "4,200", hard: "6,300", deadly: "9,500" },
				{ level: 19, easy: "2,400", medium: "4,900", hard: "7,300", deadly: "10,900" },
				{ level: 20, easy: "2,800", medium: "5,700", hard: "8,500", deadly: "12,700" },
			],
		};
	},
	meta() {
		return {
			meta: {
				twitterImage: {
					name: "twitter:image",
					content: require(`assets/_img/meta/shieldmaiden-encounter-builder.png`),
				},
				ogImage: {
					property: "og:image",
					content: require(`assets/_img/meta/shieldmaiden-encounter-builder.png`),
				},
				ogImageAlt: {
					property: "og:image:alt",
					content: "Shieldmaiden Encounter Builder",
				},
			},
		};
	},
};
</script>

<style lang="scss" scoped>
.table-wrapper {
	overflow-x: auto;
	margin-bottom: 20px;
}
.xp-table {
	width: 100%;
	border-collapse: collapse;

	th,
	td {
		text-align: left;
		padding: 8px 12px;
		border-bottom: solid 1px $neutral-6;
		white-space: nowrap;
	}
}
.table-source {
	font-size: 12px;
	color: $neutral-3;
	margin-top: -10px;
}
.media {
	display: block;
	margin: 30px auto;
}
.media.large {
	width: 100%;
	max-width: 600px;
}
.media.small {
	width: 50%;
	max-width: 300px;
	margin-left: 20px;
}

@media only screen and (max-width: $md-breakpoint) {
	.hk-card .card-image {
		font-size: 30px;
		line-height: 30px;
	}

	.media.small {
		width: 100%;
	}
}
</style>
