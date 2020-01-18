<template>
	<div class="builder">
		<div class="container">
			<div class="head">
				<h2>Build great encounters</h2>
				<span>
					Our encounter builder is easy to use and let's you use your own custom monsters.
				</span>
			</div>

			<img class="image" src="@/assets/_img/home/encounter-builder.gif"/>

			<div class="text-center">
				<router-link to="sign-up" class="btn btn-lg">Create your first encounter</router-link>
			</div>
				<a href="#share" class="next">
					<div>Share initiative list</div>
					<i class="fas fa-chevron-down"></i>
				</a>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Content'
	}
</script>

<style lang="scss" scoped>
	.builder {
		padding-bottom: 170px;
		min-height: calc(100vh - 50px - 55px);
		background-color: #181818;

		.head {
			padding-bottom: 30px;
		}
		.image {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>