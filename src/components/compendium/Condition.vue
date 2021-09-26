<template>
	<div>
		<h3>
			<i :class="`hki-${condition.value}`" />
			{{ condition.name }}
		</h3>
		<i>{{ condition.condition }}</i>

		<ul v-if="condition.effects">
			<li v-for="(effect, index) in condition.effects" :key="index">
				{{ effect }}
			</li>
		</ul>

		<!-- EXHAUSTION -->
		<table v-if="condition.value === 'exhaustion'" class="table">
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
	import { conditions } from '@/mixins/conditions.js';

	export default {
		name: 'Condition',
		props: ['id'],
		mixins: [conditions],
		data() {
			return {
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
		computed: {
			condition() {
				return this.conditionList.filter(item => item.value === this.id)[0];
			}
		}
	}
</script>

<style lang="scss" scoped>
	svg.icon {
		width: 20px;
		height: 20px;
		margin-right: 5px;
		fill: $gray-light;
	}
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