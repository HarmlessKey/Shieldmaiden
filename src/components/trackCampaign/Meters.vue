<template>
	<div class="meters">
		<q-tabs
			v-model="doneTaken"
			dark
			inline-label
			dense
			no-caps
			class="white text-shadow"
		>
			<q-tab 
				v-for="({name, label}, index) in tabs"
				:key="`tab-${index}`" 
				:name="name" 
				:label="label"
			/>
		</q-tabs>
		<template v-if="(Object.keys(_meters['damage']).length > 0 || Object.keys(_meters['healing']).length > 0)">
			<div v-for="({type, subtype, over}, index) in types" :key="index">
				<template v-if="Object.keys(_meters[type]).length > 0">
					<h3>{{ type }} {{ doneTaken }}</h3>
					<transition-group tag="ul" 
						name="entities" 
						enter-active-class="animated animate__fadeInUp" 
						leave-active-class="animated animate__fadeOutDown">
						<template v-for="entity in _meters[type]">
							<li v-if="entity" class="health" :key="entity.key">
								<div class="img">
									<Avatar :entity="entity" :players="players" :npcs="npcs" />
								</div>
								<q-linear-progress 
									size="30px" 
									:value="percentageMeters(entity.meters[subtype], type, subtype)" 
									color="black" 
									class="bg-gray-active"
								>
									<div class="info">
										<span class="name">
											<Name :entity="entity" :players="players" :npcs="npcs" :npcSettings="npcSettings" />
										</span>
										<span class="numbers">
											<span :class="{
												'red' : type == 'damage',
												'green' : type == 'healing'
											}">
												<template v-if="entity.meters[subtype] < 10000">{{ entity.meters[subtype] }}</template>
												<template v-else>{{ entity.meters[subtype] | numeral('0.0a') }}</template>
											</span>
											<template v-if="entity.meters[over]"> 
												(<template v-if="entity.meters[over] < 10000">{{ entity.meters[over] }} </template>
												<template v-else>{{ entity.meters[over] | numeral('0.0a') }} </template> 
												<small>over</small>)</template>
										</span>
									</div>
								</q-linear-progress>
							</li>
						</template>
					</transition-group>
				</template>
			</div>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { trackEncounter } from '@/mixins/trackEncounter.js';
	import Name from './live/Name';
	import Avatar from './live/Avatar';

	export default {
		name: 'app',
		mixins: [trackEncounter],
		components: {
			Name,
			Avatar
		},
		props: [
			'entities',
			'campaign',
			'players',
			'npcs',
			'npcSettings'
		],
		data() {
			return {
				userId: this.$route.params.userid,
				doneTaken: 'done',
				tabs: [
					{
						name: 'done',
						label: 'Done'
					},
					{
						name: 'taken',
						label: 'Taken'
					}
				]
			}
		},
		computed: {
			types() {
				let dmg = {
					type: 'damage',
					subtype: 'damage',
					over: 'overkill'
				}
				let heal = {
					type: 'healing',
					subtype: 'healing',
					over: 'overhealing'
				}
				if(this.doneTaken === 'taken') {
					dmg.subtype = 'damageTaken';
					dmg.over = 'overkillTaken';
					heal.subtype = 'healingTaken';
					heal.over = 'overhealingTaken';
				}

				return {
					'damage': { 
						type: dmg.type, 
						subtype: dmg.subtype, 
						over: dmg.over
					},
					'healing': { 
						type: heal.type, 
						subtype: heal.subtype, 
						over: heal.over
					},
				}
			},
			_meters: function() {
				let dmg = (this.doneTaken === 'done') ? 'damage' : 'damageTaken';
				let heal = (this.doneTaken === 'done') ? 'healing' : 'healingTaken';
				return {
					'damage': _.chain(this.entities)
						.filter(function(entity, key) {
							entity.key = key
							let damage = (entity.meters) ? entity.meters[dmg] : 0;
							return damage > 0;
						})
						.orderBy(function(entity){
							let damage = (entity.meters) ? entity.meters[dmg] : 0;
							return parseInt(damage)
						} , 'desc').value(),
					'healing': _.chain(this.entities)
						.filter(function(entity, key) {
							entity.key = key

							let healing = (entity.meters) ? entity.meters[heal] : 0;
							return healing > 0;
						})
						.orderBy(function(entity){
							let healing = (entity.meters) ? entity.meters[heal] : 0;
							return parseInt(healing)
						} , 'desc').value()
				}
			},
		},
		methods: {
			percentageMeters(input, type, subtype) {
				//Highest = 100%
				//lower is percentage of highest
				return input / this._meters[type][0].meters[subtype];
			},
		},
	}
</script>

<style lang="scss" scoped>
	.meters {
		user-select: none;

		h3 {
			text-transform: capitalize;
			color:$neutral-1;
			text-shadow: 0 0 3px $black;
			font-size: 12px !important;
			font-weight: bold !important;
			margin: 20px 0 0 0 !important;
		}
		ul {
			padding: 0;
			list-style: none;
			margin: 0;

			li {
				display: grid;
				grid-template-columns: 30px 1fr;
				grid-template-rows: auto;
				grid-gap: 0;
				grid-template-areas: 
				"img hp-bar";

				margin-bottom: 3px;

				.img {
					grid-area: img;
				}
				.q-linear-progress { 
					font-size: 15px !important;
					line-height: 30px;
					height: 30px;
					position: relative;

					.info {
						color: $gray-light;
						width: 100%;
						position: absolute;
						left: 0;
						display: grid;
						grid-template-columns: auto max-content;
						grid-template-rows: auto;
						grid-gap: 0;
						grid-template-areas: 
						"name numbers";

						.numbers {
							text-align: right;
							padding: 0 5px;
						}
						span.name {
							font-weight: bold !important;
							padding-left: 5px;
							white-space: nowrap; 
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}
				}
			}
		}
		.entities-move {
			transition: transform .6s;
		}
	}
	@media only screen and (min-width: 1250px) {
		.meters {
			ul {
				li {
					grid-template-columns: 40px 1fr;

					.img {
						width: 40px;
						height: 40px;
					}
					.q-linear-progress { 
						font-size: 18px !important;
						height: 40px;
						line-height: 40px;

						.info {
							.number {
								padding: 0 8px;
							}
							span.name {
								padding-left: 8px;
							}
						}
					}
				}
			}
		}
	}
</style>
