<template>
	<div>
		<template v-if="!parsed">
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
		</template>
		<div v-else>
			<p>Found <span class="green">{{ Object.keys(unique_npcs).length }} new</span> npcs</p>
			<p>Found <span class="orange">{{ Object.keys(duplicate_npcs).length }} duplicate</span> npcs</p>
			<q-form @submit="import_npcs">
				<q-btn class="btn btn-sm my-2" color="primary" no-caps type="submit">
					Import NPCs
				</q-btn>
				<q-toggle 
					v-model="overwrite" 
					color="warning" 
					label="Overwrite duplicates" 
					checked-icon="fas fa-exclamation-circle"
					unchecked-icon="none"
				/>
			</q-form>
		</div>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { db } from "../firebase";

export default {
	name: "ImportNPCs",
	data() { 
		return {
			json_file: undefined,
			json_input: undefined,
			overwrite: false,
			parsed: false,
			unique_npcs: {},
			duplicate_npcs: {},
			uid: this.$store.getters.user.uid
		}
	},
	methods: {
		...mapActions("npcs", ["get_full_npcs", "add_npc", "edit_npc"]),
		loadJSON() {
			const fr = new FileReader();

			fr.onload = e => {
				let result = JSON.parse(e.target.result)
				this.parse(result);
			}

			fr.readAsText(this.json_file)
		},
		parseJSON() {
			try {
				const result = JSON.parse(this.json_input);
				console.log('result',result)
				this.parse(result);
			}
			catch {
				console.log("Invalid JSON");
				this.$snotify.error("Invalid JSON");
			} 
		},

		async parse(npcs) {
			this.parsed = true;
			if (!(npcs instanceof Array)) {
				npcs = [npcs];
			}

			// const existing_npcs = await this.get_full_npcs();

			for (const npc of npcs) {
				const hk_key = npc.harmless_key;

				let existing = db.ref(`npcs/${this.uid}`).orderByChild('harmless_key').equalTo(hk_key);
				const exists = await existing.once('value')

				if (exists.val() === null) {
					this.$set(this.unique_npcs, hk_key, npc)
				}
				else {
					this.$set(this.duplicate_npcs, hk_key, npc)
				}
			}
		},
		async import_npcs() {
			
			for (const npc of Object.values(this.unique_npcs)) {
				this.add_npc(npc);
			}

			if (this.overwrite) {
				console.log(this.overwrite)
				for (const npc of Object.values(this.duplicate_npcs)) {
					let existing = db.ref(`npcs/${this.uid}`).orderByChild('name').equalTo(npc.name);
					const exists = await existing.once('value')
					console.log(exists.val(), npc)
					// this.edit_npc(npc, key);
				}
			}
			const added = !this.overwrite ? Object.keys(this.unique_npcs).length : Object.keys(this.unique_npcs).length + Object.keys(this.duplicate_npcs).length
			if (added > 0) {
				const added = Object.keys(this.unique_npcs).length
				this.$snotify.success(`Imported ${added} Monster${added>1?'s':''}`, 'Critical hit!', {position: "rightTop"});
			}

			// Close import dialog
			this.$emit('input', false);
		}
	}
}
</script>

<style>

</style>