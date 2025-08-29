<template>
	<hk-card header="">
		<div class="card-header" slot="header">
			<h1>Compendium D&D 5e</h1>
			<span class="neutral-3">
				Resource
				<a
					class="btn btn-sm btn-clear"
					href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
					target="_blank"
					rel="noopener"
					>SRD 5.1</a
				>
			</span>
		</div>
		<div class="card-body">
			<ul class="entities hasImg">
				<li v-for="(item, index) in items" :key="index">
					<i aria-hidden="true" class="icon neutral-2 mr-2" :class="item.icon" />
					<router-link :to="$route.path + '/' + item.url">{{ item.name }}</router-link>
				</li>
			</ul>

			<h3>Homebrew content by Shieldmaiden</h3>
			<ul class="entities hasImg">
				<li>
					<i class="fas fa-beer icon neutral-2 mr-2" aria-hidden="true" />
					<router-link to="/homebrew">Homebrew monsters</router-link>
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
		.icon {
			border: none;
			background: none;
			text-align: center;
			font-size: 20px;
			line-height: 48px;
		}
	}
}
</style>
