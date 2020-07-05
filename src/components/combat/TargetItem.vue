<template>
	<div>
		<div class="target">
			<!-- INITIATIVE -->
			<span class="initiative" v-b-tooltip.hover title="Initiative">
				<i v-if="targeted.includes(entity.key)" class="fas fa-crosshairs blue" />
				<template v-else>{{ entity.initiative }}</template>
			</span>

			<!-- HIDDEN -->
			<span 
				v-if="entity.hidden" 
				class="img" 
				v-b-tooltip.hover title="Hidden"
				:style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
			>
				<i class="fas fa-eye-slash red" />
			</span>

			<!-- TRANSFORMED -->
			<span 
				v-else-if="entity.transformed == true" 
				class="img" 
				v-b-tooltip.hover title="Transformed"
				:style="entity.color_label ? `border-color: ${entity.color_label}; color: ${entity.color_label}` : ``"
			>
				<i class="fas fa-paw-claws" />
			</span>

			<!-- AVATAR -->
			<template v-else>
				<icon v-if="entity.img === 'monster' || entity.img === 'player' || entity.img === 'companion'" class="img" :icon="entity.img" :fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``" />
				<span 
					v-else class="img" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}"/>
			</template>

			<!-- ARMOR CLASS -->
			<div class="ac_wrapper">
				<i class="fas fa-shield" ></i>
				<span class="ac" 
					:class="{ 
						'green': entity.ac_bonus > 0,
						'red': entity.ac_bonus < 0 
					}" 
					v-b-tooltip.hover :title="'Armor Class + ' + entity.ac_bonus" 
					v-if="entity.ac_bonus">
					{{ displayStats().ac + entity.ac_bonus}}
				</span>
				<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayStats().ac }}</span>
			</div>

			<!-- HEALT BAR -->
			<template>
				<div class="progress health-bar">
					<span>
						<template v-if="entity.active && showKeybinds.keyBinds === undefined">[{{ i }}]</template>
						{{ entity.name }}
					</span>
					<div class="conditions d-flex justify-content-right" v-if="entity.conditions">
						<div class="condition bg-red" 
							v-for="(condition, key) in entity.conditions" 
							:key="key" 
							v-b-tooltip.hover :title="key"
							@click="showCondition(key)"></div>
					</div>
					<div class="progress-bar" :class="{ 
						'bg-red': percentage(displayStats().curHp, displayStats().maxHp) <= 33, 
						'bg-orange': percentage(displayStats().curHp, displayStats().maxHp) > 33 && percentage(displayStats().curHp, displayStats().maxHp) <= 76, 
						'bg-green': true
						}" 
						role="progressbar" 
						:style="{ width: percentage(displayStats().curHp, displayStats().maxHp) + '%' }" aria-valuemin="0" aria-valuemax="100">
					</div>
				</div>

				<!-- HEALTH -->
				<template v-if="entity.active == true">
					<template v-if="(entity.curHp > 0 && entity.entityType == 'player'  || entity.entityType === 'companion') || entity.entityType == 'npc'">
						{{ setNumber(displayStats().curHp) }} 
						<span class="hp">
							<span class="current" :class="{ 
								'red': percentage(displayStats().curHp, displayStats().maxHp) <= 33, 
								'orange': percentage(displayStats().curHp, displayStats().maxHp) > 33 && percentage(displayStats().curHp, displayStats().maxHp) <= 76, 
								'green': true
								}">{{ animatedNumber }}</span>
								<span class="gray-hover" >/</span>
								<span :class="{ 
										'green': entity.maxHpMod > 0, 
										'red': entity.maxHpMod < 0 
									}" 
									v-b-tooltip.hover :title="'Max HP + ' + entity.maxHpMod">
									{{ displayStats().maxHp }}
								</span>
							<template v-if="entity.tempHp">
								<span class="gray-hover" v-b-tooltip.hover title="Temp HP">
									+{{ entity.tempHp }}
								</span>
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
								<div v-for="(check, index) in entity.saves" :key="index">
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
						v-on:click.stop="add_next_round({key: entity.key, action: 'tag', value: false})">
						<i class="fas fa-check"></i>
					</span>
					<span class="gray-hover" 
						v-if="entity.addNextRound == false"
						v-b-tooltip.hover title="Click to add next round"
						v-on:click.stop="add_next_round({key: entity.key, action: 'tag', value: true})">
						<i class="fas fa-check"></i>
					</span>
					<span class="ml-2 gray-hover" 
						v-b-tooltip.hover title="Add now"
						@click="add_next_round({key: entity.key, action: 'set'})">
						<i class="fas fa-plus"></i>
					</span>
				</div>
			</template>
		</div>

		<!-- REMINDERS -->
		<ul v-if="entity.reminders" class="reminders d-flex justify-content-start">
			<li v-for="(reminder, index) in entity.reminders" :key="index" v-b-tooltip.hover :title="reminder.title" :class="'bg-'+reminder.color">
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';

	export default {
		name: 'TargetItem',
		props: ['item', 'i'],
		data () {
			return {
				user: this.$store.getters.getUser,
				target: '',
				number: 0,
				tweenedNumber: 0
			}
		},
		firebase() {
			return {
				showKeybinds: {
					source: db.ref(`settings/${this.user.uid}/general`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
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
				// eslint-disable-next-line
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_next_round',
			]),
			showCondition(key) {
				//Stop other functions so target is not deselected
				event.stopPropagation();

				this.setSlide({
					show: true, 
					type: 'slides/encounter/Condition',
					data: {
						condition: key,
						entity: this.entity
				}})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			setNumber(value) {
				this.number = value
			},
			displayStats() {
				var stats = '';
				if(this.entity.transformed) {
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
	user-select: none;
}
.progress { 
	height: 30px;
	background-color: #232323;
	margin-right: 5px;
	position: relative;

	span { 
		color:#fff;
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
			cursor: pointer;
		}
	}
}
.initiative, .ac, .img {
	text-align: center;
	height: 30px;
}
.ac_wrapper {

	grid-area: ac;
	position: relative;
	i, .ac {
		position: absolute;
		line-height: 30px;
		width: 100%;
		text-align: center;
	}
	i {
		font-size: 25px;
		color: #5c5757;
	}
	.ac {
		font-weight: bold;
		color: #fff;
		margin-top: -1px;
	}
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
	font-size: 20px;
	line-height: 30px;
	grid-area: img;
	overflow: hidden;
	border: solid 1px transparent;

	span {
		position: relative;
	}
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
ul.reminders {
	padding-left: 30px;
	list-style: none;

	li {
		width: 20px;
		height: 7px;
		// border: solid 1px #fff;
		margin: 1px 1px 1px 0;
	}
}
</style>