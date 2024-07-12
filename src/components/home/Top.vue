<template>
	<div class="top">
		<div class="container">
			<img class="shieldmaiden" src="../../assets/_img/shieldmaiden.webp" alt="Shieldmaiden" />
			<div class="logo__wrapper">
				<img
					class="logo"
					src="../../assets/_img/logo/logo-main-icon-left.svg"
					alt="Shieldmaiden logo"
				/>
				<!-- <h1>The ultimate companion app for your D&D campaign</h1> -->
			</div>
			<h1>D&D Combat Tracker</h1>

			<q-stepper
				v-model="step"
				:dark="$store.getters.theme === 'dark'"
				class="my-4"
				alternative-labels
				color="primary"
				animated
				:vertical="isMobile"
			>
				<q-step
					v-for="({ title, caption, icon }, index) of steps"
					:key="title"
					:name="index + 1"
					:title="title"
					:caption="caption"
					:icon="icon"
				/>
			</q-stepper>
			<q-btn
				v-if="!$store.getters.user"
				:class="{ 'full-width': isMobile }"
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

			<h2>More D&D tools</h2>
			<div class="tools">
				<router-link
					v-for="{ title, to, description, image } in tools"
					:key="to"
					:to="to"
					class="tool"
				>
					<img class="tool__image" :src="require(`src/assets/_img/atmosphere/medium/${image}`)" />
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
	<!-- <div class="top">
		<div class="container">
			<img class="shieldmaiden" src="../../assets/_img/shieldmaiden.webp" alt="Shieldmaiden" />
			<div class="content">
				<div>
					<h1>Combat Tracker for D&amp;D 5<span>e</span></h1>
					<h2>The perfect companion in your D&D campaign</h2>

					<div class="button-container">
						<template v-if="!$store.getters.user">
							<q-btn to="/demo" color="primary" size="lg" no-caps push>Try demo encounter</q-btn>
							<div>
								<small>
									<em class="neutral-4">No download required</em>
								</small>
							</div>
						</template>
						<router-link v-else to="/content" class="btn btn-lg bg-green">My content</router-link>
					</div>
				</div>
			</div>
		</div>
		<div class="bar"></div>
	</div> -->
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
			return this.width < 790;
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

		.logo {
			width: 350px;

			&__wrapper {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
		}
		h1 {
			// font-size: 15px;
			font-weight: light;
			line-height: normal;
			// padding-left: 80px;
			// margin: -20px 0 0 0;
			// font-family: "Open Sans", sans-serif;
		}
		h2 {
			text-align: center;
			margin-top: 25px;
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

				&__image {
					width: 110px;
					height: 120px;
					object-fit: cover;
					border-top-left-radius: $border-radius;
					border-bottom-left-radius: $border-radius;
				}

				&__content {
					padding: 10px 15px;
					display: flex;
					flex-direction: column;

					&-title {
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
			display: flex;
			flex-direction: column;
			align-items: center;

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
			padding-left: 250px;
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

// @media only screen and (max-width: 768px) {
// 	.top {
// 		.container {
// 			padding-top: 25px;
// 			gap: 30px;

// 			.shieldmaiden {
// 				width: 350px;
// 				margin-left: -75px;
// 			}
// 			.content {
// 				.logo {
// 					width: 300px;
// 				}
// 				h1 {
// 					font-size: 28px;
// 				}
// 				h2 {
// 					font-size: 16px;
// 				}
// 			}
// 		}
// 	}
// }

// @media only screen and (max-width: 640px) {
// 	.top {
// 		.bar {
// 			top: 180px;
// 			height: 100%;
// 		}
// 		.container {
// 			padding-top: 30px;
// 			gap: 20px;
// 			padding-bottom: 80px;

// 			.shieldmaiden {
// 				width: 250px;
// 				height: 180px;
// 				position: absolute;
// 				top: 0;
// 				left: 0;
// 				object-fit: cover;
// 				object-position: top -5px left -30px;
// 			}
// 			.content {
// 				padding-left: 120px;
// 				position: relative;
// 				z-index: 50;

// 				.logo {
// 					width: 200px;
// 					margin-left: -18px;
// 					margin-bottom: 10px;
// 				}
// 				h1 {
// 					font-size: 20px;
// 				}
// 				h2 {
// 					display: none;
// 				}
// 				.button-container {
// 					position: absolute;
// 					left: 0;
// 					top: 180px;
// 					width: 100%;
// 					text-align: center;

// 					.q-btn {
// 						width: 100%;

// 						&__content {
// 							font-size: 12px;
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// }
</style>
