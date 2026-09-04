<template>
	<ValidationObserver ref="observer" v-slot="{ handleSubmit, valid }">
		<hk-dialog ref="dialog" persistent position="top" header="Report an issue" class="mt-3">
			<p>
				Found a mistake in <strong>{{ contentName }}</strong
				>?<br />Let us know what's wrong and we'll take a look.
			</p>
			<ValidationProvider rules="required|max:1000" name="Issue" v-slot="{ errors, invalid, validated }">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="What's wrong?"
					autocomplete="off"
					type="textarea"
					v-model="issue"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
			<div slot="footer" class="card-footer d-flex justify-content-end full-width">
				<q-btn v-close-popup class="mr-1" no-caps>Cancel</q-btn>
				<q-btn
					color="primary"
					no-caps
					label="Submit report"
					:disabled="!valid || submitting"
					@click="handleSubmit(submit)"
				/>
			</div>
		</hk-dialog>
	</ValidationObserver>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "ReportIssueDialog",
	props: {
		// "spell" | "monster" | "item"
		type: {
			type: String,
			required: true,
		},
		contentId: {
			type: String,
			required: true,
		},
		contentName: {
			type: String,
		},
		contentUrl: {
			type: String,
		},
		edition: {
			type: String,
		},
	},
	data() {
		return {
			issue: "",
			submitting: false,
		};
	},
	methods: {
		...mapActions("content_reports", ["add_report"]),
		show() {
			this.issue = "";
			this.$refs.observer.reset();
			this.$refs.dialog.show();
		},
		hide() {
			this.$refs.dialog.hide();
		},
		async submit() {
			this.submitting = true;
			try {
				await this.add_report({
					type: this.type,
					content_id: this.contentId,
					content_name: this.contentName,
					content_url: this.contentUrl,
					edition: this.edition,
					issue: this.issue,
				});
				this.$snotify.success("Thanks for letting us know!", "Report submitted", {
					position: "centerTop",
				});
				this.hide();
				this.$emit("submitted");
			} catch (error) {
				this.$snotify.error(error);
			} finally {
				this.submitting = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
::v-deep {
	.hk-card {
		border-radius: $border-radius !important;
		margin-top: 75px;
	}
}
</style>
