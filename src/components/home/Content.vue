<template>
	<div class="content">
		<div class="container">
			<div class="head">
				<h2>Build great encounters</h2>
				<span>
					Our encounter builder is easy to use and let's you use your own custom monsters.
				</span>
			</div>

			<b-row>
				<b-col sm="6">
					<img class="image" src="@/assets/_img/encounter-builder.gif"/>
				</b-col>
				<b-col>
					<h3>Encounter builder</h3>
					
					<ul>
						<li>Calculates difficulty</li>
						<li>Use your custom created Monsters</li>
					</ul>

					<router-link to="sign-up" class="btn btn-lg">Create your first encounter</router-link>
				</b-col>
			</b-row>
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
	.content {
		padding-bottom: 170px;
		min-height: calc(100vh - 50px - 55px);
		background-color: #181818;

		.image {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>