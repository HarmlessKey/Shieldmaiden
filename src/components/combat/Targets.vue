<template>
	<div id="targets">
			<h2 
				class="componentHeader d-flex justify-content-between" 
				:class="{ shadow : setShadow > 0 }">
				<span>
					<i class="fas fa-helmet-battle"></i> Targets ({{ _targets.length }})
				</span>
				<a @click="setSlide({show: true, type: 'slides/encounter/AddNpc'})"
					v-shortkey="['a']" @shortkey="setSlide({show: true, type: 'slides/encounter/AddNpc'})"
					class="gray-hover text-capitalize">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">
						Add
						<span v-if="showKeybinds.keyBinds === undefined" class="gray-hover d-none d-sm-inline text-lowercase">[a]</span>
					</span>
					<q-tooltip anchor="top middle" self="center middle">
						Add NPC
					</q-tooltip>
				</a>
			</h2>
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scroll">
				<div v-shortkey="{
					downSingle: ['arrowdown'], 
					downMultiple: ['shift', 'arrowdown'],
					upSingle: ['arrowup'], 
					upMultiple: ['shift', 'arrowup']
				}" 
				@shortkey="cycle_target"
			>
					<template v-for="{group, targets} in groups">
						<h2 :key="`header-${group}`" v-if="group !== 'active' && targets.length > 0">
							<i v-if="group === 'down'" class="fas fa-skull-crossbones red" /> {{ group.capitalize() }} ({{ targets.length }})
						</h2>
						<transition-group
							:key="group"
							tag="ul" 
							class="targets"
							:class="`${group}_targets`"
							name="group" 
							enter-active-class="animated fadeInUp" 
							leave-active-class="animated fadeOutDown"
						>
							<li 
								v-for="(entity, i) in targets"
								class="d-flex justify-content-between" 
								:key="entity.key" 
								:class="{ 
									'targeted': targeted.includes(entity.key), 
									'top': _active[0].key === entity.key && encounter.turn !== 0
								}"
							>
								<span 
									class="topinfo d-flex justify-content-between" 
									v-if="group === 'active' && _active[0].key == entity.key && encounter.turn != 0"
								>
									Top of the round
									<div>
										<span class="green" v-if="Object.keys(_addedNextRound).length > 0">
											+ {{ Object.keys(_addedNextRound).length }}
											<q-tooltip anchor="top middle" self="center middle">
												Added next round
											</q-tooltip>
										</span>
										<span class="red" v-if="Object.keys(_activeDown).length > 0">
											<span class="gray-hover mx-1">|</span>- {{ Object.keys(_activeDown).length }}
											<q-tooltip anchor="top middle" self="center middle">
												Removed next round
											</q-tooltip>
										</span>
									</div>
								</span>

								<div class="target" 
									v-touch-hold.mouse="event => selectTarget(event, 'multi', entity.key)"
									@click="selectTarget($event, 'single', entity.key)"
									v-shortkey="[i]" @shortkey="set_targeted({ type: 'single', key: entity.key })">
									<TargetItem :item="entity.key" :i="i" :initiative="true" :showReminders="true" />
								</div>
								<a class="options">
									<i class="fal fa-ellipsis-v"></i>
									<q-popup-proxy square dark anchor="bottom right" self="top right" :breakpoint="576">
										<div class="bg-gray gray-light">
											<q-list>
												<q-item>
													<q-item-section>
														<b>{{ entity.name }}</b>
													</q-item-section>
												</q-item>
												<q-separator />
												<q-item 
													clickable v-close-popup 
													v-if="entity.curHp == 0 && !entity.stable && entity.entityType === 'player'"
													@click="set_stable({key: entity.key, action: 'set'})"
												>
													<q-item-section avatar><i class="fas fa-heartbeat"></i></q-item-section>
													<q-item-section>Stabilize</q-item-section>
												</q-item>
												<q-item 
													clickable v-close-popup 
													@click="setSlide({show: true, type: 'slides/encounter/EditEntity', data: targeted })"
												>
													<q-item-section avatar><i class="fas fa-pencil"></i></q-item-section>
													<q-item-section>Edit</q-item-section>
												</q-item>
												<q-item 
													clickable v-close-popup 
													@click="setSlide({show: true, type: 'slides/encounter/reminders/TargetReminders', data: entity.key})"
												>
													<q-item-section avatar><i class="fas fa-stopwatch"></i></q-item-section>
													<q-item-section>Reminders</q-item-section>
												</q-item>
												<q-item 
													clickable v-close-popup 
													@click="setSlide({show: true, type: 'slides/Transform', data: entities[entity.key]})"
												>
													<q-item-section avatar><i class="fas fa-paw-claws"></i></q-item-section>
													<q-item-section>Transform</q-item-section>
												</q-item>
												<q-item 
													clickable v-close-popup 
													@click="setHidden(entity.key, !entity.hidden)"
												>
													<q-item-section avatar><i :class="entity.hidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i></q-item-section>
													<q-item-section>{{ entity.hidden ? "Show" : "Hide" }}</q-item-section>
												</q-item>
												<q-item 
													clickable v-close-popup 
													@click="setSlide({show: true, type: 'slides/encounter/Conditions', data: entity})"
												>
													<q-item-section avatar><i class="fas fa-flame"></i></q-item-section>
													<q-item-section>Conditions</q-item-section>
												</q-item>
												<q-item 
													clickable v-close-popup 
													@click="setSlide({show: true, type: 'slides/encounter/DamageHealing', data: entity,})"
												>
													<q-item-section avatar><i class="fas fa-swords"></i></q-item-section>
													<q-item-section>Do damage/healing</q-item-section>
												</q-item>
												<q-separator />
												<q-item 
													clickable v-close-popup 
													@click="remove(entity.key, entity.name)"
												>
													<q-item-section avatar><i class="fas fa-trash-alt red"></i></q-item-section>
													<q-item-section>Remove</q-item-section>
												</q-item>
											</q-list>
										</div>
									</q-popup-proxy>
								</a>
							</li>
						</transition-group>
					</template>
				</div>
			</q-scroll-area>
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
				setShadow: 0
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
			groups() {
				return [
					{ 
						group: "active",
						targets: this._targets
					},
					{
						group: "idle",
						targets: this._idle
					},
					{
						group: "down",
						targets: this._down
					}
				]
			},
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
		methods: {
			...mapActions([
				'setSlide',
				'set_hidden',
				'set_targeted',
				'set_stable',
				'remove_entity',
			]),
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
				this.setShadow = this.$refs.scroll.scrollPosition;
			},
			remove(key, name) {
				this.$snotify.error('Are you sure you want to remove "' + name + '" from this encounter?', 'Delete character', {
					buttons: [
					{ text: 'Yes', action: (toast) => { this.remove_entity(key); this.$snotify.remove(toast.id); }, bold: false},
					{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			selectTarget(e, type, key) {
				type = (e.shiftKey) ? "multi" : type;
				//Select the target
				this.set_targeted({
					type,
					key
				});
			},
			cycle_target(event) {
				const lastSelected = this.targeted[this.targeted.length - 1];
				const type = (event.srcKey === 'upSingle' || event.srcKey === 'downSingle') ? "single" : "multi"; //Multitarget or not
				//Create array with keys of all targets
				const targetsArray = this._targets.map(function (target) {
					return target.key;
				});
				const current = targetsArray.indexOf(lastSelected); //Set the target from where we're gonna select the next

				let index;
				//Select the next target, either up or down based on the key that's pressed
				if((event.srcKey === 'downSingle' || event.srcKey === 'downMultiple')) {
					index = ((current + 1) < this._targets.length) ? current + 1 : 0;
				} else {
					index = ((current - 1) < 0) ? targetsArray.length - 1 : current - 1;
				}
				const target = targetsArray[index];

				//Select the target
				this.set_targeted({
					type,
					key: target
				});
				
			}
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
		margin-bottom: 5px;

		&.componentHeader {
			padding: 10px 15px;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.9); 
			}
		}
	}
	a.options {
		display: inline-block;
		height: 35px;
		line-height: 35px;
		text-align: center;
		width: 25px;
		font-size: 18px;
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
.q-scrollarea {
	padding:0 0 30px 0;
	height: calc(100% - 55px);
}
ul.targets {
	margin: 0;
	list-style: none;
	padding: 10px 15px 10px 10px !important;

	li {
		// height: 32px;
		margin-bottom: 8px;
		border: solid 1px transparent;
		cursor: pointer;
		background: #191919;

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
		margin-top: 35px;

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
@media only screen and (max-width: 576px) {
	#targets, .q-scrollarea {
		overflow: visible !important;
		padding-bottom: 0;

		.componentHeader {
			font-size: 15px;
			padding: 5px 10px;
			line-height: normal;
		}
	}
}
</style>