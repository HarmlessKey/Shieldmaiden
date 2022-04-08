<template>
	<div>
		<i>{{ condition.condition }}</i>

		<ul v-if="condition.effects">
			<li v-for="(effect, index) in condition.effects" :key="index">
				{{ effect }}
			</li>
		</ul>

		<!-- EXHAUSTION -->
		<table v-if="condition.name == 'Exhaustion'" class="table">
			<thead>
				<th>Level</th>
				<th>Effect</th>
			</thead>
			<tbody>
				<tr v-for="(effect, index) in effects" :key="index">
					<td>{{ index + 1 }}</td>
					<td>{{ effect }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import { mapActions } from "vuex";

	export default {
		name: "Condition",
		props: {
			// If the condition is fetched in a parent component you can send the full condition object in de data prop
			data: {
				type: Object
			},
			// If the id prop is passed, the condition is fetched in the Condition component
			id: {
				type: String
			}
		},
		data() {
			return {
				condition: {},
				loading: true,
				effects: [
					"Disadvantage on ability checks",
					"Speed halved",
					"Disadvantage on attack rolls and saving throws",
					"Hit point maximum halved",
					"Speed reduced to 0",
					"Death",
				]
			}
		},
		async beforeMount() {
			if(this.data) {
				this.condition = this.data;		
				this.loading = false;
			} else {
				this.condition = await this.fetch_condition(this.id);
				this.loading = false;
			}			
		},
		methods: {
			...mapActions("api_conditions", ["fetch_condition"]),
		}
	};
</script>

<style lang="scss" scoped>
	ul {
		margin-top: 20px;
		padding-left: 20px;

		li {
			margin-bottom: 20px;
		}

		&.exhaustion {
			list-style: none;
			padding: 0;
		}
	}
</style>
