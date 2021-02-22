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
			<a @click="showRequest = !showRequest">
				<span>
					{{ totalAmount }} <span :class="request.type === 'healing' ? 'green' : 'red'">{{ request.type }}</span> request
				</span> 
				<i class="fas fa-caret-down"></i>
			</a>
		</div>
		<q-slide-transition>
			<div v-show="showRequest" class="results">
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
										@click="setDefense('v', index, key)"
										:class="{red: target.defense === 'v'}"
									>
										<i class="fas fa-shield"></i>
										<span>V</span>
										<q-tooltip anchor="center right" self="center left">
											Vulnerable
										</q-tooltip>
									</div>
									<div 
										@click="setDefense('r', index, key)"
										:class="{green: target.defense === 'r'}"
									>
										<i class="fas fa-shield"></i>
										<span>R</span>
										<q-tooltip anchor="center right" self="center left">
											Resistant
										</q-tooltip>
									</div>
									<div 
										@click="setDefense('i', index, key)"
										:class="{green: target.defense === 'i'}"
									>
										<i class="fas fa-shield"></i>
										<span>I</span>
										<q-tooltip anchor="center right" self="center left">
											Immune
										</q-tooltip>
									</div>
								</div>
							</template>
						</div>

					</div>

					<!-- FINAL RESULTS -->
					<div class="damage">Final values</div>
					<div class="targets">
						<template v-for="(final, key) in final_results">
							<div class="name truncate bg-gray-dark" v-if="entities[key]" :key="`final-name-${key}`">
								{{ entities[key].name }}
							</div>
							<div class="amount bg-gray-dark red" :key="`final-amount-${key}`">
								{{ Math.floor(final * intensity[key]) }}
							</div>
							<div class="defenses bg-gray-dark" :key="`final-options-${key}`">
								<div
									@click="setIntensity(key, 0)"
									:class="{blue: intensity[key] === 0}"
								>
									<i class="fas fa-circle"></i>
									<span>0</span>
									<q-tooltip anchor="center right" self="center left">
										No damage
									</q-tooltip>
								</div>
								<div
									@click="setIntensity(key, .5)"
									:class="{blue: intensity[key] === .5}"
								>
									<i class="fas fa-circle"></i>
									<span>½</span>
									<q-tooltip anchor="center right" self="center left">
										Half damage
									</q-tooltip>
								</div>
								<div
									@click="setIntensity(key, 1)"
									:class="{blue: intensity[key] === 1}"
								>
									<i class="fas fa-circle"></i>
									<span>1</span>
									<q-tooltip anchor="center right" self="center left">
										Full damage
									</q-tooltip>
								</div>
							</div>
						</template>
					</div>

					<!-- ACTIONS -->
					<div class="actions">
						<button class="btn btn-sm bg-green" @click="apply('damage')">Apply</button>
						<button class="btn btn-sm bg-red" @click="remove()">Decline</button>
					</div>
				</template>

				<!-- HEALING -->
				<template v-else>
					<div class="damage">Targets</div>
					<div class="targets healing">
						<div v-for="target in request.targets" :key="target">
							<div class="name truncate bg-gray-dark" v-if="entities[target]">
								{{ entities[target].name }}
							</div>
						</div>
					</div>
					<div class="actions">
						<button class="btn btn-sm bg-green" @click="apply('healing')">Apply</button>
						<button class="btn btn-sm bg-red" @click="remove()">Decline</button>
					</div>
				</template>
			</div>
		</q-slide-transition>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';

	export default {
		name: 'RequestItem',
		mixins: [setHP],
		props: ['request', 'i'],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				final_results: {},
				showRequest: false
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
			},
			intensity() {
				//Set no/half/full damage for targets
				let targets = {};

				for(let target of this.request.targets) {
					targets[target] = 1;
				}
				return targets;
			}
		},
		beforeMount() {
			this.final_results = this.setFinal(this.results);
		},
		methods: {
			setFinal(results) {
				let final = this.final_results;

				let amount = {};
				for(let result of results) {					
					for(let key in result.targets) {
						if(amount[key]) {
							amount[key] = amount[key] + parseInt(result.targets[key].amount);
						} else {
							amount[key] = parseInt(result.targets[key].amount);
						}
						final[key] = amount[key];
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
			},
			setIntensity(target, value) {
				this.$set(this.intensity, target, value);
				this.$forceUpdate();
			},
			apply(type) {
				for(let key in this.final_results) {
					let amount = {};
					amount[type] = Math.floor(this.final_results[key] * this.intensity[key]);

					this.setHP(amount, this.entities[key], this.entities[this.request.player], {});
				}
				this.remove();
			},
			remove() {
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/requests/${this.request.key}`).remove();
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
			color: $gray-light !important;

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
			.amount {
				font-size: 15px;
				padding-right: 10px;
				line-height: 28px;
				text-align: right;
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
						color:$gray-dark;
					}

					&.green, &.red, &.blue {
						span {
							color:$white;
						}
					}

				}
			}
			&.healing {
				grid-template-columns: 1fr;
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
