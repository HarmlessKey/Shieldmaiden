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

						<!-- <div class="custom-control custom-checkbox mb-2">
							<input type="checkbox" class="custom-control-input" checked="checked" id="lethal">
							<label class="custom-control-label" for="lethal">Lethal damage</label>
						</div> -->
						<div class="manual">
							<input type="phone" v-model="manualAmount" class="form-control">
							<button class="btn dmg bg-red" @click="setManual(target, 'damage')"><i class="fas fa-minus-square"></i></button>
							<button class="btn heal bg-green" @click="setManual(target, 'healing')"><i class="fas fa-plus-square"></i></button>
						</div>
					</template>
				</div>
				<div class="tab-pane fade" id="select" role="tabpanel" aria-labelledby="select-tab">
					<div class="row">
						<div class="col">
							<select class="custom-select mb-3" id="action">
								<option selected>Choose...</option>
								<optgroup label="Attacks">
									<option value="1">Shortbow</option>
									<option value="2">Scimtar</option>
								</optgroup>
							</select>
						</div>
						<div class="col">
							<div id="selected-action">
								<p>
									<b>Range:</b> <span class="range"></span><br/>
									<b>To hit:</b> <span class="to-hit"></span><br/>
									<b>Damage:</b> <span class="damage"></span><br/>
									<b>Type:</b> <span class="type"></span>
								</p>
							</div>
						</div>
					</div>
					
					<a class="btn btn-block disabled mb-3"><i class="fas fa-dice"></i> Roll to hit</a>
					
					<div id="hit-result">
						<span>
							<div class="row my-3">
								<div class="col-7">
									<span class="roll">Roll</span>
									<span class="total">-</span>
								</div>
								<div class="col-2 ac">AC</div>
								<div class="col-1 hit"></div>
							</div>
						</span>
						<a class="btn btn-block disabled"><i class="fas fa-dice"></i> Roll for damage</a>
					</div>
					<div id="damage-result">
						<span>
							<div class="row my-3">
								<div class="col">
									<span class="roll">Roll</span>
									<span class="total">-</span>
								</div>
							</div>
						</span>
						<a class="btn btn-block disabled bg-red">Apply damage</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'

	export default {

		name: 'Actions',
		props: ['target'],
		data: function() {
			return {
				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				manualAmount: ''
			}
		},
		methods: {
			setManual(target, type) {
				// console.log('MaxHP: ' + target.maxHp);
				// console.log('Type: ' + type);
				// console.log('Amount: ' + this.manualAmount);

				let amount = parseInt(this.manualAmount);
				let maxHp = parseInt(target.maxHp);
				let curHp = parseInt(target.curHp);

				if(type == 'damage') {
					let newhp = parseInt(curHp - amount);

	        if(newhp < 0) { 
						newhp = 0;
						let over = amount - curHp; //overkill
						amount = curHp;
	        }
					
					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${target.key}`).update({
						curhp: newhp,
					})
				}
				else {
					let newhp = parseInt(curHp + amount);
				
	        if(newhp > maxHp) { 
						newhp = maxHp;
						let over = amount - maxHp + curHp; //overhealing
						amount = maxHp - curHp;
	        }
					
					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${target.key}`).update({
						curhp: newhp,
					})
				}
				this.manualAmount = '';
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
</style>