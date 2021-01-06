<template>
	<div class="wrapper" :class="intensityClass" />
</template>

<script>
	export default {
		name: "Snow",
		props: {
			intensity: {
				type: Number,
				default: 1
			}
		},
		computed: {
			intensityClass() {
				const intensities = ["light", "medium", "heavy"];
				const index = this.intensity - 1;
				return intensities[index];	
			}
		},
		mounted() {
		}
	}
</script>

<style lang="scss" scoped>
	.wrapper {
		background: white;
		position: absolute;
		width: 100%;
		height: 100%;
		opacity: 0;
		

		&.light {
			animation: lightnings 360s linear infinite;
			@keyframes lightnings {
				0% { opacity: 0; }
				0.87% { opacity: 0; }
				0.9% { opacity: .5; }
				0.93% { opacity: 0; }
				0.95% { opacity: 0; }
				0.99% { opacity: .5; }
				1% { opacity: 0; }
				100% { opacity: 0; }
			}
		}
		&.medium {
			animation: lightningm 180s linear infinite;
			@keyframes lightningm {
				0% { opacity: 0; }
				0.85% { opacity: 0; }
				0.9% { opacity: .5; }
				0.95% { opacity: 0; }
				1% { opacity: 0; }
				1.05% { opacity: .5; }
				1.1% { opacity: 0; }
				100% { opacity: 0; }
			}
		}
		&.heavy {
			animation: lightning 60s linear infinite;
			@keyframes lightning {
				0% { opacity: 0; }
				1.8% { opacity: 0; }
				1.9% { opacity: .5; }
				2% { opacity: 0; }
				2.4% { opacity: 0; }
				2.6% { opacity: .5; }
				2.9% { opacity: 0; }
				100% { opacity: 0; }
			}
		}
	}
</style>