<template>
	<div>
		<ul class="settings">
			<li v-for="(setting, key) in general" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="setting.info">
							<q-icon name="info" v-if="setting.info">
								<q-menu square anchor="top middle" self="bottom middle" :max-width="setting.infoWidth || '250px'">
									<q-card dark square>
										<q-card-section class="bg-gray-active">
											<b>{{ setting.name }}</b>
										</q-card-section>

										<q-card-section>
											<div v-html="setting.info" />
											<Keybindings v-if="key === 'keyBinds'" :data="{ sm: true }" />
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

		<h3>Player overview</h3>
		<ul class="settings">
			<li v-for="(setting, key) in player" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="setting.info" class="ml-1">
							<q-icon name="info" v-if="setting.info">
								<q-menu square anchor="top middle" self="bottom middle" :max-width="setting.infoWidth || '250px'">
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

		<h3>User interface</h3>
		<ul class="settings">
			<li v-for="(setting, key) in ui" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="setting.info" class="ml-1">
							<q-icon name="info" v-if="setting.info">
								<q-menu square anchor="top middle" self="bottom middle" :max-width="setting.infoWidth || '250px'">
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
	import Keybindings from '@/components/slides/Keybindings.vue'

	export default {
		name: 'General',
		components: {
			Keybindings
		},
		data(){
			return {
				userId: this.$store.getters.user.uid,
				general: {
					'keyBinds': { 
						name: 'Show Keybinds', 
						icon: 'fas fa-keyboard',
						info: '<p>Use these keybindings to perform actions quickly.<br/> With this setting you can show or hide the keybinds on the buttons that perform the actions.</p>',
						infoWidth: '400px',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
				},
				player: {
					'passive_perception': { 
						name: 'Passive Perception', 
						icon: 'fas fa-eye',
						info: 'Show passive perception in the player overview.',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'passive_investigation': { 
						name: 'Passive Invastigation', 
						icon: 'fas fa-search',
						info: 'Show passive investigation in the player overview.',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'passive_insight': { 
						name: 'Passive Insight', 
						icon: 'fas fa-lightbulb-on',
						info: 'Show passive insight in the player overview.',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'save_dc': { 
						name: 'Save DC', 
						icon: 'fas fa-hand-holding-magic',
						info: 'Show spell save DC in the player overview.',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
				},
				ui: {
					'side_collapsed': {
						name: 'Side Menu Collapsed',
						icon: 'fas fa-bars',
						info: 'Either set the sidebar to be fully visible or collapsed by default.',
						options: {
							0: { value: true, name: 'Collapsed', action: 'Collapse', icon: 'fas fa-arrow-alt-to-left', color: 'red'},
							1: { value: undefined, name: 'Visible', action: 'Show', icon: 'fas fa-arrow-alt-to-right', color: 'green'},
						}
					},
				}
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
			setSetting(type, value) {
				if(value == undefined) {
					db.ref(`settings/${this.userId}/general/${type}`).remove();
				} else {
					db.ref(`settings/${this.userId}/general/${type}`).set(value);
				}
			},
			setDefault() {
				db.ref(`settings/${this.userId}/general`).remove();
			}
		}
	}
	
</script>

<style lang="scss" scoped>
	.collapse {
		border-top: solid 1px #494747;
		margin-top: 20px;
		padding: 20px;

		table {
			margin-bottom: 50px !important;

			td {
				background: #191919 !important;
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
	}
</style>