<template>
	<div id="targets">
			<h2 
				class="componentHeader d-flex justify-content-between" 
				:class="{ shadow : setShadow > 0 }">
				<span><i class="fas fa-helmet-battle"></i> Targets ({{ _targets.length }})</span>
				<a @click="addNpc()"
					v-shortkey="['a']" @shortkey="addNpc()"
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
						<transition-group 
							tag="ul" 
							class="targets active_targets pt-3" 
							name="targets" 
							enter-active-class="animated fadeInUp" 
							leave-active-class="animated fadeOutDown">
							
							<li 
								v-for="(entity, i, key) in _targets"
								class="d-flex justify-content-between" 
								:key="entity.key" 
								:class="{ targeted : targeted == entity.key }">
								<div class="target" 
									@click="set_targeted(entity.key)"
									v-shortkey="[i]" @shortkey="set_targeted(entity.key)">
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
										<!-- <a class="dropdown-item" 
											@click="info(entity)"
											v-shortkey="['i']" @shortkey="info(entities[targeted])">
											<i class="fas fa-info"></i> <span v-if="showKeybinds.keyBinds === undefined">[i]</span> Info
										</a> -->
										<a v-if="entity.curHp == 0 && !entity.stable" 
											class="dropdown-item" 
											v-shortkey="['s']" @shortkey="set_stable({key: targeted, action: 'set'})"
											@click="set_stable({key: entity.key, action: 'set'})">
											<i class="fas fa-hand-holding-magic"></i> [s] Stabilize
										</a>
										<a class="dropdown-item" 
										v-shortkey="['e']" @shortkey="edit(targeted, entities[targeted])"
										@click="edit(entity.key, entities[entity.key])">
											<i class="fas fa-hammer-war"></i> <span v-if="showKeybinds.keyBinds === undefined">[e]</span> Edit
										</a>
										<a class="dropdown-item" @click="reminders(entity.key)"
											v-shortkey="['m']" @shortkey="reminders(targeted)">
											<i class="fas fa-stopwatch"></i> <span v-if="showKeybinds.keyBinds === undefined">[m]</span> Reminders
										</a>
										<a class="dropdown-item" @click="transform(entity.key, entities[entity.key])"
											v-shortkey="['t']" @shortkey="transform(targeted, entities[targeted])">
											<i class="fas fa-paw-claws"></i> <span v-if="showKeybinds.keyBinds === undefined">[t]</span> Transform
										</a>
										<a class="dropdown-item" @click="conditions(entity)"
											v-shortkey="['c']" @shortkey="conditions(entities[targeted])">
											<i class="fas fa-eye-slash"></i> <span v-if="showKeybinds.keyBinds === undefined">[c]</span> Conditions
										</a>
										<a class="dropdown-item" @click="damageHeal(entity)"
											v-shortkey="['d']" @shortkey="damageHeal(entities[targeted])">
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
						<template v-if="_idle.length">
							<hr>
							<h2>IDLE ({{ _idle.length }})</h2>
							<ul class="targets idle_targets">
								<template v-for="entity in _idle">
									<li class="d-flex justify-content-between" 
										v-bind:key="entity.key" 
										:class="{ targeted : targeted == entity.key }">
										<div class="target" @click="set_targeted(entity.key)">
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
											<!-- <a class="dropdown-item" 
												@click="info(entity)"
												v-shortkey="['i']" @shortkey="info(entities[targeted])">
												<i class="fas fa-info"></i> <span v-if="showKeybinds.keyBinds === undefined">[i]</span> Info
											</a> -->
											<a v-if="entity.curHp == 0 && !entity.stable" 
												class="dropdown-item" 
												v-shortkey="['s']" @shortkey="set_stable({key: targeted, action: 'set'})"
												@click="set_stable({key: entity.key, action: 'set'})">
												<i class="fas fa-hand-holding-magic"></i> <span v-if="showKeybinds.keyBinds === undefined">[s]</span> Stabilize
											</a>
											<a class="dropdown-item" 
											v-shortkey="['e']" @shortkey="edit(targeted, entities[targeted])"
											@click="edit(entity.key, entities[entity.key])">
												<i class="fas fa-hammer-war"></i> <span v-if="showKeybinds.keyBinds === undefined">[e]</span> Edit
											</a>
											<a class="dropdown-item" @click="transform(entity.key, entities[entity.key])"
												v-shortkey="['t']" @shortkey="transform(targeted, entities[targeted])">
												<i class="fas fa-paw-claws"></i> <span v-if="showKeybinds.keyBinds === undefined">[t]</span> Transform
											</a>
											<a class="dropdown-item" @click="conditions(entity)"
												v-shortkey="['c']" @shortkey="conditions(entities[targeted])">
												<i class="fas fa-eye-slash"></i> <span v-if="showKeybinds.keyBinds === undefined">[c]</span> Conditions
											</a>
											<a class="dropdown-item" @click="damageHeal(entity)"
												v-shortkey="['d']" @shortkey="damageHeal(entities[targeted])">
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
								<template v-for="entity in _down">
									<li @click="set_targeted(entity.key)" :class="{ targeted : targeted == entity.key }">
										<TargetItem :item="entity.key" />
									</li>
								</template>
							</ul>
						</template>
					</div>
				</div>
			</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { db, auth } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'
	import TargetItem from '@/components/combat/TargetItem.vue'

	export default {
		name: 'Targets',
		components: {TargetItem},
		props: ['_active','_idle'],
		data() {
			return {
				userId: auth.currentUser.uid,
				currentTarget: {},
				setShadow: 0,
			}
		},
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'encounter',
				'entities',
				'targeted',
				// 'down',
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
			}
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
				'set_targeted',
				'set_stable',
				'remove_entity',
			]),
			conditions(entity) {
				event.stopPropagation();
				if(entity) {
					this.setSlide({
						show: true,
						type: 'conditions',
						entity: entity
					})
				}
				else {
					this.$snotify.error('Select a target', 'Show conditions', {
					});
				}
			},
			info(entity) {
				event.stopPropagation();
				if(entity) {
					this.setSlide({
						show: true,
						type: 'npc',
						entity: entity
					})
				}
				else {
					this.$snotify.error('Select a target', 'Show info', {
					});
				}
			},
			addNpc() {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'addNpc',
				})
			},
			edit(key, entity) {
				event.stopPropagation();
				if(key) {
					this.setSlide({
						show: true,
						type: 'edit',
						key: key,
						entity: entity,
					})
				}
				else {
					this.$snotify.error('Select a target', 'Edit entity', {
					});
				}
			},
			transform(key, entity) {
				event.stopPropagation();
				if(key) {
					this.setSlide({
						show: true,
						type: 'transform',
						key: key,
						entity: entity,
					})
				}
				else {
					this.$snotify.error('Select a target', 'Transform entity', {
					});
				}
			},
			reminders(key) {
				event.stopPropagation();
				if(key) {
					this.setSlide({
						show: true,
						type: 'targetReminders',
						key: key,
					})
				}
				else {
					this.$snotify.error('Select a target', 'Reminders', {
					});
				}
			},
			damageHeal(entity) {
				event.stopPropagation();
				if(entity) {
					this.setSlide({
						show: true,
						type: 'damageHealing',
						target: entity,
					})
				}
				else {
					this.$snotify.error('Select a target', 'Do damage', {
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

		&:hover {
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