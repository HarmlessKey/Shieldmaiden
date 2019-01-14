<template>
	<div id="current" class="bg-gray">
		<template v-if="current">
			<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">Current</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
					<div class="current">

						<template v-if="current.entityType == 'player' && current.curHp == 0 && !current.stable">
								<a @click="deathInfo()">What is this <i class="fas fa-question"></i></a>
								<div class="px-1 my-3 d-flex justify-content-between">
									<div v-for="(n, index) in 5">
										<template v-if="Object.keys(current.saves).length == n">
											<a v-show="current.saves[n] === 'succes'" class="green" v-b-tooltip.hover title="Change" @click="save('unset', n)"><i class="fas fa-check"></i></a>
											<a v-show="current.saves[n] === 'fail'" class="red" v-b-tooltip.hover title="Change" @click="save('unset', n)"><i class="fas fa-times"></i></a>
										</template>
										<template v-else>
											<span v-show="current.saves[n] === 'succes'" class="green"><i class="fas fa-check"></i></span>
											<span v-show="current.saves[n] === 'fail'" class="red"><i class="fas fa-times"></i></span>
										</template>
										<span v-show="!current.saves[n]" class="gray-hover"><i class="fas fa-dot-circle"></i></span>
									</div>
								</div>
								<div v-if="Object.keys(current.saves).length < 5" class="d-flex justify-content-between">
									<button class="btn save bg-green" @click="save('succes', Object.keys(current.saves).length)"><i class="fas fa-check"></i></button>
									<button class="btn save bg-red" @click="save('fail', Object.keys(current.saves).length)"><i class="fas fa-times"></i></button>
								</div>
								<a class="btn btn-block mt-3" @click="set_stable({key: current.key, action: 'set'})"><i class="fas fa-hand-holding-magic"></i> Stabilize</a>
						</template>
						
						<template v-else>
							<div class="health">
								<span class="img" :style="{ backgroundImage: 'url(\'' + current.img + '\')' }"></span>
								<div class="progress health-bar">
									<span v-show="current.stable" class="green percentage"><i class="fas fa-fist-raised"></i> Stable</span>
									<div v-show="!current.stable">
										<span class="percentage">{{ percentage(current.curHp, current.maxHp) }}%</span>
										<span class="hp">{{ current.curHp }} / {{ current.maxHp }}</span>
									</div>
									<div class="progress-bar" :class="{ 
										'bg-red': percentage(current.curHp, current.maxHp) <= 33, 
										'bg-orange': percentage(current.curHp, current.maxHp) > 33 && percentage(current.curHp, current.maxHp) < 76, 
										'bg-green': percentage(current.curHp, current.maxHp) > 7
										}" 
										role="progressbar" 
										:style="{width: percentage(current.curHp, current.maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
									</div>
								</div>
							</div>
						</template>

						<b-row class="conditions">
							<b-col sm="1" v-for="condition, key in current.conditions" :key="key" @click="showCondition(conditions[key])">
								<svg 
								v-if="conditions[key]"
								v-b-popover.hover="conditions[key].condition" 
								:title="key" 
								class="icon text" 
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512">
									<path :d="conditions[key].icon" fill-opacity="1"></path>
								</svg>
							</b-col>
						</b-row>
						<NPC class="mt-3" :entity="current" />
					</div>
				</div>
			</div>
		</template>
		<div v-else class="loader"><span>Loading current...</span></div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import NPC from '@/components/slides/NPC.vue';

	export default {
		name: 'Current',
		components: {
			NPC: NPC,
		},
		props: ['current'],
		data() {
			return {
				setShadow: 0,
			}
		},
		firebase() {
			return {
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'turn',
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_save',
				'set_stable',
			]),
			showCondition(show) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'condition',
					condition: show
				})
			},
			deathInfo() {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'deathSaves',
				})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollTop
			 },
			 save(check, number) {
				 this.set_save({
					 key: this.current.key,
					 check: check,
					 number: number
					})
			 },
			 stabilize(key) {
				this.set_stable({
					 key: this.current.key,
					 action: 'set',
					})
			 },
		}
	}
</script>

<style lang="scss" scoped>
#current {
	grid-area: current;
	overflow: hidden;
	
	.current {
		padding: 15px 10px;
	}
	.scroll {
		height: calc(100% - 30px);
	}
	h2.componentHeader {
		padding: 10px 15px !important;
		margin-bottom: 0 !important;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0,0.8); 
		}
	}
	.btn.save {
		width: 49.5%;
	}
	.health {
		display: grid;
		grid-template-columns: 30px 1fr;
		grid-template-rows: auto;
		grid-gap: 0;
		grid-template-areas: 
		"img hp-bar";

		margin-bottom: 10px;

		.img {
			background-color: #191919;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
			grid-area: img;
		}
		.progress { 
			height: 30px;
			line-height: 30px;
			background-color: #302f2f;
			position: relative;

			span.hp, span.percentage {
				
				color:#191919;
				position: absolute;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			span.hp {
				text-align: right;
				right: 5px;
			}
			span.percentage {
				left: 5px;
			}
		}
	}
	.conditions {
		margin-bottom: 10px;

		svg {
			width: 30px;
			height: 30px;
			fill: #cc3e4a;
			background-color: #302f2f;
			padding: 2px;
			cursor: pointer;
		}
	}
}

</style>