<template>
	<div>
		<h2>Do damage / heal</h2>
		
		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>
		<hr>

		<Actions v-if="targeted.length > 0" class="mt-3" :select-entity="true" />

		<p  v-else class="mt-4">
			Select one or multiple targets to deal damage or heal.
		</p>

	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import Actions from 'src/components/combat/actions/Actions.vue';
	import TargetItem from 'src/components/combat/TargetItem.vue';

	export default {
		name: 'damageHealing',
		components: {
			Actions: Actions,
			TargetItem
		},
		props: [
		'data',
		],
		data() {
			return {
				target: this.data,
			}
		},
		computed: {
			...mapGetters([
				'targeted'
			])
		}
	};
</script>

<style lang="scss" scoped>
	ul.targets {
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 2px !important;
			border: solid 1px transparent;
		}
	}
</style>
