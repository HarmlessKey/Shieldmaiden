<template>
<div class="grid">
	<div class="container d-flex justify-content-center">
		<div class="die">
			<i class="fas fa-dice-d20"></i>
			<span>1</span>
		</div>
		<div>
			<h1 class="red">Natural 1</h1>
			<h2>404 page not found</h2>
			<p>Ouch, that was a terrible roll, your "Lucky" trait let's you try again though.</p>
			<router-link to="/"><i class="fas fa-dice-d20"></i> Roll again</router-link>
		</div>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'Error',
		components: {
			Footer,
		},
	}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=Baloo+Bhaina');
.grid {
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.container {
		padding: 50px 0; 

		h1 {
			font-size: 40px !important;
		}
		h2 {
			margin-bottom: 10px !important;
		}
		.die {
			position: relative;
			margin-right: 20px;

			span {
				font-family: 'Baloo Bhaina', cursive;
				text-align: center;
				font-weight: bold;
				position: absolute;
				color: #262626;
				font-size: 40px;
				width: 20px;
				height: 20px;
				top: 50%;
				left: 50%;
				margin-left: -12px;
				margin-top: -24px;
			}
			i {
				font-size: 150px;
			}
		}
	}
}
</style>