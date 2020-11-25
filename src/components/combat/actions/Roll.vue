<template>
	<div v-if="current">
		<p v-if="targeted.length === 0">No target selected</p>
		<template v-else-if="current.entityType === 'npc' || 'companion'">
			<p v-if="targeted.length === 1">
				<i class="fas fa-crosshairs gray-hover"></i> Target: <b class="blue">{{ entities[targeted[0]].name }}</b><br/>
				<i class="fas fa-shield gray-hover"></i> Armor Class: 
				<b class="blue">
					<span :class="{ 
							'green': entities[targeted[0]].ac_bonus > 0, 
							'red': entities[targeted[0]].ac_bonus < 0 
						}" v-if="entities[targeted[0]].ac_bonus">
						{{ displayStats(entities[targeted[0]]).ac + entities[targeted[0]].ac_bonus}}
						<q-tooltip anchor="center right" self="center left">
							Armor class + {{ entities[targeted[0]].ac_bonus }}
						</q-tooltip>
					</span>
					<span v-else>{{ displayStats(entities[targeted[0]]).ac }}</span>
				</b>
			</p>

			<template v-if="current.actions">
				<!-- ROLL OPTIONS -->
				<template v-if="!demo">
					<div class="d-flex justify-content-between">
						<q-checkbox 
							dark :value="share_rolls" 
							@input="setShareRolls($event)" 
							indeterminate-value="something-else">
								Share Rolls
								<q-icon name="info" class="blue">
									<q-menu square anchor="top middle" self="bottom middle" max-width="250px" prevent>
										<q-card dark square>
											<q-card-section class="bg-gray-active">
												<b>Share rolls</b>
											</q-card-section>

											<q-card-section>
												<p>
													Check this box to share rolls with your players, 
													they will be shown on the player screen when you are live.
												</p>
												<a @click="setSlide({show: true, type: 'PlayerLink'})">Link to your player screen</a>
											</q-card-section>
										</q-card>
									</q-menu>
								</q-icon>
						</q-checkbox>
						<a class="ml-1" @click="rollInfo = !rollInfo"><i class="fas fa-cog"></i></a>
					</div>
					<q-slide-transition>
						<div v-show="rollInfo" class="bg-gray-hover p-2 mb-2" id="rollOptions">
							<q-option-group
								dark
								:options="options"
								label="Display options open roll"
								type="checkbox"
								v-model="rollOptions"
							/>
							<small>Open rolls are shown on the player screen.</small>
						</div>
					</q-slide-transition>
				</template>
				<div><q-checkbox dark v-model="toHit" label="Roll to hit" indeterminate-value="something-else" /></div>
				<q-checkbox v-if="targeted.length > 1" dark v-model="rollOnce" label="Roll damage once" indeterminate-value="something-else" />

				<!-- ADVANTAGE / DISADVANTAGE -->
				<template v-if="toHit">
					<div class="setAdvantage d-sm-none d-flex justify-content-between">
						<button class="btn btn-sm bg-gray-hover mb-3" :class="{ 'bg-green': advantage == 'advantage' }" @click="setAdvantage('advantage')">
							<i v-if="advantage === 'advantage'" class="fas fa-check"></i>
							Advantage
						</button>
						<button class="btn btn-sm bg-gray-hover mb-3" :class="{ 'bg-green': advantage == 'disadvantage' }" @click="setAdvantage('disadvantage')">
							<i v-if="advantage === 'disadvantage'" class="fas fa-check"></i>
							Disadvantage
						</button>
					</div>
					<p class="mt-3 d-none d-sm-block">
						<q-icon name="info" size="sm" class="info" /> Hold <b>Shift</b> for <span class="green">advantage</span>, <b>Ctrl</b> for <span class="red">disadvantage</span>
					</p>
				</template>
				
				<!-- CUSTOM ROLL -->
				<h3>Custom Roll</h3>
				<div class="custom-roll">
					<div v-if="toHit">
						<q-input 
							dark filled square dense
							label="Hit mod"
							autocomplete="off" 
							type="number" 
							v-model="custom_roll.attack_bonus" 
							name="custom_hit"
							data-vv-as="To Hit Modifier"
						/>
					</div>
					<div :class="{ span: !toHit }">
						<q-input 
							dark filled square dense
							label="Damage dice"
							autocomplete="off" 
							type="text" 
							v-model="custom_roll.damage_dice" 
							name="custom_roll"
							data-vv-as="Custom Roll"
							v-validate="{ regex:/^[0-9]+d[0-9]+(\+[0-9]+d[0-9]+)*$/ }"
						/>
					</div>
					<div>
						<q-input 
							dark filled square dense
							label="Modifier"
							autocomplete="off" 
							type="number" 
							v-model="custom_roll.damage_bonus" 
							name="custom_mod"
							data-vv-as="Custom Modifier"
						/>
					</div>
					<hk-roll>
						<button 
							:disabled="(errors.items && errors.items.length > 0) || !custom_roll.damage_dice"
							@click="groupRoll($event, custom_roll)" 
							class="btn btn-sm"
						>
							<i class="fas fa-dice-d20"></i>
							<span class="d-none d-md-inline ml-1">Roll</span>
						</button>
					</hk-roll>
				</div>
				<p class="validate red" v-if="errors.has('custom_roll')">
					{{ errors.first('custom_roll') }}
					Allowed format: "2d6" or "2d6+1d8".
				</p>

				<!-- ACTIONS -->
				<h3 class="mt-3">Actions</h3>
				<ul class="roll">
					<li v-for="(action, index) in current.actions" :key="index" class="bg-gray-active">
						<span class="d-flex justify-content-between">
							<a class="d-flex justify-content-between gray-light" @click="setShow('action', index)">
								<span>{{ action.name }}</span>
								<i class="fas fa-caret-down"></i>
							</a>
							<hk-roll>
								<button 
									v-if="action['damage_dice']" 
									@click="groupRoll($event, action)" 
									class="btn btn-sm"
								>
									<i class="fas fa-dice-d20"></i>
									<span class="d-none d-md-inline ml-1">Roll</span>
									<q-tooltip anchor="center right" self="center left">
										Roll {{ action.name }}
									</q-tooltip>
								</button>
							</hk-roll>
						</span>
						<q-slide-transition>
							<p v-show="showAction === index" class="py-2 pr-1">{{ action.desc }}</p>
						</q-slide-transition>
					</li>
				</ul>
			</template>

			<!-- LEGENDARY ACTIONS -->
			<template v-if="current.legendary_actions">
				<h3>Legendary Actions</h3>
				<ul class="roll">
					<li v-for="(action, index) in current.legendary_actions" :key="index" class="bg-gray-active">
						<span class="d-flex justify-content-between">
							<a class="d-flex justify-content-between gray-light" @click="setShow('legendary', index)">
								<span>{{ action.name }}</span>
								<i class="fas fa-caret-down"></i>
							</a>
							<hk-roll>
								<button v-if="action['damage_dice']" @click="groupRoll($event, action)" class="btn btn-sm">
									<i class="fas fa-dice-d20"></i>
									<span class="d-none d-md-inline ml-1">Roll</span>
									<q-tooltip anchor="center right" self="center left">
										Roll {{ action.name }}
									</q-tooltip>
								</button>
							</hk-roll>
						</span>
						<q-slide-transition>
							<p v-show="showLegendary" class="py-2 pr-1">{{ action.desc }}</p>
						</q-slide-transition>
					</li>
				</ul>

			</template>
		</template>
		<p v-else-if="current.entityType === 'player'">
			Most players want to roll their own attacks, you probably shouldn't take that away from them. ;)
		</p>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'
	import { dice } from '@/mixins/dice.js'
	import { setHP } from '@/mixins/HpManipulations.js'


	export default {
		name: 'Select',
		mixins: [setHP, dice],
		props: ['current'],
		data: function() {
			return {
				rollInfo: false,
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				showAction: undefined,
				showLegendary: undefined,
				advantage: false,
				rollOptions: ['toHit', 'damage'],
				setToHit: undefined,
				rollOnce: true,
				animateTrigger: false,
				rolledDamage: 0,
				rolledToHit: 0,
				actionHover: undefined,
				legendaryHover: undefined,
				custom_roll: {
					name: 'Custom Roll',
					attack_bonus: undefined,
					damage_dice: undefined,
					damage_bonus: undefined
				},
				options: [
					{ label: 'To hit', value: 'toHit' },
					{ label: 'Damage', value: 'damage' },
					{ label: 'Modifiers', value: 'modifiers' },
				],
				aoeRoll: undefined
			}
		},
		firebase() {
			return {
				criticalSettings: {
					source: db.ref(`settings/${this.userId}/encounter/critical`),
					asObject: true
				},
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'entities',
				'turn',
				'targeted',
				'share_rolls'
			]),
			toHit: {
				get() {
					let hit = (this.targeted.length > 1) ? false : true;
					return (this.setToHit !== undefined) ? this.setToHit : hit;
				},
				set(newValue) {
					this.setToHit = newValue;
					return newValue;
				}
			}
		},
		watch: {
			targeted(newValue) {
				if(newValue.length > 1) {
					this.toHit = false;
				}
			},
			animateTrigger() {
				this.animateValue("toHitRoll", 0, this.rolledToHit, 500);
				this.animateValue("damageRoll", 0, this.rolledDamage, 500);
				this.rolledDamage = 0;
				this.rolledToHit = 0;
			}
		},
		created() {
			this.$nextTick(function() {
				window.addEventListener('keyup', this.checkKeyPress);
				window.addEventListener('keydown', this.checkKeyPress);
			});
		},
		destroyed() {
			window.removeEventListener('keyup', this.checkKeypress);
			window.removeEventListener('keydown', this.checkKeypress);
		},
		methods: {
			...mapActions([
				'setSlide',
				'setShareRolls',
			]),
			checkKeyPress(e) {
				if(e.type === "keydown") {
					if(this.actionHover) {
						let hover = this.actionHover.split("-");
						if(e.key === "Shift") {
							this.actionHover = `${hover[0]}-advantage`;
						} else if(e.key === "Control") {
							this.actionHover = `${hover[0]}-disadvantage`;
						}
					} else if(this.legendaryHover) {
						let hover = this.legendaryHover.split("-");
						if(e.key === "Shift") {
							this.legendaryHover = `${hover[0]}-advantage`;
						} else if(e.key === "Control") {
							this.legendaryHover = `${hover[0]}-disadvantage`;
						} 
					}
				}
				if(e.type === "keyup") {
					if(this.actionHover) {
						let hover = this.actionHover.split("-");
						if(e.key === "Shift" || e.key === "Control") {
							this.actionHover = `${hover[0]}-undefined`;
						}
					} else if(this.legendaryHover) {
						let hover = this.legendaryHover.split("-");
						if(e.key === "Shift" || e.key === "Control") {
							this.legendaryHover = `${hover[0]}-undefined`;
						}
					}
				}
			},
			displayStats(entity) {
				var stats;
				if(entity.transformed == true) {
					stats = {
						ac: entity.transformedAc,
						maxHp: entity.transformedMaxHp,
						curHp: entity.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: entity.ac,
						maxHp: entity.maxHp,
						curHp: entity.curHp,
					}
				}
				return stats
			},
			setShow(type, index) {
				if(type === 'action') {
					this.showAction = (this.showAction === index) ? undefined : index;
				} else if(type === 'legendary') {
					this.showLegendary = (this.showLegendary === index) ? undefined : index;
				}
			},
			setAdvantage(value) {
				if(this.advantage == value) {
					this.advantage = false;
				} else {
					this.advantage = value;
				}
			},
			groupRoll(e, action) {
				for(let i in this.targeted) {
					let key = this.targeted[i];
					let target = this.entities[key];

					this.roll(e, action, target, i);
				}
				this.aoeRoll = undefined;
				this.custom_roll = { 
					name: 'Custom Roll',
					damage_dice: undefined, 
					damamge_bonus: undefined
				};
			},
			roll(e, action, target, rollCounter) {
				event.stopPropagation();
				var rolls = action.damage_dice.replace(/\s+/g, ''); //remove spaces
				rolls = rolls.split('+'); //seperate the rolls
				let crit = false;
				let critDouble = false;
				let critRoll = 1; //set to 2 on a crit
				let hits = '';
				var total = 0;
				var allDamageRolls = [];
				var critInfo = '';
				let advantage = this.advantage;

				if(e.shiftKey) {
					advantage = "advantage";
				} else if(e.ctrlKey) {
					advantage = "disadvantage";
				}

				var ac = parseInt(this.displayStats(target).ac);

				//Add bonus AC if there is any
				if(target.ac_bonus) {
					ac = parseInt(target.ac_bonus) + ac;
				}

				let attack_bonus = action.attack_bonus || 0;
				let advantage_disadvantage = {};
				let toHit;
				let adv = ""
				//If there is advantage/disadvantage set required properties
				if(advantage) {	
					advantage_disadvantage[advantage] = true;

					//Set advantage message for snotify
					let color = (advantage === 'advantage') ? 'green' : 'red'; 
					adv = `<small class="${color} advantage">${advantage}</small>`;	
				}

				if(this.toHit) {
					toHit = this.rollD(e, 20, 1, attack_bonus, `${this.current.name} ${action.name} to hit`, false, advantage_disadvantage);
				}

				//Roll the damage for all seperated rolls
				//Roll if it's the first roll and rollOnce = true
				//Roll if rollOnce is false
				if((rollCounter == 0 && this.rollOnce) || !this.rollOnce){
					//Check if it was a crit
					if(this.toHit && toHit.throws[0] === 20) {
						crit = true;
						if(this.criticalSettings['.value']) {
							critDouble = true;
						} else {
							critInfo = `<div><b class="red">Crit!</b> The damage dice were rolled twice.</div>`;
							critRoll = 2;
						}
					}

					
					for(const index in rolls) {
						let modifier = 0;
						const dice = rolls[index].split('d'); //split amount from type of dice [1]d[6]
						const diceCount = dice[0]*critRoll; //Roll the damage dice twice if it was a crit and critsettings are set to roll twice
						
						//For the last roll, include the damage modifier, this is just to show it in saved rolls
						if(parseInt(index)+1 === rolls.length) {
							modifier = action.damage_bonus;
						}
						
						const rolled = this.rollD(e, dice[1], diceCount, modifier, `${this.current.name} ${action.name}`); //roll the dice
						const damage = rolled.throwsTotal; //save damage without the damage bonus

						allDamageRolls.push(rolled.throws);
						total = parseInt(total) + parseInt(damage); //Add the rolls to the total damage
					}
					//Set the roll that needs to be used when rolling damage only once
					if(this.rollOnce) {
						this.aoeRoll = { 
							allDamageRolls,
							total
						}
					}
				} else {
					//Use the first roll if rollOnce = true
					allDamageRolls = this.aoeRoll.allDamageRolls;
					total = this.aoeRoll.total;
				}

				//If it was an open roll, save it, so it will be shared on the track encounter screen.
				if(!this.demo) {
					//If the damage is rolled once, show all targets with that roll
					//Otherwise show 1 target per roll
					let targets = (this.rollOnce && !this.toHit) ? this.targeted : [target.key];

					//Only roll if 
					//All rolls should be seperate (different damage or same damage and to hit)
					//All rolls are together (same damge, no to hit) and there was no roll before
					if(this.share_rolls && ((rollCounter == 0 && this.rollOnce) || !this.rollOnce || this.toHit)) {
						const toHitRoll = (this.toHit) ? toHit.throws[0] : 0;
						this.shareRoll(targets, toHitRoll, total, action.attack_bonus, action.damage_bonus);
					} else {
						db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/lastRoll`).set(false);
					}
				}
				//Check if it was a critical hit and rolled damage should be doubled, not be rolled twice
				if(critDouble) {
					//Form HTML for snotify
					critInfo = `<div><b class="red">Crit!</b> The rolled damage was doubled.<br/> (was ${total}, changed to ${parseInt(total*2)})</div>`;
					total = parseInt(total*2);
				}
				//Add the damage modifier
				if(action['damage_bonus']) {
					var bonus = '+'+action['damage_bonus']; //form HTML for snotify
					var totalDamage = parseInt(total) + parseInt(action['damage_bonus']); //Add it to the total damage
					var showTotal = '<span class="red" id="damageRoll">' + totalDamage + '</span>'; //form HTML for snotify
				}
				else {
					//If there was no modifier
					bonus = '';
					totalDamage = total;
					showTotal = '<span class="red" id="damageRoll">' + total + '</span>';
				}
				this.rolledDamage = totalDamage; //For animation

				if(this.toHit) {
					let toHitRoll = toHit.throws[0];

					//If the to hit roll is a 20, it is a critical hit
					if(toHitRoll === 20) {
						toHitRoll = '<span class="green">natural 20</span>'; //form HTML for snotify
					}
					//If the to hit roll is a 1, it is a critical fail
					else if(toHitRoll === 1) {
						toHitRoll = '<span class="red">natural 1</span>'; //form HTML fo snotify
					}
					//If the to hit is higher than or equal to target's AC, it hits
					let hitOrMiss = (toHit.total >= ac) ? '<span class="green">HIT!</span>' : '<span class="red">MISS!</span>';
					let ignoredRoll = (advantage) ? `<span class="gray-hover">${toHit.ignored}</span>` : ``;

					this.rolledToHit = toHit.total; //For animation

					//Form HTML for snotify
					hits = `<div class="roll">
						${(adv) ? adv : ``}
						<div class="top">
							${ignoredRoll}
							${toHitRoll}${toHit.mod}
						</div>
						<h2 id="toHitRoll">${toHit.total}</h2>
						<div class="bottom">
							${hitOrMiss}
						</div>
					</div>`;		
				}

				//BUILD SNOTIFY POPUP
				this.$snotify.html(
					`<div class="snotifyToast__title">
						<div class="target">
							<div class="image" style="background-image: url(${target.img});"></div>
							<div class="ac">${target.ac}</div>
							<div class="name truncate">${target.name}</div>
						</div>
					</div>
					<div class="snotifyToast__body">
						<h2 class="title"><b>${action.name}</b></h2>
						<div class="display-rolls">
							${this.toHit ? hits : ''}
							<div class="roll">
								<div class="top">${total}${bonus}</div>
								<h2>${showTotal}</h2>
								<div class="bottom">damage</div>
							</div>
						</div>
						${critInfo}
					</div> `, {
					timeout: 0,
					closeOnClick: false,
					buttons: [
						{ 
							text: 'Hit', 
							action: (toast) => { 
								this.setHP(totalDamage, crit, target, this.current, 'damage')
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{ 
							//Does half of the damage rounded down
							text: 'Half', 
							action: (toast) => { 
								this.setHP(Math.floor(totalDamage/2), crit, target, this.current, 'damage')
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{ 
							//Does double of the damage
							text: 'Double', 
							action: (toast) => { 
								this.setHP(parseInt(totalDamage*2), crit, target, this.current, 'damage')
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{ 
							text: 'Miss', 
							action: (toast) => { 
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
					]
				});
				this.animateTrigger = !this.animateTrigger;
				this.advantage = false; //turn advantage off
			},
			shareRoll(targets, toHit, damage, hitMod, damageMod) {
				var showRoll = {
					targets,
					timestamp: Date.now()
				};

				//Show to hit roll
				if(this.toHit) {
					if (Object.values(this.rollOptions).includes('toHit')) {
						if(toHit === 20) {
							showRoll.crit = 20;
						} else if(toHit === 1) {
							showRoll.crit = 1;
						}
						showRoll.toHitTotal = parseInt(toHit) + parseInt(hitMod);

						//Show Modifier
						if(Object.values(this.rollOptions).includes('modifiers')) {
							showRoll.toHit = toHit;
							if(hitMod) {
								showRoll.hitMod = hitMod;
							}
						}
					}
				}

				//Show damage roll
				if (Object.values(this.rollOptions).includes('damage')) {
					showRoll.damageTotal = (damageMod) ? parseInt(damage) + parseInt(damageMod) : parseInt(damage);

					//Show Modifier
					if(Object.values(this.rollOptions).includes('modifiers')) {
						showRoll.damage = damage;
						if(damageMod) {
							showRoll.damageMod = damageMod;
						}
					}
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/lastRoll`).set(showRoll)
			},
			checkAdvantage(e, type, index) {
				let advantage;

				if(e.shiftKey) {
					advantage = "advantage"
				} else if(e.ctrlKey) {
					advantage = "disadvantage"
				}

				if(type === 'action') {
					this.actionHover = `${index}-${advantage}`;
				} 
				if(type === 'legendary') {
					this.legendaryHover = `${index}-${advantage}`;
				} 
				
			},
			clearAdvantage() {
				this.actionHover = undefined;
				this.legendaryHover = undefined;
			},
			animateValue(id, start, end, duration) {
				if (start === end) return;
				const range = end - start;
				let current = start;
				const increment = end > start? 1 : -1;
				const stepTime = Math.abs(Math.floor(duration / range));
				const obj = document.getElementById(id);
				const timer = setInterval(function() {
						current += increment;
						obj.innerHTML = current;
						if (current == end) {
								clearInterval(timer);
						}
				}, stepTime);
			}
		},
	}
</script>

<style lang="scss" scoped>
	.select {
		h2 {
			margin-bottom: 5px !important;
		}
	}
	.info {
		vertical-align: -7px;
	}
	.custom-roll {
		display: grid;
		grid-template-columns: 50px 1fr 50px max-content;
		grid-gap: 3px;

		.btn {
			height: 40px !important;
		}
		.span {
			grid-column: span 2;
		}

		.advantage:hover {
			.btn {
				background-color: #83b547;
			}
		}
		.disadvantage:hover {
			.btn {
				background-color: #cc3e4a;
			}
		}
	}
	ul.roll {
		margin-bottom: 30px;
		padding: 0;
		list-style: none;

		li {
			padding-left: 5px;
			margin-bottom: 2px;

			a {
				width: 100%;
				padding: 5px;

				&:hover {
					text-decoration: none;
				}

				i {
					margin-top: 3px;
				}
			}
			.btn {
				min-width: 60px;
			}
			.advantage:hover {
				.btn {
					background-color: #83b547;
				}
			}
			.disadvantage:hover {
				.btn {
					background-color: #cc3e4a;
				}
			}
		}
	}
	.setAdvantage {
		margin-top: 20px;

		.btn {
			width: 48%;
		}
	}
</style>