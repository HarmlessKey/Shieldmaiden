<template>
	<div class="wrapper" :class="intensityClass">
		<div class="hail layer1 a"></div>
		<div class="hail layer1"></div>
		<div class="hail layer2 a"></div>
		<div class="hail layer2"></div>
		<div class="hail layer3 a"></div>
		<div class="hail layer3"></div>
	</div>
</template>

<script>
export default {
	name: "Hail",
	props: {
		intensity: {
			type: Number,
			default: 1,
		},
	},
	computed: {
		intensityClass() {
			const intensities = ["light", "medium", "heavy"];
			const index = this.intensity - 1;
			return intensities[index];
		},
	},
};
</script>

<style lang="scss" scoped>
.wrapper {
	margin-left: -50px;
	width: calc(100% + 50px);
	height: 100%;

	$s1: "";
	$s2: "";
	$s3: "";
	@for $i from 1 through 500 {
		$s1: $s1 +
			random(1000) *
			0.1vw +
			" " +
			random(1000) *
			0.1vh +
			" " +
			0 +
			" " +
			random(50) *
			-0.01rem +
			#fff;
		$s2: $s2 +
			random(1000) *
			0.1vw +
			" " +
			random(1000) *
			0.1vh +
			" " +
			0 +
			" " +
			random(50) *
			-0.01rem +
			#fff;
		$s3: $s3 +
			random(1000) *
			0.1vw +
			" " +
			random(1000) *
			0.1vh +
			" " +
			0 +
			" " +
			random(50) *
			-0.01rem +
			#fff;

		@if $i < 500 {
			$s1: $s1 + ",";
			$s2: $s2 + ",";
			$s3: $s3 + ",";
		}
	}
	.hail {
		border-radius: 50%;
		opacity: 0.9;
		position: absolute;
		top: -100vh;
		animation-name: fall;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	// Light (default)
	.layer1 {
		width: 0.3rem;
		height: 0.3rem;
		box-shadow: #{$s1};
		animation-duration: 1.2s;

		&.a {
			animation-delay: -0.7s;
		}
	}
	.layer2 {
		width: 0.2rem;
		height: 0.2rem;
		box-shadow: #{$s2};
		animation-duration: 2.2s;
		z-index: -1;

		&.a {
			animation-delay: -1.7s;
		}
	}
	.layer3 {
		width: 0.1rem;
		height: 0.1rem;
		box-shadow: #{$s3};
		animation-duration: 3.2s;
		z-index: -2;

		&.a {
			animation-delay: -2.7s;
		}
	}

	// Medium
	&.medium {
		.layer1 {
			width: 0.4rem;
			height: 0.4rem;
			animation-duration: 1s;

			&.a {
				animation-delay: -0.5s;
			}
		}
		.layer2 {
			width: 0.3rem;
			height: 0.3rem;
			animation-duration: 2s;

			&.a {
				animation-delay: -1.5s;
			}
		}
		.layer3 {
			width: 0.2rem;
			height: 0.2rem;
			animation-duration: 3s;

			&.a {
				animation-delay: -2.5s;
			}
		}
	}

	// Heavy
	&.heavy {
		.layer1 {
			width: 0.5rem;
			height: 0.5rem;
			animation-duration: 0.7s;

			&.a {
				animation-delay: -0.3s;
			}
		}
		.layer2 {
			width: 0.4rem;
			height: 0.4rem;
			animation-duration: 0.8s;

			&.a {
				animation-delay: -0.4s;
			}
		}
		.layer3 {
			width: 0.3rem;
			height: 0.3rem;
			animation-duration: 0.9s;

			&.a {
				animation-delay: -0.5s;
			}
		}
	}
}
@keyframes fall {
	100% {
		transform: translateY(200vh);
	}
}
</style>
