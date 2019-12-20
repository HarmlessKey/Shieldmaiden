<template>
	<div>
		<h2>{{ item.public_name }}</h2>
		<h3>Link item</h3>
		<div class="input-group mb-3">
            <input type="text" autocomplete="off" v-model="searched" @keyup="searchItems()" placeholder="Search" class="form-control"/>
            <div class="input-group-append">
                <button class="btn" @click="searchItems()"><i class="fas fa-search"></i></button>
            </div>
        </div>
        <div v-if="searched !== undefined && searched !== ''" class="green result-count" :class="{'red': Object.keys(foundItems).length === 0}">{{ Object.keys(foundItems).length }} results for {{ searched }}</div>

		<div v-if="foundItems" class="items">
			<template v-for="item in foundItems">
				<div class="name" :key="`name-${item['.key']}`">
					{{ item.name }}
				</div>
				<div class="link" :key="`link-${item['.key']}`">
					<a @click="linkItem(item.custom, item['.key'])"><i class="fas fa-link"></i></a>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions } from 'vuex'

	export default {
		name: 'EditNpc',
		props: [
		'data'
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				search: ["name"],
                searched: undefined,
                foundItems: []
			}
		},
		firebase() {
			return {
                item: {
					source: db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/loot/${this.data.key}`),
					asObject: true
				},
				items: db.ref(`items`)
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			searchItems() {
				const vm = this;
				let searchTerm = this.searched.toLowerCase();
				
				let results = this.items.filter( function(row) {
					for (let i in vm.search) {
                        let key = vm.search[i];
						// If field is undefined don't return row
						if (row[key] == undefined) {
							return
						}
						if (row[key].toLowerCase().includes(searchTerm)){
							return row;
						}
					}
				});
				this.foundItems = results;
			},
			linkItem(custom, key) {
				custom = (custom === true) ? true : false;
				
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/loot/${this.data.key}/linked_item`).set({
					key,
					custom
				});
				this.setSlide(false);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.items {
		display: grid;
		grid-template-columns: auto min-content;
		grid-auto-rows: minmax(46px auto);
		row-gap: 1px;
		margin-top: 20px;

		div {
			background-color: #191919;
			padding: 10px;
		}

		.name {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
