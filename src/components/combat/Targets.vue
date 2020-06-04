<template>
	<div id="targets">
			<h2 
				class="componentHeader d-flex justify-content-between" 
				:class="{ shadow : setShadow > 0 }">
				<span>
					<i class="fas fa-helmet-battle"></i> Targets ({{ _targets.length }})
					<a v-b-popover.hover.top="'Use shift+click to select multiple targets, or hold down on a tablet or phone.'" title="Multitargeting"><i class="fas fa-info-circle"></i></a>
				</span>
				<a @click="setSlide({show: true, type: 'slides/encounter/AddNpc'})"
					v-shortkey="['a']" @shortkey="setSlide({show: true, type: 'slides/encounter/AddNpc'})"
					class="gray-hover text-capitalize" v-b-tooltip.hover title="Add NPC">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">
						Add
						<span v-if="showKeybinds.keyBinds === undefined" class="gray-hover d-none d-sm-inline text-lowercase">[a]</span>
					</span>
				</a>
			</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
					<div>
						<!-- ACTIVE TARGETS -->
						<transition-group 
							tag="ul" 
							class="targets active_targets pt-3" 
							name="targets" 
							enter-active-class="animated fadeInUp" 
							leave-active-class="animated fadeOutDown">
							<li 
								v-for="(entity, i) in _targets"
								class="d-flex justify-content-between" 
								:key="entity.key" 
								:class="{ 'targeted': targeted.includes(entity.key), 'top': _active[0].key == entity.key && encounter.turn != 0}">

								<span class="topinfo d-flex justify-content-between" v-if="_active[0].key == entity.key && encounter.turn != 0">
									Top of the round
									<div>
										<span class="green" v-if="Object.keys(_addedNextRound).length > 0" v-b-tooltip.hover title="Added next round">+ {{ Object.keys(_addedNextRound).length }}</span>
										<span class="red" v-if="Object.keys(_activeDown).length > 0" v-b-tooltip.hover title="Removed next round"><span class="gray-hover mx-1">|</span>- {{ Object.keys(_activeDown).length }}</span>
									</div>
								</span>

								<div class="target" 
									@mousedown="start($event, entity.key)" 
									@mouseleave="stop" 
									@mouseup="stop" 
									@touchstart="start($event, entity.key)" 
									@touchend="stop" 
									@touchcancel="stop"
									v-shortkey="[i]" @shortkey="set_targeted({ longPress: false, e: $event, key: entity.key })">
									<TargetItem :item="entity.key" :i="i" />
								</div>
								<span>
									<a class="options"
										id="options"
										data-toggle="dropdown" 
										aria-haspopup="true" 
										aria-expanded="false">
										<i class="far fa-ellipsis-v"></i>
									</a>
									<div class="dropdown-menu" aria-labelledby="options">	
										<div class="dropdown-header">{{ entity.name }}</div>
										<a v-if="entity.curHp == 0 && !entity.stable" 
											class="dropdown-item" 
											v-shortkey="['s']" @shortkey="set_stable({key: targeted, action: 'set'})"
											@click="set_stable({key: entity.key, action: 'set'})">
											<i class="fas fa-heartbeat"></i> [s] Stabilize
										</a>
										<a class="dropdown-item" 
										v-shortkey="['e']" @shortkey="edit(targeted, entities[targeted], entities[targeted].entityType)"
										@click="edit(entity.key, entities[entity.key], entity.entityType)">
											<i class="fas fa-pencil"></i> <span v-if="showKeybinds.keyBinds === undefined">[e]</span> Edit
											{{ entity.entityType }}
										</a>
										<a class="dropdown-item" 
											@click="setSlide({show: true, type: 'slides/encounter/reminders/TargetReminders', data: entity.key})"
										>
											<i class="fas fa-stopwatch"></i> <span v-if="showKeybinds.keyBinds === undefined">[m]</span> Reminders
										</a>
										<a class="dropdown-item" 
											@click="setSlide({show: true, type: 'slides/Transform', data: entities[entity.key]})"
											v-shortkey="['t']" @shortkey="setSlide({show: true, type: 'slides/Transform', data: entities[targeted]})">
											<i class="fas fa-paw-claws"></i> <span v-if="showKeybinds.keyBinds === undefined">[t]</span> Transform
										</a>
										<a class="dropdown-item" @click="setHidden(entity.key, !entity.hidden)"
											v-shortkey="['h']" @shortkey="setHidden(targeted, !entities[targeted].hidden)">
											<i class="fas fa-eye-slash"></i> <span v-if="showKeybinds.keyBinds === undefined">[h]</span> 
											<template v-if="!entity.hidden"> Hide</template>
											<template v-else> Show</template>
										</a>
										<a class="dropdown-item" @click="setSlide({show: true, type: 'slides/encounter/Conditions', data: entity})">
											<i class="fas fa-flame"></i> <span v-if="showKeybinds.keyBinds === undefined">[c]</span> Conditions
										</a>
										<a class="dropdown-item" @click="setSlide({show: true, type: 'slides/encounter/DamageHealing', data: entity,})">
											<i class="fas fa-swords"></i> <span v-if="showKeybinds.keyBinds === undefined">[d]</span> Do damage/healing
										</a>
										<div class="dropdown-divider"></div>
										<a class="dropdown-item" @click="remove(entity.key, entity.name)">
											<i class="fas fa-times"></i> Remove
										</a>
									</div>
								</span>
							</li>
						</transition-group>

						<!-- IDLE TARGETS -->
						<template v-if="_idle.length">
							<hr>
							<h2>IDLE ({{ _idle.length }})</h2>
							<ul class="targets idle_targets">
								<template v-for="entity in _idle">
									<li class="d-flex justify-content-between" 
										v-bind:key="entity.key" 
										:class="{ targeted : targeted.includes(entity.key) }">
										<div 
											class="target" 
											@mousedown="start($event, entity.key)" 
											@mouseleave="stop" 
											@mouseup="stop" 
											@touchstart="start($event, entity.key)" 
											@touchend="stop" 
											@touchcancel="stop"
										>
											<TargetItem :item="entity.key" />
										</div>
										<span>
										<a class="options"
											id="options"
											data-toggle="dropdown" 
											aria-haspopup="true" 
											aria-expanded="false">
											<i class="far fa-ellipsis-v"></i>
										</a>
										<div class="dropdown-menu" aria-labelledby="options">	
											<div class="dropdown-header">{{ entity.name }}</div>
											<a v-if="entity.curHp == 0 && !entity.stable" 
												class="dropdown-item" 
												v-shortkey="['s']" @shortkey="set_stable({key: targeted, action: 'set'})"
												@click="set_stable({key: entity.key, action: 'set'})">
												<i class="fas fa-hand-holding-magic"></i> <span v-if="showKeybinds.keyBinds === undefined">[s]</span> Stabilize
											</a>
											<a class="dropdown-item" 
											v-shortkey="['e']" @shortkey="edit(targeted, entities[targeted], entities[targeted].entityType)"
											@click="edit(entity.key, entities[entity.key], entity.entityType)">
												<i class="fas fa-hammer-war"></i> <span v-if="showKeybinds.keyBinds === undefined">[e]</span> Edit
											</a>
											<a class="dropdown-item" 
												@click="setSlide({show: true, type: 'slides/Transform', data: entities[entity.key]})"
												v-shortkey="['t']" @shortkey="setSlide({show: true, type: 'slides/Transform', data: entities[targeted]})">
												<i class="fas fa-paw-claws"></i> <span v-if="showKeybinds.keyBinds === undefined">[t]</span> Transform
											</a>
											<a v-if="!entity.hidden" class="dropdown-item" @click="setHidden(entity.key, true)"
												v-shortkey="['h']" @shortkey="setHidden(targeted, true)">
												<i class="fas fa-eye-slash"></i> <span v-if="showKeybinds.keyBinds === undefined">[h]</span> Hide
											</a>
											<a v-else class="dropdown-item" @click="setHidden(entity.key, false)"
												v-shortkey="['h']" @shortkey="setHidden(targeted, false)">
												<i class="fas fa-eye"></i> <span v-if="showKeybinds.keyBinds === undefined">[h]</span> Show
											</a>
											<a class="dropdown-item" @click="setSlide({show: true, type: 'slides/encounter/Conditions', data: entity})">
												<i class="fas fa-flame"></i> <span v-if="showKeybinds.keyBinds === undefined">[c]</span> Conditions
											</a>
											<a class="dropdown-item" @click="setSlide({show: true, type: 'slides/encounter/DamageHealing', data: entity})">
												<i class="fas fa-swords"></i> <span v-if="showKeybinds.keyBinds === undefined">[d]</span> Do damage/healing
											</a>
											<div class="dropdown-divider"></div>
											<a class="dropdown-item" @click="remove(entity.key, entity.name)">
												<i class="fas fa-times"></i> Remove
											</a>
										</div>
									</span>
									</li>
								</template>
							</ul>
						</template>
						<template v-if="_down.length">
							<hr>
							<h2><i class="fas fa-skull-crossbones"></i> Down ({{ _down.length }})</h2>
							<ul class="targets down_targets">
								<li 
									v-for="(entity, index) in _down" 
									:key="index" 
									@mousedown="start($event, entity.key)" 
									@mouseleave="stop" 
									@mouseup="stop" 
									@touchstart="start($event, entity.key)" 
									@touchend="stop" 
									@touchcancel="stop" 
									:class="{ targeted : targeted.includes(entity.key) }">
									<TargetItem :item="entity.key" />
								</li>
							</ul>
						</template>
					</div>
				</div>
			</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { db, auth } from '@/firebase';
	import { mapGetters, mapActions } from 'vuex';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'Targets',
		components: {TargetItem},
		props: ['_active','_idle'],
		data() {
			return {
				userId: (auth.currentUser) ? auth.currentUser.uid : undefined,
				currentTarget: {},
				setShadow: 0,

				//Multitargeting needs variables
				interval:false,
				counter: 0,
				event: undefined,
				key: undefined
			}
		},
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'encounter',
				'entities',
				'targeted',
			]),
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._active)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._active[i])
			},
			_down: function() {
				return _.chain(this.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.down == true;
								})
								.orderBy(function(entity){
									return parseInt(entity.initiative)
								} , 'desc')
								.value()
			},
			//Count NPC's that are down but still in active list
			_activeDown: function() {
				return _.chain(this._targets)
					.filter(function(entity) {
						return entity.curHp == 0 && entity.entityType == 'npc';
					})
					.sortBy('name' , 'desc')
					.value()
			},
			_addedNextRound: function() {
				return _.chain(this._idle)
					.filter(function(entity) {
						return entity.addNextRound == true;
					})
					.sortBy('name' , 'desc')
					.value()
			},
		},
		firebase() {
			return {
				showKeybinds: {
					source: db.ref(`settings/${this.userId}/general`),
					asObject: true
				}
			}
		},
		watch: {
			counter(newValue) {
				if(newValue > 8) {
					this.stop()
				}
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_hidden',
				'set_targeted',
				'set_stable',
				'remove_entity',
			]),
			start(e, key) {
				//Check how long the item is being pressed
				if(!this.interval){
					this.interval = setInterval(() => this.counter++, 30);
					this.event = e;
					this.key = key;
				}
			},
			stop(){
				//If and item was pressed, see if it was long or short
				if(this.interval) {
					let longPress = (this.counter >= 8) ? true : false;
	
					this.set_targeted({
						longPress,
						e: this.event,
						key: this.key
					})
				}
				//Reset all values
				clearInterval(this.interval)
				this.interval = false;
				this.counter = 0;
				this.key = undefined;
			},
			edit(key, entity, entityType) {
				var editType = (entityType === 'player') ? 'slides/EditPlayer' : 'slides/encounter/EditNpc';

				if(key) {
					this.setSlide({
						show: true,
						type: editType,
						data: {
							key: key,
							location: 'encounter'
						}
					})
				}
				else {
					this.$snotify.error('Select a target', 'Edit entity', {
					});
				}
			},
			setHidden(key, hidden) {
				if(key) {
					this.set_hidden({
						key: key,
						hidden: hidden
					})
				} else {
					this.$snotify.error('Select a target', 'Hide entity', {
					});
				}
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollTop
			},
			remove(key, name) {
				this.$snotify.error('Are you sure you want to remove "' + name + '" from this encounter?', 'Delete character', {
					buttons: [
					{ text: 'Yes', action: (toast) => { this.remove_entity({key: key}); this.$snotify.remove(toast.id); }, bold: false},
					{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
		},
	}
</script>

<style lang="scss" scoped>

#targets {
	background: rgba(38, 38, 38, .9);
	grid-area: targets;
	overflow: hidden;

	.target {
		width: 100%;
	}

	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.5); 
			}
		}
	}
	a.options {
		display: inline-block;
		height: 30px;
		line-height: 30px;
		padding: 0 5px 0 15px;
		color: #b2b2b2 !important;

		&:hover {
			color: #2c97de !important;
		}
	}
	.dropdown-menu {
		left: -30px !important;
		top: 0px !important;

		i {
			width: 18px;
			padding-right: 3px;
			text-align: center;
		}
	}
}
.scroll {
	padding:0 0 30px 0;
	height: calc(100% - 20px);
}
ul.targets {
	list-style:none;
	padding:0 15px 0 10px;

	li {
		// height: 32px;
		margin-bottom: 8px;
		border: solid 1px transparent;
		cursor: pointer;
		background: #191919;

		&:hover {
			background: #000;
			border-color: #b2b2b2;
		}
		&.targeted {
			border-color: #2c97de !important;
			box-shadow: 0px 0px 10px rgba(44, 151, 222, .5);
		}
	}
	&.active_targets li:first-child {
		margin-bottom: 20px;
		border-color: #83b547;
		box-shadow: 0px 0px 10px rgba(131, 181, 71, .5);
	}
	li.top {
		position: relative;
		margin-top: 30px;

		.topinfo {
			cursor: default;
			text-transform: uppercase;
			font-size: 11px;
			width: 100%;
			position: absolute;
			top: -25px;
			border-bottom: solid 1px #b2b2b2;
		}
	}
}
.targets-move {
  transition: transform .6s;
}
.fadeInUp, .fadeInDown {
	animation-delay: .6s;
}
@media only screen and (max-width: 600px) {
	#targets, .scroll {
		overflow: visible !important;
		padding-bottom: 0;
	}
}
</style>