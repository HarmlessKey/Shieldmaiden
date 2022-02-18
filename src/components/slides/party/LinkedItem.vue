<template>
	<div v-if="!loading">
		<div class="linked-item">
			<slot />
			<div @click="showItem = !showItem" class="title">
				{{ item.name }}
				<i class="fas fa-chevron-down" :class="{ collapsed: showItem }" />
			</div>
		</div>
		<q-slide-transition>
			<div v-show="showItem" class="full-item">
				<ViewItem :data="item"/>
			</div>
		</q-slide-transition>
	</div>
	<div v-else class="loader">Loading linked item</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import ViewItem from '@/components/compendium/Item.vue';

	export default {
		name: 'LinkedItemCampaign',
		components: {
			ViewItem
		},
		props: {
			linkedItem: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				user: this.$store.getters.user,
				loading: true,
				item: {},
				showItem: false,
			}
		},
		async mounted() {
			this.item = await this.getItem(this.linkedItem.key, this.linkedItem.custom);
			this.loading = false;
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("items", ["get_item"]),
			...mapActions("api_items", ["get_api_item"]),
			async getItem(id, custom) {
				let item;
				if(custom) {
					item = await this.get_item({ uid: this.user.uid, id });
				} else {
					item = await this.get_api_item(id);
				}
				return item;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.linked-item {
		display: flex;
		justify-content: flex-start;

		.title {
			line-height: 31px;
			width: 100%;
			display: flex;
			justify-content: space-between;
			cursor: pointer;

			.fa-chevron-down {
				line-height: 31px;
				transition: all .2s linear;

				&.collapsed {
					transform: rotate(180deg);
				}
			}
		}
	}
	.full-item {
		background-color: $neutral-6;
		padding: 5px;
		margin-top: 10px;
	}
</style>