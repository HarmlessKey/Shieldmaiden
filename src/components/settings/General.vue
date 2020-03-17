<template>
	<div>
		<ul class="settings">
			<li v-for="(setting, key) in general" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="key == 'keyBinds'" data-toggle="collapse" class="ml-1" :href="'#'+key" 
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

				<div v-if="key == 'keyBinds'" class="collapse px-4 bg-gray-darker" :id="key">
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
				</div>
			</li>
		</ul>

		<h3>Player overview</h3>
		<ul class="settings">
			<li v-for="(setting, key) in player" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="key == 'keyBinds'" data-toggle="collapse" class="ml-1" :href="'#'+key" 
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
			</li>
		</ul>
		<h3>User interface</h3>
		<ul class="settings">
			<li v-for="(setting, key) in ui" :key="key">
				<div class="d-flex justify-content-between">
					<span>
						<i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}
						<a v-if="key == 'keyBinds'" data-toggle="collapse" class="ml-1" :href="'#'+key" 
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
				general: {
					'keyBinds': { 
						name: 'Show Keybinds', 
						icon: 'fas fa-keyboard',
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
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'passive_investigation': { 
						name: 'Passive Invastigation', 
						icon: 'fas fa-search',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'passive_insight': { 
						name: 'Passive Insight', 
						icon: 'fas fa-lightbulb-on',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'save_dc': { 
						name: 'Save DC', 
						icon: 'fas fa-hand-holding-magic',
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