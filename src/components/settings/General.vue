<template>
	<div class="card-body">
		<h3>Theme</h3>
		<div class="theme">
			<a @click="setTheme('dark')" :class="{ active: $store.getters.theme === 'dark' }">
				<img src="~assets/_img/dark.webp" />
				Dark
			</a>
			<a @click="setTheme('light')" :class="{ active: $store.getters.theme === 'light' }">
				<img src="~assets/_img/light.webp" />
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
						<q-item-label class="truncate">
							{{ setting.name }}
						</q-item-label>
						<q-item-label caption class="truncate">
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
							<q-item-label v-text="scope.opt.name"/>
						</q-item-section>
						<q-item-section avatar>
							<q-icon :name="scope.opt.icon" size="small" :class="scope.opt.color" />
						</q-item-section>
					</q-item>
				</template>
				<hk-popover v-if="setting.info" slot="after" :header="setting.name">
						<q-icon name="info" size="sm" color="neutral-3" />
						<div slot="content">
							<div v-html="setting.info" />
							<Keybindings v-if="setting.key === 'keyBinds'" :data="{ sm: true }" />
						</div>
				</hk-popover>
			</q-select>
		</div>

		<a class="btn bg-neutral-5 mt-3" @click="set_default_settings('general')">
			Reset to default
		</a>
	</div>
</template>

<script>
	import Keybindings from 'src/components/slides/Keybindings.vue';
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: 'GeneralSettings',
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
								name: 'Passive Investigation', 
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
		computed: {
			...mapGetters(["userSettings"]),
			settings() {
				return this.userSettings.general || {};
			}
		},
		methods: {
			...mapActions([
				"setTheme",
				"update_settings",
				"set_default_settings"
			]),
			setSetting(type, value) {
				this.update_settings({
					category: "general",
					type,
					value
				});
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
	.q-item.no-wrap {
		flex-wrap: wrap;
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