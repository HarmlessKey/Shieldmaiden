<template>
	<div class="target">
		<span class="initiative" v-b-tooltip.hover title="Initiative">{{ entity.initiative }}</span>
		<span class="img" :style="{'background-image': 'url(' + entity.img + ')'}">
			<span v-if="entity.transformed == true" v-b-tooltip.hover title="Transformed">
				<i class="fas fa-paw-claws"></i>
			</span>
		</span>
		<span class="img" v-if="entity.img != ''" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }">
			<span v-if="entity.transformed == true" v-b-tooltip.hover title="Transformed">
				<i class="fas fa-paw-claws"></i>
			</span>
		</span>
		<span class="img" v-else><img src="@/assets/_img/styles/player.svg" /></span>
		<span class="ac green" v-b-tooltip.hover :title="'Armor Class + ' + entity.ac_bonus" v-if="entity.ac_bonus">
			{{ displayStats().ac + entity.ac_bonus}}
		</span>
		<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayStats().ac }}</span>

		<template>
			<div class="progress health-bar">
				<span>{{ entity.name }}</span>
				<div class="conditions d-flex justify-content-right" v-if="entity.conditions">
					<div class="condition bg-red" 
						v-for="(condition, key) in entity.conditions" 
						:key="key" 
						v-b-tooltip.hover :title="key"
						@click="showCondition(key, entity)"></div>
				</div>
				<div class="progress-bar" :class="{ 
					'bg-red': percentage(displayStats().curHp, displayStats().maxHp) < 33, 
					'bg-orange': percentage(displayStats().curHp, displayStats().maxHp) > 33 && percentage(displayStats().curHp, displayStats().maxHp) < 76, 
					'bg-green': percentage(displayStats().curHp, displayStats().maxHp) > 7
					}" 
					role="progressbar" 
					:style="{ width: percentage(displayStats().curHp, displayStats().maxHp) + '%' }" aria-valuemin="0" aria-valuemax="100">
				</div>
			</div>

			<!-- HEALTH -->
			<template v-if="entity.active == true">
				<template v-if="(entity.curHp > 0 && entity.entityType == 'player') || entity.entityType == 'npc'">
					{{ setNumber(displayStats().curHp) }} 
					<span class="hp" v-b-tooltip.hover title="Current / Max HP + Temp">
						<span class="current" :class="{ 
							'red': percentage(displayStats().curHp, displayStats().maxHp) < 33, 
							'orange': percentage(displayStats().curHp, displayStats().maxHp) > 33 && percentage(displayStats().curHp, displayStats().maxHp) < 76, 
							'green': percentage(displayStats().curHp, displayStats().maxHp) > 7
							}">{{ animatedNumber }}</span>
							<span class="gray-hover">/</span>{{ displayStats().maxHp }}
						<template v-if="entity.tempHp">
							<span class="gray-hover">+{{ entity.tempHp }}</span>
						</template>
					</span>
				</template>
				<template v-else>
					<div class="hp">
						<div v-if="entity.stable" class="green">
							<span><i class="fas fa-fist-raised"></i> Stable</span>
						</div>
						<div v-if="entity.dead && !entity.stable" class="red">
							<span><i class="fas fa-skull-crossbones"></i> Dead</span>
						</div>
						<div v-else class="hp d-flex justify-content-end">
							<div v-for="check in entity.saves" :key="check">
								<span v-show="check == 'succes'" class="save green"><i class="fas fa-check"></i></span> 
								<span v-show="check == 'fail'" class="save red"><i class="fas fa-times"></i></span>
							</div>
						</div>
					</div>
				</template>
			</template>
			<div v-else class="text-right">
				<span class="green" 
					v-if="entity.addNextRound == true"
					v-b-tooltip.hover title="Will be added next round"
					@click="add_next_round({key: entity.key, action: 'tag', value: false})">
					<i class="fas fa-check"></i>
				</span>
				<span class="gray-hover" 
					v-if="entity.addNextRound == false"
					v-b-tooltip.hover title="Click to add next round"
					@click="add_next_round({key: entity.key, action: 'tag', value: true})">
					<i class="fas fa-check"></i>
				</span>
			</div>
		</template>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'TargetItem',
		props: ['item'],
		data () {
			return {
				target: '',
				number: 0,
				tweenedNumber: 0
			}
		},
		computed: {
			...mapGetters([
				'entities',
			]),
			animatedNumber: function() {
				return this.tweenedNumber.toFixed(0);
			},
			entity: function() {
				return this.entities[this.item]
			}
		},
		watch: {
			number: function(newValue) {
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_next_round',
			]),
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			setNumber(value) {
				this.number = value
			},
			displayStats() {
				var stats = '';
				if(this.entity.transformed == true) {
					stats = {
						ac: this.entity.transformedAc,
						maxHp: this.entity.transformedMaxHp,
						curHp: this.entity.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: this.entity.ac,
						maxHp: this.entity.maxHp,
						curHp: this.entity.curHp,
					}
				}
				return stats
			},
			showCondition(show, entity) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'condition',
					condition: show,
					entity, entity
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.target {
	width: 100%;
	display: grid;
	grid-template-columns: 30px 30px 30px 2fr 2fr;
	grid-template-rows: 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"initiative img ac hp-bar hp-bar hp-bar hp hp";
	
	line-height: 30px;
}
.progress { 
	height: 30px;
	background-color: #302f2f;
	margin-right: 5px;
	position: relative;

	span { 
		color:#191919;
		font-size: calc( 8px + (10 - 8) * ( (100vw - 360px) / ( 800 - 360) ));
		position: absolute;
		left: 5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis !important;
	}
	.conditions {
		position: absolute;
		right: 0;
		top: 0;

		.condition {
			display: block;
			width: 12px;
			height: 12px;
			border: solid 1px #fff;
			margin-left: 1px;
		}
	}
}
.initiative, .ac, .img {
	text-align:center;
	height: 30px;
}
.initiative {
	grid-area: initiative;
}
.img {
	display: block;
	width: 30px;
	height: 30px;
	background-color: #191919;
	background-position: center top;
	background-repeat: no-repeat;
	background-size: cover;
	color: #cc3e4a;
	font-size: 20px;
	line-height: 30px;
	grid-area: img;
	overflow: hidden;

	span {
		position: relative;
	}
}
.ac {
	background-color:#4c4c4c;
	font-weight:bold;
	color:#191919;
	grid-area: ac;
}
.hp {
	font-size: calc( 8px + (10 - 8) * ( (100vw - 360px) / ( 800 - 360) ));
	text-align: right;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis !important;
	
	.save {
		margin-right: 4px;
	}
}
.temp {
	color: #494747;
}
</style>