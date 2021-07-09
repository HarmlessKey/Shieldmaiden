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
    width: calc(100% + 100px);
    height: 100%;

		$s1:"";
		$s2:"";
		$s3:"";
		
		@for $i from 1 through 400 {
			$s1: $s1 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem +$white;
			$s2: $s2 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem +$white;
			$s3: $s3 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem +$white;

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
			animation-duration: 11s;

			&.a {
				animation-delay: 5.7s;
			}
		}
		.layer2 {
			width: .4rem;
			height: .4rem;
			filter: blur(3px);
			box-shadow: #{$s2};
			animation-duration: 13s;

			&.a {
				animation-delay: -6.5s;
			}
		}
		.layer3 {
				width: .2rem;
				height: .2rem;
				filter: blur(6px);
				box-shadow: #{$s3};
				animation-duration: 15s;

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
				animation-duration: 6s;

				&.a {
					animation-delay: -2.9s;
				}
			}
			.layer2 {
				width: .8rem;
				height: .8rem;
				animation-duration: 8s;

				&.a {
					animation-delay: -3.9s;
				}
			}
			.layer3 {
					width: .6rem;
					height: .6rem;
					animation-duration: 10s;

					&.a {
						animation-delay: -5s;
				}
			}
		}
	}
	@keyframes fall {
		0% { 
			transform: translateY(0) translateX(0);
		}
		33% { 
			transform: translateY(76vh) translateX(25px);
		}
		66% { 
			transform: translateY(152vh) translateX(-25px);
		}
		100% { 
			transform: translateY(230vh) translateX(0);
		}
	}
</style>