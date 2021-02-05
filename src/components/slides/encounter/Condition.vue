<template>
	<div class="pb-5">
		<h2>
			<icon :icon="cond.value" class="icon" />
			{{ cond.name }}
		</h2>

		<span class="bg-gray-dark">
			<TargetItem  :item="entity.key" />
		</span>

		<hr>

		<a v-if="entity.conditions[cond.value]" 
			class="btn btn-block bg-red mb-3"
			@click="remove(cond.value)">
			Remove condition</a>

		<table v-if="cond.value === 'exhaustion'" class="table">
			<thead>
				<th>Current</th>
				<th>Effect</th>
			</thead>
			<tbody>
				<tr v-for="(effect, index) in effects" :key="index">
					<td><a :class="{'active': entity.conditions['exhaustion'] >= index + 1}" 
					@click="setExhausted(index + 1)">
					<span v-if="entity.conditions['exhaustion'] >= index + 1"><i class="fas fa-check"></i></span>
					<span v-else>{{ index + 1 }}</span>
					</a></td>
					<td :class="{'gray-hover': entity.conditions['exhaustion'] < index + 1}">{{ effect }}</td>
				</tr>
			</tbody>
		</table>
		<ul>
			<li v-for="(effect, index) in cond.effects" :key="index">
				{{ effect }}
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { conditions } from '@/mixins/conditions.js';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'Condition',
		mixins: [conditions],
		components: {
			TargetItem
		},
		props: [
		'data',
		],
		data() {
			return {
				entity: this.data.entity,
				condition: this.data.condition,
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
				// cond: {
				// 	source: db.ref(`conditions/${this.condition}`),
				// 	asObject: true
				// }
			}
		},
		computed: {
			cond() {
				return this.conditionList.filter(item => item.value === this.condition)[0];
			}
		},
		methods: {
			...mapActions([
				'set_condition',
			]),
			remove(condition) {
				this.set_condition({
					action: 'remove', 
					key: this.entity.key, 
					condition: condition
				});
			},
			setExhausted(level) {
				this.set_condition({
					action: 'add', 
					key: this.entity.key, 
					condition: 'exhaustion',
					level: level
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	ul {
		padding-left: 20px;

		&.exhaustion {
			list-style: none !important;
			padding-left: 5px;
		}

		li {
			margin-bottom: 10px;
		}
	}
	svg {
		width: 23px;
		height: 23px;
		color: $gray-light;
		fill: $gray-light;
	}
	.table {

		td {
			background:$gray-active;

			a {
				color: $gray-light !important;
				background: #494747;
				line-height: 30px;
				height: 30px;
				display: block;
				text-align: center;

				&.active {
					background: $gray-light;
					color:$gray-active !important;
				}
			}
		}
	}

</style>
