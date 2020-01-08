<template>
	<div class="content">
		<Crumble :name="name" />

		<component :is="component" :id="id" v-if="component" @name="setName" />

		<!-- GOOGLE ADS -->
		<div v-if="(tier && !tier.benefits.ads) || tier == undefined" align="center">
			<ins class="adsbygoogle"
				style="display:block; margin-bottom:20px;"
				data-ad-client="ca-pub-2711721977927243"
				data-ad-slot="4341848074"
				data-ad-format="auto"
				data-full-width-responsive="true">
			</ins>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'ViewCompendium',
		components: {
			Crumble
		},
		metaInfo() {
			return {
				title: this.name + ' | D&D 5th Edition',
				meta: [
					{ 
					vmid: 'description', 
					name: 'description', 
					content: 'D&D 5th Edition ' + this.type + ': ' + this.name }
				],
			}
		},
		data() {
			return {
				component: null,
				name: undefined,
				id: this.$route.params.id
			}
		},
		firebase() {
			return {
			}
		},
		computed: {
			...mapGetters([
				'tier',
			]),
			type() {
				let type = this.$route.params.type;
				if(type === 'conditions') { type = 'Condition'; }
				if(type === 'items') { type = 'Item'; }
				if(type === 'monsters') { type = 'Monster'; }
				if(type === 'spells') { type = 'Spell'; }

				return type;
			},
			loader() {
				if (!this.type) {
					return null;
				}
				return () => import(`@/components/compendium/${this.type}.vue`);
			}	
		},
		mounted() {
			this.$nextTick(function() {
				// eslint-disable-next-line
				if ($('ins').length > 0) {
					// eslint-disable-next-line
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
			this.loader()
				.then(() => {
					this.component = () => this.loader()
				})
				.catch(() => {
					this.component = () => import('@/components/slides/Error.vue')
				})
		},
		methods: {
			setName(name) {
				this.name = name;
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>