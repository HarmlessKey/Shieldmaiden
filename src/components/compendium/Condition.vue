<template>
	<div>
		<template v-if="$route.meta.basePath != '/compendium'">
			<small class="url">url: <a :href="'https://harmlesskey.com/compendium/conditions/'+id" target="_blank">https://harmlesskey.com/compendium/conditions/{{ id }}</a></small>
			<ins class="adsbygoogle"
				v-if="!tier.benefits.ads"
				style="display:inline-block;width:285px;height:100px"
				data-ad-client="ca-pub-2711721977927243"
				data-ad-slot="5263800080">
			</ins>
		</template>
		<template v-else>
			<Crumble :name="condition.name" />
			<div v-if="!tier.benefits.ads" align="center">
				<ins class="adsbygoogle"
						style="display:block; margin-bottom:20px;"
						data-ad-client="ca-pub-2711721977927243"
						data-ad-slot="4341848074"
						data-ad-format="auto"
						data-full-width-responsive="true">
				</ins>
			</div>
		</template>

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
	import { mapGetters } from 'vuex'

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
		computed: {
			...mapGetters([
				'tier',
			]),
		},
		mounted() {
			this.$nextTick(function() {
				if ($('ins').length > 0) {
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
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