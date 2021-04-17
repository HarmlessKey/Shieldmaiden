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
				default: 1
			}
		},
		computed: {
			intensityClass() {
				const intensities = ["light", "medium", "heavy"];
				const index = this.intensity - 1;
				return intensities[index];	
			}
		}
	};
</script>

<style lang="scss" scoped>
	.wrapper {
		margin-left: -50px;
    width: calc(100% + 100px);
    height: 100%;

		$s1:"";
		$s2:"";
		$s3:"";
		
		@for $i from 1 through 400 {
			$s1: $s1 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + $gray-darker;	
			$s3: $s3 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + $gray-darker;

			@if $i < 400 {
				$s1: $s1 + ",";
				$s3: $s3 + ",";
			}
		}
		@for $i from 1 through 50 {
			$s2: $s2 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #ffae00;

			@if $i < 50 {
				$s2: $s2 + ",";
			}
		}
		.ash {
			border-radius: 50%;
			opacity: 0.9;
			position: absolute;
			top:-100vh;
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
			width: .4rem;
			height: .4rem;
			filter: blur(1.5px);
			box-shadow: #{$s1};
			animation-duration: 20s;

			&.a {
				animation-delay: 10s;
			}
		}
		.layer2 {
			width: .3rem;
			height: .3rem;
			box-shadow: #{$s2};
			animation-duration: 28s;
			opacity: 1;

			&.a {
				animation-delay: 14s;
			}
		}
		.layer3 {
				width: .2rem;
				height: .2rem;
				filter: blur(3px);
				box-shadow: #{$s3};
				animation-duration: 24s;

				&.a {
					animation-delay: 12s;
			}
		}

		// Medium
		&.medium {
			.layer1 {
				width: .45rem;
				height: .45rem;
				animation-duration: 20s;

				&.a {
					animation-delay: -10s;
				}
			}
			.layer3 {
				width: .35rem;
				height: .35rem;
				animation-duration: 24s;

				&.a {
					animation-delay: -12s;
				}
			}
		}

		// Heavy
		&.heavy {
			.layer1 {
				width: .5rem;
				height: .5rem;

				&.a {
					animation-delay: -2.9s;
				}
			}

			.layer3 {
					width: .4rem;
					height: .4rem;

					&.a {
						animation-delay: -5s;
				}
			}
		}
	}
	@keyframes fall {
			100% { 
				transform: translateY(230vh) rotate(-10deg);
			}
	}
	@keyframes rise {
			0% { 
				transform: translateX(-200px) translateY(0) rotate(0deg);
			}
			33% {
        transform: translateX(200px) translateY(100vh) rotate(20deg);
			}
			66% {
				transform: translateX(-200px) translateY(150vh) rotate(60deg);
			}
			100% { 
				transform: translateX(200px) translateY(230vh) rotate(40deg);
			}
	}
</style>