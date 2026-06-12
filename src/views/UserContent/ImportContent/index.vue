<template>
	<hk-card header="Import content">
		<div class="card-body">
			<div v-if="tier.price !== 'Free'">
				<ImportUserContent ref="import" :json-input="json_input">
					<button class="btn bg-accent" @click="ai_dialog = !ai_dialog">Generate</button>
				</ImportUserContent>
			</div>
			<template v-else>
				<div class="card-body d-flex flex-col justify-center text-center">
					<h2>With a subscription you can import Shieldmaiden content created by others.</h2>
					<p>
						Content creators can export their entire one shots or campaigns from Shieldmaiden and
						you will be able to import them including all encounters and monsters.
					</p>
					<router-link to="/pricing" class="btn btn-lg mt-2">Get a subscription</router-link>
				</div>
			</template>
		</div>
		<hk-dialog v-model="ai_dialog" header="Generate" no-padding position="top">
			<GenerateMonster @finished="setMonster" />
		</hk-dialog>
	</hk-card>
</template>

<script>
import { mapGetters } from "vuex";
import ImportUserContent from "src/components/userContent/ImportUserContent.vue";
import GenerateMonster from "src/components/npcs/GenerateMonster.vue";

export default {
	name: "import-content",
	components: {
		ImportUserContent,
		GenerateMonster,
	},
	computed: {
		...mapGetters(["tier", "ai"]),
	},
	data() {
		return {
			ai_dialog: false,
			json_input: undefined,
		};
	},
	methods: {
		setMonster(monster) {
			this.json_input = monster;
			this.ai_dialog = false;
			this.$refs.import.parseJSON(JSON.stringify(monster, null, 2));
		},
	},
};
</script>
