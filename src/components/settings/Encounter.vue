<template>
	<section id="encounter">
		<b-card header="Run Encounter Settings">
			<ul class="settings">
				<li class="d-flex justify-content-between">
					<span>
						<i class="fas fa-calculator"></i> Automate
						<a data-toggle="collapse" :href="'#automate'" 
							role="button" aria-expanded="false">
							<i class="fas fa-info"></i>
						</a>
					</span>

					<div>
						<div v-show="settings.automate === false">
							<span v-b-tooltip.hover title="Not Automated" class="red mr-2">
								<span class="d-none d-md-inline mr-1">Not Automated</span>
								<i class="fas fa-times"></i>
							</span>
							<a v-b-tooltip.hover title="Automate" @click="set('unset', 'automate')" class="btn btn-sm bg-gray">
								<span class="d-none d-md-inline mr-1">Automate</span>
								<i class="fas fa-check"></i>
							</a>
						</div>
						<div v-show="settings.automate === undefined">
							<a v-b-tooltip.hover title="Don't Automate" @click="set('set', 'automate', false)" class="btn btn-sm bg-gray mr-2">
								<span class="d-none d-md-inline mr-1">Don't Automate</span>
								<i class="fas fa-times"></i>
							</a>
							<span v-b-tooltip.hover title="Automated" class="green">
								<span class="d-none d-md-inline mr-1">Automated</span>
								<i class="fas fa-check"></i>
							</span>
						</div>
					</div>
				</li>
				<li class="collapse px-4 bg-gray-darker" id="automate">
					<p><b>Automate.</b> When you check the automate setting, some actions in an encounter will be done automatically.</p>

					<p>At the moment only one action is dependent on the automate function.</p>

					<p><b>Death Saving Throws</b><br/>
						When a down player receives damage, it will automatically get a failed death saving throw. 
						If the "critical hit" checkbox is checked, two death saves will be failed.<br/>
						Even a character that is stable at 0 hit points will automatically fail saves when taking damage.
					</p>
				</li>

				<li class="d-flex justify-content-between">
					<span><i class="fas fa-image"></i> Background Image</span>

					<div>
						<div v-show="!settings.background">
							<span v-b-tooltip.hover title="Hidden" class="red mr-2">
								<span class="d-none d-md-inline mr-1">Hidden</span>
								<i class="fas fa-eye-slash"></i>
							</span>
							<a v-b-tooltip.hover title="Show" @click="set('set', 'background', true)" class="btn btn-sm bg-gray">
								<span class="d-none d-md-inline mr-1">Show</span>
								<i class="fas fa-eye"></i>
							</a>
						</div>
						<div v-show="settings.background == true">
							<a v-b-tooltip.hover title="Hide" @click="set('unset', 'background')" class="btn btn-sm bg-gray mr-2">
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
			</ul>
			<a class="btn" @click="setDefault()">Set default</a>
		</b-card>
	</section>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'Track',
		data(){
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.userId}/encounter`),
					asObject: true,
				},
			}
		},
		methods: {
			set(action, type, value) {
				if(action == 'set') {
					db.ref(`settings/${this.userId}/encounter/${type}`).set(value);
				}
				if(action == 'unset') {
					db.ref(`settings/${this.userId}/encounter/${type}`).remove();
				}
			},
			setDefault() {
				db.ref(`settings/${this.userId}/encounter`).remove();
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>