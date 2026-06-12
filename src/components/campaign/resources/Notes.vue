<template>
	<div>
		<button class="btn btn-block bg-neutral-5 mb-2" @click="note_dialog = !note_dialog">
			<i class="fas fa-plus green" aria-hidden="true" />
			Add note
		</button>

		<q-list :dark="$store.getters.theme === 'dark'" class="accordion">
			<q-expansion-item
				v-for="(note, key) in notes"
				:dark="$store.getters.theme === 'dark'"
				switch-toggle-side
				group="notes"
				name="notes"
				enter-active-class="animated animate__fadeIn"
				leave-active-class="animated animate__fadeOut"
				:key="key"
			>
				<template #header>
					<q-item-section>{{ note.title }}</q-item-section>
					<q-item-section avatar>
						<button @click.stop="deleteNote(key)" class="btn btn-sm bg-neutral-5">
							<i aria-hidden="true" class="fas fa-trash-alt red" />
						</button>
					</q-item-section>
				</template>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					v-model="note.description"
					type="textarea"
					@blur="updateNote($event, key)"
				/>
			</q-expansion-item>
		</q-list>

		<q-dialog v-model="note_dialog">
			<div>
				<ValidationObserver v-slot="{ handleSubmit, valid }">
					<q-form @submit="handleSubmit(addNote)" greedy>
						<hk-card header="New note" class="mb-0" :min-width="300">
							<div class="card-body">
								<ValidationProvider
									rules="max:100|required"
									name="Title"
									v-slot="{ errors, invalid, validated }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										label="Title"
										autocomplete="off"
										v-model="new_note.title"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
								<ValidationProvider
									rules="max:1000|required"
									name="Note"
									v-slot="{ errors, invalid, validated }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										label="Note"
										autocomplete="off"
										type="textarea"
										v-model="new_note.description"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
							<div slot="footer" class="card-footer d-flex justify-content-end">
								<q-btn v-close-popup class="mr-1" no-caps>Cancel</q-btn>
								<q-btn color="primary" type="submit" no-caps label="Add note" :disabled="!valid" />
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "CampaignNotes",
	data() {
		return {
			campaignId: this.$route.params.campid,
			note_dialog: false,
			new_note: {},
		};
	},
	computed: {
		...mapGetters("campaigns", ["get_notes"]),
		notes() {
			return this.get_notes(this.campaignId);
		},
	},
	async mounted() {
		await this.get_campaign_notes(this.campaignId);
		this.loading_active = false;
	},
	methods: {
		...mapActions("campaigns", ["get_campaign_notes", "add_note", "delete_note", "update_note"]),
		addNote() {
			this.add_note({
				campaignId: this.campaignId,
				note: this.new_note,
			});
			this.new_note = {};
			this.note_dialog = false;
		},
		deleteNote(key) {
			this.delete_note({ campaignId: this.campaignId, key });
		},
		updateNote(e, id) {
			this.update_note({ campaignId: this.campaignId, id, note: { description: e.target.value } });
		},
	},
};
</script>
