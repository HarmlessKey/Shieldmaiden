<template>
	<div class="card-body">
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
						<q-icon :name="setting.icon" class="neutral-2" size="large" />
					</q-item-section>
					<q-item-section class="neutral-2 truncate">
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
							<q-menu dark anchor="top middle" self="bottom middle" :max-width="setting.infoWidth || '250px'">
								<q-card dark>
									<q-card-section class="bg-neutral-9">
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
			
			<div class="timer">
				<q-input 
					dark square filled
					type="number"
					label="Minutes"
					:value="timer.minutes"
					@input="setTimer($event, 'minutes')"
				>
					<q-icon slot="prepend" size="medium" name="fas fa-stopwatch" class="mx-3" />
					<template #append>:</template>
				</q-input>
				<q-input 
					dark square filled
					type="number"
					max="59"
					label="Seconds"
					:value="timer.seconds"
					@input="setTimer($event, 'seconds')"
				>
					<span slot="after" >
						<a @click.stop>
						<q-icon name="info" size="medium">
							<q-menu square anchor="top middle" self="bottom middle" :max-width="'250px'">
								<q-card dark square>
									<q-card-section class="bg-neutral-9">
										<b>Turn timer</b>
									</q-card-section>

									<q-card-section>
										<p>When a time is entered, the turn timer will count down from the time you entered.</p>
										<p>Set to 0 or clear the value to have the timer count up again.</p>		
									</q-card-section>
								</q-card>
							</q-menu>
						</q-icon>
					</a>
					</span>
				</q-input>
			</div>
		</div>
		<a class="btn mt-3 bg-neutral-5" @click="setDefault()">Reset to default</a>
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
									{ value: undefined, name: 'Descend', action: 'Descend', icon: 'fas fa-long-arrow-alt-down', color: 'neutral-2' },
									{ value: true, name: 'Ascend', action: 'Ascend', icon: 'fas fa-long-arrow-alt-up', color: 'neutral-2' },
								]
							},
							{ 
								key: 'critical',
								name: 'Critical Hits', 
								icon: 'far fa-crosshairs',
								info: 'How do you want critical hits to be handled?<br/> <b>Roll</b>: all the damage dice are rolled twice.<br/> <b>Double</b>: the rolled damage is doubled.',
								options: [
									{ value: undefined, name: 'Roll', action: 'Roll', icon: 'fas fa-dice-d20', color: 'neutral-2' },
									{ value: true, name: 'Double', action: 'Double', icon: 'fas fa-chevron-double-up', color: 'neutral-2' },
								]
							},
							{ 
								key: 'npcDamageTab',
								name: 'NPC Damage Tab', 
								icon: 'fas fa-sword',
								info: 'Set what tab shows by default when it is an NPC\'s turn. It either shows the tab for rolling damage, or doing manual damage.',
								options: [
									{ value: undefined, name: 'Roll', action: 'Roll', icon: 'fas fa-dice-d20', color: 'neutral-2' },
									{ value: true, name: 'Manual', action: 'Manual', icon: 'fas fa-hand-paper', color: 'neutral-2' },
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
		computed: {
			timer() {
				const total = this.settings.timer ? this.settings.timer : 0;
				const minutes = Math.floor(total/60);
				const seconds = total - (minutes*60);

				return {
					minutes,
					seconds
				};
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
			},
			setTimer(value, type) {
				value = (value === "") ? 0 : value;
				value = (value < 0) ? 0 : value;
				value = (value > 59) ? 59 : value;
				let total;
				if(type === 'seconds') {
					total = parseInt(parseInt(value) + this.timer.minutes*60);
				} else {
					total = parseInt(this.timer.seconds + parseInt(value)*60);
				}
				db.ref(`settings/${this.userId}/encounter/timer`).set(total);
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
	.timer {
		display: flex;
	}
</style>