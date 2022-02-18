<template>
	<div 
		v-if="entity.reminders && Object.keys(entity.reminders).length > 0" 
		class="reminders truncate-chip-labels" 
	>
		<template v-for="(reminder, key) in entity.reminders">
			<q-chip 
				v-if="reminder"
				clickable
				:key="key" 
				square 
				size="12px"
				:icon="reminder.icon"
				class=""
				:class="'bg-'+reminder.color"
				@click="setSlide({
					show: true, 
					type: 'slides/encounter/reminders/Reminder',
					data: {
						key,
						entity
				}})" 
			>
				<q-avatar v-if="reminder.rounds">
					<b>{{ reminder.rounds }}</b>
					<q-tooltip anchor="top middle" self="center middle">
						Ends in {{ reminder.rounds }} rounds
					</q-tooltip>
				</q-avatar>
				<q-item-label>{{ title(reminder) }}</q-item-label>
			</q-chip>
		</template>
	</div>
</template>

<script>
	import { remindersMixin } from '@/mixins/reminders';
	import { mapActions } from 'vuex';

	export default {
		name: 'Reminders',
		props: ['entity'],
		mixins: [remindersMixin],
		methods: {
			...mapActions([
				'setSlide'
			]),
			title(reminder) {
				let title = reminder.title;

				if(reminder.selectedVars) {
					title = this.replaceReminderVariables(title, reminder.selectedVars);
				}
				return title;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.reminders {
		margin-top: 4px;
		margin-left: -4px;

		.q-chip {
			color:$neutral-1 !important;
			border-radius: 0;
			cursor: pointer;

			.q-avatar {
				border-radius: 0;
				background: rgba(0, 0, 0, .4);
			}
		}
	}
</style>