<template>
	<div id="actions" class="bg-gray">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" id="manual-tab" data-toggle="tab" href="#manual" role="tab" aria-controls="manual" aria-selected="true">Manual</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" id="select-tab" data-toggle="tab" href="#select" role="tab" aria-controls="select" aria-selected="false">Select</a>
			</li>
		</ul>
		<div class="scroll" v-bar>
			<div>
				<div class="tab-content">
					<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
						<p v-if="!target" class="red">No target selected</p>
						<template v-else>
							<h2>Manual</h2>
							<p>Target: <b class="blue">{{ target.name }}</b></p>
							<p>Manual damage or healing</p>

							<select class="form-control mb-2" v-model="damageType" name="damageType">
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
							</select>

							<div class="manual">
								<input type="phone" v-model="manualAmount" v-validate="'numeric'" name="Manual Input" class="form-control manual-input">
								<button class="btn dmg bg-red" :class="{disabled: errors.has('Manual Input') || manualAmount == ''}" @click="setManual(target, 'damage')"><i class="fas fa-minus-square"></i></button>
								<button class="btn heal bg-green" :class="{disabled: errors.has('Manual Input') || manualAmount == ''}" @click="setManual(target, 'healing')"><i class="fas fa-plus-square"></i></button>
							</div>
							<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
							<div v-if="target.type == 'player'">
								{{ getPlayer(target.id).character_name }}
							</div>
						</template>
					</div>
					<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
						<h2>Select</h2>
						Coming soon
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import { mapGetters } from 'vuex'

	import { getters } from '@/mixins/getters'

	export default {

		name: 'Actions',
		props: ['target', 'turn', 'current'],
		mixins: [getters],
		data: function() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				manualAmount: '',
				damageType: '',
				log: undefined
			}
		},
		computed: {
			...mapGetters([
				'encounter',
			]),
		},
		methods: {
			setManual(target, type) {
				this.$validator.validateAll().then((result) => {
					if(result && this.manualAmount != '') {
						let amount = parseInt(this.manualAmount);
						let maxHp = parseInt(target.maxHp);
						let curHp = parseInt(target.curHp);

						if(type == 'damage') {
							this.isDamage(target, amount, curHp, maxHp)
						}
						else {
							this.isHealing(target, amount, curHp, maxHp)
						}
						this.manualAmount = '';
						this.damageType = '';
					}
					else {
						//console.log('Not Valid');
					}
				})
			},
			isDamage(target, amount, curHp, maxHp) {
				let newhp = parseInt(curHp - amount);
				let type = 'damage'
				let over = 0

				if(newhp < 0) { 
					newhp = 0;
					over = amount - curHp; //overkill
					amount = curHp;
				}
				
				target.curHp = newhp
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${target.key}`).update({
					curHp: newhp,
				})
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
			isHealing(target, amount, curHp, maxHp) {
				let newhp = parseInt(curHp + amount);
				let type = 'healing'
				let over = 0

				if(newhp > maxHp) { 
					newhp = maxHp;
					over = amount - maxHp + curHp; //overhealing
					amount = maxHp - curHp;
				}
				
				target.curHp = newhp
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${target.key}`).update({
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
						target: this.target.key,
						damageType: this.damageType,
						over: over,
					});
				}
			}
		}
	}
</script>

<style lang="css" scoped>
#actions {
	grid-area: actions;
	overflow: hidden;
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
</style>