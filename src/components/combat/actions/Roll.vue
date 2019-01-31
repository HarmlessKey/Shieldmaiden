<template>
	<div v-if="current" class="tab-pane roll fade" id="roll" role="tabpanel" aria-labelledby="roll-tab">
		<p v-if="!target" class="red">No target selected</p>
		<template v-else-if="current.entityType == 'npc'">
			<p>Target: <b class="blue">{{ target.name }}</b></p>
			
			<template v-if="current.actions">
				<h2>Actions</h2>
				<ul class="roll">
					<li v-for="action, index in current.actions" v-if="action['damage_dice']" class="bg-gray-active">
						<span class="d-flex justify-content-between">
							<a class="d-flex justify-content-between gray-light"
								data-toggle="collapse" :href="'#act-'+index" 
								role="button" 
								aria-expanded="false">
								<span>{{ action.name }}</span>
								<i class="fas fa-caret-down"></i>
							</a>
							<button v-if="action['damage_dice']" v-b-tooltip.hover :title="'Roll '+action.name" @click="roll(action)" class="btn btn-sm">
								<span class="d-none d-md-inline mr-1">Roll</span>
								<i class="fas fa-dice-d20"></i>
							</button>
						</span>
						<p class="collapse py-2 pr-1" :id="'act-'+index">{{ action.desc }}</p>
					</li>
				</ul>
			</template>
			<template v-if="current.legendary_actions">
				<h2>Legendary Actions</h2>

				<ul class="roll">
					<li v-for="action, index in current.legendary_actions" v-if="action['damage_dice']" class="bg-gray-active">
						<span class="d-flex justify-content-between">
							<a class="d-flex justify-content-between gray-light"
								data-toggle="collapse" 
								:href="'#leg-'+index" role="button" 
								aria-expanded="false">
								<span>{{ action.name }}</span>
								<i class="fas fa-caret-down"></i>
							</a>
							<button v-if="action['damage_dice']" v-b-tooltip.hover :title="'Roll '+action.name" @click="roll(action)" class="btn btn-sm">
								<span class="d-none d-md-inline mr-1">Roll</span>
								<i class="fas fa-dice-d20"></i>
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
	import firebase from 'firebase'
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
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
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
			roll(action) {
				event.stopPropagation();
				var rolls = action['damage_dice'].split('+');
				let crit = false;
				let hits = '';
				var total = 0;

				let toHit =  this.rollD(20, 1, action['attack_bonus'])
				
				//Damage
				for(let roll in rolls) {
					let dice = rolls[roll].split('d');
					let damage = this.rollD(dice[1], dice[0]).total;

					total = parseInt(total) + parseInt(damage);
				}
				
				let totalDamage = parseInt(total) + parseInt(action['damage_bonus']);

				if(toHit.throws[0] == '20') {
					toHit.total = '<span class="green">NATURAL 20</span>';
					crit = true;
				}
				else if(toHit.throws[0] == '1') {
					toHit.total = '<span class="red">NATURAL 1</span>';
				}
				else {
					if(toHit.total >= this.target.ac) {
						hits = `<span class="green">HIT!</span> <span class="gray-hover">(<i class="fas fa-shield"></i> ${this.target.ac})</span>`;
					}
					else {
						hits = `<span class="red">MISS!</span> <span class="gray-hover">(<i class="fas fa-shield"></i> ${this.target.ac})</span>`;
					}
				}

				this.$snotify.html(
					`<div class="snotifyToast__title">
						<b>${action.name}</b>
					</div>
					<div class="snotifyToast__body">
						<h2>${toHit.total} ${hits}</h2>
						<h2 class="red">${totalDamage} <span class="gray-hover">damage</span></h2>
					</div> `, {
					timeout: 0,
					closeOnClick: false,
					buttons: [
						{ 
							text: 'Hit', 
							action: (toast) => { 
								this.setHP(totalDamage, crit, this.target, this.current, 'damage')
								this.$snotify.remove(toast.id); }, 
								bold: false
							},
						{ 
							text: 'Miss', 
							action: (toast) => { 
								this.$snotify.remove(toast.id); }, 
								bold: true
							},
						{ 
							text: 'Cancel', 
							action: (toast) => { 
								this.$snotify.remove(toast.id); }, 
								bold: true
							},
					]
				});
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
</style>