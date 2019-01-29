<template>
	<div class="pb-5">
		<h2>
			<svg :title="cond['.key']" 
				class="icon text" 
				xmlns="https://www.w3.org/2000/svg"
				viewBox="0 0 512 512">
					<path :d="cond.icon" fill-opacity="1"></path>
			</svg>
			 {{ cond['.key'] }}
		</h2>

		<a v-if="entity.conditions[cond['.key']]" 
			class="btn btn-block bg-red mb-3"
			@click="remove(cond['.key'])">
			Remove condition</a>

		<table v-if="cond['.key'] == 'exhaustion'" class="table">
			<thead>
				<th>Current</th>
				<th>Effect</th>
			</thead>
			<tbody>
				<tr v-for="effect, index in effects" :key="index">
					<td><a :class="{'active': entity.conditions['exhaustion'] == index + 1}" @click="setExhausted(index + 1)">{{ index + 1 }}</a></td>
					<td>{{ effect }}</td>
				</tr>
			</tbody>
		</table>

		<ul :class="cond['.key']">
			<li v-for="effect in cond.effects">
				{{ effect }}
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Condition',
		props: [
		'entity',
		'condition',
		],
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
		firebase() {
			return {
				cond: {
					source: db.ref(`conditions/${this.condition}`),
					asObject: true
				}
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
		color: #b2b2b2;
		fill: #b2b2b2;
	}
	.table {

		td {
			background: #302f2f;

			a {
				color: #b2b2b2 !important;
				background: #494747;
				line-height: 30px;
				height: 30px;
				display: block;
				text-align: center;

				&.active {
					background: #b2b2b2;
					color: #302f2f !important;
				}
			}
		}
	}

</style>
