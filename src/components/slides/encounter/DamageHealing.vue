<template>
	<div>
		<h2>Damage / heal</h2>

		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>

		<Actions class="mt-3" :settings="settings" :select-entity="true" />
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapActions, mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';
	import Actions from '@/components/combat/actions/Actions.vue';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'damageHealing',
		mixins: [setHP],
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
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid
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
			background: #191919;
		}
	}
</style>
