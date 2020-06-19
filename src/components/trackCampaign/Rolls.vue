<template>
	<div>
		<h3 class="mt-3">DM Rolls</h3>
		<ul class="rolls">
			<li v-for="(roll, index) in rolls" :key="`roll-${index}`">
				{{ roll }}
			</li>
		</ul>
	</div>
</template>

<script>
	import { trackEncounter } from '@/mixins/trackEncounter.js';

	export default {
		name: 'Rolls',
		mixins: [trackEncounter],
		props: [
			'rolls',
			'entities'
		],
		data() {
			return {
				userId: this.$route.params.userid
			}
		},
		computed: {
			
		}
	}
</script>

<style lang="scss" scoped>
	.rolls {

	}
</style>
