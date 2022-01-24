<template>
	<tag :is="cardView ? 'hk-card' : 'div'">
		<div v-if="loading" :class="{ 'card-body': cardView }">
			<hk-loader />
		</div>
		<template v-else>
			<div slot="header" :class="{ 'card-header': cardView }">
				<h1 v-if="monster.name">
					{{ monster.name.capitalizeEach() }}
				</h1>
				<span class="neutral-3">
					{{ monster.source }}
				</span>
			</div>
			<ViewMonster :data="monster" />
		</template>
	</tag>
</template>

<script>
	import ViewMonster from '@/components/ViewMonster.vue';
	import { mapActions } from 'vuex';

	export default {
		name: 'Monster',
		components: {
			ViewMonster,
		},
		data() {
			return {
				monster: {},
				loading: true
			}
		},
		metaInfo() {
			return {
				title: `${this.monster.name ? this.monster.name.capitalizeEach() : "Monster"} | D&D 5e`,
			}
		},
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
		methods: {
			...mapActions("api_monsters", ["get_monster"]),
		},
		mounted() {
			this.get_monster(this.id).then(result => {
				this.monster = result;
				this.$root.$emit('route-name', result.name.capitalizeEach());
				this.loading = false;
			});
		}
	}
</script>