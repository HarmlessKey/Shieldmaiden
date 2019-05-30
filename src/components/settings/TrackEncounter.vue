<template>
	<div>
		<h3>Your unique link: <span class="gray-active">(click to copy)</span></h3>
		<a @click="copyLink()" class="copy">{{ copy }}</a>
		<input type="hidden" id="copy" :value="copy">
		

		<h3>General</h3>
		<ul class="settings">
			<li v-for="(setting, key) in general" class="d-flex justify-content-between" :key="key">
				<span><i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}</span>
				<div>
					<a v-for="option in setting.options" 
						v-b-tooltip.hover 
						:title="[ option.value == player[key] ? option.name : option.action ]" 
						:key="option.name" 
						@click="setSetting(setting.entity, key, option.value)" class="ml-2"
						:class="[ option.value == player[key] ? option.color : 'gray-light' ]">
							<span class="d-none d-md-inline mr-1">
								<template v-if="option.value == player[key]">{{ option.name }}</template>
								<template v-if="option.value != player[key]">{{ option.action }}</template>
							</span>
							<i :class="option.icon"></i>
					</a>
				</div>
			</li>
		</ul>

		<h3>NPC settings</h3>
		<ul class="settings">
			<li v-for="(setting, key) in npcs" class="d-flex justify-content-between" :key="key">
				<span><i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}</span>
				<div>
					<a v-for="option in setting.options" 
						v-b-tooltip.hover 
						:title="[ option.value == npc[key] ? option.name : option.action ]" 
						:key="option.name" 
						@click="setSetting(setting.entity, key, option.value)" class="ml-2"
						:class="[ option.value == npc[key] ? option.color : 'gray-light' ]">
							<span class="d-none d-md-inline mr-1">
								<template v-if="option.value == npc[key]">{{ option.name }}</template>
								<template v-if="option.value != npc[key]">{{ option.action }}</template>
							</span>
							<i :class="option.icon"></i>
					</a>
				</div>
			</li>
		</ul>

		<h3>Player settings</h3>
		<ul class="settings">
			<li v-for="(setting, key) in players" class="d-flex justify-content-between" :key="key">
				<span><i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}</span>
				<div>
					<a v-for="option in setting.options" 
						v-b-tooltip.hover 
						:title="[ option.value == player[key] ? option.name : option.action ]" 
						:key="option.name" 
						@click="setSetting(setting.entity, key, option.value)" class="ml-2"
						:class="[ option.value == player[key] ? option.color : 'gray-light' ]">
							<span class="d-none d-md-inline mr-1">
								<template v-if="option.value == player[key]">{{ option.name }}</template>
								<template v-if="option.value != player[key]">{{ option.action }}</template>
							</span>
							<i :class="option.icon"></i>
					</a>
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
				copy: window.location.host + '/user/' + this.$store.getters.getUser.uid,
				general: {
					'meters': { 
						entity: 'player',
						name: 'Damage Meters', 
						icon: 'fas fa-swords',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'loot': { 
						entity: 'player',
						name: 'Loot', 
						icon: 'fas fa-treasure-chest',
						options: {
							0: { value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
				},
				npcs: {
					'health': { 
						entity: 'npc',
						name: 'Health', 
						icon: 'fas fa-heart',
						options: {
							0: { value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: 'obscured', name: 'Obsc', action: 'Obsc', icon: 'fas fa-question-circle', color: 'orange' },
							2: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'ac': { 
						entity: 'npc',
						name: 'Armor Class', 
						icon: 'fas fa-shield',
						options: {
							0: { value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'conditions': { 
						entity: 'npc',
						name: 'Conditions', 
						icon: 'fas fa-skull-crossbones',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
				},
				players: {
					'health': { 
						entity: 'player',
						name: 'Health', 
						icon: 'fas fa-heart',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: 'obscured', name: 'Obsc', action: 'Obsc', icon: 'fas fa-question-circle', color: 'orange' },
							2: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'ac': { 
						entity: 'player',
						name: 'Armor Class', 
						icon: 'fas fa-shield',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					'conditions': { 
						entity: 'player',
						name: 'Conditions', 
						icon: 'fas fa-skull-crossbones',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
				}
			}
		},
		firebase() {
			return {
				npc: {
					source: db.ref(`settings/${this.userId}/track/npc`),
					asObject: true,
				},
				player: {
					source: db.ref(`settings/${this.userId}/track/player`),
					asObject: true,
				}	
			}
		},
		methods: {
			setSetting(entity, type, value) {
				if(value == undefined) {
					db.ref(`settings/${this.userId}/track/${entity}/${type}`).remove();
				} else {
					db.ref(`settings/${this.userId}/track/${entity}/${type}`).set(value);
				}
			},
			setDefault() {
				db.ref(`settings/${this.userId}/track`).remove();
			},
			copyLink() {
				let toCopy = document.querySelector('#copy')
				toCopy.setAttribute('type', 'text')    //hidden
				toCopy.select()

				try {
					var successful = document.execCommand('copy');
					var msg = successful ? 'Successful' : 'Unsuccessful';

					this.$snotify.success(msg, 'Link Copied!', {
						position: "rightTop"
					});
				} catch (err) {
					alert('Something went wrong, unable to copy');
				}

				/* unselect the range */
				toCopy.setAttribute('type', 'hidden')
				window.getSelection().removeAllRanges()
			},
		}
	}
</script>

<style lang="scss" scoped>
	.copy {
		word-wrap: break-word;
		margin-bottom: 20px;
		display: block;
	}
</style>