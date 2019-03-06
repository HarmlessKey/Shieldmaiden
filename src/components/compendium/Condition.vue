<template>
	<div>
		<small v-if="$route.meta.basePath != '/compendium'" class="url">url: <a :href="'https://harmlesskey.com/compendium/conditions/'+id" target="_blank">https://harmlesskey.com/compendium/conditions/{{ id }}</a></small>
		<Crumble v-else :name="condition.name" />

		<div v-if="loading" class="loader"> <span>Loading condition....</span></div>

		<h1>{{ condition.name }}</h1>
		<i>{{ condition.condition }}</i>

		<ul :class="condition['.key']">
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
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Condition',
		components: {
			Crumble
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.condition.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Condition: ' + this.condition.name }
        ],
			}
		},
		beforeMount() {
			//Because the component is loaded in another view, 
			//the scroll needs to be reset to 0
			window.scrollTo(0,0);
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
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
		}
	}
</script>

<style lang="scss" scoped>
	h1 {
		margin-bottom: 5px !important;
	}
	.url {
		display: block;
		margin-bottom: 15px;
		word-break: break-all;
	}
	ul {
		margin-top: 20px;
		padding: 20px;

		li {
			margin-bottom: 20px;
		}

		&.exhaustion {
			list-style: none;
			padding: 0;
		}
	}
</style>