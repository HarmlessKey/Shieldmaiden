<template>
	<div>
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
			class="collapse results"
		>
			<div v-for="(result, index) in results" :key="`result-${index}`">
				<div class="damage">{{ result.amount}} {{ result.damage_type }}</div>
				<div class="targets">
					<template v-for="(target, key) in result.targets">
						<div class="name truncate" :key="`name-${key}-${i}`">
							{{ entities[key].name }}
						</div>
						<div class="defenses" :key="`defenses-${key}-${i}`">
							<div 
								v-b-tooltip.hover title="Vulnerable" 
								@click="setDefense('v', index, key)"
								:class="{red: target.defense === 'v'}"
							>
								<i class="fas fa-shield"></i>
								<span>V</span>
							</div>
							<div 
								v-b-tooltip.hover title="Resistant" 
								@click="setDefense('r', index, key)"
								:class="{green: target.defense === 'r'}"
							>
								<i class="fas fa-shield"></i>
								<span>R</span>
							</div>
							<div 
								v-b-tooltip.hover title="Immune" 
								@click="setDefense('i', index, key)"
								:class="{green: target.defense === 'i'}"
							>
								<i class="fas fa-shield"></i>
								<span>I</span>
							</div>
						</div>
						<div class="amount" :key="`amount-${key}-${i}`">{{ target.amount }}</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters } from 'vuex';

	export default {
		name: 'Requests',
		props: ['request', 'i'],
		computed: {
			...mapGetters([
				'players',
				'entities'
			]),
			results() {
				let results = this.request.results;
				let targets = this.request.targets;

				for(let result of results) {
					result.targets = {};

					for(let target of targets) {
						result.targets[target] = {};
						result.targets[target].amount = result.amount;
						result.targets[target].defense = '';
					}
				}
				return results;
			}
		},
		methods: {
			setDefense(defense, index, target) {
				let amount = this.results[index].amount;

				if(defense === this.results[index].targets[target].defense) {
					defense = '';
				} else {
					if(defense === 'v') {
						amount = amount * 2;
					} else if(defense === 'r') {
						amount = Math.floor(amount / 2);
					} else if(defense === 'i') {
						amount = 0;
					}
				}

				this.$set(this.results[index].targets[target], 'defense', defense);
				this.$set(this.results[index].targets[target], 'amount', amount);
				this.$forceUpdate();
			}
		},
	}
</script>

<style lang="scss" scoped>
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
	.results {
		padding-top: 15px;

		.damage {
			font-size: 18px;
			border-bottom: solid 1px #494747;
			padding-bottom: 5px;
		}
		.targets {
			display: grid;
			grid-template-columns: 1fr max-content minmax(30px, max-content);
			grid-auto-rows: 28px;

			.name {
				line-height: 28px;
			}

			.defenses {
				user-select: none;
				display: flex;
				justify-content: flex-end;

				div {
					cursor: pointer;
					position: relative;
					width: 15px;
					font-size: 19px;
					margin-left: 8px;

					span {
						font-size: 13px;
						text-align: center;
						font-weight: bold;
						position: absolute;
						width: 15px;
						top: 4px;
						left: 2px;
						color: #191919;
					}

				}
			}
			.amount {
				font-size: 15px;
				padding-left: 10px;
				line-height: 28px;
				text-align: right;
			}
		}
	}
</style>
