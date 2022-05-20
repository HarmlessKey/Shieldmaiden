<template>
<div class="grid">
	<div class="container">
		<h1>Contribute</h1>
		
		<ul class="entities hasImg">
			<template v-for="(item, index) in items">
				<li v-if="userInfo.contribute.includes(item.url)" :key="index">
					<i aria-hidden="true" class="img mr-2" :class="item.icon"></i> <router-link :to="$route.path.replace(/\/$/, '')+'/'+item.url">{{ item.name }}</router-link>
				</li>
			</template>
		</ul>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from 'src/components/Footer.vue'

	export default {
		name: 'Contribute',
		components: {
			Footer,
		},
		data() {
			return {
				userInfo: this.$store.getters.userInfo,
				items: {
					'spells': { 
						name: 'Spells',
						url: 'spells',
						icon: 'fas fa-wand-magic',
					},
					'monsters': { 
						name: 'Monsters',
						url: 'monsters',
						icon: 'fas fa-dragon',
					},
				},
			}
		}
	}
</script>

<style lang="scss" scoped>
.grid {
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.container {
		padding-top: 30px;
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;

		ul.entities {
			li {
				.img {
					border: none;
					background: none;
					text-align: center;
					font-size: 20px;
					line-height: 48px;
				}
			}
		}
	}
}

</style>