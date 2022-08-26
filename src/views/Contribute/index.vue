<template>
<hk-card header="Contribute">
	<div class="card-body">
		<ul class="entities hasImg">
			<template v-for="(item, key) in items">
				<li v-if="userInfo.admin || userInfo.contribute.includes(key)" :key="key">
					<i aria-hidden="true" class="icon mr-2" :class="item.icon" />
					<router-link :to="item.url">{{ item.name }}</router-link>
				</li>
			</template>
		</ul>
	</div>
</hk-card>
</template>

<script>
	export default {
		name: 'Contribute',
		data() {
			return {
				userInfo: this.$store.getters.userInfo,
				items: {
					'spells': { 
						name: 'Spells',
						url: '/contribute/spells',
						icon: 'fas fa-wand-magic',
					},
					'monsters': { 
						name: 'Monsters',
						url: '/contribute/monsters',
						icon: 'fas fa-dragon',
					},
					'character-builder': { 
						name: 'Character builder',
						url: '/content/character-builder',
						icon: 'fas fa-helmet-battle',
					},
				},
			}
		}
	}
</script>

<style lang="scss" scoped>
ul.entities {
	li {
		.icon {
			border: none;
			background: none;
			text-align: center;
			font-size: 20px;
			line-height: 48px;
		}
	}
}
</style>