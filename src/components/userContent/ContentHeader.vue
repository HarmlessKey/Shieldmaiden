<template>
	<div class="card-header">
		<div>
			{{ type.capitalize() }} ( 
			<span :class=" 
				content_count[type] > tier.benefits[type] ? 'red' :
				content_count[type] == tier.benefits[type] ? 'neutral-2' : 'green'
			">{{ content_count[type] }}</span> 
				/ 
				<i v-if="tier.benefits[type] == 'infinite'" class="far fa-infinity"></i> 
				<template v-else>{{ tier.benefits[type] }}</template>	
				)
		</div>
		<div>
			<slot name="actions-left" />
			<template v-if="tier.benefits[type] === 'infinite' || (!overencumbered && content_count[type] < tier.benefits[type])">
				<slot name="actions-right" />
				<router-link
					class="btn btn-sm bg-neutral-5" 
					:to="`${$route.path}/add-${type.slice(0, -1)}`"
				>
					<i class="fas fa-plus green"></i> New {{ type.slice(0, -1).capitalize() }}
				</router-link>
			</template>
			<router-link v-else-if="overencumbered" class="btn btn-sm ml-1" to="/content/manage">
				<i class="fas fa-box-full red mr-1"/>
				Over encumbered
			</router-link>
			<router-link v-else class="btn btn-sm ml-1" to="/patreon">
				<i class="fab fa-patreon patreon-red mr-1"/>
				Get more slots
			</router-link>
		</div>
	</div>
</template>

<script>
	import { mapGetters } from "vuex";

	export default {
		name: "ContentHeader",
		props: {
			type: {
				type: String,
				required: true
			}
		},
		computed: {
			...mapGetters([
				"user",
				"tier",
				"content_count",
				"overencumbered"
			]),
		}
	}
</script>