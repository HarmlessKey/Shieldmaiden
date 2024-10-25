<template>
	<div class="top">
		<div class="container">
			<img
				class="shieldmaiden"
				src="../../assets/_img/shieldmaiden-cropped.webp"
				alt="Shieldmaiden"
			/>
			<h1>Run D&D Combat with ease.</h1>
			<h2>
				Build encounters for your campaign, and keep track of everything you need during combat
				using our advanced initiative tracker.
			</h2>

			<div class="buttons">
				<q-btn v-if="!$store.getters.user" to="/demo" color="accent" size="lg" no-caps>
					Try Demo Encounter
				</q-btn>
				<q-btn v-if="!$store.getters.user" to="/sign-up" class="" size="lg" no-caps>
					Create Free Account
				</q-btn>
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
					to: "/tools/spell-creator/create-spell",
					icon: "fas fa-list-alt",
				},
				{
					title: "Character Sync",
					to: "/tools/spell-creator/create-spell",
					icon: "fas fa-sync-alt",
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
		padding: 22px 20px 50px 20px;

		.shieldmaiden {
			transform: scaleX(-1);
			object-fit: cover;
			object-position: top 0 left -30px;
			height: 250px;
			width: 100%;
			margin-bottom: 22px;
		}
		.laptop {
			display: flex;
			justify-content: center;

			img {
				width: 90%;
				margin-bottom: 50px;
			}
		}
		h1 {
			font-size: 35px;
			margin: 0 0 10px 0;
			max-width: 550px;
			font-weight: bold;
			line-height: 45px;
		}
		h2 {
			margin: 0 0 22px 0;
			font-size: 18px;
			line-height: 30px;
			max-width: 400px;
			opacity: 0.8;
			font-weight: normal;
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
					transition: all 0.2s ease-in-out;
				}
			}
		}
	}
}

@media only screen and (min-width: $md-breakpoint) {
	.top {
		.container {
			padding: 95px 20px 77px 20px;
			background-image: url("../../assets/_img/shieldmaiden.webp");
			background-repeat: no-repeat;
			background-position: top 50px right -120px;

			.shieldmaiden {
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
				gap: 4px;
				.tool {
					background: none;
					padding: 3px 0;

					&:hover {
						.tool__content {
							font-size: 20px;
						}
					}
				}
			}
		}
	}
}
@media only screen and (min-width: $lg-breakpoint) {
	.top {
		.container {
			padding: 145px 30px 77px 30px;
			background-position: top 55px right -20px;

			h2 {
				max-width: 500px;
			}
			.tools {
				align-items: flex-start;
				flex-direction: row;
				flex-wrap: wrap;
				column-gap: 25px;
				row-gap: 2px;
				max-width: 600px;

				.tool {
					flex-basis: 250px;
					padding: 8px 0;
				}
			}
		}
	}
}
@media only screen and (min-width: $xl-breakpoint) {
	.top {
		.container {
			background-position: top 10px right 85px;

			h2 {
				max-width: 600px;
			}
			.tools {
				column-gap: 60px;
				max-width: 600px;

				.tool {
					flex-basis: 250px;
				}
			}
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
