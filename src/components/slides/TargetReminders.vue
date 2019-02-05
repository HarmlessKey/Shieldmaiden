<template>
	<div class="pb-5" v-if="entities">
		<h2>Reminders <span class="blue">{{ entities[entityKey].name }}</span></h2>
		<b-row v-if="entities[entityKey].reminders" class="current justify-content-start px-3">
			<b-col class="col-3 p-1" v-for="reminder, key in entities[entityKey].reminders" :key="key">
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
					<li v-for="reminder, key in premade" :key="key"
						class="d-flex justify-content-between"
					 	:class="'bg-'+reminder.color">
						<div>{{ reminder.title }}</div>
						<a class="green" v-b-tooltip.hover title="Set" @click="addReminder('premade', reminder)"><i class="fas fa-plus"></i></a>
					</li>
				</ul>
			</div>

			<div class="tab-pane fade" id="custom" role="tabpanel" aria-labelledby="custom-tab">
				<b-row class="mb-2">
					<b-col class="col-3">
						<label for="title">Title</label>
					</b-col>
					<b-col>
						<b-form-input type="text" 
						v-model="title"
						v-validate="'required'"
						name="title"
						id="title"
						placeholder="Title"></b-form-input>
						<p class="validate red" v-if="errors.has('title')">{{ errors.first('title') }}</p>
					</b-col>
				</b-row>
				<b-row class="mb-2">
					<b-col class="col-3">
						<label for="trigger">Trigger</label>
					</b-col>
					<b-col>
						<b-form-select type="text" 
						v-model="trigger"
						v-validate="'required'"
						id="trigger"
						name="trigger">
							<option>Select the trigger</option>
							<option v-for="trigger, key in triggers" :value="key">{{ trigger }}</option>
						</b-form-select>
						<p class="validate red" v-if="errors.has('trigger')">{{ errors.first('trigger') }}</p>
					</b-col>
				</b-row>
				<b-row v-if="trigger == 'rounds'">
					<b-col class="col-3">
						<label for="rounds">Rounds</label>
					</b-col>
					<b-col>
						<b-form-input id="rounds" type="number" 
							min="1"></b-form-input>
							<small>(A minute is 10 rounds)</small>
					</b-col>
				</b-row>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'TargetReminders',
		props: [
			'entityKey',
		],
		data() {
			return {
				triggers: {
					'constant': 'No trigger',
					'turn': 'Targets turn',
					'rounds': 'x amount of rounds',
					'damage': 'On damage',
				},
				actions: {
					'notify': 'Notify',
					'remove': 'Remove reminder',
				},
				title: undefined,
				trigger: undefined,
			}
		},
		firebase() {
			return {
				premade: db.ref(`reminders`),
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
					
					//Recreating the reminder without ['.key']
					//If ['.key'] is deleted if won't be there if you want to add it again...
					let setReminder = {
						title: reminder.title,
						trigger: reminder.trigger,
						notify: reminder.notify,
						color: reminder.color,
					}
					if(reminder.action) {
						setReminder.action = reminder.action
					}

					this.set_targetReminder({
						action: 'add',
						entity: this.entityKey,
						key: reminder['.key'],
						type: 'premade',
						reminder: setReminder
					})
				}
				else if(type == 'custom') {

				}
			},
			removeReminder(key) {
				this.set_targetReminder({
					action: 'remove',
					entity: this.entityKey,
					key: key,
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	ul.nav {
		a.nav-link {
			&.active {
				background: #302f2f !important;
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
	.tab-content {
		background: #302f2f !important;
		padding: 15px;
		
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
					background: #302f2f;
					padding: 5px 10px;
				}
			}
		}
	}
</style>
