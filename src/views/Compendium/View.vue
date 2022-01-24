<template>
	<div>
		<component :is="component" :id="id" v-if="component" @name="setName" :card-view="true" />
	</div>
</template>

<script>
	export default {
		name: 'ViewCompendium',
		data() {
			return {
				component: null,
				name: undefined,
				id: this.$route.params.id
			}
		},
		computed: {
			type() {
				let type = this.$route.path.split("/")[2];
				if(type === 'conditions') { type = 'Condition'; }
				if(type === 'items') { type = 'Item'; }
				if(type === 'monsters') { type = 'Monster'; }
				if(type === 'spells') { type = 'Spell'; }

				return type;
			},
			loader() {
				if (!this.type) {
					return null;
				}
				return () => import(`@/components/compendium/${this.type}.vue`);
			}	
		},
		mounted() {
			this.loader()
				.then(() => {
					this.component = () => this.loader()
				})
				.catch(() => {
					this.component = () => import('@/components/slides/Error.vue')
				})
		},
		methods: {
			setName(name) {
				this.name = name;
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>