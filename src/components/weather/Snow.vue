<template>
	<div class="wrapper" :class="intensityClass">
		<div class="snow layer1 a"></div>
		<div class="snow layer1"></div> 
		<div class="snow layer2 a"></div>
		<div class="snow layer2"></div>
		<div class="snow layer3 a"></div>
		<div class="snow layer3"></div>
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
    width: calc(100% + 50px);
    height: 100%;

		$s1:"";
		$s2:"";
		$s3:"";
		@for $i from 1 through 400 {
			$s1: $s1 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #fff;
			$s2: $s2 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #fff;
			$s3: $s3 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #fff;

			@if $i < 400 {
				$s1: $s1 + ",";
				$s2: $s2 + ",";
				$s3: $s3 + ",";
			}
		}
		.snow {
			border-radius: 50%;
			opacity: 0.9;
			position: absolute;
			top:-100vh;
			animation-name: fall;
			animation-timing-function: linear;
			animation-iteration-count: infinite;
		}

		// Light (default)
		.layer1 {
			width: .6rem;
			height: .6rem;
			filter: blur(1.5px);
			box-shadow: #{$s1};
			animation-duration: 10s;

			&.a {
				animation-delay: -5s;
			}
		}
		.layer2 {
			width: .4rem;
			height: .4rem;
			filter: blur(3px);
			box-shadow: #{$s2};
			animation-duration: 12s;

			&.a {
				animation-delay: -6s;
			}
		}
		.layer3 {
				width: .2rem;
				height: .2rem;
				filter: blur(6px);
				box-shadow: #{$s3};
				animation-duration: 14s;

				&.a {
					animation-delay: -7s;
			}
		}

		// Medium
		&.medium {
			.layer1 {
				width: .8rem;
				height: .8rem;
				animation-duration: 8s;

				&.a {
					animation-delay: -4s;
				}
			}
			.layer2 {
				width: .6rem;
				height: .6rem;
				animation-duration: 10s;

				&.a {
					animation-delay: -5s;
				}
			}
			.layer3 {
				width: .4rem;
				height: .4rem;
				animation-duration: 12s;

				&.a {
					animation-delay: -6s;
				}
			}
		}

		// Heavy
		&.heavy {
			.layer1 {
				width: 1rem;
				height: 1rem;
				animation-duration: 4s;

				&.a {
					animation-delay: -2s;
				}
			}
			.layer2 {
				width: .8rem;
				height: .8rem;
				animation-duration: 6s;

				&.a {
					animation-delay: -3s;
				}
			}
			.layer3 {
					width: .6rem;
					height: .6rem;
					animation-duration: 8s;

					&.a {
						animation-delay: -4s;
				}
			}
		}
	}
	@keyframes fall {
			100% { 
				transform: translateY(200vh) rotate(-20deg);
			}
	}
</style>