<template>
	<div>
		<hk-card-deck v-if="tier">
			<hk-card :header="t.name" v-for="(t, key) in tiers" :key="key" :class="{ 'current': t.name == tier.name }">
				<div class="card-body">
					<h2>{{ t.price }}</h2>
					<i v-if="t.price == 'Free'" class="neutral-3 sub">forever</i>
					<i v-else class="neutral-3 sub">per month</i>
					<ul>
						<li v-for="(benefit, key) in t.benefits" :key="key">
							<template v-if="key == 'campaigns'">
								<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
								<span v-else class="green">{{ benefit }}</span> Campaign slots
							</template>
							<template v-if="key == 'encounters'">
								<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
								<span v-else class="green">{{ benefit }}</span> Encounter slots
							</template>
							<template v-if="key == 'players'">
								<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
								<span v-else class="green">{{ benefit }}</span> Player slots
							</template>
							<template v-if="key == 'npcs'">
								<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
								<span v-else class="green">{{ benefit }}</span> NPC slots
							</template>
							<template v-if="key == 'items'">
								<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
								<span v-else class="green">{{ benefit }}</span> Item slots
							</template>
							<template v-if="key == 'reminders'">
								<i v-if="benefit == 'infinite'" class="green far fa-infinity"></i>
								<span v-else class="green">{{ benefit }}</span> Reminder slots
							</template>
						</li>
					</ul>
				</div>
				<div slot="footer" v-if="t.price != 'Free'">
					<a :href="'https://www.patreon.com/join/harmlesskey/checkout?rid='+t['.key']" target="_blank" rel="noopener" class="btn btn-block btn-square bg-patreon-red">Join {{ t.price }} tier</a>
				</div>
			</hk-card>
		</hk-card-deck>
		<div v-else class="loader"><span>Loading Tiers...</span></div>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'	

	export default {
		data() {
			return {

			}
		},
		firebase() {
			return {
				tiers: db.ref('tiers').orderByChild('order'),
			}
		},
		computed: {
			...mapGetters([
				'tier',
			]),
		},
		methods: {

		}
	};
</script>

<style lang="scss" scoped>
	.hk-card {				
			&.current {
				border-color: $patreon-red !important;
			}
			h2 {
				margin-bottom: 0 !important;
			}
			i.sub {
				display: block;
				margin-bottom: 15px;
			}
			ul {
				list-style: none;
				padding: 0;
			}
		}
</style>