<template>
	<div>
		<h2>Player requests</h2>
		<transition-group 
			v-if="_requests.length"
			tag="q-list" 
			class="accordion"
			name="requests" 
			enter-active-class="animated animate__fadeInDown" 
			leave-active-class="animated animate__fadeOutRight"
		>
			<template v-for="(request, i) in _requests">
				<Request :request="request" :i="i" :key="`request-${request.key}`" />
			</template>
		</transition-group>
		<template v-else>
			<p class="red">No requests have been made.</p>
			<p>
				Your players can do damage or healing request from the 
				<a @click="setSlide({show: true, type: 'PlayerLink'})">track encounter screen</a>.
			</p>

			<p>In order to do this, the following requirements must be met.</p>

			<ol>
				<li>The player must have a Harmless Key account.</li>
				<li>The player must have control over a character in the encounter.</li>
				<li>You must be <span class="live">Live</span> with your encounter.</li>
			</ol>

			<p>
				If the above is met, players can target entities from the initiative list 
				on the track encounter screen and input the damage or healing they want to do.<br/>
				You as a DM can then decide if you wish to apply this damage, or discard it.
			</p>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters, mapActions } from 'vuex';
	import Request from '@/components/combat/side/RequestItem.vue';

	export default {
		name: 'Requests',
		components: {
			Request
		},
		computed: {
			...mapGetters([
				'encounter'
			]),
			_requests() {
				return _.chain(this.encounter.requests)
					.filter(function(request, key) {
						request.key = key
						return request;
					})
					.orderBy(function(request) {
						return parseInt(request.timestamp)
					} , 'desc')
					.value()
			},
		},
		methods: {
			...mapActions([
				"setSlide"
			])
		}
	}
</script>

<style lang="scss" scoped>
	ol {
		padding: 15px;
	}
	ul.requests {
		padding: 0 5px 0 0;
		list-style: none;

		li.request {
			padding:10px 3px;
			border-bottom: solid 1px $neutral-3;
		}
	}
	.fadeInDown, .fadeOutRight {
		animation-duration: 0.5s !important;
		animation-delay: .2s;
	}
</style>
