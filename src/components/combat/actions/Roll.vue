<template>
	<div v-if="current">
		<p v-if="targeted.length === 0">No target selected</p>
		<template v-else-if="current.entityType === 'npc'">
			<p v-if="targeted.length === 1">
				<i class="fas fa-crosshairs gray-hover"></i> Target: <b class="blue">{{ entities[targeted[0]].name }}</b><br/>
				<i class="fas fa-shield gray-hover"></i> Armor Class: 
				<b class="blue">
					<span :class="{ 
							'green': entities[targeted[0]].ac_bonus > 0, 
							'red': entities[targeted[0]].ac_bonus < 0 
						}" v-b-tooltip.hover :title="'Armor Class + ' + entities[targeted[0]].ac_bonus" v-if="entities[targeted[0]].ac_bonus">
						{{ displayStats(entities[targeted[0]]).ac + entities[targeted[0]].ac_bonus}}
					</span>
					<span v-else>{{ displayStats(entities[targeted[0]]).ac }}</span>
				</b>
			</p>
			
			<template v-if="current.actions">
				<h2>Actions</h2>

				<!-- ROLL OPTIONS -->
				<template v-if="!demo">
					<div class="d-flex justify-content-between">
						<b-form-checkbox class="mb-2" name="openRoll" v-model="openRoll">Roll openly</b-form-checkbox>
						<a data-toggle="collapse" class="ml-1" href="#rollOptions" role="button" aria-expanded="false"><i class="fas fa-cog"></i></a>
					</div>
					<div class="collapse bg-gray-hover p-2 mb-2" id="rollOptions">
						<b-form-group label="Display options open roll">
							<b-form-checkbox-group
								v-model="rollOptions"
								:options="options"
								name="flavour-2a"
								stacked
							></b-form-checkbox-group>
						</b-form-group>
						<small>Open rolls are shown on the player screen.</small>
					</div>
				</template>
				<b-form-checkbox class="mb-2" name="toHit" v-model="toHit">Roll to hit</b-form-checkbox>
				<b-form-checkbox v-if="targeted.length > 1" class="mb-2" name="rollOnce" v-model="rollOnce">Roll damage once</b-form-checkbox>


				<div v-if="toHit" class="advantage d-flex justify-content-between">
					<button class="btn btn-sm bg-gray-hover mb-3" :class="{ 'bg-green': advantage == 'advantage' }" @click="setAdvantage('advantage')">
						<i v-if="advantage == 'advantage'" class="fas fa-check"></i>
						Advantage
					</button>
					<button class="btn btn-sm bg-gray-hover mb-3" :class="{ 'bg-green': advantage == 'disadvantage' }" @click="setAdvantage('disadvantage')">
						<i v-if="advantage == 'disadvantage'" class="fas fa-check"></i>
						Disadvantage
					</button>
				</div>
				<ul class="roll">
					<li v-for="(action, index) in current.actions" :key="index" class="bg-gray-active">
						<span class="d-flex justify-content-between">
							<a class="d-flex justify-content-between gray-light"
								data-toggle="collapse" :href="'#act-'+index" 
								role="button" 
								aria-expanded="false">
								<span>{{ action.name }}</span>
								<i class="fas fa-caret-down"></i>
							</a>
							<button v-if="action['damage_dice']" v-b-tooltip.hover :title="'Roll '+action.name" @click="groupRoll(action)" class="btn btn-sm">
								<i class="fas fa-dice-d20"></i>
								<span class="d-none d-md-inline ml-1">Roll</span>
							</button>
						</span>
						<p class="collapse py-2 pr-1" :id="'act-'+index">{{ action.desc }}</p>
					</li>
				</ul>
			</template>
			<template v-if="current.legendary_actions">
				<h2>Legendary Actions</h2>

				<ul class="roll">
					<li v-for="(action, index) in current.legendary_actions" :key="index" class="bg-gray-active">
						<span class="d-flex justify-content-between">
							<a class="d-flex justify-content-between gray-light"
								data-toggle="collapse" 
								:href="'#leg-'+index" role="button" 
								aria-expanded="false">
								<span>{{ action.name }}</span>
								<i class="fas fa-caret-down"></i>
							</a>
							<button v-if="action['damage_dice']" v-b-tooltip.hover :title="'Roll '+action.name" @click="groupRoll(action)" class="btn btn-sm">
								<i class="fas fa-dice-d20"></i>
								<span class="d-none d-md-inline ml-1">Roll</span>
							</button>
						</span>
						<p class="collapse py-2 pr-1" :id="'leg-'+index">{{ action.desc }}</p>
					</li>
				</ul>

			</template>
		</template>
		<p v-else-if="current.entityType === 'player'">Most players want to roll their own attacks, you probably shouldn't take that away from them.</p>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapGetters } from 'vuex'
	import { dice } from '@/mixins/dice.js'
	import { setHP } from '@/mixins/HpManipulations.js'


	export default {
		name: 'Select',
		mixins: [setHP, dice],
		props: ['current'],
		data: function() {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				advantage: false,
				openRoll: false,
				rollOptions: ['toHit', 'damage'],
				setToHit: undefined,
				rollOnce: true,
				options: [
					{ text: 'To hit', value: 'toHit' },
					{ text: 'Damage', value: 'damage' },
					{ text: 'Modifiers', value: 'modifiers' },
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
				'targeted'
			]),
			toHit: {
				get() {
					let hit = true
					if(this.targeted.length > 1) {
						hit = false;
					}
					return (this.setToHit) ? this.setToHit : hit;
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
			}
		},
		methods: {
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
			setAdvantage(value) {
				if(this.advantage == value) {
					this.advantage = false;
				} else {
					this.advantage = value;
				}
			},
			groupRoll(action) {
				for(let i in this.targeted) {
					let key = this.targeted[i];
					let target = this.entities[key];

					this.roll(action, target, i);
				}
				this.aoeRoll = undefined;
			},
			roll(action, target, rollCounter) {
				event.stopPropagation();
				var rolls = action['damage_dice'].replace(/\s+/g, ''); //remove spaces
				rolls = rolls.split('+'); //seperate the rolls
				let crit = false;
				let critDouble = false;
				let critRoll = 1; //set to 2 on a crit
				let hits = '';
				var total = 0;
				var allDamageRolls = [];
				var critInfo = '';
				var highest = 0;
				var lowest = undefined;

				var ac = parseInt(this.displayStats(target).ac);

				//Add bonus AC if there is any
				if(target.ac_bonus) {
					ac = parseInt(target.ac_bonus) + ac;
				}

				let toHit = [];
				let adv = ""
				//If there is advantage roll twice
				if(this.advantage) {
					for(let i = 0; i <= 1; i++) {
						let attack_bonus = action.attack_bonus || 0;
						toHit[i] =  this.rollD(20, 1, attack_bonus); //Roll the to hit, d20 + attack bonus
					}

					//Define the position of the highest and lowest rolls in the array
					highest = (toHit[0].throws[0] >= toHit[1].throws[0]) ? 0 : 1;
					lowest = (toHit[0].throws[0] >= toHit[1].throws[0]) ? 1 : 0;

					//Set advantage message for snotify
					let color = (this.advantage == 'advantage') ? 'green' : 'red'; 
					adv = `<small class="${color} advantage">${this.advantage}</small>`;	
				} 
				//Roll once where there is no advantage/disadvantage
				else {
					highest = 0; //You roll once, so 0 will be the hightest roll (important later)
					toHit[highest] = this.rollD(20, 1, action['attack_bonus']); //Roll the to hit, d20 + attack bonus
				}

				//Flip the positions of highest and lowest if there was disadvantage
				if(this.advantage == 'disadvantage') {
					highest = (highest === 0) ? 1 : 0;
					lowest = (lowest === 0) ? 1 : 0;
				}

				//Roll the damage for all seperated rolls
				//Roll if it's the first roll and rollOnce = true
				//Roll if rollOnce is false
				if((rollCounter == 0 && this.rollOnce) || !this.rollOnce){
					//Check if it was a crit
					if(this.toHit && toHit[highest].throws[0] === 20) {
						crit = true;
						if(this.criticalSettings['.value']) {
							critDouble = true;
						} else {
							critInfo = `<div><small>The damage dice were rolled twice.</small></div>`;
							critRoll = 2;
						}
					}

					//Roll the damage. Twice if it was a crit and critsettings are set to roll twice
					for(let c = 0; c < critRoll; c++) {
						for(let roll in rolls) {
							let dice = rolls[roll].split('d'); //split amount from type of dice [1]d[6]
							let rolled = this.rollD(dice[1], dice[0]) //roll the dice
							let damage = rolled.total; //roll the dice
	
							allDamageRolls.push(rolled.throws);
							total = parseInt(total) + parseInt(damage); //Add the rolls to the total damage
	
						}
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
					if(this.openRoll && ((rollCounter == 0 && this.rollOnce) || !this.rollOnce || this.toHit)) {
						this.rollOpenly(targets, toHit[highest].throws[0], total, action['attack_bonus'], action['damage_bonus']);
					} else {
						db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/lastRoll`).set(false);
					}
				}
				//Check if it was a critical hit and rolled damage should be doubled, not be rolled twice
				if(critDouble) {
					//Form HTML for snotify
					critInfo = `<div><small>The rolled damage was doubled.<br/> (was ${total}, changed to ${parseInt(total*2)})</small></div>`;
					total = parseInt(total*2);
				}
				//Add the damage modifier
				if(action['damage_bonus']) {
					var bonus = '+'+action['damage_bonus']; //form HTML for snotify
					var totalDamage = parseInt(total) + parseInt(action['damage_bonus']); //Add it to the total damage
					var showTotal = '<span class="red">' + totalDamage + '</span>'; //form HTML for snotify
				}
				else {
					//If there was no modifier
					bonus = '';
					totalDamage = total;
					showTotal = '<span class="red">' + total + '</span>';
				}

				if(this.toHit) {
					let toHitRoll = toHit[highest].throws[0];

					//If the to hit roll is a 20, it is a critical hit
					if(toHitRoll === 20) {
						toHitRoll = '<span class="green">natural 20</span>'; //form HTML for snotify
					}
					//If the to hit roll is a 1, it is a critical fail
					else if(toHitRoll === 1) {
						toHitRoll = '<span class="red">natural 1</span>'; //form HTML fo snotify
					}
					//If the to hit is higher than or equal to target's AC, it hits
					let hitOrMiss = (toHit[highest].total >= ac) ? '<span class="green">HIT!</span>' : '<span class="red">MISS!</span>';
					let ignoredRoll = (this.advantage) ? `<span class="gray-hover">${toHit[lowest].throws[0]}</span>` : ``;

					//Form HTML for snotify
					hits = `<div class="roll">
							${(adv) ? adv : ``}
							<div class="top">
								${ignoredRoll}
								${toHitRoll}${toHit[highest].mod}
							</div>
							<h2>${toHit[highest].total}</h2>
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
							${hits}
							<div class="roll">
								<div class="top">${total}${bonus}</div>
								<h2>${showTotal}</h2>
								<div class="bottom">damage</div>
							</div>
						</div>
						${critInfo}

						<a data-toggle="collapse" href="#rolls-${rollCounter}" role="button" >
							Damage Rolls <i class="fal fa-chevron-down"></i>
						</a>
						<p id="rolls-${rollCounter}" class="collapse">
							<span class="gray-hover">${action['damage_dice']} + ${action['damage_bonus']}</span><br/>
							Rolls: ${allDamageRolls}
						</p>
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
				this.advantage = false; //turn advantage off
			},
			rollOpenly(targets, toHit, damage, hitMod, damageMod) {
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
		}
	}
	.advantage {
		.btn {
			width: 48%;
		}
	}
</style>