<template>
	<component :is="component" :data="slide.data" :type="slide.type" v-if="component" />
</template>

<script>
export default {
    name: 'Slide',
    data() {
			return {
				slide: this.$store.getters.getSlide,
				component: null,
			}
    },
    computed: {
			loader() {
				if (!this.slide.type) {
					return null
				}
				return () => import(`./${this.slide.type}.vue`)
			}
    },
    mounted() {
      this.loader()
				.then(() => {
						this.component = () => this.loader()
				})
				.catch(() => {
						this.component = () => import('./slides/Error.vue')
				})
    },
}
</script>

<style lang="scss" scoped>
	.slide-wrap {
		padding: 10px;
	}
</style>