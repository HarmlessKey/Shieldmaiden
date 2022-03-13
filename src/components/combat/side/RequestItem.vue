<template>
	<q-expansion-item
		class="request" 
		:dark="$store.getters.theme === 'dark'" 
		group="requests"
	>
		<template #header>
			<q-item-section>
				<q-item-label caption>{{ entities[request.player].name }}</q-item-label>
				<q-item-label>
					{{ totalAmount }} <span :class="request.type === 'healing' ? 'green' : 'red'">{{ request.type }}</span>
				</q-item-label> 
			</q-item-section>
			<q-item-label class="text-right neutral-3">
				<q-item-label caption class="text-right neutral-3">
					Round: {{ request.round }}
				</q-item-label>	
				<q-item-label>
					Turn: {{ request.turn + 1 }}
				</q-item-label>	
			</q-item-label>
		</template>
		<div class="accordion-body">
			<!-- DAMAGE -->
			<template v-if="request.type === 'damage'">
				<div v-for="(result, index) in results" :key="`result-${index}`">
					<div class="damage">{{ result.amount}} {{ result.damage_type }}</div>
					<div class="targets">
						<template v-for="(target, key) in result.targets">
							<div class="name truncate bg-neutral-8" :key="`name-${key}-${i}`" v-if="entities[key]">
								{{ entities[key].name.capitalizeEach() }}
							</div>

							<div class="amount bg-neutral-8" :key="`amount-${key}-${i}`">
								{{ target.amount }}
							</div>

							<div class="defenses bg-neutral-8" :key="`defenses-${key}-${i}`">
								<div 
									v-for="({name}, defense_key) in defenses"
									:key="defense_key"
									class="option"
									@click.stop="setDefense(defense_key, index, key)"
									:class="[{active: target.defense === defense_key}, defense_key]"
								>
									<i aria-hidden="true" class="fas fa-shield"></i>
									<span>{{ defense_key.capitalize() }}</span>
									<q-tooltip anchor="top middle" self="center middle">
										{{ name }}
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
						<div class="name truncate bg-neutral-8" v-if="entities[key]" :key="`final-name-${key}`">
							{{ entities[key].name }}
						</div>
						<div class="amount bg-neutral-8 red" :key="`final-amount-${key}`">
							{{ Math.floor(final * intensity[key]) }}
						</div>
						<div class="defenses bg-neutral-8" :key="`final-options-${key}`">
							<div
								v-for="{multiplier, name, label} in multipliers"
								@click="setIntensity(key, multiplier)"
								:class="{blue: intensity[key] === multiplier}"
								:key="multiplier"
							>
								<i aria-hidden="true" class="fas fa-circle"></i>
								<span>{{ name }}</span>
								<q-tooltip anchor="top middle" self="center middle">
									{{ label }}
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
						<div class="name truncate bg-neutral-8" v-if="entities[target]">
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
	</q-expansion-item>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { setHP } from 'src/mixins/HpManipulations.js';

	export default {
		name: 'RequestItem',
		mixins: [setHP],
		props: ['request', 'i'],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				multipliers: [
					{ multiplier: 0, name: "0", label: "No damage" },
					{ multiplier :.5, name: "½", label: "Half damage" },
					{ multiplier: 1, name: "1", label: "Full damage" }
				],
				defenses: {
					v: { name: "Vulnerable", value: "double" },
					r: { name: "Resistant", value: "half" },
					i: { name: "Immune", value: "no" }
				},
				final_results: {},
				showRequest: false
			}
		},
		computed: {
			...mapGetters([
				"entities"
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

				let resistances = {
					v: "damage_vulnerabilities",
					r: "damage_resistances",
					i: "damage_immunities"
				}

				results.forEach(result => {
					result.targets = {};

					for(let target of targets) {
						result.targets[target] = {};
						result.targets[target].amount = result.amount;
						result.targets[target].defense = '';

						// Set defenses
						for(const [key, defense] of Object.entries(resistances)) {
							if(this.entities[target][defense] && this.entities[target][defense].includes(result.damage_type)) {
								result.targets[target].defense = key;
								result.targets[target].amount = this.updateAmount(key, result.targets[target].amount);
							}
						}
					}
				});
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
		mounted() {
			this.final_results = this.setFinal(this.results);
		},
		methods: {
			...mapActions(["delete_request"]),
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
			updateAmount(defense, amount) {
				if(defense === 'v') {
					return amount * 2;
				} else if(defense === 'r') {
					return Math.floor(amount / 2);
				} else if(defense === 'i') {
					return 0;
				}
			},
			setDefense(defense, index, target) {
				let amount = this.results[index].amount;

				if(defense === this.results[index].targets[target].defense) {
					defense = '';
				} else {
					amount = this.updateAmount(defense, amount);
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

					// Set config for HpManipulation and log
					const config = {
						crit: this.crit,
						ability: "player request",
						log: true,
						actions: [
							{
								type,
								request: true,
								rolls: []
							}
						]
					};
					for(const result of this.results) {
						let roll = {
							damage_type: result.damage_type,
							value: result.targets[key].amount
						}
						config.actions[0].rolls.push(roll);
					}
					this.setHP(amount, this.entities[key], this.entities[this.request.player], config);
				}
				this.remove();
			},
			remove() {
				this.delete_request(this.request.key);
			}
		},
	}
</script>

<style lang="scss" scoped>
	.q-expansion-item {
		background-color: $neutral-8;
		margin-bottom: 1px;
	}
	.accordion-body {
		padding: 10px;
		background-color: $neutral-9;

		.damage {
			font-size: 15px;
			border-bottom: solid 1px $neutral-4;
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
						color: $neutral-9;
					}

					&.active {
						&.i, &.r { color: $green; }
						&.v { color: $red; }
						span {
							color: $neutral-1;
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
