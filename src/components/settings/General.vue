<template>
	<div class="card-body">
		<h3>Theme</h3>
		<div class="theme">
			<a @click="setTheme('dark')" :class="{ active: $store.getters.theme === 'dark' }">
				<img src="@/assets/_img/dark.webp" />
				Dark
			</a>
			<a @click="setTheme('light')" :class="{ active: $store.getters.theme === 'light' }">
				<img src="@/assets/_img/light.webp" />
				Light
			</a>
		</div>
		<hr>
		
		<div v-for="({name, type_settings}, type_key) in types" :key="type_key">
			<h3 class="mt-3 mb-1" v-if="name">{{ name }}</h3>
			<q-select 
				:dark="$store.getters.theme === 'dark'" filled square
				v-for="(setting, index) in type_settings" 
				:options="setting.options"
				:value="index"
				class="mb-1"
				:key="`${type_key}-${index}`"
			>
				<q-item :dark="$store.getters.theme === 'dark'" slot="selected">
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
							<q-menu :dark="$store.getters.theme === 'dark'" anchor="top middle" self="bottom middle" :max-width="setting.infoWidth || '250px'">
								<q-card :dark="$store.getters.theme === 'dark'">
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
		</div>

		<a class="btn bg-neutral-5 mt-3" @click="setDefault()">Reset to default</a>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Keybindings from '@/components/slides/Keybindings.vue';
	import { mapActions } from "vuex";

	export default {
		name: 'General',
		components: {
			Keybindings
		},
		data(){
			return {
				userId: this.$store.getters.user.uid,
				types: {
					general: { 
						type_settings: [
							{ 
								key: 'keyBinds',
								name: 'Show Keybinds', 
								icon: 'fas fa-keyboard',
								info: '<p>Use these keybindings to perform actions quickly.<br/> With this setting you can show or hide the keybinds on the buttons that perform the actions.</p>',
								infoWidth: '400px',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
						],
					},
					player: { 
						name: "Player", 
						type_settings: [
							{ 
								key: 'passive_perception',
								name: 'Passive Perception', 
								icon: 'fas fa-eye',
								info: 'Show passive perception in the player overview.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'passive_investigation',
								name: 'Passive Invastigation', 
								icon: 'fas fa-search',
								info: 'Show passive investigation in the player overview.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'passive_insight',
								name: 'Passive Insight', 
								icon: 'fas fa-lightbulb-on',
								info: 'Show passive insight in the player overview.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
							{ 
								key: 'save_dc',
								name: 'Save DC', 
								icon: 'fas fa-hand-holding-magic',
								info: 'Show spell save DC in the player overview.',
								options: [
									{ value: false, name: 'Hidden', action: 'Hide', icon: 'fas fa-eye-slash', color: 'red' },
									{ value: undefined, name: 'Shown', action: 'Show', icon: 'fas fa-eye', color: 'green' },
								]
							},
						],
					},
					ui: { 
						name: "User interface", 
						type_settings: [
							{
								key: 'side_collapsed',
								name: 'Side Menu',
								icon: 'fas fa-bars',
								info: 'Either set the sidebar to be fully visible or collapsed by default.',
								options: [
									{ value: true, name: 'Collapsed', action: 'Collapse', icon: 'fas fa-arrow-alt-to-left', color: 'red'},
									{ value: undefined, name: 'Visible', action: 'Show', icon: 'fas fa-arrow-alt-to-right', color: 'green'},
								]
							},
						]
					},
				},				
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
			...mapActions([
				"setTheme"
			]),
			setSetting(type, value) {
				if(value == undefined) {
					db.ref(`settings/${this.userId}/general/${type}`).remove();
				} else {
					db.ref(`settings/${this.userId}/general/${type}`).set(value);
				}
			},
			setDefault() {
				db.ref(`settings/${this.userId}/general`).remove();
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
	.theme {
		display: flex;
		justify-content: center;

		a {
			margin-right: 10px;
			border: solid 1px transparent;
			border-radius: $border-radius;
			padding: 5px;
			text-align: center;
			color: $neutral-3;

			&:hover, &.active {
				border-color: $blue;
				color: $neutral-1;
			}
			&:last-child {
				margin: 0;
			}
			img {
				width: 100%;
				max-width: 250px;
				display: block;
				margin-bottom: 5px;
			}
		}
	}
</style>