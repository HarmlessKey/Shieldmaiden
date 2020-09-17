<template>
	<b-row v-if="entity.reminders" class="reminders justify-content-start px-2">
		<b-col class="col-3 p-1" v-for="(reminder, key) in entity.reminders" :key="key">
			<a 
				@click="setSlide({
					show: true, 
					type: 'slides/encounter/reminders/Reminder',
					data: {
						key,
						entity
				}})" 
				v-b-tooltip.hover :title="'Show '+title(reminder)" 
				class="text-truncate d-block" :class="'bg-'+reminder.color"
			>
				{{ title(reminder) }}
				<span class="counter" v-if="reminder.rounds">{{ reminder.rounds }}</span>
			</a>
		</b-col>
	</b-row>
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
		margin-right: -12px;
		margin-left: -12px;
		font-size: 11px;

		.col {
			a {
				color: #fff !important;
				position: relative;
				padding: 3px;
				padding-right: 15px;
				text-shadow: 1px 1px #000;

				.counter {
					position: absolute;
					right: 5px;
					color: #fff !important;
					font-size: 12px;
					display: inline-block;
				}
				
			}
		}
	}
</style>