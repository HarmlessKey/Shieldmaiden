<template>
	<div class="bg-gray gray-light">
		<q-list>
			<q-item>
				<q-item-section>
					<b>{{ entity.name.capitalizeEach() }}</b>
				</q-item-section>
			</q-item>
			<q-separator />
			<q-item 
				clickable v-close-popup 
				v-if="entity.curHp == 0 && !entity.stable && entity.entityType === 'player'"
				@click="set_stable({key: entity.key, action: 'set'})"
			>
				<q-item-section avatar><i class="fas fa-heartbeat"></i></q-item-section>
				<q-item-section>Stabilize</q-item-section>
			</q-item>
			<q-item 
				clickable v-close-popup 
				@click="setSlide({show: true, type: 'slides/encounter/EditEntity', data: [entity.key] })"
			>
				<q-item-section avatar><i class="fas fa-pencil"></i></q-item-section>
				<q-item-section>Edit</q-item-section>
			</q-item>
			<q-item 
				clickable v-close-popup 
				@click="setSlide({show: true, type: 'slides/encounter/reminders/TargetReminders', data: [entity.key] })"
			>
				<q-item-section avatar><i class="fas fa-stopwatch"></i></q-item-section>
				<q-item-section>Reminders</q-item-section>
			</q-item>
			<q-item 
				clickable v-close-popup 
				@click="setSlide({show: true, type: 'slides/Transform', data: entities[entity.key]})"
			>
				<q-item-section avatar><i class="fas fa-paw-claws"></i></q-item-section>
				<q-item-section>Transform</q-item-section>
			</q-item>
			<q-item 
				clickable v-close-popup 
				@click="setHidden(entity.key, !entity.hidden)"
			>
				<q-item-section avatar><i :class="entity.hidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i></q-item-section>
				<q-item-section>{{ entity.hidden ? "Show" : "Hide" }}</q-item-section>
			</q-item>
			<q-item 
				clickable v-close-popup 
				@click="setSlide({show: true, type: 'slides/encounter/Conditions', data: [entity.key] })"
			>
				<q-item-section avatar><i class="fas fa-flame"></i></q-item-section>
				<q-item-section>Conditions</q-item-section>
			</q-item>
			<q-item 
				clickable v-close-popup 
				@click="setSlide({show: true, type: 'slides/encounter/DamageHealing' })"
			>
				<q-item-section avatar><i class="fas fa-swords"></i></q-item-section>
				<q-item-section>Do damage/healing</q-item-section>
			</q-item>
			<q-separator />
			<q-item 
				clickable v-close-popup 
				@click="remove(entity.key, entity.name)"
			>
				<q-item-section avatar><i class="fas fa-trash-alt red"></i></q-item-section>
				<q-item-section>Remove</q-item-section>
			</q-item>
		</q-list>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'TargetMenu',
		props: ['entity'],
		data() {
			return {

			}
		},
		computed: {
			...mapGetters([
				'entities',
			])
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_hidden',
				'set_stable',
				'remove_entity',
			]),
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
			remove(key, name) {
				this.$snotify.error('Are you sure you want to remove "' + name + '" from this encounter?', 'Delete character', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.remove_entity(key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
		}
	}
</script>

<style>

</style>