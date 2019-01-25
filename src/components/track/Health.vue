<template>
	<div v-if="entity.curHp > 0 || entity.entityType == 'npc'">
		{{ setNumber(displayHp(entity).curHp) }}
		<span class="hp">
			<span v-if="entity.transformed" v-b-tooltip.hover title="Transformed" class="mr-1">
				<i class="fas fa-paw-claws"></i>
			</span>
			<span class="current" :class="{ 
				'red': percentage(displayHp(entity).curHp, displayHp(entity).maxHp) <= 33, 
				'orange': percentage(displayHp(entity).curHp, displayHp(entity).maxHp) > 33 && percentage(displayHp(entity).curHp, displayHp(entity).maxHp) < 76, 
				'green': percentage(displayHp(entity).curHp, displayHp(entity).maxHp) > 7
				}">
					{{ animatedNumber }}
				</span>
				<span class="gray-hover">/</span>{{ displayHp(entity).maxHp }}
			<template v-if="entity.tempHp">
				+{{ entity.tempHp }}
			</template>
		</span>
	</div>
	<div v-else>
		<div v-if="entity.stable" class="green">
			<span><i class="fas fa-fist-raised"></i> Stable</span>
		</div>
		<div v-if="entity.dead && !entity.stable" class="red">
			<span><i class="fas fa-skull-crossbones"></i> Dead</span>
		</div>
		<div v-else class="hp d-flex justify-content-start">
			<div v-for="(check, key) in entity.saves" v-bind:key="key" class="mr-1">
				<span v-show="check == 'succes'" class="save green"><i class="fas fa-check"></i></span> 
				<span v-show="check == 'fail'" class="save red"><i class="fas fa-times"></i></span>
			</div>
		</div>
	</div>
</template>

<script>
	import { attributes } from '@/mixins/attributes.js'

	export default {
		name: 'Health',
		mixins: [attributes],
		props: [
			'entity',
		],
		data() {
			return {
				number: 0,
				tweenedNumber: 0,
			}
		},
		firebase() {
			return {
				
			}
		},
		computed: {
			animatedNumber: function() {
				return this.tweenedNumber.toFixed(0);
			},
		},
		watch: {
			number: function(newValue) {
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			},
		},
		methods: {
			setNumber(value) {
				this.number = value
			},
			displayHp(entity) {
				var stats = {};

				if(entity.transformed) {
					stats = {
						maxHp: parseInt(entity.transformed.maxHp),
						curHp: parseInt(entity.transformed.curHp),
					}
				}
				else {
					stats = {
						maxHp: parseInt(entity.maxHp),
						curHp: parseInt(entity.curHp),
					}
				}
				return stats
			},
		},
	}
</script>

<style lang="scss" scoped>
	.table {
		border-collapse: separate; 
		border-spacing: 0 5px;

		tr:first-child {
			td {
				border-top: solid 1px #2c97de !important;
				border-bottom: solid 1px #2c97de !important;
			}
			td:first-child {
				border-left: solid 1px #2c97de !important;
			}
			td:last-child {
				border-right: solid 1px #2c97de !important;
			}
		}
		tr {
			td {
				background: rgba(38, 38, 38, .9);
			}
			td.ac, th.ac {
				width: 30px;
				text-align: center;
			}
			td.ac {
				font-weight: bold;
			}
			td.name {
				width: 1%;
				white-space: nowrap;
			}
			td.hp {

			}
			td.img {
				width: 45px;
				background-size: cover;
				background-position: center top;
			}
		}
		tr td:first-child, thead th {
			text-align: center;
			color: #fff;
			background: none;
			text-shadow: 0 0 3px  #000;
		}
	}
	.conditions {
		padding: 9px 10px;

		svg {
			width: 24px;
			height: 24px;
			fill: #cc3e4a;
			padding: 2px;
			cursor: pointer;
			margin: 0;
		}
	}
	.entities-move {
		transition: transform .6s;
	}
</style>
