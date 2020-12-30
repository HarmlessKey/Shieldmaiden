<template>
	<div class="menu bg-gray-dark">
		<div v-if="targeted.length === 0" class="no-target red" 
			@click="setSlide({
				show: true,
				type: 'slides/encounter/TargetingInfo',
				data: { key: targeted[0] }
			})"
		>
			Select a target.
		</div>
		<q-tabs
			v-else
			dark
			no-caps
			indicator-color="transparent"
		>
			<q-tab 
				v-for="({name, icon, slide}, index) in tabs"
				:key="`tab-${index}`" 
				:name="name" 
				:icon="icon"
				@click="
					(slide) ? 
					setSlide({
						show: true,
						type: slide.type,
						data: slide.data
					}) : dialog[name] = !dialog[name]"
			/>
		</q-tabs>

		<!-- DAMAGE / HEALING -->
		<q-dialog square v-model="dialog.damage">
			<div class="bg-gray px-3 py-3">
				<Actions :current="current" :settings="settings" :select-entity="true" />
			</div>
		</q-dialog>

		<!-- DAMAGE / HEALING -->
		<q-dialog square v-model="dialog.options">
			<!-- <div class="bg-gray">
				<q-list>
					<q-item>
						<q-item-section>
							<b>{{ (targeted.length === 1) ? entities[targeted[0]].name : `${targeted.length} targets` }}</b>
						</q-item-section>
					</q-item>
					<q-separator />
					<q-item 
						v-if="targeted.length === 1 && entities[targeted[0]].curHp === 0 && !entities[targeted[0]].stable && entities[targeted[0]].entityType === 'player'"
						clickable v-close-popup 
						@click="set_stable({key: entities[targeted[0]].key, action: 'set'})"
					>
						<q-item-section avatar><i class="fas fa-heartbeat"></i></q-item-section>
						<q-item-section>Stabilize</q-item-section>
					</q-item>
					<q-item 
						v-if="targeted.length === 1"
						clickable v-close-popup 
						@click="setSlide({show: true, type: 'slides/encounter/EditEntity' })"
					>
						<q-item-section avatar><i class="fas fa-pencil"></i></q-item-section>
						<q-item-section>Edit</q-item-section>
					</q-item>
					<q-item 
						clickable v-close-popup 
						@click="setSlide({show: true, type: 'slides/encounter/reminders/TargetReminders', data: entities[targeted[0]].key})"
					>
						<q-item-section avatar><i class="fas fa-stopwatch"></i></q-item-section>
						<q-item-section>Reminders</q-item-section>
					</q-item>
					<q-item 
						v-if="targeted.length === 1"
						clickable v-close-popup 
						@click="setSlide({show: true, type: 'slides/Transform', data: entities[targeted[0]]})"
					>
						<q-item-section avatar><i class="fas fa-paw-claws"></i></q-item-section>
						<q-item-section>Transform</q-item-section>
					</q-item>
					<q-item 
						v-if="targeted.length === 1"
						clickable v-close-popup 
						@click="setHidden(entities[targeted[0]].key, !entities[targeted[0]].hidden)"
					>
						<q-item-section avatar><i :class="entities[targeted[0]].hidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i></q-item-section>
						<q-item-section>{{ entities[targeted[0]].hidden ? "Show" : "Hide" }}</q-item-section>
					</q-item>
					<q-item 
						clickable v-close-popup 
						@click="setSlide({show: true, type: 'slides/encounter/Conditions', data: entity})"
					>
						<q-item-section avatar><i class="fas fa-flame"></i></q-item-section>
						<q-item-section>Conditions</q-item-section>
					</q-item>
					<q-separator />
					<q-item 
						v-if="targeted.length === 1"
						clickable
						@click="remove(entities[targeted[0]].key, entities[targeted[0]].name)"
					>
						<q-item-section avatar><i class="fas fa-trash-alt red"></i></q-item-section>
						<q-item-section>Remove</q-item-section>
					</q-item>
				</q-list>
			</div> -->
			<target-menu :entity="entity" />
		</q-dialog>
	</div>

</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import Actions from '@/components/combat/actions/Actions.vue';
	import Manual from '@/components/combat/actions/Manual.vue';
	import Roll from '@/components/combat/actions/Roll.vue';
	import TargetMenu from '@/components/combat/TargetMenu.vue';

	export default {
		name: 'Menu',
		components: {
			Actions,
			Manual,
			Roll,
			TargetMenu,
		},
		props: ["entities", "settings", "current"],
		data () {
			return {
				dialog: {
					damage: false,
					options: false
				}
			}
		},
		computed: {
			...mapGetters([
				'targeted',
			]),
			tabs() { 
				let tabs = [];

				if(this.targeted.length) {
					tabs.push({
						name: "damage",
						label: "Actions",
						icon: "fas fa-swords",
					},
					{
						name: "edit",
						label: "Edit",
						icon: "fas fa-pencil-alt",
						slide: {
							type: 'slides/encounter/EditEntity',
							data: {}
						}
					},
					{
						name: "options",
						label: "Options",
						icon: "fas fa-ellipsis-h"
					})
				}
				if(this.targeted.length === 1) {
					tabs.push(	{
						name: "info",
						label: "Info",
						icon: "info",
						slide: {
							type: 'combat/TargetInfo',
							data: { key: this.targeted[0] }
						}
					});
				}
				if(this.targeted.length)
					return tabs;
			},
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_hidden',
				'remove_entity'
			]),
			remove(key, name) {
				this.$snotify.error('Are you sure you want to remove "' + name + '" from this encounter?', 'Delete character', {
					buttons: [
					{ text: 'Yes', action: (toast) => { this.remove_entity(key); this.dialog.options = false, this.$snotify.remove(toast.id); }, bold: false},
					{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			setHidden(key, hidden) {
				if(key) {
					this.set_hidden({
						key: key,
						hidden: hidden
					})
				} else {
					this.$snotify.error('Select a target', 'Hide entity', {
					});
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.menu {
		position: fixed;
		width: 100%;
		bottom: 0;
		height: 60px;

		.no-target {
			line-height: 60px;
			text-align: center;
			user-select: none;
		}
		.q-tabs {
			height: 100%;
		}
	}
</style>