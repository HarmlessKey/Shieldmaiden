<template>
	<div>
		<a @click="setSlide({ show: true, type: 'PlayerLink'})" class="d-block mb-3">
			Share your adventures
		</a>

		<div v-for="({name, type_settings}, type_key) in types" :key="type_key">
			<h3 class="mt-3 mb-1" v-if="name">{{ name }}</h3>
			<q-select 
				dark filled square
				v-for="(setting, index) in type_settings" 
				:options="setting.options"
				:value="index"
				class="mb-1"
				:key="`${type_key}-${index}`"
			>
				<q-item dark slot="selected">
					<q-item-section avatar>
						<q-icon :name="setting.icon" class="gray-light" size="large" />
					</q-item-section>
					<q-item-section class="gray-light truncate">
						<q-item-label>{{ setting.name }}</q-item-label>
						<q-item-label caption>
							{{ displaySetting(type_key, setting.key, settings[setting.entity] ? settings[setting.entity][setting.key] : undefined).name }}
						</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-icon 
							:name="displaySetting(type_key, setting.key, settings[setting.entity] ? settings[setting.entity][setting.key] : undefined).icon" 
							:class="displaySetting(type_key, setting.key, settings[setting.entity] ? settings[setting.entity][setting.key] : undefined).color"
							size="medium"
						/>
					</q-item-section>
				</q-item>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="selected(scope.opt.value, settings[setting.entity] ? settings[setting.entity][setting.key] : undefined)"
						@click="setSetting(setting.entity, setting.key, scope.opt.value)"
					>
						<q-item-section>
							<q-item-label v-html="scope.opt.name"/>
						</q-item-section>
						<q-item-section avatar>
							<q-icon :name="scope.opt.icon" size="small" :class="scope.opt.color" />
						</q-item-section>
					</q-item>
				</template>
				<span slot="after" v-if="setting.info">
					<a @click.stop>
						<q-icon name="info" v-if="setting.info" size="medium">
							<q-menu square anchor="top middle" self="bottom middle" :max-width="setting.infoWidth || '250px'">
								<q-card dark square>
									<q-card-section class="bg-gray-active">
										<b>{{ setting.name }}</b>
									</q-card-section>

									<q-card-section>
										<div v-html="setting.info" />
										<Keybindings v-if="setting.key === 'keyBinds'" :data="{ sm: true }" />
									</q-card-section>
								</q-card>
							</q-menu>
						</q-icon>
					</a>
				</span>
			</q-select>
		</div>
		
		<a class="btn mt-3" @click="setDefault()">Reset to default</a>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions } from 'vuex';

	export default {
		name: 'Track',
		data(){
			return {
				userId: this.$store.getters.user.uid,
				copy: window.location.host + '/user/' + this.$store.getters.user.uid,
				types: {
					general: {
						type_settings: [
							{ 
								key: 'meters',
								entity: 'player',
								name: 'Damage Meters', 
								icon: 'fas fa-swords',
								info: 'Players can see the damage meters.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							}
						]
					},
					npcs: {
						name: "NPC's",
						type_settings: [
							{ 
								key: 'name',
								entity: 'npc',
								name: 'Name', 
								icon: 'fas fa-helmet-battle',
								info: 'Players can see the names of NPC\'s.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'health',
								entity: 'npc',
								name: 'Health', 
								icon: 'fas fa-heart',
								info: 'Players can see the health of NPC\'s.',
								options: [
									{ value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: 'obscured', name: 'Obsc', action: 'Obsc', icon: 'fas fa-question-circle', color: 'orange' },
									{ value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'ac',
								entity: 'npc',
								name: 'Armor Class', 
								icon: 'fas fa-shield',
								info: 'Players can see the armor class of NPC\'s.',
								options: [
									{ value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'conditions',
								entity: 'npc',
								name: 'Conditions', 
								icon: 'fas fa-skull-crossbones',
								info: 'Players can see the conditions on NPC\'s.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							}
						]
					},
					players: {
						name: 'Players',
						type_settings: [
							{ 
								key: 'health',
								entity: 'player',
								name: 'Health', 
								icon: 'fas fa-heart',
								info: 'Players can see the health of players.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: 'obscured', name: 'Obsc', action: 'Obsc', icon: 'fas fa-question-circle', color: 'orange' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'ac',
								entity: 'player',
								name: 'Armor Class', 
								icon: 'fas fa-shield',
								info: 'Players can see the armor class of players.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								condition: 'conditions',
								entity: 'player',
								name: 'Conditions', 
								icon: 'fas fa-skull-crossbones',
								info: 'Players can see the conditions of players.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
						]
					}
				},
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.userId}/track`),
					asObject: true,
				}
			}
		},
		methods: {
			...mapActions([
				"setSlide"
			]),
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
			selected(value, current) {
				return value === current;
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
			displaySetting(type, key, value) {
				let options = this.types[type].type_settings.filter(item => {
					return item.key === key;
				})[0].options;
				const selected = options.filter(item => {
					return item.value === value;
				})[0];
				return selected;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.q-field__control {
		.q-item {
			width: 100%;
		}
	}
</style>