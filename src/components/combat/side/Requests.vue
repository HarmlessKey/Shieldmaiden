<template>
	<div>
		<h2>Player requests</h2>
		<ul class="requests">
			<li v-for="(request, i) in encounter.requests" :key="`request-${i}`">
				<div class="d-flex justify-content-between head">
					<span class="blue">{{ players[request.player].character_name }}</span>
					<span>
						Round: {{ request.round }},
						Turn: {{ request.turn + 1 }}
					</span>
				</div>
				<div class="title">
					<a data-toggle="collapse" class="collapsed" :href="`#request-${i}`">
						<span>
							<span :class="request.type === 'healing' ? 'green' : 'red'">{{ request.type }}</span> request
						</span> 
						<i class="fas fa-caret-down"></i>
					</a>
				</div>
				<div 
					:id="`request-${i}`"
					class="collapse"
				>
					<div v-for="(result, index) in request.results" :key="`result-${index}`">
						{{ result.amount}} {{ result.damage_type }}
					</div>
					<!-- {{request}} -->
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters } from 'vuex';

	export default {
		name: 'Requests',
		data() {
			return {

			}
		},
		computed: {
			...mapGetters([
				'players',
				'entities',
				'encounter',
			])
		},
		methods: {
			
		},
	}
</script>

<style lang="scss" scoped>
	ul {
		padding: 0 5px 0 0;
		list-style: none;

		li {
			padding:10px 3px;
			border-bottom: solid 1px #494747;

			.head {
				font-size: 11px;
				margin-bottom: 5px;
				font-style: italic;
			}
			.title {
				font-size: 15px;
				
				a {
					display: flex;
					justify-content: space-between;
					color: #b2b2b2 !important;

					i {
						transition: transform .2s linear;
					}
					&.collapsed {
						i.fa-caret-down {
							transform: rotate(-90deg);
						}
					}
					&:hover {
						text-decoration: none;
					}
				}
			}
		}
	}
</style>
