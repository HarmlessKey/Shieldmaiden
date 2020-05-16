<template>
	<div v-if="targets && allEntities && players && campPlayers">
		<!-- ACTIONS -->
		<div class="actions" v-if="characters.length !== 0">
			<div>
				<span v-if="targeted.length === 0">Select a target to perform actions</span>
				<span v-else>
					{{ targeted.length }} {{ targeted.length > 1 ? 'targets' : 'target' }}
				</span>
			</div>
			<div class="right">
				<a 
					v-if="targeted.length > 0"
					v-b-tooltip.hover
					title="Damage or Healing"
					@click="setSlide({
						show: true,
						type: 'slides/trackCampaign/playerRequests/index',
						data: {
							characters,
							targeted: targeted,
							targets,
							players,
							campPlayers,
							npcs,
							encounter: { key: encounter.key, turn: encounter.turn, round: encounter.round },
							type: 'manual'
						}
					})"><i class="fas fa-swords"></i></a>
				<!-- <a
					v-b-tooltip.hover
					title="Pending requests"
					@click="setSlide({
						show: true,
						type: 'slides/trackCampaign/playerRequests/pendingRequests',
						data: {
							campPlayers
						}
					})">
					<i class="far fa-hourglass-half"></i>
				</a> -->
			</div>
		</div>

		<!-- INITIATIVE LIST -->
		<table class="initiative targets">
			<thead>
				<th class="init">In.</th>
				<th></th>
				<th class="ac"><i class="fas fa-shield"></i></th>
				<th>Name</th>
				<th class="hp"><i class="fas fa-heart"></i></th>
				<th class="d-none d-md-table-cell">Conditions</th>
			</thead>
			<tbody 
				class="entities"
				name="entities"
				is="transition-group"
				enter-active-class="animated fadeIn"
				leave-active-class="animated fadeOut">
				<template v-for="(entity, index) in targets">
					<tr v-if="allEntities[0].key == entity.key && turn > 0 " :key="index" class="top">
						<td colspan="6">Top of the round</td>
					</tr>
					<tr 
						:key="entity.key" 
						:class="{ pointer: characters.length !== 0, 'targeted': targeted.includes(entity.key) }"
						@mousedown="characters.length !== 0 ? start($event, entity.key) : null" 
						@mouseleave="characters.length !== 0 ? stop() : null" 
						@mouseup="characters.length !== 0 ? stop() : null" 
						@touchstart="characters.length !== 0 ? start($event, entity.key) : null" 
						@touchend="characters.length !== 0 ? stop() : null" 
						@touchcancel="characters.length !== 0 ? stop() : null"
					>
						<td class="init">
							<i v-if="targeted.includes(entity.key)" class="fas fa-crosshairs blue"></i>
							<template v-else>{{ entity.initiative }}</template>
						</td>
					
						<td class="image">
							<icon 
								v-if="displayImg(entity, players[entity.id], npcs[entity.id]) === 'monster' || displayImg(entity, players[entity.id], npcs[entity.id]) === 'player'" class="img" 
								:icon="displayImg(entity, players[entity.id], npcs[entity.id])" 
								:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
							/>
							<div 
								v-else 
								class="img" 
								:style="{ 
									backgroundImage: 'url(\'' + displayImg(entity, players[entity.id], npcs[entity.id]) + '\')',
									'border-color': entity.color_label ? entity.color_label : ''
								}"
							/>
						</td>

						<td class="ac">
							<template v-if="
								(entity.entityType == 'player' && playerSettings.ac === undefined) 
								|| (entity.entityType == 'npc' && displayNPCField('ac', entity) == true)">
								<span class="ac" :class="{ 
										'green': displayAc(entity, players[entity.key], campPlayers[entity.key]).bonus > 0, 
										'red': displayAc(entity, players[entity.key], campPlayers[entity.key]).bonus < 0 
									}"  
									v-b-tooltip.hover :title="'Armor Class + ' + displayAc(entity, players[entity.key], campPlayers[entity.key]).bonus" 
									v-if="displayAc(entity, players[entity.key], campPlayers[entity.key]).bonus">
									{{ displayAc(entity, players[entity.key], campPlayers[entity.key]).ac + displayAc(entity, players[entity.key], campPlayers[entity.key]).bonus }}
								</span>
								<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayAc(entity, players[entity.key], campPlayers[entity.key]).ac }}</span>
							</template>
							<span v-else class="gray-hover">?</span>
						</td>

						<td class="name">
							<span v-if="entity.entityType == 'npc'" :style="entity.color_label ? `color: ${entity.color_label}` : ``">
								<template v-if="displayNPCField('name', entity)">
									{{ entity.name }}
								</template>
								<template v-else>
									? ? ?
								</template>
							</span>
							<template v-else>{{ players[entity.key].character_name }}</template>
						</td>

						<td class="hp">
							<template v-if="
								(entity.entityType == 'player' && playerSettings.health === undefined)
								|| (entity.entityType == 'npc' && displayNPCField('health', entity) === true)
							">
								<Health	:entity="entity" :campPlayers="campPlayers" />
							</template>
							<template v-else-if="
								(entity.entityType == 'player' && playerSettings.health === 'obscured')
								|| (entity.entityType == 'npc' && displayNPCField('health', entity) === 'obscured')
							">
								<template v-if="entity.curHp == 0">
									<span class="gray-hover"><i class="fas fa-skull-crossbones red"></i></span>
								</template>
								<i v-else class="fas" :class="{
										'green fa-heart': percentage(entity.curHp, entity.maxHp) == 100,
										'orange fa-heart-broken': percentage(entity.curHp, entity.maxHp) < 100 && percentage(entity.curHp, entity.maxHp) > 33,
										'red fa-heartbeat': percentage(entity.curHp, entity.maxHp) <= 33,
									}"></i>
							</template>
							<template v-else>
								<span class="gray-hover">
									<template v-if="entity.curHp == 0">
										<i class="fas fa-skull-crossbones red"></i>
									</template>
									<template v-else>? ? ?</template>
								</span>
							</template>
						</td>

						<td class="conditions d-none d-md-table-cell">
							<div class="d-flex justify-content-right" v-if="
							entity.conditions &&
							((entity.entityType == 'player' && playerSettings.conditions === undefined) 
								|| (entity.entityType == 'npc' && npcSettings.conditions === undefined))
							">
								<template v-for="(condition, key) in entity.conditions">
									<div :key="key" v-if="conditions[key]">
											<span class="n" v-if="key == 'exhaustion'">
												{{ entity.conditions[key] }}
											</span>
											<svg
												v-else
												v-b-popover.hover="conditions[key].condition" 
												:title="key" 
												class="icon text" 
												viewBox="0 0 512 512">
												<path :d="conditions[key].icon" fill-opacity="1"></path>
											</svg>
									</div>
								</template>
							</div>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';
	import { mapActions } from 'vuex';
	import { trackEncounter } from '@/mixins/trackEncounter.js';

	import Health from '@/components/trackCampaign/Health.vue';

	export default {
		name: 'app',
		mixins: [general, trackEncounter],
		components: {
			Health,
		},
		props: [
			'encounter',
			'targets',
			'allEntities',
			'turn',
			'campPlayers',
		],
		data() {
			return {
				dmId: this.$route.params.userid,
				userId: this.$store.getters.getUser.uid,
				characters: [],
				windowWidth: 0,

				//Multitargeting needs variables
				targeted: [],
				interval:false,
				counter: 0,
				event: undefined,
				key: undefined
			}
		},
		firebase() {
			return {
				players: {
					source: db.ref(`players/${this.dmId}`),
					asObject: true,
				},
				npcs: {
					source: db.ref(`npcs/${this.dmId}`),
					asObject: true,
				},
				playerSettings: {
					source: db.ref(`settings/${this.dmId}/track/player`),
					asObject: true,
				},
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				},
			}
		},
		mounted() {
			//Check if user has control over a character in the campaign
			if(this.userId) {
				const allCampaignPlayers = Object.keys(this.campPlayers);
				const getCharacters = db.ref(`character_control/${this.userId}`);
				getCharacters.on('value', async (snapshot) => {
					let controlledCharacters = snapshot.val();

					for(let key in controlledCharacters) {
						if(allCampaignPlayers.includes(key)) {
							this.characters.push(key);
						}
					}

				});
			}

			//For a responsive window size
			//in the html we bind a class based on that
			this.$nextTick(function() {
				window.addEventListener('resize', this.getWindowWidth);

				//Init
				this.getWindowWidth()
			})
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
				'setSlide'
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
					let longPress = this.counter >= 8;
	
					this.target({
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
			target({longPress, e, key}) {
				let targeted = this.targeted;

				if(longPress || e.shiftKey) {
					if(!targeted.includes(key)) {
						targeted.push(key);
					} else {
						targeted = targeted.filter(function(value){
							return value != key;
						});
					}
				} else {
					if(targeted.length === 0 || targeted != key) {
						targeted = [key];
					} else {
						targeted = [];
					}
				}
				this.targeted = targeted;
				this.setSlide({ show: false });
			},
			getWindowWidth() {
				//Return the window width
				//used in the html to bind a class for small tables
        this.windowWidth = document.documentElement.clientWidth;
      }
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.getWindowWidth);
		}
	}
