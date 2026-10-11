<template>
	<hk-card header="">
		<div class="card-header" slot="header">
			<h1>Compendium D&D 5e and 5.5e</h1>
		</div>
		<div class="card-body">
			<ul class="entities">
				<li v-for="(item, index) in items" :key="index">
					<i aria-hidden="true" class="icon neutral-2 mr-2" :class="item.icon" />
					<span class="flex-grow">
						{{ item.name }}
					</span>
					<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${item.url}`"
						>5e</router-link
					>
					<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${item.url}/5.5e`"
						>5.5e</router-link
					>
				</li>
			</ul>
		</div>
	</hk-card>
</template>

<script>
export default {
	name: "CompendiumOverview",
	data() {
		return {
			items: {
				conditions: {
					name: "Conditions",
					url: "conditions",
					icon: "fas fa-flame",
				},
				items: {
					name: "Items",
					url: "items",
					icon: "fas fa-treasure-chest",
				},
				monsters: {
					name: "Monsters",
					url: "monsters",
					icon: "fas fa-dragon",
				},
				spells: {
					name: "Spells",
					url: "spells",
					icon: "fas fa-wand-magic",
				},
				rules: {
					name: "Rules",
					url: "rules",
					icon: "fas fa-book",
				},
			},
		};
	},
};
</script>

<style lang="scss" scoped>
ul.entities {
	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 5px;
		padding: 0 15px;

		.icon {
			border: none;
			background: none;
			text-align: center;
			font-size: 20px;
			line-height: 48px;
			width: 35px;
		}
	}
}
</style>
