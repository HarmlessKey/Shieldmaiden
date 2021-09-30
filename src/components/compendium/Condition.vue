<template>
	<tag :is="cardView ? 'hk-card' : 'div'">
		<div slot="header" :class="{ 'card-header': cardView }">
			<h1>
				<svg class="icon" viewBox="0 0 512 512">
					<path :d="condition.icon" fill-opacity="1"></path>
				</svg>
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
	import { db } from '@/firebase';

	export default {
		name: 'Condition',
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
		firebase() {
			return {
				condition: {
					source: db.ref(`conditions/${this.id}`),
					asObject: true,
					readyCallback: () => this.$emit('name', this.condition.name),
				}
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