<template>
	<div id="actions">
		<template v-if="selectEntity">
			<p>Action performed by:</p>
			<q-select 
				dark filled square dense
				name="doneBy"
				:value="doneBy" 
				:options="_active"
				v-validate="'required'"
			>
				<template v-slot:selected>
					<q-item v-if="doneBy" class="selected">
						<q-item-section avatar>
							<icon 
								class="img" 
								v-if="['monster', 'player', 'companion', 'environment'].includes(entitiesList[doneBy].img)" 
								:icon="entitiesList[doneBy].img" 
								:fill="entitiesList[doneBy].color_label" 
								:style="entitiesList[doneBy].color_label ? `border-color: ${entitiesList[doneBy].color_label}` : ``" 
							/>
							<span 
								v-else 
								class="img" 
								:style="{
									'background-image': 'url(' + entitiesList[doneBy].img + ')',
									'border-color': entitiesList[doneBy].color_label ? entitiesList[doneBy].color_label : ``
								}
							"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="entitiesList[doneBy].name"/>
						</q-item-section>
					</q-item>
					<span v-else>
						Who performs the action?
					</span>
				</template>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="doneBy === scope.opt.key"
						@click="doneBy = scope.opt.key"
					>
						<q-item-section avatar>
							<icon v-if="['monster', 'player', 'companion', 'environment'].includes(scope.opt.img)" class="img" :icon="scope.opt.img" :fill="scope.opt.color_label" :style="scope.opt.color_label ? `border-color: ${scope.opt.color_label}` : ``" />
							<span 
								v-else 
								class="img" 
								:style="{
									'background-image': 'url(' + scope.opt.img + ')',
									'border-color': scope.opt.color_label ? scope.opt.color_label : ``
								}
							"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="scope.opt.name"/>
						</q-item-section>
					</q-item>
				</template>
			</q-select>
			<p class="validate red" v-if="errors.has('doneBy')">{{ errors.first('doneBy') }}</p>

			<div 
				v-if="doneBy && entitiesList[doneBy].reminders && entitiesList[doneBy].reminders.reaction"
				class="reaction-used bg-red px-1 py-2 white mb-2 d-flex justify-between" 
			>
				<span>Reaction used</span>
				<q-icon name="fas fa-exclamation"/>
			</div>
		</template>

		<template v-if="doneBy">
			<q-tabs
				v-model="tab"
				dark
				inline-label
				dense
				no-caps
			>
				<q-tab 
					v-for="({name, icon, label}, index) in tabs"
					:key="`tab-${index}`" 
					:name="name" 
					:icon="icon"
					:label="label"
				/>
			</q-tabs>

			<q-tab-panels v-model="tab" class="bg-transparent">
					<q-tab-panel :name="name" v-for="{name} in tabs" :key="`panel-${name}`">
						<Manual v-if="name === 'manual'" :current="entitiesList[doneBy]" :targeted="targeted" />
						<template v-if="name === 'roll'">
							<RollDeprecated v-if="entitiesList[doneBy].old" :current="entitiesList[doneBy]" />
							<Roll v-else :current="entitiesList[doneBy]" />
						</template>
						<Spellcasting v-if="name === 'spells'" :current="entitiesList[doneBy]" />
					</q-tab-panel>
			</q-tab-panels>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';

	import Manual from '@/components/combat/actions/Manual.vue';
	import RollDeprecated from '@/components/combat/actions/RollDeprecated.vue';
	import Roll from '@/components/combat/actions/Roll.vue';
	import Spellcasting from '@/components/combat/actions/Spellcasting.vue';
	import { damage_types } from '@/mixins/damageTypes.js';

	export default {
		name: 'Actions',
		components: {
			Manual,
			RollDeprecated,
			Roll,
			Spellcasting
		},
		mixins: [setHP, damage_types],
		props: {
			current: {
				type: Object
			}, 
			selectEntity: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				tabSetter: undefined,
				doneBySetter: undefined
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			_active: function() {
				let active = _.chain(this.entities)
				.filter(function(entity, key) {
					entity.key = key
					return !entity.down;
				})
				.sortBy('name' , 'asc')
				.value();
				active.unshift({
					key: "environment",
					name: "Environment",
					img: "environment"
				});
				return active;
			},
			entitiesList() {
				let list = {...this.entities};
				list.environment = {
					key: "environment",
					name: "Environment",
					img: "environment",
					entityType: "environment"
				};
				return list;
			},
			tabs() {
				const current = this.entitiesList[this.doneBy];
				let tabs = [
					{ name: "manual", label: "Manual", icon: "fas fa-keyboard" },
					{ name: "roll", label: "Actions", icon: "fas fa-dice-d20" }	
				];
				if(current.entityType !== "player" && (current.caster_ability || current.innate_ability)) {
					tabs.push({ name: "spells", label: "Spells", icon: "fas fa-wand-magic" })
				}
				return tabs;
			},
			doneBy: {
				get() {
					const key = (this.current) ? this.current.key : undefined;
					return (this.doneBySetter) ? this.doneBySetter : key;
				},
				set(newValue) {
					this.doneBySetter = newValue;
				}
			},
			tab: {
				get() {
					const tab = (
						(this.current && (this.current.entityType === 'player' || 
						this.current.entityType === 'companion')) || 
						this.settings.npcDamageTab
					) ? "manual" : "roll";

					return (this.tabSetter) ? this.tabSetter : tab;
				},
				set(newValue) {
					this.tabSetter = newValue;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	#actions {
		font-size: 12px;

		.q-field {
			margin-bottom: 15px;

			.q-item {
				&.selected {
					padding: 0;
					min-height: 35px !important;
					line-height: 35px !important
				}
			}
		}
	}
	.q-tab-panel {
		padding: 15px 0 0 0 !important;
	}
	.img {
		display: block;
		width: 35px;
		height: 35px;
		background-size: cover;
		background-position: top center;
		border: solid 1px $gray-light;
	}
	.reaction-used {
		font-size: 15px;
		i {
			margin: 4px 5px 0 0;
		}
	}
</style>