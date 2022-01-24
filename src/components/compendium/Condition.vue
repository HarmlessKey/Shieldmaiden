<template>
	<div>
		<i>{{ condition.condition }}</i>

		<ul v-if="condition.effects">
			<li v-for="(effect, index) in condition.effects" :key="index">
				{{ effect }}
			</li>
		</ul>

		<!-- EXHAUSTION -->
		<table v-if="condition.value == 'exhaustion'" class="table">
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

	export default {
		name: 'Condition',
		props: [
			'data'
		],
		data() {
			return {
				condition: this.data,
				effects: [
					"Disadvantage on ability checks",
					"Speed halved",
					"Disadvantage on attack rolls and saving throws",
					"Hit point maximum halved",
					"Speed reduced to 0",
					"Death",
				]
			}
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
