<template>
	<div ref="encounter" v-if="initialized">
		<div v-if="overencumbered && demo">
			<OverEncumbered/>
		</div>
		<div 
			class="combat-wrapper"
			v-else-if="encounter && (players || demo)"  
			:style="[settings.background ?  {'background': 'url(\'' + encounter.background + '\')'} : {'background': ''}]"
		>	
			<template v-if="encounter.finished">
				<Finished v-if="!demo" :encounter="encounter"/>
				<DemoFinished v-else />
			</template>
			<!-- DESKTOP -->
			<template v-else-if="width > 576">
				<template v-if="encounter.finished">
					<Finished v-if="!demo" :encounter="encounter"/>
					<DemoFinished v-else />
				</template>

				<template v-else>
					<SetInitiative 
						v-if="encounter.round === 0"
						:_active="_active"
						:_idle="_idle"
						:width="width"
					/>
					<div v-else class="desktop">
						<Turns 
							:active_len="Object.keys(_active).length"
							:current="_active[encounter.turn]"
							:next="_active[encounter.turn + 1]"
							:settings="settings"
						/>
						<Current 
							:current="_active[encounter.turn]"
							:next="next"
							:settings="settings"
						/>
						<Targets 
							:_active = "_active"
							:_idle = "_idle"
						/>
						<Targeted />
						<div id="side_container"> 
							<Side />
						</div>
					</div>
				</template>

				<DemoOverlay v-if="demo" />
			</template>

			<!-- MOBILE -->
			<template v-else>
				<SetInitiative 
					v-if="encounter.round === 0"
					:_active="_active"
					:_idle="_idle"
					:width="width"
				/>
				<div v-else class="mobile">
					<Turns 
						:active_len="Object.keys(_active).length"
						:current="_active[encounter.turn]"
						:next="_active[encounter.turn + 1]"
						:settings="settings"
					/>

					<CurrentMobile 
						:current="_active[encounter.turn]"
						:next="next"
						:settings="settings"
					/>
					
					<Targets
						:_active = "_active"
						:_idle = "_idle"
					/>

					<div>
						<Menu :entities="entities" :settings="settings" :current="_active[encounter.turn]" />
					</div>
				</div>
			</template>
		</div>
	</div>
	<div v-else class="combat-wrapper" ref="encounter">
		<hk-loader />
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapActions, mapGetters } from 'vuex';
	import { db } from '@/firebase';

	import { audio } from '@/mixins/audio';
	
	import Finished from '@/components/combat/Finished.vue';
	import DemoFinished from '@/components/combat/DemoFinished.vue';
	import Actions from '@/components/combat/actions/Actions.vue';
	import Turns from '@/components/combat/Turns.vue';
	import Menu from '@/components/combat/mobile/Menu.vue';
	import Current from '@/components/combat/Current.vue';
	import CurrentMobile from '@/components/combat/mobile/Current.vue';
	import Targets from '@/components/combat/Targets.vue';
	import Targeted from '@/components/combat/Targeted.vue';
	import Side from '@/components/combat/side/Side.vue';
	import SetInitiative from '@/components/combat/initiative';
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import DemoOverlay from '@/components/combat/DemoOverlay.vue';

	export default {
		name: 'app',
		metaInfo: {
			title: 'Run Encounter'
		},
		components: {
			Finished,
			DemoFinished,
			Actions,
			Turns,
			Menu,
			Current,
			CurrentMobile,
			Targets,
			Targeted,
			Side,
			SetInitiative,
			OverEncumbered,
			DemoOverlay
		},
		mixins: [ audio ],
		data() {
			return {
				userId:  this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				demo: this.$route.name === "Demo",
				target: undefined,
				width: 0,
				audio_notification: false,
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.userId}/encounter`),
					asObject: true,
				},
			}
		},
		beforeMount() {
			if(this.$route.name !== "Demo" && this.broadcast.live === this.$route.params.campid) {
				this.setLiveEncounter(this.$route.params.encid);
			}
			this.init_Encounter({
				cid: this.$route.params.campid, 
				eid: this.$route.params.encid,
				demo: this.demo
			});
		},
		mounted() {
			this.$nextTick(function() {
				window.addEventListener('resize', this.setSize);
				//Init
				this.setSize();
			});
			this.track_Encounter(this.demo);
		},
		computed: {
			...mapGetters([
				'encounter',
				'players',
				'campaigns',
				'entities',
				'initialized',
				'overencumbered',
				'broadcast'
			]),
			_active: function() {
				let order = (this.settings && this.settings.initOrder) ? 'asc' : 'desc'; 

				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.active && !entity.down;
					})
					.orderBy(function(entity) {
						return entity.name
					}, 'asc')
					.orderBy(function(entity){
						return Number(entity.initiative)
					} , order)
					.value()
			},
			_idle: function() {
				let order = (this.settings && this.settings.initOrder) ? 'asc' : 'desc';

				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return !entity.active && !entity.down;
					})
					.orderBy(function(entity){
						return Number(entity.initiative)
					} , order)
					.value()
			},
			alive() {
				return Object.keys(this._alive).length;
			},
			_alive: function() {
				let order = (this.settings && this.settings.initOrder) ? 'asc' : 'desc';

				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.active && entity.curHp > 0 && entity.entityType == 'npc';
					})
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , order)
					.value()
			},
			next() {
				//returns next in initiative order
				//returns first if there is no next
				return this._active[this.encounter.turn + 1] || this._active[0];
			},
			requests() {
				if(this.encounter) {
					return this.encounter.requests;
				}
			},
		},
		watch: {
			alive(newVal) {
				if(newVal === 0 && this.initialized) {
					this.confirmFinish()
				}
			},
			encounter: {
				deep: true,
				handler(newValue) {
					// Create notify if encounter has audio link
					if (newValue !== undefined && newValue.audio !== undefined && this.audio_notification === false) {
						this.audio_notification = true;
						this.$q.notify({
							message: 'Audio link found',
							caption: 'Would you like to follow it?',
							color: "blue-light",
							position: "top",
							progress: true,
							timeout: 7500,
							icon: this.audio_icons[this.audio_link_type].icon,
							actions: [
								{ label: 'Yes', color: 'white', handler: () => { this.open_audio_link(this.encounter.audio) } },
								{ label: 'No', color: 'white', handler: () => { /* ... */ } }
							]
						})
					}
				}
			},
			requests: {
				deep: true,
				handler(newValue, oldValue) {
					if((newValue && oldValue) && (Object.keys(newValue).length > Object.keys(oldValue).length)) {
							this.$snotify.warning(
							'A new player request was made.',
							'New request', 
							{
								timeout: 5000,
								buttons: [
									{ 
										text: 'Show requests', 
										action: (toast) => { 
											this.setSlide({show: true, type: 'combat/side/Requests'});
											this.$snotify.remove(toast.id); 
										}, bold: false
									},
									{ 
										text: 'Close', 
										action: (toast) => { 
											this.$snotify.remove(toast.id); 
										}, bold: false
									}
								]
							}
						);
					}
				}
			}
		},
		beforeRouteLeave (to, from, next) {
			this.reset_store();
			this.setLiveEncounter();
			next();
		},
		beforeRouteUpdate(to, from, next) {
			this.reset_store();
			this.setLiveEncounter();
			next();
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.setSize);
		},
		methods: {
			...mapActions([
				'init_Encounter',
				'track_Encounter',
				'set_finished',
				'reset_store',
				'setSlide',
				'setLiveEncounter'
			]),
			setSize() {
				this.width = this.$refs.encounter.clientWidth;
			},
			confirmFinish() {
				this.$snotify.error('All NPC\'s seem to be dead. Do you want to finish the encounter?', 'Finish Encounter', {
					position: "centerCenter",
					timeout: 0,
					buttons: [
						{ text: 'Finish', action: (toast) => { this.finish(); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'Cancel', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			finish() {
				this.set_finished();
			},
		}
	}
</script>

<style lang="scss" scoped>
.combat-wrapper {
	background-size: cover !important;
	background-position: center bottom !important;
	background-color:$gray-dark;
	height: calc(100vh - 50px);

	.finished {
		margin-top: 30px;
		background: rgba(38, 38, 38, .9) !important;
	}
	.desktop {
		padding: 5px;
		width: 100%;
		height: calc(100% - 50px);
		display: grid;
		grid-template-columns: 3fr 4fr 3fr 2fr;
		grid-template-rows: 60px 1fr;
		grid-gap: 5px;
		grid-template-areas:
		"turns turns turns turns"
		"current targets targeted side";
		position: absolute;
		font-size: 12px;
		h1 {
			text-transform:uppercase;
			font-size: 15px !important;
		}
		h2 {
			text-transform:uppercase;
			font-size: 15px !important;
			margin-bottom: 20px !important;
		}
		h3 {
			font-size: 15px !important;
			margin-bottom: 15px !important;
		}

		#side_container {
			padding-top: 5px;
			margin-top: -5px;
			grid-area: side;
			overflow: hidden;
		}
	}

	.mobile {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 60px max-content 1fr 60px;
		grid-template-areas:
		"turns"
		"current"
		"targets"
		"menu";

		#turns {
			border-bottom: solid 1px#191919;
		}
		#current {
			z-index: 90;
		}
	}

	@media only screen and (max-width: 1000px) {
		.desktop {
			grid-template-columns: 2fr 3fr 2fr;
			grid-template-areas:
			"turns turns turns"
			"current targets targeted";
		}
		#side_container {
			display: none;
		}
	}
	@media only screen and (max-width: 900px) {
		.desktop {
			grid-template-columns: 1fr 1fr;
			grid-template-areas:
			"turns turns turns"
			"current targets";
		}
	}
}
</style>
