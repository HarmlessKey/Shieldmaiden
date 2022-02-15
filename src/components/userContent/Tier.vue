<template>
	<ul class="benefits">
		<li v-for="type in content_types" :key="type">
			<i v-if="tier.benefits[type] === 'infinite'" class="green far fa-infinity count"/>
			<span 
				v-else
				class="count"
				:class="
					content_count[type] > tier.benefits[type] ? 'red' :
					content_count[type] === tier.benefits[type] ? 'neutral-2' : 'green'
			">
				{{ tier.benefits[type] }}
			</span>
			<span class="truncate neutral-4">
				<span class="neutral-1">
					{{ type.slice(0, -1).capitalize() }} slot{{ (tier.benefits[type] > 1 || tier.benefits[type] === "infinite") ? "s" : "" }}
				</span>
				<span v-if="type === 'encounters'" class="neutral-4">
					(per campaign)
				</span>
			</span>
		</li>
	</ul>
</template>

<script>
	import { mapGetters } from "vuex";

	export default {
		name: "Tier",
		data() {
			return {
				content_types: [ 
					"campaigns",
					"encounters",
					"players",
					"npcs",
					"reminders",
					"items"
				]
			}
		},
		computed: {
			...mapGetters([
				"tier",
				"content_count"
			])
		}
	}
</script>

<style lang="scss" scoped>
	ul.benefits {
		padding: 0;
		list-style: none;
		margin: 0;

		li {
			display: grid;
			grid-template-columns: 30px 1fr;
			line-height: 35px;
			align-items: center;
			font-size: 15px;
			padding: 0 5px 0 15px;
			color: $neutral-1;
			background-color: $neutral-9;
			margin-bottom: 1px;
		}
	}
</style>