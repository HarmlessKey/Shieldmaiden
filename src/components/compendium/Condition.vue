<template>
	<tag :is="cardView ? 'hk-card' : 'div'">
		<div slot="header" :class="{ 'card-header': cardView }">
			<h1>
				<i :class="`hki-${condition.value}`" />
				{{ condition.name }}
			</h1>
		</div>
		<div :class="{ 'card-body': cardView }">
			<i>{{ condition.condition }}</i>

			<ul v-if="condition.effects">
				<li v-for="(effect, index) in condition.effects" :key="index">
					{{ effect }}
				</li>
			</ul>

			<!-- EXHAUSTION -->
			<table v-if="condition['.key'] == 'exhaustion'" class="table">
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
	</tag>
</template>

<script>
	import { conditions } from '@/mixins/conditions.js';

	export default {
		name: 'Condition',
		mixins: [conditions],
		props: {
			id: {
				type: String,
				required: true
			},
			cardView: {
				type: Boolean,
				default: false
			}
		},
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
				return this.conditionList.filter(item => {
					return item.value === this.id;
				})[0];
			}
		},
		beforeMount() {
			if(this.$route.name === 'Condition') {
				this.$root.$emit('route-name', this.condition.name);
			}
		}
	}
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