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
		<div class="actions">
			<h2>Actions</h2>
			<div class="tab-content">
				<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
					<p v-if="!target" class="red">No target selected</p>
					<template v-else>
						<p>Target: <b class="blue">{{ target.name }}</b></p>
						<p>Manual damage or healing</p>
						<div class="manual">
							<input type="number" min="0" v-model="manualAmount" v-validate="'numeric'" name="Manual Input" class="form-control">
							<button class="btn dmg bg-red" @click="setManual(target, 'damage')"><i class="fas fa-minus-square"></i></button>
							<button class="btn heal bg-green" @click="setManual(target, 'healing')"><i class="fas fa-plus-square"></i></button>
						</div>
						<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
						<div v-if="target.type == 'player'">
							{{ target.type }}
							{{ getPlayer(target.id).player_name }}
						</div>
					</template>
				</div>
				<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
					Coming soon
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'

	import { getters } from '@/mixins/getters'

	export default {

		name: 'Actions',
		props: ['target', 'round', 'turn'],
		mixins: [getters],
		data: function() {
			return {
				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				manualAmount: '',
				log: [],
				currentRound: this.round,
				currentTurn: this.turn + 1,
			}
		},
		computed: {
			test: function() {

				console.log(this.target)
			}
		} ,
		methods: {
			setManual(target, type) {
				this.$validator.validateAll().then((result) => {
					if(result) {
						let amount = parseInt(this.manualAmount);
						let maxHp = parseInt(target.maxHp);
						let curHp = parseInt(target.curHp);
						let over = 0

						//time for log
						var d = new Date();
						var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

						if(type == 'damage') {
						let newhp = parseInt(curHp - amount);

						if(newhp < 0) { 
							newhp = 0;
							over = amount - curHp; //overkill
							amount = curHp;
						}
							
							target.curHp = newhp
							db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${target.key}`).update({
								curhp: newhp,
							})
							//Notification
							this.$snotify.error(
								amount + ' ' + type + 'done to ' + target.name, 
								'Damage done!', 
								{
									position: "centerTop"
								}
							);
							//Add to log
							this.log.unshift({
								round: this.currentRound,
								turn: this.currentTurn,
								time: time,
								type: type,
								target: target.name,
								amount: amount,
								over: over
							})	
						}
						else {
							let newhp = parseInt(curHp + amount);

							if(newhp > maxHp) { 
								newhp = maxHp;
								over = amount - maxHp + curHp; //overhealing
								amount = maxHp - curHp;
							}
							
							target.curHp = newhp
							db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${target.key}`).update({
								curhp: newhp,
							})
							//Notification
							this.$snotify.success(
								amount + ' ' + type + 'done to ' + target.name, 
								'Healing done!', 
								{
									position: "centerTop",
								}
							);
							//Add to log
							this.log.unshift({
								round: this.currentRound,
								turn: this.currentTurn,
								time: time,
								type: type,
								target: target.name,
								amount: amount,
								over: over
							})	
						}
						
						this.manualAmount = '';
						this.$emit("log", this.log);
					}
					else {
						//console.log('Not Valid');
					}
				})
			}
		}
	}
</script>

<style lang="css" scoped>
.nav { 
	background:#191919;
}
.actions {
	padding:15px 10px;
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
.form-control {
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

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
-webkit-appearance: none;
margin: 0;
}
</style>