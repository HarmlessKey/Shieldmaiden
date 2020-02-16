<template>
	<div>
		<b-card-group deck v-if="tier">
			<b-card :header="t.name" v-for="(t, key) in tiers" :key="key" :class="{ 'current': t.name == tier.name }">
				<h2>{{ t.price }}</h2>
				<i v-if="t.price == 'Free'" class="gray-hover sub">forever</i>
				<i v-else class="gray-hover sub">per month</i>
				<ul>
					<li v-for="(benefit, key) in t.benefits" :key="key">
						<template v-if="key == 'ads'">Ads are removed</template>
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
				<div slot="footer" v-if="t.price != 'Free'">
					<a :href="'https://www.patreon.com/join/harmlesskey/checkout?rid='+t['.key']" target="_blank" class="btn btn-block bg-patreon-red">Join {{ t.price }} tier</a>
				</div>
			</b-card>
		</b-card-group>
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
	.card {
			border: solid 1px transparent !important;
			background: #232323 !important;
				
			&.current {
				border-color: #e85b46 !important;
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
			.card-footer {
				padding: 0;
			}
		}
</style>