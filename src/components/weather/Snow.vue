<template>
	<div class="wrapper" :class="intensity">
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
				type: String,
				default: "light"
			}
		},
		data() {
			return {
	
			}
		},
		methods: {

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
		@for $i from 1 through 300 {
			$s1: $s1 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #fff;
			$s2: $s2 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #fff;
			$s3: $s3 + random(1000)*0.1vw + " " + random(1000)*0.1vh + " " + 0 + " " + random(50)*-0.01rem + #fff;

			@if $i < 300 {
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
			width: .9rem;
			height: .9rem;
			filter: blur(1.5px);
			box-shadow: #{$s1};
			animation-duration: 10s;

			&.a {
				animation-delay: -5s;
			}
		}
		.layer2 {
			width: 0.7rem;
			height: 0.7rem;
			filter: blur(3px);
			box-shadow: #{$s2};
			animation-duration: 12s;

			&.a {
				animation-delay: -6s;
			}
		}
		.layer3 {
				width: 0.4rem;
				height: 0.4rem;
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
				width: 1.1rem;
				height: 1.1rem;
				animation-duration: 8s;

				&.a {
					animation-delay: -4s;
				}
			}
			.layer2 {
				width: .9rem;
				height: .9rem;
				animation-duration: 10s;

				&.a {
					animation-delay: -5s;
				}
			}
			.layer3 {
				width: .6rem;
				height: .7rem;
				animation-duration: 12s;

				&.a {
					animation-delay: -6s;
				}
			}
		}

		// Heavy
		&.heavy {
			.layer1 {
				width: 1.5rem;
				height: 1.5rem;
				animation-duration: 6s;

				&.a {
					animation-delay: -3s;
				}
			}
			.layer2 {
				width: 1.2rem;
				height: 1.2rem;
				animation-duration: 8s;

				&.a {
					animation-delay: -4s;
				}
			}
			.layer3 {
					width: 0.8rem;
					height: 0.8rem;
					animation-duration: 10s;

					&.a {
						animation-delay: -5s;
				}
			}
		}
	}
	@keyframes fall {
			100% {transform: translateY(200vh); }
	}
</style>