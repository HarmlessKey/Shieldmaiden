<template>
	<div class="monster-card">
		<ViewMonster :data="monster" />
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import ViewMonster from '@/components/ViewMonster.vue';

	export default {
		name: 'Monster',
		components: {
			ViewMonster,
		},
		props: ['id'],
		firebase() {
			return {
				monster: {
					source: db.ref(`monsters/${this.id}`),
					asObject: true,
					readyCallback: () => this.$emit('name', this.monster.name)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.monster-card {
	max-width: 600px;
}
</style>