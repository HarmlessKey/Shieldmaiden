<template>
	<tag :is="cardView ? 'hk-card' : 'div'" v-if="monster">
		<div slot="header" :class="{ 'card-header': cardView }">
			<h1>
				{{ monster.name.capitalizeEach() }}
			</h1>
			<span class="neutral-3">
				{{ monster.source }}
			</span>
		</div>
		<ViewMonster :data="monster" />
	</tag>
</template>

<script>
	import { db } from '@/firebase'
	import ViewMonster from '@/components/ViewMonster.vue';

	export default {
		name: 'Monster',
		components: {
			ViewMonster,
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
		firebase() {
			return {
				monster: {
					source: db.ref(`monsters/${this.id}`),
					asObject: true,
					readyCallback: () => {
						this.$root.$emit('route-name', this.monster.name.capitalizeEach())
					}
				}
			}
		}
	}
</script>