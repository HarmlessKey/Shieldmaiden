<template>
	<div>
		<h2>Player requests</h2>
		<ul class="requests">
			<li v-for="(request, i) in encounter.requests" class="request" :key="`request-${i}`">
				<Request :request="request" :i="i" />
			</li>
		</ul>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters } from 'vuex';
	import Request from '@/components/combat/side/RequestItem.vue';

	export default {
		name: 'Requests',
		components: {
			Request
		},
		data() {
			return {

			}
		},
		computed: {
			...mapGetters([
				'encounter'
			])
		},
		methods: {
			
		},
	}
</script>

<style lang="scss" scoped>
	ul.requests {
		padding: 0 5px 0 0;
		list-style: none;

		li.request {
			padding:10px 3px;
			border-bottom: solid 1px #494747;
		}
	}
</style>