</script>

<style lang="scss" scoped>
.actions {
	display: flex;
	justify-content: space-between;
	padding: 20px 0 5px 0;
	border-bottom: solid 1px #fff;

	.right {
		a {
			color: #fff !important;
			margin-left: 10px;
		}
	}
}
	.initiative {
		margin: 20px 0;
		border-collapse: separate; 
		width: 100%;
		border-spacing: 0 5px;
		user-select: none;

		th.ac, th.init {
			text-align: center;
			width: 38px;
		}

		tbody {
			
			tr.top {
				td {
					font-size: 12px;
					padding: 10px 0 5px 0;
					border: none;
					border-bottom: solid 1px #fff;
					cursor: default;

					&:hover {
						border-left: none;
						border-right: none;
						border-top: none;
					}
				}
			}
			tr {
				cursor: pointer;

				td {
					background: rgba(38, 38, 38, .9);
					border-top: solid 1px transparent;
					border-bottom: solid 1px transparent;

					&:first-child {
						border-left: solid 1px transparent;
					}
					&:last-child {
						border-right: solid 1px transparent;
					}
				}
				td.init, td.ac, th.ac {
					width: 38px;
					text-align: center;
				}
				td.ac {
					font-weight: bold;
				}
				td.name {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					max-width:0;
				}
				td.image {
					padding: 0;
					width: 45px;

					.img {
						width: 43px;
						height: 43px;
						border: solid 1px #b2b2b2;
						background-size: cover;
						background-position: center top;
					}

				}
				&.targeted {
					td {
						border-color: #2c97de;
					}
				}
				&:hover {
					@media only screen and (min-width: 576px) {
						td {
							border-color: #fff;
						}
					}
				}
			}
			tr td:first-child, thead th {
				color: #fff;
				background: none;
				text-shadow: 0 0 3px  #000;
			}
			tr td:first-child, thead th:first-child {
				text-align: center;
			}
		}
	}
	.conditions {
		padding: 9px 10px;

		svg, .n {
			width: 24px;
			height: 24px;
			line-height: 20px;
			fill: #cc3e4a;
			padding: 2px;
			margin: 0;
			display: block;
			font-size: 16px;
			text-align: center;
			color: #cc3e4a;
		}
	}
	.entities-move {
		transition: transform .6s;
	}
</style>
