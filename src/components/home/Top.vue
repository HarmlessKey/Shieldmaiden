<template>
	<div class="top">
		<div class="container">
			<div class="header">
				<!-- <img class="logo" src="../../assets/_img/logo/logo-main-icon-left.svg" alt="Shieldmaiden" /> -->
				<div class="header__bar">
					<span>Shieldmaiden<em class="neutral-2">.app</em></span>
				</div>
				<a
					class="btn bg-neutral-6"
					href="https://discord.gg/dU59jgvcuq"
					target="_blank"
					rel="noopener"
					><i class="fab fa-discord mr-3" />Join our Discord</a
				>
				<router-link
					v-if="!$store.getters.user"
					class="btn bg-neutral-6 create-account"
					to="/sign-up"
					>Create account</router-link
				>
			</div>
			<q-parallax src="../../assets/_img/home/shieldmaiden-banner.webp" class="mb-4" :height="360">
				<div class="banner">
					<div class="banner__content">
						<h1>D&D Combat Tracker</h1>
						<h2>And the ultimate companion app for your campaign</h2>
						<q-btn
							v-if="!$store.getters.user"
							class="px-2 py-1"
							to="/demo"
							color="primary"
							size="lg"
							no-caps
						>
							Try Demo Encounter
						</q-btn>
					</div>
				</div>
			</q-parallax>

			<div class="tools-title">More Shieldmaiden features</div>
			<div class="tools">
				<router-link
					v-for="{ title, to, description, icon } in tools"
					:key="to"
					:to="to"
					class="tool"
				>
					<div class="tool__image">
						<i :class="icon" aria-hidden="true" />
					</div>
					<div class="tool__content">
						<div class="tool__content-title">
							{{ title }}
						</div>
						<div class="tool__content-description" v-html="description" />
					</div>
				</router-link>
			</div>

			<a href="#general" class="read-more">
				<div>Read more</div>
				<i aria-hidden="true" class="fas fa-chevron-down" />
			</a>

			<!-- <img class="logo" src="../../assets/_img/logo/logo-main-icon-left.svg" alt="Shieldmaiden" />
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

			<div class="tools-title">More Shieldmaiden features</div>
			<div class="tools">
				<router-link
					v-for="{ title, to, description, icon } in tools"
					:key="to"
					:to="to"
					class="tool"
				>
					<div class="tool__image">
						<i :class="icon" aria-hidden="true" />
					</div>
					<div class="tool__content">
						<div class="tool__content-title">
							{{ title }}
						</div>
						<div class="tool__content-description" v-html="description" />
					</div>
				</router-link>
			</div>
			<img
				class="shieldmaiden"
				src="../../assets/_img/shieldmaiden.webp"
				alt="Shieldmaiden holding a sword and shield"
			/>
		</div>
		<a href="#general" class="read-more">
			<div>Read more</div>
			<i aria-hidden="true" icon="fas fa-chevron-down" />
		</a>
		<q-resize-observer @resize="setSize" /> -->
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
					icon: "fas fa-map",
				},
				{
					title: "Character Sync",
					to: "/tools/character-sync",
					description:
						"Access your characters from external resources and sync them with Shieldmaiden.",
					image: "character-sync.png",
					icon: "fas fa-sync-alt",
				},
				{
					title: "Monster Creator",
					to: "/tools/monster-creator",
					description:
						"Build custom monster stat blocks with easy to roll actions. You can use your monsters in our combat tracker.",
					image: "monster-medium.jpg",
					icon: "fas fa-dragon",
				},
				{
					title: "Spell Creator",
					to: "/tools/spell-creator",
					description:
						"Create custom spells to roll directly, or use on your spellcaster monsters.",
					image: "fire-dragon-medium.jpg",
					icon: "fas fa-wand-magic",
				},
				{
					title: "Compendium",
					to: "/compendium",
					description: "Quickly reference Monsters, Spells, Conditions and Items.",
					image: "compendium-medium.jpg",
					icon: "fas fa-book-spells",
				},
				{
					title: "Character Builder",
					to: "/tools/character-builder",
					description: "Build your character and get an online character sheet.",
					image: "characters-medium.jpg",
					icon: "fas fa-helmet-battle",
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
	padding: 1px 0 50px 0;
	background-color: $neutral-11;
	overflow: hidden;

	.container {
		padding: 0 20px;
		max-width: 1280px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;

		.header {
			width: 100%;
			display: flex;
			align-items: center;
			margin-bottom: 10px;
			border-radius: $border-radius;
			gap: 10px;

			.logo {
				max-width: 260px;
				margin: -10px;
			}
			&__bar {
				width: 100%;
				height: 54px;
				background-color: $neutral-6;
				border-radius: $border-radius-small;
				display: flex;
				justify-content: flex-start;
				gap: 10px;
				align-items: center;
				padding: 0 15px;
				font-weight: bold;
			}
			.btn {
				white-space: nowrap;
				height: 54px;
				line-height: 54px;
				padding: 0 12px;

				&.create-account {
					border-color: $neutral-2;
					border-width: 2px;
					line-height: 52px;
				}
			}
		}
		.q-parallax {
			border-radius: $border-radius;
		}
		.banner {
			// background-image: url("../../assets/_img/home/shieldmaiden-banner.webp");
			// background-size: cover;
			border-radius: $border-radius;
			height: 360px;
			width: 100%;
			display: flex;
			justify-content: flex-start;
			overflow: hidden;
			&__content {
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 0 45px;
				width: 100%;
				max-width: 550px;

				h1,
				h2 {
					text-shadow: 2px 2px 5px $black;
				}

				::v-deep {
					.q-btn {
						font-weight: bold;
						font-size: 22px !important;
						// background-color: $green !important;
						border: solid 3px $neutral-1;
						max-width: 300px;
						// color: $neutral-11 !important;
						box-shadow: $shadow-8;
					}
				}
			}
		}
		.shieldmaiden {
			height: 860px;
			display: none;
			position: absolute;
			left: -170px;
			top: 20px;
			z-index: 0;
		}
		.content {
			display: flex;
			flex-direction: column;
			gap: 25px;
			padding: 0;
			text-align: center;

			.laptop {
				width: 80%;
				margin: 20px auto;
			}
		}
		h1 {
			line-height: normal;
			font-size: 35px;
			margin: 0 0 10px 0;
			font-family: inherit;
			max-width: 400px;
			font-weight: bold;
			line-height: 35px;
		}
		h2 {
			margin: 0 0 30px 0;
			font-size: 18px;
			line-height: 25px;
			opacity: 0.8;
		}
		.tools-title {
			font-size: 22px;
			margin: 25px 0 20px 0;
			font-weight: bold;
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
				min-height: 101px;

				&:hover {
					background-color: $neutral-5;
				}
				&__image {
					min-width: 80px;
					height: 70px;
					background-size: cover;
					background-position: center top;
					border-top-left-radius: $border-radius;
					border-bottom-left-radius: $border-radius;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 25px;
				}

				&__content {
					padding: 10px 25px 10px 0;
					display: flex;
					flex-direction: column;

					&-title {
						font-size: 15px;
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
		font-weight: bold;

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
		padding-bottom: 75px;

		.container {
			.content {
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				text-align: left;

				.laptop {
					width: 400px;
					margin: 0;
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
			align-items: start;
			.content {
				margin-bottom: 25px;

				.laptop {
					width: 457px;
					display: none;
				}
			}
			.logo {
				// margin-left: -35px;
			}
			.shieldmaiden {
				display: block;
			}
			.tools {
				.tool {
					flex-basis: calc(33% - 7.5px);
				}
			}
		}
	}
}
@media only screen and (min-width: $xl-breakpoint) {
	.top {
		.container {
			.content {
				.laptop {
					width: 457px;
					display: block;
				}
			}
		}
	}
}
</style>
