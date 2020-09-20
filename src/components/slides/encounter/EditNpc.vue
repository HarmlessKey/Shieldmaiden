<!-- EDIT NPC DURING AN ENCOUNTER -->

<template>
	<div class="pb-5" v-if="entity">
		<h2>Edit <span class="blue">{{ entity.name }}</span></h2>
		<q-input 
			dark filled square
			label="Name"
			type="text" 
			name="name" 
			v-model="entity.name"
			:class="{'input': true, 'error': errors.has('name') }"
			v-validate="'required'"
			placeholder="Name"
		/>

		<q-input
			dark filled square
			v-model="entity.color_label"
			label="Color label"
			readonly
		>
			<template v-slot:append>
				<q-icon name="colorize" class="cursor-pointer">
					<q-popup-proxy transition-show="scale" transition-hide="scale">
						<q-color v-model="entity.color_label" :palette="hkColors" default-view="palette" />
					</q-popup-proxy>
				</q-icon>
			</template>
		</q-input>
		<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		<hr>
		<div class="d-flex justify-content-between">
			<q-input 
				dark filled square
				label="Initiative"
				type="number" 
				name="initiative"
				min="0"
				v-model="entity.initiative"
				class="mr-1"
				v-validate="'required'"
				placeholder="Initiative"></q-input>
				<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>

			<q-input 
				dark filled square
				label="AC Bonus"
				class="mr-1"
				type="number" 
				name="ac_bonus" 
				v-model="entity.ac_bonus"
				placeholder="AC Bonus"></q-input>

			<q-input 
				dark filled square
				label="Temp HP"
				type="number" 
				name="tempHp" 
				v-model="entity.tempHp"
				placeholder="Temporary Hit Points"></q-input>
		</div>

		<template>
			<hr>
			<h2 class="mb-2">Override</h2>
				<div class="d-flex justify-content-between">
					<q-input 
						dark filled square
						label="Armor class"
						class="mr-1"
						type="number" 
						name="ac" 
						min="1"
						v-model="entity.ac"
						v-validate="'required|numeric'"
						data-vv-as="Armor lass"
						placeholder="Armor Class"></q-input>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

					<q-input 
						dark filled square
						label="Armor class"
						class="mr-1"
						type="number" 
						name="maxHp" 
						min="1"
						v-model="entity.maxHp"
						v-validate="'required|numeric'"
						data-vv-as="Maximum HP"
						placeholder="Maximum Hit Points"></q-input>
						<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>

					<q-input 
						dark filled square
						label="Armor class"
						type="number" 
						name="maxHp" 
						min="1"
						v-model="entity.curHp"
						v-validate="'required|numeric'"
						data-vv-as="Current HP"
						placeholder="Current Hit Points"></q-input>
						<p class="validate red" v-if="errors.has('curHp')">{{ errors.first('curHp') }}</p>
				</div>
		</template>

		<template v-if="!demo">
			<hr>
			<span class="justify-content-between d-flex">
				<h2 class="mb-0">Display Override</h2>
				<a @click="clearOverrides()" class="red">
					<span class="mr-1 small">clear</span>
					<i class="fas fa-broom small"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Clear display overrides
					</q-tooltip>
				</a>
			</span>

			<ul class="settings">
				<li v-for="(setting, key) in npcsOptions" class="d-flex justify-content-between" :key="key">
					<span><i :class="setting.icon + ' gray-hover'"></i> {{ setting.name }}</span>
					<div>

						<a v-for="option in setting.options"
							:key="option.name" 
							@click="setSetting(key, option.value)" class="ml-2"
							:class="[ isActive(key, option) ? option.color : 'gray-light' ]">
								<span class="d-none d-md-inline mr-1">
									<template v-if="isActive(key, option)">{{ option.name }}</template>
									<template v-else>{{ option.action }}</template>
								</span>
								<i :class="option.icon"></i>
								<q-tooltip anchor="top middle" self="center middle">
									{{ isActive(key, option) ? option.name : option.action }}
								</q-tooltip>
						</a>
					</div>
				</li>
			</ul>
		</template>

		<button class="btn btn-block my-3" @click="edit()">Save</button>
		<small>
			Edit this entity only for the current encounter.<br/>
			<span class="red">Warning!</span> only change the initiative if you really have to. It can mess up the order during a game so stay away from it as much as possible.
		</small>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'EditEntity',
		props: [
			'data',
		],
		data() {
			return {
				demo: this.$route.name === "Demo",
				entityKey: this.data.key,
				entity: undefined,
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				npcSettings: undefined,
				hkColors: [
					"#88b3ce",
					"#9ac16a",
					"#c45e66",
					"#db815e",
					"#e2da5f",
					"#9b7aba"
				],
				npcsOptions: {
					'name': { 
						entity: 'npc',
						name: 'Name', 
						icon: 'fas fa-helmet-battle',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
							// 1: { value: 'obscured', name: 'Obsc', action: 'Obsc', icon: 'fas fa-question-circle', color: 'orange' },
							1: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green', settings_default: true },
							// 2: { value: undefined, name: 'Default', action: 'Default', icon: 'fas fa-sparkles', color: 'blue'}
						}
					},
					'health': { 
						entity: 'npc',
						name: 'Health', 
						icon: 'fas fa-heart',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red', settings_default: true },
							1: { value: 'obscured', name: 'Obsc', action: 'Obsc', icon: 'fas fa-question-circle', color: 'orange' },
							2: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
							// 3: { value: undefined, name: 'Default', action: 'Default', icon: 'fas fa-sparkles', color: 'blue'}
						}
					},
					'ac': { 
						entity: 'npc',
						name: 'Armor Class', 
						icon: 'fas fa-shield',
						options: {
							0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red', settings_default: true },
							1: { value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
						}
					},
					// 'conditions': { 
					// 	entity: 'npc',
					// 	name: 'Conditions', 
					// 	icon: 'fas fa-skull-crossbones',
					// 	options: {
					// 		0: { value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
					// 		1: { value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
					// 	}
					// },
				},
			}
		},
		computed: {
			...mapGetters([
				'demoEntities'
			])	
		},

		mounted() {
			if(!this.demo) {
				var entity_ref = db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}`);
				entity_ref.on('value', async (snapshot) => {
					this.entity = snapshot.val();
				});

				var npcSettings_ref = db.ref(`settings/${this.userId}/track/npc`);
				npcSettings_ref.on('value', async (snapshot) => {
					this.npcSettings = snapshot.val();
				});

			} else {
				this.entity = this.demoEntities[this.entityKey];
			}
			
		},
		methods: {
			...mapActions([
				'setSlide',
				'edit_entity',
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						delete this.entity['.key']

						this.entity.initiative = Number(this.entity.initiative)
						if(this.entity.ac_bonus) {
							this.entity.ac_bonus = parseInt(this.entity.ac_bonus)
						}
						else { this.entity.ac_bonus = 0 }
						if(this.entity.tempHp) {
							this.entity.tempHp = parseInt(this.entity.tempHp)
						}
						else { this.entity.tempHp = 0 }

						this.entity.ac = parseInt(this.entity.ac)
						this.entity.maxHp = parseInt(this.entity.maxHp)
						this.entity.curHp = parseInt(this.entity.curHp)

						if(this.entity.curHp > this.entity.maxHp) {
							this.entity.curHp = this.entity.maxHp
						}
						
						this.edit_entity({key: this.entityKey, entity: this.entity});
						this.setSlide(false);
					}
					else {
						//console.log('Not valid');
					}
				})
			},
			setSetting(key, value) {
				if(value === undefined) {
					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/settings/${key}`).remove();
				} else {
					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/settings/${key}`).set(value)
				}
			},
			isActive(key, option) {
				if (this.entity.settings && this.entity.settings[key] !== undefined) {
					if (this.entity.settings[key] == option.value)
						return true
					else
						return false
				}
				else if (this.npcSettings && this.npcSettings[key] === undefined && option.settings_default) {
					return true;
				}
				else if (this.npcSettings &&  this.npcSettings[key] == option.value) {
					return true;
				}
				else if (this.npcSettings == undefined && option.settings_default)
					return true;
				else
					return false;
			},
			clearOverrides() {
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/settings`).remove();
			}
		}
	};
</script>

<style lang="scss" scoped>


</style>
