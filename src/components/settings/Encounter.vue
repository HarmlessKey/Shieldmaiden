<template>
	<div>
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
							{{ displaySetting(type_key, setting.key, settings[setting.key]).name }}
						</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-icon 
							:name="displaySetting(type_key, setting.key, settings[setting.key]).icon" 
							:class="displaySetting(type_key, setting.key, settings[setting.key]).color"
							size="medium"
						/>
					</q-item-section>
				</q-item>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="scope.opt.value === settings[setting.key]"
						@click="setSetting(setting.key, scope.opt.value)"
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

	export default {
		name: 'Track',
		data(){
			return {
				userId: this.$store.getters.user.uid,
				types: {
					general: {
						type_settings: [
							{
								key: 'automate', 
								name: 'Automate', 
								icon: 'fas fa-calculator',
								info: 
									'<p>When you check the automate setting, some actions in an encounter will be done automatically.<br/>'+
									'At the moment only one action is dependent on the automate function.</p>'+
									'<b>Death Saving Throws</b>'+
									'<p>When a down player receives damage, it will automatically get a failed death saving throw.'+ 
									'If the "critical hit" checkbox is checked, two death saves will be failed.<br/>'+
									'Even a character that is stable at 0 hit points will automatically fail saves when taking damage.</p>',
								options: [
									{ value: false, name: 'Don\'t automate', action: 'Don\'t', icon: 'fas fa-times', color: 'red' },
									{ value: undefined, name: 'Automate', action: 'Automate', icon: 'fas fa-check', color: 'green' },
								]
							},
							{ 
								key: 'background',
								name: 'Background Image', 
								icon: 'fas fa-image',
								info: 'Show or hide background image you set for the encounter.',
								options: [
									{ value: undefined, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: true, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'initOrder',
								name: 'Initiative order', 
								icon: 'fas fa-arrows-alt-v',
								info: 'Change the order of initiative.',
								options: [
									{ value: undefined, name: 'Descend', action: 'Descend', icon: 'fas fa-long-arrow-alt-down', color: 'gray-light' },
									{ value: true, name: 'Ascend', action: 'Ascend', icon: 'fas fa-long-arrow-alt-up', color: 'gray-light' },
								]
							},
							{ 
								key: 'critical',
								name: 'Critical Hits', 
								icon: 'far fa-crosshairs',
								info: 'How do you want critical hits to be handled?<br/> <b>Roll</b>: all the damage dice are rolled twice.<br/> <b>Double</b>: the rolled damage is doubled.',
								options: [
									{ value: undefined, name: 'Roll', action: 'Roll', icon: 'fas fa-dice-d20', color: 'gray-light' },
									{ value: true, name: 'Double', action: 'Double', icon: 'fas fa-chevron-double-up', color: 'gray-light' },
								]
							},
							{ 
								key: 'npcDamageTab',
								name: 'NPC Damage Tab', 
								icon: 'fas fa-sword',
								info: 'Set what tab shows by default when it is an NPC\'s turn. It either shows the tab for rolling damage, or doing manual damage.',
								options: [
									{ value: undefined, name: 'Roll', action: 'Roll', icon: 'fas fa-dice-d20', color: 'gray-light' },
									{ value: true, name: 'Manual', action: 'Manual', icon: 'fas fa-hand-paper', color: 'gray-light' },
								]
							},
						]
					}
				}
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