<template>
	<div>
		<ul class="entities">
			<template v-if="!loading">
				<li v-for="(notification, key) in _notifications" :key="key">
					<div>
						<div class="mb-2 gray-hover">{{ makeDate(notification.timestamp, true) }} </div>
						<div class="member_info">
							<span>{{ notification.attributes.full_name }}</span>
							<span>{{ notification.trigger }}</span>
						</div>

						<a @click="setShow(key)" class="mt-2">Details</a>
						<q-slide-transition>
							<ul v-show="show === key">
								<li><span>Entitled Amount:</span> <span>{{ notification.attributes.currently_entitled_amount_cents  / 100 | numeral('$0,0') }}</span></li>
								<li><span>Name:</span> <span>{{ notification.attributes.full_name }}</span></li>
								<li><span>Email:</span> <span>{{ notification.attributes.email }}</span></li>
								<li><span>Follower:</span> <span>{{ notification.attributes.is_follower }}</span></li>
								<li><span>Last charge:</span> <span>{{ makeDate(notification.attributes.last_charge_date, true) }}</span></li>
								<li><span>Last charge status:</span> <span>{{ notification.attributes.last_charge_status }}</span></li>
								<li><span>Lifetime support:</span> <span>{{ notification.attributes.lifetime_support_cents  / 100 | numeral('$0,0') }}</span></li>
								<li><span>Note:</span> <span>{{ notification.attributes.note }}</span></li>
								<li><span>Patron status:</span> <span>{{ notification.attributes.patron_status }}</span></li>
								<li><span>Pledge start:</span> <span>{{ makeDate(notification.attributes.pledge_relationship_start, true) }}</span></li>
								<li><span>Will pay:</span> <span>{{ notification.attributes.will_pay_amount_cents  / 100 | numeral('$0,0') }}</span></li>
								<li>
									<span>Tier:</span> 
									<span v-if="notification.relationships.currently_entitled_tiers">
										<div v-for="(tier, index) in notification.relationships.currently_entitled_tiers.data" :key="index">
											{{ tiers[tier.id].name }}
										</div>
									</span>
								</li>
							</ul>
						</q-slide-transition>

						<div v-if="notification.trigger === 'members:pledge:delete'" class="trigger bg-red white">
							Pledge deleted
						</div>
						<div v-if="notification.trigger === 'members:update' && notification.attributes.last_charge_status === 'Declined'" class="trigger red">
							Payment Declined
						</div>
						<div v-if="notification.trigger === 'members:pledge:create' && notification.attributes.currently_entitled_amount_cents > 0" class="trigger bg-green white">
							New Patron
						</div>
						<div 
							v-if="notification.attributes.will_pay_amount_cents > notification.attributes.currently_entitled_amount_cents && notification.attributes.last_charge_status !== 'Declined' && notification.attributes.currently_entitled_amount_cents !== 0" 
							class="trigger green"
						>
							Upgrade: <b>{{ notification.attributes.currently_entitled_amount_cents / 100 | numeral('$0,0')  }}</b> -> <b>{{ notification.attributes.will_pay_amount_cents  / 100 | numeral('$0,0') }}</b>
						</div>
						<div 
							v-if="notification.attributes.will_pay_amount_cents < notification.attributes.currently_entitled_amount_cents && notification.attributes.last_charge_status !== 'Declined' && notification.attributes.currently_entitled_amount_cents !== 0" 
							class="trigger orange"
						>
							Downgrade: <b>{{ notification.attributes.currently_entitled_amount_cents / 100 | numeral('$0,0')  }}</b> -> <b>{{ notification.attributes.will_pay_amount_cents  / 100 | numeral('$0,0') }}</b>
						</div>
					</div>
				</li>
			</template>
			<li v-else>
				<div class="loader"> <span>Loading patron....</span></div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import _ from 'lodash'
	import { general } from '@/mixins/general.js'

	export default {
		name: 'Notifications',
		mixins: [general],
		data() {
			return {
				loading: true,
				edit: false,
				results: 20,
				show: undefined
			}
		},
		firebase() {
			return {
				notifications: {
					source: db.ref(`patreon_data`).orderByChild('timestamp').limitToLast(this.results),
					readyCallback: () => this.loading = false
				},
				tiers: {
					source: db.ref('tiers'),
					asObject: true
				}
			}
		},
		computed: {
			_notifications: function() {

				return _.chain(this.notifications)
					.filter(function(notification, key) {
						notification.key = key
						return notification
					})
					.orderBy(function(notification){
						return notification.timestamp
					} , 'desc')
					.value()
			},
		},
		methods: {
			setShow(key) {
				this.show = (this.show === key) ? undefined : key;
			}
		}
	}
</script>

<style lang="scss" scoped>
	ul.entities {
		li {
			padding: 10px;
			
			.member_info {
				display: flex;
				justify-content: space-between;
			}
			.trigger {
				text-align: center;
				padding: 5px;
				margin-top: 10px;
			}

			ul {
				padding: 0;
				list-style: none;

				li {
					display: flex;
					justify-content: space-between;
				}
			}
		}
	}
</style>