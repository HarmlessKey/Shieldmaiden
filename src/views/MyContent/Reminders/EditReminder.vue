<template>
	<div class="container-fluid">
		<div v-if="overencumbered" class='container'>
			<OverEncumbered/>
		</div>
		<template v-else>
			<reminder-form v-model="reminder" @validation="setValidation" class="form" />
		</template>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import { mapGetters } from 'vuex';
	import ReminderForm from '@/components/ReminderForm';
	import { db } from '@/firebase'

	export default {
		name: 'Reminders',
		metaInfo: {
			title: 'Reminders'
		},
		components: {
			OverEncumbered,
			ReminderForm
		},
		data() {
			return {
				reminderId: this.$route.params.id,
			}
		},
		firebase() {
			return {
				reminder: {
					source: db.ref(`reminders/${this.userId}/${this.reminderId}`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'overencumbered',
			]),
		},

		methods: {
			setValidation(validate) {
				this.validation = validate;
			},
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	.form {
		max-width: 360px;
	}
}

</style>