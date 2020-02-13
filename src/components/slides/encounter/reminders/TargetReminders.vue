<template>
	<div class="pb-5" v-if="entities">
		<h2>Reminders <span class="blue">{{ entities[entityKey].name }}</span></h2>
		<b-row v-if="entities[entityKey].reminders" class="current justify-content-start px-3">
			<b-col class="col-3 p-1" v-for="(reminder, key) in entities[entityKey].reminders" :key="key">
				<a @click="removeReminder(key)" v-b-tooltip.hover :title="'Remove '+reminder.title" class="text-truncate d-block" :class="'bg-'+reminder.color">
					{{ reminder.title }}
					<span class="delete"><i class="fas fa-times"></i></span>
				</a>
			</b-col>
		</b-row>
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" 
					id="premade-tab" 
					data-toggle="tab" 
					href="#premade" 
					role="tab" 
					aria-controls="premade" 
					aria-selected="true">
					Premade
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					id="custom-tab" 
					data-toggle="tab" 
					href="#custom" 
					role="tab" 
					aria-controls="custom" 
					aria-selected="false">
					Custom
				</a>
			</li>
		</ul>

		<div class="tab-content">
			<div class="tab-pane fade show active" id="premade" role="tabpanel" aria-labelledby="premade-tab">
				<ul class="premade">
					<li v-for="(reminder, key) in premade" :key="key"
						class="d-flex justify-content-between"
						:class="'bg-'+reminder.color">
						<div>{{ reminder.title }}</div>
						<a class="green" v-b-tooltip.hover title="Set" @click="addReminder('premade', reminder)"><i class="fas fa-plus"></i></a>
					</li>
				</ul>
			</div>

			<div class="tab-pane fade" id="custom" role="tabpanel" aria-labelledby="custom-tab">	
				<reminder-form v-model="customReminder" @validation="setValidation"/>
				<button class="btn btn-block" @click="addReminder('custom')">Set</button>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import { db } from '@/firebase';
	import ReminderForm from '@/components/ReminderForm';
	import { remindersMixin } from '@/mixins/reminders'

	export default {
		name: 'TargetReminders',
		mixins: [remindersMixin],
		components: {
			ReminderForm
		},
		props: [
			'data',
		],
		data() {
			return {
				entityKey: this.data,
				action: 'remove',
				selectedColor: 'green-light',
				premadeReminder: undefined,
				customReminder: {}
			}
		},
		computed: {
			...mapGetters([
				'entities',
			]),
		},
		methods: {
			...mapActions([
				'set_targetReminder',
			]),
			addReminder(type, reminder = false) {	
				if(type == 'premade') {
					this.set_targetReminder({
						action: 'add',
						entity: this.entityKey,
						key: reminder['.key'],
						type: 'premade',
						reminder: reminder
					});
				}
				else if(type == 'custom') {
					this.validation.validateAll().then((result) => {
						if (result) {
							this.set_targetReminder({
								action: 'add',
								entity: this.entityKey,
								type: 'custom',
								reminder: this.customReminder
							})
							this.customReminder = {};
						}
					})
				}
			},
			setValidation(validate) {
				this.validation = validate;
			},
			removeReminder(key) {
				this.set_targetReminder({
					action: 'remove',
					entity: this.entityKey,
					key: key,
				})
			},
		}
	};
</script>

<style lang="scss" scoped>

	ul.nav-tabs {
		border-bottom: solid 3px #494747;
		height: 41px;
		margin: 0;

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
		padding-top: 20px;
				
		ul.premade {
			color: #fff;
			list-style: none;
			padding: 0;

			li {
				margin-bottom: 3px;

				div {
					padding: 5px;
				}
				a {
					display: block;
					background: #262626;
					padding: 5px 10px;
				}
			}
		}
	}
	.current {
		margin-bottom: 20px;
		font-size: 11px;

		.col {
			a {
				color: #fff !important;
				position: relative;
				padding: 3px;

				.delete {
					display: none;
				}

				&:hover {
					.delete {
						position: absolute;
						right: 5px;
						color: #fff !important;
						font-size: 12px;
						display: inline-block;
						
					}
					padding-right: 15px;
				}
			}
		}
	}
</style>
