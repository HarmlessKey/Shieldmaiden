<template>
	<div>
		<ul class="settings">
			<li class="d-flex justify-content-between">
				<span>
					<i class="fas fa-heart"></i> Maximum HP
					<a data-toggle="collapse" class="ml-1" :href="'#rollhp'" 
						role="button" aria-expanded="false">
						<i class="fas fa-info"></i>
					</a>
				</span>

				<div>
					<div v-show="settings.rollHp === true">
						<span v-b-tooltip.hover title="Roll" class="green mr-2">
							<span class="d-none d-md-inline mr-1">Roll</span>
							<i class="fas fa-check"></i>
						</span>
						<a v-b-tooltip.hover title="Average" @click="set('unset', 'rollHp')" class="btn btn-sm bg-gray">
							<span class="d-none d-md-inline mr-1">Average</span>
							<i class="fas fa-check"></i>
						</a>
					</div>
					<div v-show="settings.rollHp === undefined">
						<a v-b-tooltip.hover title="Roll" @click="set('set', 'rollHp', true)" class="btn btn-sm bg-gray mr-2">
							<span class="d-none d-md-inline mr-1">Roll</span>
							<i class="fas fa-check"></i>
						</a>
						<span v-b-tooltip.hover title="Average" class="green">
							<span class="d-none d-md-inline mr-1">Average</span>
							<i class="fas fa-check"></i>
						</span>
					</div>
				</div>
			</li>
			<li class="collapse px-4 bg-gray-darker" id="rollhp">
				<p><b>Setting NPC's HP</b> 
					When adding an NPC to an encounter, it can either have the average of their hit dice set as maximum health, 
					or we can roll the hit dice for you. 
					If you change this setting to "roll" we will always roll the hit dice of an NPC to set the maximum health points. 
				</p>
			</li>

			<li class="d-flex justify-content-between">
				<span>
					<i class="fas fa-heart"></i> Show keybinds
					<a data-toggle="collapse" class="ml-1" :href="'#hotkeys'" 
						role="button" aria-expanded="false">
						<i class="fas fa-info"></i>
					</a>
				</span>

				<div>
					<div v-show="settings.keyBinds === false">
						<span v-b-tooltip.hover title="Hidden" class="red mr-2">
							<span class="d-none d-md-inline mr-1">Hidden</span>
							<i class="fas fa-eye-slash"></i>
						</span>
						<a v-b-tooltip.hover title="Show" @click="set('unset', 'keyBinds')" class="btn btn-sm bg-gray">
							<span class="d-none d-md-inline mr-1">Show</span>
							<i class="fas fa-eye"></i>
						</a>
					</div>
					<div v-show="settings.keyBinds === undefined">
						<a v-b-tooltip.hover title="Hide" @click="set('set', 'keyBinds', false)" class="btn btn-sm bg-gray mr-2">
							<span class="d-none d-md-inline mr-1">Hide</span>
							<i class="fas fa-eye-slash"></i>
						</a>
						<span v-b-tooltip.hover title="Shown" class="green">
							<span class="d-none d-md-inline mr-1">Shown</span>
							<i class="fas fa-eye"></i>
						</span>
					</div>
				</div>
			</li>
			<li class="collapse px-4 bg-gray-darker" id="hotkeys">
				<p><b>Show keybindings</b><br/>
					If you hide the keybindings, keyboard shortcuts will still be operational. You can always look up the keybindings here.
				</p>
				<h3>General</h3>
				<table class="table">
					<thead>
						<th>#</th>
						<th>Function</th>
						<th><i class="fas fa-keyboard"></i> Keybind</th>
					</thead>
					<tbody>
						<tr>
							<td>1</td>
							<td>Show dice roller</td>
							<td class="binds"><span class="bind">R</span></td>
						</tr>
						<tr>
							<td>2</td>
							<td>Hide right sidebar</td>
							<td class="binds"><span class="bind">esc</span></td>
						</tr>
					</tbody>
				</table> 

				<h3>Run encounter</h3>
				<table class="table">
					<thead>
						<th>#</th>
						<th>Function</th>
						<th><i class="fas fa-keyboard"></i> Keybind</th>
					</thead>
					<tbody>
						<tr>
							<td>1</td>
							<td>Next Turn </td>
							<td class="binds">
								<span class="bind">shift</span> + 
								<span class="bind">arrowright</span>
							</td>
						</tr>
						<tr>
							<td>2</td>
							<td>Select target </td>
							<td class="binds"><span class="bind">0-9</span></td>
						</tr>
						<tr>
							<td>3</td>
							<td>Show target Info</td>
							<td class="binds"><span class="bind">I</span></td>
						</tr>
						<tr>
							<td>4</td>
							<td>Edit target</td>
							<td class="binds"><span class="bind">E</span></td>
						</tr>
						<tr>
							<td>5</td>
							<td>Transform target</td>
							<td class="binds"><span class="bind">T</span></td>
						</tr>
						<tr>
							<td>6</td>
							<td>Show target Conditions</td>
							<td class="binds"><span class="bind">C</span></td>
						</tr>
						<tr>
							<td>7</td>
							<td>Attack/Heal target</td>
							<td class="binds"><span class="bind">D</span></td>
						</tr>
					</tbody>
				</table> 
			</li>
		</ul>
		<a class="btn" @click="setDefault()">Set default</a>
	</div>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'General',
		data(){
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.userId}/general`),
					asObject: true,
				},
			}
		},
		methods: {
			set(action, type, value) {
				if(action == 'set') {
					db.ref(`settings/${this.userId}/general/${type}`).set(value);
				}
				if(action == 'unset') {
					db.ref(`settings/${this.userId}/general/${type}`).remove();
				}
			},
			setDefault() {
				db.ref(`settings/${this.userId}/general`).remove();
			}
		}
	}
	
</script>

<style lang="scss">
	table {
		margin-bottom: 50px !important;

		td {
			&.binds {
				width: 150px;
			}
			.bind {
				border: solid 1px #2c97de;
				display: inline-block;
				min-width: 20px;
				padding: 0 5px;
				text-align: center;
			}
		}
	}
</style>