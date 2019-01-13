<template>
	<div id="actions" class="bg-gray">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" 
					id="manual-tab" 
					data-toggle="tab" 
					href="#manual" 
					role="tab" 
					aria-controls="manual" 
					aria-selected="true">
					Manual
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					id="select-tab" 
					data-toggle="tab" 
					href="#select" 
					role="tab" 
					aria-controls="select" 
					aria-selected="false">
					Select
				</a>
			</li>
		</ul>
		<div class="scroll" v-bar>
			<div>
				<div class="tab-content">
					<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
						<p v-if="!target" class="red">No target selected</p>
						<template v-else>
							<p>Target: <b class="blue">{{ target.name }}</b></p>
							<b-form-checkbox class="mb-2" name="crit" v-model="crit">Critical hit</b-form-checkbox>

							<!-- <select class="form-control mb-2" v-model="damageType" name="damageType">
								<option value="">Type of damage...</option>
								<option value="acid">Acid</option>
								<option value="bludgeoning">Bludgeoning</option>
								<option value="cold">Cold</option>
								<option value="fire">Fire</option>
								<option value="force">Force</option>
								<option value="lightning">Lightning</option>
								<option value="necrotic">Necrotic</option>
								<option value="piercing">Piercing</option>
								<option value="poison">Poison</option>
								<option value="psychic">Psychic</option>
								<option value="radiant">Radiant</option>
								<option value="slashing">Slashing</option>
								<option value="thunder">Thunder</option>
							</select> -->

							<div class="manual">
								<input type="number" 
									v-model="manualAmount" 
									v-validate="'numeric'" 
									name="Manual Input" 
									min="0"
									class="form-control manual-input">
								<button class="btn dmg bg-red" 
									:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
									@click="setManual(targeted, target, 'damage')">
									<i class="fas fa-minus-square"></i>
								</button>
								<button class="btn heal bg-green" 
									:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
									@click="setManual(targeted, target, 'healing')">
									<i class="fas fa-plus-square"></i>
								</button>
							</div>
							<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
						</template>
					</div>
					<div v-if="current" class="tab-pane select fade" id="select" role="tabpanel" aria-labelledby="select-tab">
						<p v-if="!target" class="red">No target selected</p>
						<template v-else-if="current.entityType == 'npc'">
							<p>Target: <b class="blue">{{ target.name }}</b></p>
							
							<template v-if="current.actions">
								<h2>Actions</h2>
								<div v-for="action, index in current.actions">
									<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#action-'+index" role="button" aria-expanded="false">
										<span>{{ index + 1 }}. {{ action.name }}</span>
										<i class="fas fa-caret-down"></i>
									</a>
									<p class="collapse" :id="'action-'+index">{{ action.desc }}</p>
								</div>
							</template>
							<template v-if="current.legendary_actions">
								<h2>Legendary Actions</h2>
								<div v-for="action, index in current.legendary_actions">
									<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#action-'+index" role="button" aria-expanded="false">
										<span>{{ index + 1 }}. {{ action.name }}</span>
										<i class="fas fa-caret-down"></i>
									</a>
									<p class="collapse" :id="'action-'+index">{{ action.desc }}</p>
								</div>
							</template>
						</template>
						<p v-else>Players want to roll their own attacks, don't take that away from them.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'

	import { getters } from '@/mixins/getters'

	export default {

		name: 'Actions',
		mixins: [getters],
		props: ['current'],
		data: function() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				manualAmount: '',
				damageType: '',
				crit: false,
				log: undefined
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
			...mapActions([
				'set_save',
				'set_stable',
			]),
			setManual(key, target, type) {
				this.$validator.validateAll().then((result) => {
					if(result && this.manualAmount != '') {
						let amount = parseInt(this.manualAmount);

						if(type == 'damage') {
							this.isDamage(key, target, amount)
						}
						else {
							this.isHealing(key, target, amount)
						}
						this.manualAmount = '';
						this.damageType = '';
						this.crit = false;
					}
					else {
						//console.log('Not Valid');
					}
				})
			},
			isDamage(key, target, amount) {
				var maxHp = parseInt(target.maxHp);
				var curHp = parseInt(target.curHp);
				var tempHp = parseInt(target.tempHp)
				var type = 'damage'
				var over = 0
				var rest_amount = amount

				//Death saves at 0 hp
				if(curHp == 0) {
					console.log('yo')
					var n = parseInt(Object.keys(target.saves).length)
					
					this.set_save({
					 key: key,
					 check: 'fail',
					 number: n
					})
					if(this.crit) {
						n = parseInt(Object.keys(target.saves).length)

						this.set_save({
						key: key,
						check: 'fail',
						number: n
						})
					}
				}

				//First check if there is tempHp and put damage in there first.
				if(tempHp) {
					var newtemp = parseInt(tempHp - amount);
					
					//if the damage was higher then the amount of tempHp, remove the tempHp and remember the rest damage
					if(newtemp < 0) {
						rest_amount = parseInt(amount - tempHp);
						target.tempHp = undefined;
						db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${key}/tempHp`).remove()
					}
					//if the damage was lower than the amount of tempHp, set a new tempHp and set rest damage to 0
					else {
						db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${key}`).update({
							tempHp: newtemp,
						})
						target.tempHp = newtemp;
						rest_amount = 0;
					}
				}
				//If there is damage left after taking it from the tempHp
				if(rest_amount > 0) {
					var newhp = parseInt(curHp - rest_amount);

					if(newhp <= 0) {
						this.set_stable({
							key: target.key,
							action: 'unset',
						});
					}
				
					if(newhp < 0) { 
						newhp = 0;

						if(tempHp) {
							over = parseInt(rest_amount + tempHp - curHp); //overkill
							amount = parseInt(curHp + tempHp);
						}
						else {
							over = parseInt(rest_amount - curHp); //overkill
							amount = curHp;
						}
					}
					target.curHp = newhp

					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${key}`).update({
						curHp: newhp,
					})
				}

				//Notification
				this.$snotify.error(
					this.current.name + ' did ' + amount + ' ' + type + ' to ' + target.name,
					'Damage done!', 
					{
						position: "centerTop"
					}
				);
				//Add to log
				this.addLog(type, target.name, amount, over);

				//Add to damagemeters
				this.damageMeters(type, amount, over);
			},
			isHealing(key, target, amount) {
				let maxHp = parseInt(target.maxHp);
				let curHp = parseInt(target.curHp);
				let newhp = parseInt(curHp + amount);
				let type = 'healing'
				let over = 0

				//If the target is a player and the curHp was 0, saves need to be reset
				if(target.entityType == 'player' && curHp == 0) {
					this.set_save({
						key: key,
						check: 'reset'
					})
				}

				if(newhp > maxHp) { 
					newhp = maxHp;
					over = amount - maxHp + curHp; //overhealing
					amount = maxHp - curHp;
				}
				
				target.curHp = newhp
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${key}`).update({
					curHp: newhp,
				})
				//Notification
				this.$snotify.success(
					this.current.name + ' did ' + amount + ' ' + type + ' to ' + target.name, 
					'Healing done!', 
					{
						position: "centerTop",
					}
				);
				//Add to log
				this.addLog(type, target.name, amount, over)
				
				//Add to damagemeters
				this.damageMeters(type, amount, over);
			},
			addLog(type, target, amount, over) {
				var d = new Date();
				var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

				if(this.$cookies.isKey(this.encounterId) == true) {
					this.log = JSON.parse(this.$cookies.get(this.encounterId));
				}
				else {
					this.log = []
				}
				this.log.unshift({
					round: this.encounter.round,
					turn: this.encounter.turn + 1,
					by: this.current.name,
					time: time,
					type: type,
					damageType: this.damageType,
					target: target,
					amount: amount,
					over: over
				})
				this.$cookies.set(this.encounterId, JSON.stringify(this.log), "2m");
				this.$emit("log", this.log)
			},
			damageMeters(type, amount, over) {
				if(amount > 0) {
					db.ref(`meters/${this.userId}/${this.encounterId}/${type}/${this.current.key}`).push({
						amount: amount,
						round: this.encounter.round,
						target: this.targeted,
						damageType: this.damageType,
						over: over,
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
#actions {
	grid-area: actions;
	overflow: hidden;

	.custom-control-label {
		line-height: 25px !important;
	}
}
.nav { 
	background: #191919;
	margin-bottom: 20px;
}
.actions {
	padding:0 10px 10px 15px;
	height: calc(100% - 55px);
}
.manual {
	display:grid;
	grid-template-columns: 2fr 1fr;
	grid-template-rows: 40px 40px;
	grid-gap: 10px;
	grid-template-areas: 
	"input btn-dmg"
	"input btn-heal";
}
.manual-input {
	height:90px;
	font-size:50px;
	text-align: center;
	grid-area: input;
}
.heal {
	grid-area: btn-heal;
}
.dmg {
	grid-area: btn-dmg;
}
.tab-content {
	padding: 0 10px 15px 10px;
}
.select {
	h2 {
		margin-bottom: 5px !important;
	}
}
</style>