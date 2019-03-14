<template>
	<div>
		<ul class="settings">
			<li v-for="(setting, key) in general" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="key == 'automate'" data-toggle="collapse" class="ml-1" :href="'#'+key" 
							role="button" aria-expanded="false">
							<i class="fas fa-info"></i>
						</a>
					</span>
					<div>
						<a v-for="option in setting.options" 
							v-b-tooltip.hover 
							:title="[ option.value == settings[key] ? option.name : option.action ]" 
							:key="option.name" 
							@click="setSetting(key, option.value)" class="ml-2"
							:class="[ option.value == settings[key] ? option.color : 'gray-light' ]">
								<span class="d-none d-md-inline mr-1">
									<template v-if="option.value == settings[key]">{{ option.name }}</template>
									<template v-if="option.value != settings[key]">{{ option.action }}</template>
								</span>
								<i :class="option.icon"></i>
						</a>
					</div>
				</div>
				<div v-if="key == 'automate'" class="collapse px-4 bg-gray-darker" id="automate">
					<p><b>Automate.</b> When you check the automate setting, some actions in an encounter will be done automatically.</p>

					<p>At the moment only one action is dependent on the automate function.</p>

					<p><b>Death Saving Throws</b><br/>
						When a down player receives damage, it will automatically get a failed death saving throw. 
						If the "critical hit" checkbox is checked, two death saves will be failed.<br/>
						Even a character that is stable at 0 hit points will automatically fail saves when taking damage.
					</p>
				</div>
			</li>
		</ul>
		<a class="btn" @click="setDefault()">Set default</a>
	</div>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'Track',
		data(){
			return {
				userId: this.$store.getters.getUser.uid,
				general: {
					'automate': { 
						name: 'Automate', 
						icon: 'fas fa-calculator',
						options: {
							0: { value: false, name: 'Not Automated', action: 'Don\'t', icon: 'fas fa-times', color: 'red' },
							1: { value: undefined, name: 'Automate', action: 'Automate', icon: 'fas fa-check', color: 'green' },
						}
					},
					'background': { 
						name: 'Bakcground Image', 
						icon: 'fas fa-image',
						options: {
							0: { value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
				},
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
			setSetting(type, value) {
				if(value == undefined) {
					db.ref(`settings/${this.userId}/encounter/${type}`).remove();
				} else {
					db.ref(`settings/${this.userId}/encounter/${type}`).set(value);
				}
			},
			setDefault() {
				db.ref(`settings/${this.userId}/encounter`).remove();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.collapse {
		border-top: solid 1px #494747;
		margin-top: 20px;
		padding: 20px;
	}
</style>