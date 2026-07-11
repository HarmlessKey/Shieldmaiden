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
				<tr v-for="(effect, index) in exhaustionLevels" :key="index">
					<td>{{ index + 1 }}</td>
					<td>{{ effect }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import { mapActions } from "vuex";
	import { EXHAUSTION_LEVELS } from "src/utils/generalConstants.js";

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
			}
		},
		computed: {
			edition() {
				return this.$route.params.edition === "5.5e" ? "5.5e" : "5e";
			},
			exhaustionLevels() {
				return EXHAUSTION_LEVELS[this.edition];
			},
		},
		async beforeMount() {
			if(this.data) {
				this.condition = this.data;
				this.loading = false;
			} else {
				this.condition = await this.fetch_condition({ id: this.id, edition: this.edition });
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
