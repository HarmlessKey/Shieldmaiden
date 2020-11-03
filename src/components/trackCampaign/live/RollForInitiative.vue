<template>
		<div class="roll-for-initiative">
			<div>
				<span class="die spin" :style="{ backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + dieColor + '.svg') + ')' }"></span>
				<h2>Roll for initiative!</h2>
			</div>
		</div>
</template>

<script>
	export default {
		name: 'live',
		computed: {
			//Random die color
			dieColor() {
				let number = Math.ceil(Math.random() * 6)

				switch(number) {
					case 1: return 'blue';
					case 2: return 'cyan';
					case 3: return 'green';
					case 4: return 'orange';
					case 5: return 'red';
					case 6: return 'yellow';
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.roll-for-initiative {
		height: calc(100vh - 50px);
		z-index: 99;
		width: 100%;
		left: 0;
		position: fixed;
		top: 50px;
		background: rgba(38, 38, 38, .5);
		text-align: center;

		> div {
			position: absolute;
			top: 40%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		.die {
			display: inline-block;
			width: 155px; 
			height: 155px;
			background-size: 155px 155px;
			background-position: center;
			background-repeat: no-repeat;
			margin-bottom: 20px;

			&.spin {
				margin-right: 10px;
				font-size: 40px;
				animation: spin 1.5s ease infinite;
			}
		}
		h2 {
			font-weight: bold;
			font-size: 50px;
			text-transform: none;
			color: #fff;
			text-shadow: 0 0 8px #000;
			line-height: 60px;
		}
	}
	@keyframes spin {
		0%, 30% { transform: rotate(0deg); }
		70%, 100% { transform: rotate(360deg); }
	}
</style>
