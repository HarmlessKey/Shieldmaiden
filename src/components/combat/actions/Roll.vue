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
				<b-form-checkbox class="mb-2" name="toHit" v-model="toHit">Roll to hit</b-form-checkbox>
				<b-form-checkbox v-if="targeted.length > 1" class="mb-2" name="rollOnce" v-model="rollOnce">Roll damge once</b-form-checkbox>


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
							<button v-if="action['damage_dice']" v-b-tooltip.hover :title="'Roll '+action.name" @click="roll(action, advantage)" class="btn btn-sm">
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
				let hits = '';
				var total = 0;
				var allDamageRolls = [];
				var critInfo = '';
				var highest = 0;

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
						toHit[i] =  this.rollD(20, 1, action['attack_bonus']); //Roll the to hit, d20 + attack bonus
					}
					
					//Check which roll was highest
					highest = (toHit[0].total >= toHit[1].total) ? 0 : 1;
					
					//Set advantage message for snotify
					let color = (this.advantage == 'advantage') ? 'green' : 'red'; 
					adv = `<small class="${color}">${this.advantage}</small>`;	
				} 
				//Roll once where there is no advantage/disadvantage
				else {
					highest = 0; //You roll once, so 0 will be the hightest roll (important later)
					toHit[highest] =  this.rollD(20, 1, action['attack_bonus']); //Roll the to hit, d20 + attack bonus
				}

				//Roll the damage for all seperated rolls
				//Roll if it's the first roll and rollOnce = true
				//Roll if rollOnce is false
				if((rollCounter == 0 && this.rollOnce) || !this.rollOnce){
					//Check if it was a crit
					if(this.toHit) {
						if(toHit[highest].throws[0] == '20') {
							crit = true;
						}
					}	

					//Roll the damage
					for(let roll in rolls) {
						let dice = rolls[roll].split('d'); //split amount from type of dice [1]d[5]
						let rolled = this.rollD(dice[1], dice[0]) //roll the dice
						let damage = rolled.total; //roll the dice

						allDamageRolls.push(rolled.throws);
						total = parseInt(total) + parseInt(damage); //Add the rolls to the total damage

					}
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

				//If there was disadvantage, it cannot crit
				if(this.advantage == 'disadvantage') {
					highest = (highest == 0) ? 1 : 0;
				}
				//Check if it was a critical hit
				if(toHit[highest].throws[0] == '20') {
					//Form HTML for snotify
					critInfo = `<small>The rolled damage is doubled on a crit.<br/> (was ${total}, changed to ${parseInt(total*2)})</small>`;
					
					//Double the rolled damage
					total = parseInt(total*2);
				}
				
				//Add the damage modifier
				if(action['damage_bonus']) {
					var bonus = ' + '+action['damage_bonus']; //form HTML for snotify
					var totalDamage = parseInt(total) + parseInt(action['damage_bonus']); //Add it to the total damage
					var showTotal = ' = <span class="red">' + totalDamage + '</span>'; //form HTML for snotify
				}
				else {
					//If there was no modifier
					bonus = '';
					showTotal = ''
					totalDamage = total;
					total = '<span class="red">' + total + '</span>';
				}

				if(this.toHit) {
					//If the to hit roll is a 20, it is a critical hit
					if(crit) {
						hits = '<h2 class="green">NATURAL 20</h2>'; //form HTML for snotify
					}
					//If the to hit roll is a 1, it is a critical fail
					else if(toHit[highest].throws[0] == '1') {
						hits = '<h2 class="red">NATURAL 1</h2>'; //form HTML fo snotify
					}
					else {
						//If the to hit is higher than or equal to target's AC, it hits
						if(toHit[highest].total >= ac) {
							//Form HTML for snotify
							hits = `<h2><span class="gray-hover">${toHit[highest].throws[0]} ${toHit[highest].mod} = </span>${toHit[highest].total}
											<span class="green">HIT!</span> 
											<span class="gray-hover">(<i class="fas fa-shield"></i> ${ac})</span></h2>`;
						}
						//If the to hit is lower than the target's ac, it misses
						else {
							//Form HTML for snotify
							hits = `<h2><span class="gray-hover">${toHit[highest].throws[0]} ${toHit[highest].mod} = </span>${toHit[highest].total}
											<span class="red">MISS!</span> 
											<span class="gray-hover">(<i class="fas fa-shield"></i> ${ac})</span></h2>`;
						}
					}
				}

				//If it was an open roll
				if(this.openRoll) {
					this.rollOpenly(toHit[highest].throws[0], total, action['attack_bonus'], action['damage_bonus'])
				} else {
					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/lastRoll`).set(false)
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
						<h2><b>${action.name}</b></h2>
						${adv}
						${hits}
						<h2 class="gray-hover">${total} ${bonus} ${showTotal} <span class="gray-hover">damage</span></h2>
						${critInfo}

						<a data-toggle="collapse" href="#rolls-${rollCounter}" role="button" >
							<small>Show Rolls <i class="fal fa-chevron-down"></i></small>
						</a>
						<p id="rolls-${rollCounter}" class="collapse">
							<span class="gray-hover">${action['damage_dice']} + ${action['damage_bonus']}</span><br/>
							Your rolls: ${allDamageRolls}
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
			rollOpenly(toHit, damage, hitMod, damageMod) {
				var showRoll = [];

				//Show to hit roll
				if (Object.values(this.rollOptions).indexOf('toHit') > -1) {
					if(toHit == '20') {
						showRoll.toHitTotal = 'Natural 20'
					} else if(toHit == '1') {
						showRoll.toHitTotal = 'Natural 1'
					} else {
						showRoll.toHitTotal = parseInt(toHit) + parseInt(hitMod);
					}

					//Show Modifier
					if(Object.values(this.rollOptions).indexOf('modifiers') > -1) {
						showRoll.toHit = toHit;
						showRoll.hitMod = hitMod;
					}
				}

				//Show damage roll
				if (Object.values(this.rollOptions).indexOf('damage') > -1) {
					showRoll.damageTotal = parseInt(damage) + parseInt(damageMod);

					//Show Modifier
					if(Object.values(this.rollOptions).indexOf('modifiers') > -1) {
						showRoll.damage = damage;
						showRoll.damageMod = damageMod;
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