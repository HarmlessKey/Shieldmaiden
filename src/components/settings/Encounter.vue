<template>
	<div>
		<ul class="settings">
			<li v-for="(setting, key) in general" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="setting.info">
							<q-icon name="info" v-if="setting.info">
								<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
									<q-card dark square>
										<q-card-section class="bg-gray-active">
											<b>{{ setting.name }}</b>
										</q-card-section>

										<q-card-section>
											<div v-html="setting.info" />
										</q-card-section>
									</q-card>
								</q-menu>
							</q-icon>
						</a>
					</span>
					<div>
						<a v-for="option in setting.options" 
							:key="option.name" 
							@click="setSetting(key, option.value)" class="ml-2"
							:class="[ option.value == settings[key] ? option.color : 'gray-light' ]"
						>
								<span class="d-none d-md-inline mr-1">
									<template v-if="option.value == settings[key]">{{ option.name }}</template>
									<template v-if="option.value != settings[key]">{{ option.action }}</template>
								</span>
								<i :class="option.icon"></i>
								<q-tooltip anchor="top middle" self="center middle">
									{{ option.value == settings[key] ? option.name : option.action }}
								</q-tooltip>
						</a>
					</div>
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
				userId: this.$store.getters.user.uid,
				general: {
					'automate': { 
						name: 'Automate', 
						icon: 'fas fa-calculator',
						info: 
							'<p>When you check the automate setting, some actions in an encounter will be done automatically.<br/>'+
							'At the moment only one action is dependent on the automate function.</p>'+
							'<b>Death Saving Throws</b>'+
							'<p>When a down player receives damage, it will automatically get a failed death saving throw.'+ 
							'If the "critical hit" checkbox is checked, two death saves will be failed.<br/>'+
							'Even a character that is stable at 0 hit points will automatically fail saves when taking damage.</p>',
						options: {
							0: { value: false, name: 'Not Automated', action: 'Don\'t', icon: 'fas fa-times', color: 'red' },
							1: { value: undefined, name: 'Automate', action: 'Automate', icon: 'fas fa-check', color: 'green' },
						}
					},
					'background': { 
						name: 'Background Image', 
						icon: 'fas fa-image',
						info: 'Show or hide background image you set for the encounter.',
						options: {
							0: { value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'initOrder': { 
						name: 'Initiative order', 
						icon: 'fas fa-arrows-alt-v',
						info: 'Change the order of initiative.',
						options: {
							0: { value: undefined, name: 'Descend', action: 'Descend', icon: 'fas fa-long-arrow-alt-down', color: 'green' },
							1: { value: true, name: 'Ascend', action: 'Ascend', icon: 'fas fa-long-arrow-alt-up', color: 'green' },
						}
					},
					'critical': { 
						name: 'Critical Hits', 
						icon: 'far fa-crosshairs',
						info: 'How do you want critical hits to be handled?<br/> <b>Roll</b>: all the damage dice are rolled twice.<br/> <b>Double</b>: the rolled damage is doubled.',
						options: {
							0: { value: undefined, name: 'Roll', action: 'Roll', icon: 'fas fa-dice-d20', color: 'green' },
							1: { value: true, name: 'Double', action: 'Double', icon: 'fas fa-chevron-double-up', color: 'green' },
						}
					},
					'npcDamageTab': { 
						name: 'NPC Damage Tab', 
						icon: 'fas fa-sword',
						info: 'Set what tab shows by default when it is an NPC\'s turn. It either shows the tab for rolling damage, or doing manual damage.',
						options: {
							0: { value: undefined, name: 'Roll', action: 'Roll', icon: 'fas fa-dice-d20', color: 'green' },
							1: { value: true, name: 'Manual', action: 'Manual', icon: 'fas fa-hand-paper', color: 'green' },
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