<template>
	<div id="actions">
		<q-tabs
        v-model="tab"
				dark
				inline-label
				dense
				align="left"
				:breakpoint="0"
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
					<Manual :current="current" :targeted="targeted" />
				</q-tab-panel>
				<q-tab-panel name="roll">
					<Roll :current="current" />
				</q-tab-panel>
		</q-tab-panels>
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
		props: ['current', 'location'],
		data() {
			return {
				tabSetter: undefined,
				tabs: [
					{ name: "manual", label: "Manual", icon: "fas fa-keyboard" },
					{ name: "roll", label: "Roll", icon: "fas fa-dice-d20" }
				]
			}
		},
		computed: {
			...mapGetters([
				'targeted',
			]),
			tab: {
				get() {
					const tab = (
						this.current.entityType === 'player' || 
						this.current.entityType === 'companion' || 
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

	.custom-control-label {
		line-height: 25px !important;
	}
	ul.nav-tabs {
		border-bottom: solid 3px #494747;
		height: 37px;
		margin: 0 10px;

		.nav-link {
			color: #b2b2b2 !important;
			border-bottom: solid 3px #494747 !important;

			&.active {
				color: #2c97de !important;
				background: none !important;
				border-color: #2c97de !important;
			}
		}
	}
	.tab-content {
		padding: 20px 10px 15px 10px;
	}
}
</style>