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
					{{ totalAmount }} <span :class="request.type === 'healing' ? 'green' : 'red'">{{ request.type }}</span> request
				</span> 
				<i class="fas fa-caret-down"></i>
			</a>
		</div>
		<div 
			:id="`request-${i}`"
			class="collapse results"
		>
			<!-- DAMAGE -->
			<template v-if="request.type === 'damage'">
				<div v-for="(result, index) in results" :key="`result-${index}`">
					<div class="damage">{{ result.amount}} {{ result.damage_type }}</div>
					<div class="targets">
						<template v-for="(target, key) in result.targets">
							<div class="name truncate bg-gray-dark" :key="`name-${key}-${i}`" v-if="entities[key]">
								{{ entities[key].name }}
							</div>

							<div class="amount bg-gray-dark" :key="`amount-${key}-${i}`">
								{{ target.amount }}
							</div>

							<div class="defenses bg-gray-dark" :key="`defenses-${key}-${i}`">
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
						</template>
					</div>

					<!-- FINAL RESULTS -->
					<div class="damage">Final</div>
					<div class="targets">
						<template v-for="(final, key) in final_results">
							<div class="name truncate bg-gray-dark" v-if="entities[key]" :key="`final-name-${key}`">
								{{ entities[key].name }}
							</div>
							<div class="amount bg-gray-dark" :key="`final-amount-${key}`">
								{{ final }}
							</div>
							<div class="defenses bg-gray-dark" :key="`final-options-${key}`">
								<div
									v-b-tooltip.hover title="No damage" 
									@click="setIntensity('i', index, key)"
									:class="{blue: final.defense === '0'}"
								>
									0
								</div>
								<div
									v-b-tooltip.hover title="Half damage" 
									@click="setIntensity('i', index, key)"
									:class="{blue: final.defense === '.5'}"
								>
									5
								</div>
								<div
									v-b-tooltip.hover title="Full damage" 
									@click="setIntensity('i', index, key)"
									:class="{blue: final.defense === '1'}"
								>
									1
								</div>
							</div>
						</template>
					</div>
				</div>
				<div class="actions">
					<button class="btn btn-sm bg-green">Apply</button>
					<button class="btn btn-sm bg-red">Decline</button>
				</div>
			</template>

			<!-- HEALING -->
			<template v-else>
				<div class="damage">Targets</div>
				<div class="targets">
					<div v-for="target in request.targets" :key="target">
						<div class="name truncate bg-gray-dark" v-if="entities[target]">
							{{ entities[target].name }}
						</div>
					</div>
				</div>
				<div class="actions">
					<button class="btn btn-sm bg-green">Apply</button>
					<button class="btn btn-sm bg-red">Decline</button>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters } from 'vuex';

	export default {
		name: 'Requests',
		props: ['request', 'i'],
		data() {
			return {
				final_results: undefined
			}
		},
		computed: {
			...mapGetters([
				'players',
				'entities'
			]),
			totalAmount() {
				let amount = 0;

				for(let result of this.request.results) {
					amount = amount + parseInt(result.amount);
				}

				return amount;
			},
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
		mounted() {
			this.final_results = this.setFinal(this.results);
		},
		watch: {
			results: {
				deep: true,
				handler(newVal) {
					console.log(newVal)
					this.final_results = this.setFinal(newVal);
				}
			}
		},
		methods: {
			setFinal(results) {
				let final = {};

				for(let result of results) {

					for(let key in result.targets) {
						let amount = result.targets[key].amount;

						if(!Object.keys(results).includes(key)) {
							final[key] = amount;
						} else {
							final[key] = result.targets[key] + amount;
						}
					}
				}
				return final;
			},
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

				this.final_results = this.setFinal(this.results);
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
			font-size: 15px;
			border-bottom: solid 1px #494747;
			padding-bottom: 2px;
		}
		.targets {
			display: grid;
			grid-template-columns: 1fr max-content max-content;
			grid-auto-rows: 28px;
			grid-row-gap: 2px;
			margin-bottom: 15px;

			.name {
				padding-left: 5px;
				line-height: 28px;
			}

			.defenses {
				user-select: none;
				display: flex;
				justify-content: flex-end;
				padding-right: 5px;

				div {
					cursor: pointer;
					position: relative;
					width: 15px;
					font-size: 15px;
					margin-left: 4px;
					text-align: center;
					line-height: 28px;

					span {
						font-size: 11px;
						text-align: center;
						font-weight: bold;
						position: absolute;
						width: 15px;
						line-height: 28px;
						top: 0;
						left: 0;
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
		.actions {
			margin-top: 20px;
			display: flex;
			justify-content: space-between;
			
			button {
				width: 48%;
			}
		}
	}
</style>
