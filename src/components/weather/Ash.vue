<template>
	<div class="wrapper" :class="intensityClass">
		<div class="ash layer1 a"></div>
		<div class="ash layer1"></div>
		<div class="ash sparks layer2 a"></div>
		<div class="ash sparks layer2"></div>
		<div class="ash layer3 a"></div>
		<div class="ash layer3"></div>
	</div>
</template>

<script>
export default {
	name: "Snow",
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
	width: calc(100% + 100px);
	height: 100%;

	$s1: "";
	$s2: "";
	$s3: "";

	@for $i from 1 through 400 {
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
			#000;
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
			#000;

		@if $i < 400 {
			$s1: $s1 + ",";
			$s3: $s3 + ",";
		}
	}

	@for $i from 1 through 80 {
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
			#ffae00;

		@if $i < 80 {
			$s2: $s2 + ",";
		}
	}
	.ash {
		border-radius: 50%;
		opacity: 0.9;
		position: absolute;
		top: -100vh;
		animation-name: fall;
		animation-timing-function: linear;
		animation-iteration-count: infinite;

		&.sparks {
			animation-name: rise;
			animation-direction: reverse;
		}
	}

	// Light (default)
	.layer1 {
		width: 0.4rem;
		height: 0.4rem;
		filter: blur(1.5px);
		box-shadow: #{$s1};
		animation-duration: 20s;

		&.a {
			animation-delay: -10s;
		}
	}
	.layer2 {
		width: 0.3rem;
		height: 0.3rem;
		box-shadow: #{$s2};
		animation-duration: 25s;
		opacity: 1;
		z-index: -1;

		&.a {
			animation-delay: -14s;
		}
	}
	.layer3 {
		width: 0.2rem;
		height: 0.2rem;
		filter: blur(3px);
		box-shadow: #{$s3};
		animation-duration: 24s;
		z-index: -2;

		&.a {
			animation-delay: -12s;
		}
	}

	// Medium
	&.medium {
		.layer1 {
			width: 0.45rem;
			height: 0.45rem;
			animation-duration: 20s;

			&.a {
				animation-delay: -10s;
			}
		}
		.layer3 {
			width: 0.35rem;
			height: 0.35rem;
			animation-duration: 24s;

			&.a {
				animation-delay: -12s;
			}
		}
	}

	// Heavy
	&.heavy {
		.layer1 {
			width: 0.5rem;
			height: 0.5rem;

			&.a {
				animation-delay: -10s;
			}
		}

		.layer3 {
			width: 0.4rem;
			height: 0.4rem;

			&.a {
				animation-delay: -12s;
			}
		}
	}
}
@keyframes fall {
	0% {
		transform: translateY(0) translateX(0);
	}
	33% {
		transform: translateY(76vh) translateX(50px);
	}
	66% {
		transform: translateY(152vh) translateX(-50px);
	}
	100% {
		transform: translateY(230vh) translateX(0);
	}
}
@keyframes rise {
	0% {
		transform: translateX(0) translateY(0);
		opacity: 1;
	}
	20% {
		transform: translateX(-100px) translateY(46vh);
		opacity: 0;
	}
	40% {
		transform: translateX(0) translateY(92vh);
	}
	60% {
		transform: translateX(-100px) translateY(138vh);
	}
	80% {
		transform: translateX(0) translateY(184vh);
	}
	100% {
		transform: translateX(-100px) translateY(230vh);
	}
}
</style>
