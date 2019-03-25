<template>
	<div>
		<template v-if="$route.meta.basePath != '/compendium'">
			<small class="url">url: <a :href="'https://harmlesskey.com/compendium/monsters/'+id" target="_blank">https://harmlesskey.com/compendium/monsters/{{ id }}</a></small>
			<ins class="adsbygoogle"
				style="display:inline-block;width:285px;height:100px"
				data-ad-client="ca-pub-2711721977927243"
				data-ad-slot="5263800080">
			</ins>
		</template>
		<template v-else>
			<Crumble :name="monster.name"/>
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

		<div v-if="loading" class="loader"> <span>Loading monster....</span></div>

		<h1 class="d-none">{{ monster.name }}</h1>
		<ViewEntity :entity="monster" />
	</div>
</template>

<script>
	import { db } from '@/firebase'

	import ViewEntity from '@/components/ViewEntity.vue';
	import Crumble from '@/components/crumble/Compendium.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'Monster',
		components: {
			Crumble,
			ViewEntity,
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.monster.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Monster: ' + this.monster.name }
        ]
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
		firebase() {
			return {
				monster: {
					source: db.ref(`monsters/${this.id}`),
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
	.url {
		display: block;
		margin-bottom: 15px;
		word-break: break-all;
	}
</style>