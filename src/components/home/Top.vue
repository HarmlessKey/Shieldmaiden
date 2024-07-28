<template>
	<div class="top">
		<div class="container">
			<img class="shieldmaiden" src="../../assets/_img/shieldmaiden.webp" alt="Shieldmaiden" />
			<div class="content">
				<div>
					<h1>D&D Combat Tracker</h1>
					<h2>And the ultimate companion app for your D&D campaign</h2>

					<q-btn
						v-if="!$store.getters.user"
						:class="{ 'full-width': isMobile }"
						class="px-2 py-1"
						to="/demo"
						color="primary"
						size="lg"
						no-caps
						push
					>
						Try demo encounter
					</q-btn>
					<router-link
						v-else
						to="/content"
						class="btn btn-lg bg-green"
						:class="{ 'btn-block': isMobile }"
						>My content</router-link
					>
				</div>
				<img
					class="laptop"
					:src="require('src/assets/_img/shieldmaiden-combat-tracker-laptop.webp')"
					alt="Shieldmaiden Combat Tracker on Laptop"
				/>
			</div>

			<div class="tools-title">More RPG tools from Shieldmaiden</div>
			<div class="tools">
				<router-link
					v-for="{ title, to, description, image } in tools"
					:key="to"
					:to="to"
					class="tool"
				>
					<div
						class="tool__image"
						:style="{
							backgroundImage: `url(${require(`src/assets/_img/atmosphere/medium/${image}`)})`,
						}"
					/>
					<div class="tool__content">
						<div class="tool__content-title">
							{{ title }}
						</div>
						<div class="tool__content-description" v-html="description" />
					</div>
				</router-link>
			</div>
		</div>
		<a href="#general" class="read-more">
			<div>Read more</div>
			<hk-icon icon="fas fa-chevron-down" />
		</a>
		<q-resize-observer @resize="setSize" />
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
			step: 0,
			width: 0,
			steps: [
				{
					title: "Build Encounter",
					caption: "Add players & monsters",
					icon: "",
				},
				{
					title: "Run Encounter",
					caption: "Perform actions Track health & initiative",
					icon: "",
				},
				{
					title: "Distribute Loot",
					caption: "Award experience, items and items",
					icon: "",
				},
			],
			tools: [
				{
					title: "DM Screen",
					to: "/tools/dm-screen",
					description:
						"Quick access to rules, a soundboard, your players, your custom encounters and more.",
					image: "dm-screen-medium.png",
				},
				{
					title: "Character Sync",
					to: "/tools/character-sync",
					description:
						"Access your characters from external resources and sync them with Shieldmaiden.",
					image: "character-sync.png",
				},
				{
					title: "Monster Creator",
					to: "/tools/monster-creator",
					description:
						"Build custom monster stat blocks with easy to roll actions. You can use your monsters in our combat tracker.",
					image: "monster-medium.jpg",
				},
				{
					title: "Spell Creator",
					to: "/tools/spell-creator",
					description:
						"Create custom spells to roll directly, or use on your spellcaster monsters.",
					image: "fire-dragon-medium.jpg",
				},
				{
					title: "Compendium",
					to: "/compendium",
					description: "Quickly reference Monsters, Spells, Conditions and Items.",
					image: "compendium-medium.jpg",
				},
				{
					title: "Character Builder",
					to: "/tools/character-builder",
					description: "Build your character and get an online character sheet.",
					image: "characters-medium.jpg",
				},
			],
		};
	},
	computed: {
		isMobile() {
			return this.width < 768;
		},
	},
	methods: {
		setSize(size) {
			this.width = size.width;
		},
	},
};
</script>

<style lang="scss" scoped>
.top {
	background-image: url("../../assets/_img/styles/paper-bg.png");
	background-position: top center;
	padding-bottom: 50px;
	background-color: $neutral-11;
	overflow: hidden;

	.bar {
		width: 100%;
		height: 150px;
		position: absolute;
		bottom: 0;
		background-color: $neutral-9;
	}
	.container {
		padding: 30px 20px 0 20px;
		max-width: 1280px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;

		.q-stepper {
			border: none;
			padding: 0;
			background: none;

			&::v-deep {
				.q-stepper__header {
					border: none;
				}
				.q-stepper__step-inner {
					display: none;
				}
			}
		}

		.shieldmaiden {
			height: 860px;
			display: none;
			position: absolute;
			left: -150px;
			top: 20px;
			z-index: 0;
		}
		.content {
			display: flex;
			flex-direction: column;
			gap: 25px;
			padding: 0;

			.laptop {
				width: 100%;
			}
		}
		h1 {
			line-height: normal;
			font-size: 30px;
			margin: 0 0 10px 0;
			text-transform: uppercase;
		}
		h2 {
			margin: 0 0 30px 0;
			font-size: 18px;
		}
		.tools-title {
			font-size: 18px;
			margin: 25px 0 25px 0;
		}
		.tools {
			display: flex;
			flex-direction: column;
			gap: 15px;
			z-index: 1;

			.tool {
				background-color: $neutral-6;
				border-radius: $border-radius;
				color: $neutral-1;
				display: flex;
				cursor: pointer;
				box-shadow: 0 10px 15px $black;

				&:hover {
					background-color: $neutral-7;
				}
				&__image {
					min-width: 110px;
					height: 100px;
					background-size: cover;
					background-position: center top;
					border-top-left-radius: $border-radius;
					border-bottom-left-radius: $border-radius;
				}

				&__content {
					padding: 10px 15px;
					display: flex;
					flex-direction: column;

					&-title {
						font-size: 18px;
						font-weight: bold;
					}
					&-description {
						font-size: 12px;
						line-height: normal;
					}
				}
			}
		}
	}
	.read-more {
		color: $neutral-1;
		text-align: center;
		width: 100%;
		margin-top: 25px;
		display: flex;
		flex-direction: column;
		align-items: center;

		&:hover {
			font-size: 20px;
			margin-bottom: -2px;
		}
	}
}

[data-theme="light"] {
	.top {
		background-image: none;
		background-color: $neutral-9;
	}
}

@media only screen and (min-width: $md-breakpoint) {
	.top {
		padding: 25px 0 75px 0;

		.container {
			.content {
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				.laptop {
					width: 400px;
				}
			}
			.tools {
				flex-direction: row;
				flex-wrap: wrap;
				.tool {
					flex-basis: calc(50% - 7.5px);
				}
			}
		}
	}
}
@media only screen and (min-width: $lg-breakpoint) {
	.top {
		.container {
			padding-left: 330px;
			align-items: start;
			.content {
				margin-bottom: 25px;

				.laptop {
					width: 457px;
				}
			}
			.shieldmaiden {
				display: block;
			}
			.tools {
				.tool {
					// flex-basis: calc(33% - 7.5px);
				}
			}
		}
	}
}
</style>
