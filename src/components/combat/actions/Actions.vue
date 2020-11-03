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
							<icon v-if="['monster', 'player', 'companion'].includes(entities[doneBy].img)" class="img" :icon="entities[doneBy].img" :fill="entities[doneBy].color_label" :style="entities[doneBy].color_label ? `border-color: ${entities[doneBy].color_label}` : ``" />
							<span 
								v-else 
								class="img" 
								:style="{
									'background-image': 'url(' + entities[doneBy].img + ')',
									'border-color': entities[doneBy].color_label ? entities[doneBy].color_label : ``
								}
							"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="entities[doneBy].name"/>
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
							<icon v-if="['monster', 'player', 'companion'].includes(scope.opt.img)" class="img" :icon="scope.opt.img" :fill="scope.opt.color_label" :style="scope.opt.color_label ? `border-color: ${scope.opt.color_label}` : ``" />
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
					<q-tab-panel name="manual">
						<Manual :current="entities[doneBy]" :targeted="targeted" />
					</q-tab-panel>
					<q-tab-panel name="roll">
						<Roll :current="entities[doneBy]" />
					</q-tab-panel>
			</q-tab-panels>
		</template>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';

	import Manual from '@/components/combat/actions/Manual.vue';
	import Roll from '@/components/combat/actions/Roll.vue';

	export default {
		name: 'Actions',
		components: {
			Manual,
			Roll,
		},
		mixins: [setHP],
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
				tabs: [
					{ name: "manual", label: "Manual", icon: "fas fa-keyboard" },
					{ name: "roll", label: "Roll", icon: "fas fa-dice-d20" }
				],
				doneBy: this.current ? this.current.key : undefined
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			_active: function() {
				return _.chain(this.entities)
				.filter(function(entity, key) {
					entity.key = key
					return !entity.down;
				})
				.sortBy('name' , 'asc')
				.value()
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
		border: solid 1px #b2b2b2;
	}
</style>