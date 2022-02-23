<template>
	<hk-card>
		<hk-loader v-if="loading" name="monster" />
		<template v-else>
			<div slot="header" class="card-header">
				<h1>
					{{ not_found ? "Monster not found" : monster.name.capitalizeEach() }}
				</h1>
				<div>
					<span class="neutral-3">
						{{ monster.source }}
					</span>
					<hk-share 
						v-if="!not_found" 
						:title="monster.name.capitalizeEach()" 
						:text="`${monster.name.capitalizeEach()} D&D 5e. ${monster.description}`" 
						size="sm"
						class="ml-1"
					/>
				</div>
			</div>
			<div v-if="not_found" class="card-body">
				<p>Could not find monster <b>{{ id }}</b></p>
				<router-link to="/compendium/monsters" class="btn bg-neutral-5">
					Find monsters
				</router-link>
			</div>
			<ViewMonster v-else :data="monster" />
		</template>
	</hk-card>
</template>

<script>
	import ViewMonster from '@/components/compendium/Monster.vue';
	import { mapActions } from 'vuex';

	export default {
		name: 'Monster',
		components: {
			ViewMonster,
		},
		data() {
			return {
				id: this.$route.params.id,
				monster: {},
				loading: true,
				not_found: false
			}
		},
		metaInfo() {
			return {
				title: `${this.monster.name ? this.monster.name.capitalizeEach() : "Monster"} D&D 5e`,
				meta: [
					{ 
						vmid: "description", 
						name: "description", 
						content: `D&D 5th Edition monster: ${ this.monster.name ? this.monster.name.capitalizeEach() : "Monster" }. ${this.monster.description}`
					},
					{
						vmid: "og-title",
						property: "og:title", 
						content: `D&D 5th Edition monster: ${ this.monster.name ? this.monster.name.capitalizeEach() : "Monster" }. ${this.monster.description}`
					},
					{ 
						vmid: "og-description", 
						property: "og:description",
						name: "description", 
						content: `D&D 5th Edition monster: ${ this.monster.name ? this.monster.name.capitalizeEach() : "Monster" }. ${this.monster.description}`
					},
					{ 
						vmid: "twitter-title",
						name: "twitter:title", 
						content: `${this.monster.name ? this.monster.name.capitalizeEach() : "Monster"} D&D 5e`
					},
					{ 
						vmid: "twitter-description", 
						name: "twitter:description",
						content: `D&D 5th Edition monster: ${ this.monster.name ? this.monster.name.capitalizeEach() : "Monster" }. ${this.monster.description}`
					},
				],
			}
		},
		methods: {
			...mapActions("api_monsters", ["get_monster"]),
		},
		async mounted() {
			await this.get_monster(this.id).then(result => {
				this.monster = result;
				this.$root.$emit('route-name', result.name.capitalizeEach());
				this.monster.description = result.type;
				this.monster.description += (result.subtype) ? ` ${result.subtype}, `: ", ";
				this.monster.description += `${result.alignment}. `;
				this.monster.description += `Challenge rating: ${result.challenge_rating}. `
				this.monster.description += `Armor class: ${result.armor_class}. Hit points: ${result.hit_points}. `;

				this.monster.description += result.walk_speed ? `Speed: ${result.walk_speed}ft.` : "Speed: 0ft.";
				if(result.swim_speed) this.monster.description += `, swim ${result.swim_speed}ft.`;
				if(result.fly_speed) this.monster.description += `, fly ${result.fly_speed}ft.`; 
				if(result.burrow_speed) this.monster.description += `, burrow ${result.burrow_speed}ft.`; 
				if(result.climb_speed) this.monster.description += `, climb ${result.climb_speed}ft.`;

				for(const ability of ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]) {
					this.monster.description += ` ${ability.substring(0, 3).toUpperCase()}: ${result[ability]}.`;
				}

				const maxLength = 160 - (result.name.length + 25);

				this.monster.description = this.monster.description.substring(0, maxLength).trim() + "...";

				this.loading = false;
			}).catch(() => {
				this.not_found = true;
				this.loading = false;
			});
		}
	}
</script>