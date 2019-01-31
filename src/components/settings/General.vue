<template>
	<div>
		<b-card header="General Settings">
			<ul class="settings">
				<li class="d-flex justify-content-between">
					<span>
						<i class="fas fa-heart"></i> Maximum HP
						<a data-toggle="collapse" :href="'#rollhp'" 
							role="button" aria-expanded="false">
							<i class="fas fa-info"></i>
						</a>
					</span>

					<div>
						<div v-show="settings.setHp === false">
							<span v-b-tooltip.hover title="Roll" class="green mr-2">
								<span class="d-none d-md-inline mr-1">Roll</span>
								<i class="fas fa-check"></i>
							</span>
							<a v-b-tooltip.hover title="Average" @click="set('unset', 'setHp')" class="btn btn-sm bg-gray">
								<span class="d-none d-md-inline mr-1">Average</span>
								<i class="fas fa-check"></i>
							</a>
						</div>
						<div v-show="settings.setHp === undefined">
							<a v-b-tooltip.hover title="Roll" @click="set('set', 'setHp', false)" class="btn btn-sm bg-gray mr-2">
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
			</ul>
			<a class="btn" @click="setDefault()">Set default</a>
		</b-card>
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

<style lang="css">

</style>