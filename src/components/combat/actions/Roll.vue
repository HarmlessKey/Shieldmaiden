<template>
	<div v-if="current" class="tab-pane roll fade" id="roll" role="tabpanel" aria-labelledby="roll-tab">
		<p v-if="!target">No target selected</p>
		<template v-else-if="current.entityType == 'npc'">
			<p><i class="fas fa-crosshairs gray-hover"></i> Target: <b class="blue">{{ target.name }}</b><br/>
				<i class="fas fa-shield gray-hover"></i> Armor Class: 
				<b class="blue">
					<span :class="{ 
							'green': target.ac_bonus > 0, 
							'red': target.ac_bonus < 0 
						}" v-b-tooltip.hover :title="'Armor Class + ' + target.ac_bonus" v-if="target.ac_bonus">
						{{ displayStats(target).ac + target.ac_bonus}}
					</span>
					<span v-else>{{ displayStats(target).ac }}</span>
				</b>
			</p>
			
			<template v-if="current.actions">
				<h2>Actions</h2>
				<div class="advantage d-flex justify-content-between">
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
							<button v-if="action['damage_dice']" v-b-tooltip.hover :title="'Roll '+action.name" @click="roll(action, advantage)" class="btn btn-sm">
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
		<p v-else>Most players want to roll their own attacks, you probably shouldn't take that away from them.</p>
	</div>
</template>

<script>
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
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'entities',
				'turn',
				'targeted',
			]),
			target: function() {
				return this.entities[this.targeted]
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
			roll(action, advantage) {
				event.stopPropagation();
				var rolls = action['damage_dice'].replace(/\s+/g, ''); //remove spaces
				rolls = rolls.split('+'); //seperate the rolls
				let crit = false;
				let hits = '';
				var total = 0;
				var allDamageRolls = [];
				var critInfo = '';
				var highest = 0;

				var ac = parseInt(this.displayStats(this.target).ac);

				//Add bonus AC if there is any
				if(this.target.ac_bonus) {
					ac = parseInt(this.target.ac_bonus) + ac;
				}

				let toHit = [];
				let adv = ""
				//If there is advantage roll twice
				if(advantage) {
					for(let i = 0; i <= 1; i++) {
						toHit[i] =  this.rollD(20, 1, action['attack_bonus']); //Roll the to hit, d20 + attack bonus
					}
					
					//Check which roll was highest
					highest = (toHit[0].total >= toHit[1].total) ? 0 : 1;
					
					//Set advantage message for snotify
					let color = (advantage == 'advantage') ? 'green' : 'red'; 
					adv = `<small class="${color}">${advantage}</small>`;
					
				} 
				//Roll once where there is no advantage/disadvantage
				else {
					highest = 0; //You roll once, so 0 will be the hightest roll (important later)
					toHit[highest] =  this.rollD(20, 1, action['attack_bonus']); //Roll the to hit, d20 + attack bonus
				}
				console.log(toHit);

				//Roll the damage for all seperated rolls
				for(let roll in rolls) {
					let dice = rolls[roll].split('d'); //split amount from type of dice [1]d[5]
					let rolled = this.rollD(dice[1], dice[0]) //roll the dice
					let damage = rolled.total; //roll the dice

					allDamageRolls.push(rolled.throws);
					total = parseInt(total) + parseInt(damage); //Add the rolls to the total damage
				}

				//If there was disadvantage, it cannot crit
				if(advantage == 'disadvantage') {
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

				//If the to hit roll is a 20, it is a critical hit
				if(toHit[highest].throws[0] == '20') {
					hits = '<span class="green">NATURAL 20</span>'; //form HTML for snotify
					crit = true;
				}
				//If the to hit roll is a 1, it is a critical fail
				else if(toHit[highest].throws[0] == '1') {
					hits = '<span class="red">NATURAL 1</span>'; //form HTML fo snotify
				}
				else {
					//If the to hit is higher than or equal to target's AC, it hits
					if(toHit[highest].total >= ac) {
						//Form HTML for snotify
						hits = `<span class="gray-hover">${toHit[highest].throws[0]} ${toHit[highest].mod} = </span>${toHit[highest].total}
										<span class="green">HIT!</span> 
										<span class="gray-hover">(<i class="fas fa-shield"></i> ${ac})</span>`;
					}
					//If the to hit is lower than the target's ac, it misses
					else {
						//Form HTML for snotify
						hits = `<span class="gray-hover">${toHit[highest].throws[0]} ${toHit[highest].mod} = </span>${toHit[highest].total}
										<span class="red">MISS!</span> 
										<span class="gray-hover">(<i class="fas fa-shield"></i> ${ac})</span>`;
					}
				}

				//BUILD SNOTIFY POPUP
				this.$snotify.html(
					`<div class="snotifyToast__title">
						<b>${action.name}</b>
					</div>
					<div class="snotifyToast__body">
						${adv}
						<h2>${hits}</h2>
						<h2 class="gray-hover">${total} ${bonus} ${showTotal} <span class="gray-hover">damage</span></h2>
						${critInfo}

						<a data-toggle="collapse" href="#rolls" role="button" >
							<small>Show Rolls <i class="fal fa-chevron-down"></i></small>
						</a>
						<p id="rolls" class="collapse">
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
								this.setHP(totalDamage, crit, this.target, this.current, 'damage')
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{ 
							//Does half of the damage rounded down
							text: 'Half', 
							action: (toast) => { 
								this.setHP(Math.floor(totalDamage/2), crit, this.target, this.current, 'damage')
								this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{ 
							//Does double of the damage
							text: 'Double', 
							action: (toast) => { 
								this.setHP(parseInt(totalDamage*2), crit, this.target, this.current, 'damage')
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