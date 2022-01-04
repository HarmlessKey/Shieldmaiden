<template>
	<div>
		<q-file 
			:dark="$store.getters.theme === 'dark'" 
			filled square 
			accept=".json"
			v-model="json_file"
			@input="loadJSON()"
		>
			<template v-slot:prepend>
				<q-icon name="attach_file" />
			</template>
		</q-file>

		<h4 class="my-3">
			OR
		</h4>
		<ValidationObserver  v-slot="{ handleSubmit }">

			<q-form @submit="handleSubmit(parseJSON)">
				<ValidationProvider rules="json" name="JSON" v-slot="{ errors, invalid, validated}">
					<q-input
						:dark="$store.getters.theme === 'dark'" 
						filled square 
						type="textarea"
						label="JSON Input"
						v-model="json_input"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>

				</ValidationProvider>
				<q-btn class="btn btn-sm my-2" color="primary" no-caps type="submit" :disabled="!json_input">
					Parse Input
				</q-btn>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
export default {
	name: "ImportNPCs",
	data() { 
		return {
			npc: undefined,
			json_file: undefined,
			json_input: undefined,
		}
	},
	methods: {
		loadJSON() {
			const fr = new FileReader();

			fr.onload = e => {
				let result = JSON.parse(e.target.result)

				this.emit_npc(result);
			}

			fr.readAsText(this.json_file)
		},
		parseJSON() {
			try {
				const result = JSON.parse(this.json_input);

				this.emit_npc(result);
			}
			catch {
				console.log("Invalid JSON");
				this.$snotify.error("Invalid JSON");
			} 
		},
		emit_npc(result) {
			if (result instanceof Array) {
				for (const i in result) {
					delete result[i].key
				}
			}
			else {
				delete result.key
			}
			
			this.$emit("imported", result);
		}
	}
}
</script>

<style>

</style>