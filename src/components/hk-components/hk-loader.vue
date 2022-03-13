<template>
	<div class="loading">
			<div>
				<span class="die spin" :style="{ backgroundImage: 'url(' + require('src/assets/_img/logo/logo-icon-no-shield-' + dieColor + '.svg') + ')' }"></span>
				<h2>{{ prefix ? prefix : "Loading" }}{{ name ? ` ${name}` : `` }}...</h2>
			</div>
		</div>
</template>

<script>
export default {
	name: 'hk-loader',
	props: {
		name: {
			type: String
		},
		prefix: {
			type: String,
			default: undefined
		}
	},
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
			return 'blue';
		}
	}
}
</script>

<style lang="scss" scoped>
	.loading {
		min-height: 300px;
		height: 100%;
		width: 100%;
		text-align: center;
		display: grid;
		align-content: center;
		background: rgba(0, 0, 0, .1);

		.die {
			display: inline-block;
			width: 50px; 
			height: 50px;
			background-size: 50px 50px;
			background-position: center;
			background-repeat: no-repeat;
			margin-bottom: 10px;

			&.spin {
				margin-right: 10px;
				animation: spin 1.5s ease infinite;
			}
		}
		h2 {
			font-weight: bold;
			font-size: 18px;
			text-transform: none;
			color: $white;
			text-shadow: 0 0 8px $black;
			line-height: 25px;
			letter-spacing: 2px;
			margin-bottom: 0;
		}
	}
	@keyframes spin {
		0%, 30% { transform: rotate(0deg); }
		70%, 100% { transform: rotate(360deg); }
	}
</style>