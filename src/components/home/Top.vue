<template>
	<div class="top">
		<div class="container">
			<h1>D&D Combat Tracker</h1>
			<h2>And the ultimate companion app for your campaign</h2>

			<div class="buttons">
				<q-btn
					v-if="!$store.getters.user"
					class="mr-2"
					to="/demo"
					color="primary"
					size="lg"
					no-caps
				>
					Try Demo Encounter
				</q-btn>
				<q-btn v-if="!$store.getters.user" to="/sign-up" class="" size="lg" no-caps>
					Create Free Account
				</q-btn>
			</div>

			<div class="laptop">
				<img
					:src="require('src/assets/_img/shieldmaiden-combat-tracker-laptop.webp')"
					alt="Combat Tracker on Laptop"
				/>
			</div>

			<div class="tools-title">More Shieldmaiden tools</div>
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

			<q-resize-observer @resize="setSize" />
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
			width: 0,
			tools: [
				{
					title: "Encounter Builder",
					to: "/tools/encounter-builder/build-encounter",
					description: "Build encounters and see the difficulty for your party.",
					image: "characters-medium.jpg",
					icon: "fas fa-hammer-war",
				},
				{
					title: "Monster Creator",
					to: "/tools/monster-creator/create-monster",
					description: "Build custom monster stat blocks with easy to roll actions.",
					image: "monster-medium.jpg",
					icon: "fas fa-dragon",
				},
				{
					title: "Spell Creator",
					to: "/tools/spell-creator/create-spell",
					description:
						"Create custom spells to roll directly, or use on your spellcaster monsters.",
					image: "fire-dragon-medium.jpg",
					icon: "fas fa-wand-magic",
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
	background-color: $neutral-11;

	.container {
		max-width: 1280px;
		padding: 50px 20px 50px 20px;

		.laptop {
			display: flex;
			justify-content: center;

			img {
				width: 90%;
				margin-bottom: 50px;
			}
		}
		h1 {
			line-height: normal;
			font-size: 35px;
			margin: 0 0 10px 0;
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
		.buttons {
			display: flex;
			flex-direction: column;
			gap: 15px;
			margin-bottom: 35px;

			.q-btn {
				width: 100%;
			}
		}
		.tools-title {
			font-size: 18px;
			margin-bottom: 20px;
			font-weight: bold;
		}
		.tools {
			display: flex;
			flex-direction: column;
			gap: 10px;
			z-index: 1;

			.tool {
				border-radius: $border-radius;
				background-color: $neutral-6;
				color: $neutral-1;
				display: flex;
				cursor: pointer;
				align-items: center;
				gap: 10px;
				padding: 15px 10px;

				&__image {
					min-width: 40px;
					font-size: 20px;
					text-align: center;
				}

				&__content {
					font-size: 16px;
				}
			}
		}
	}
}

@media only screen and (min-width: $md-breakpoint) {
	.top {
		.container {
			padding: 150px 20px 77px 20px;
			background-image: url("../../assets/_img/shieldmaiden.webp");
			background-repeat: no-repeat;
			background-position: top 0 right -110px;

			.laptop {
				display: none;
			}
			.buttons {
				flex-direction: row;
				margin-bottom: 77px;

				.q-btn {
					width: unset;
				}
			}
			.tools {
				.tool {
					background: none;
					padding: 0;
				}
			}
		}
	}
}
@media only screen and (min-width: $lg-breakpoint) {
	.top {
		.container {
			background-position: top 0 right 60px;
		}
	}
}
@media only screen and (min-width: $xl-breakpoint) {
	.top {
		.container {
			background-position: top 10px right 150px;
		}
	}
}

[data-theme="light"] {
	.top {
		background-image: none;
		background-color: $neutral-9;
	}
}
</style>
