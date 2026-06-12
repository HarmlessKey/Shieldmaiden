<template>
	<q-dialog v-model="tutorial_finished" persistent>
		<hk-card>
			<div class="card-header" slot="header">
				Tutorial finished
				<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat @click="close" />
			</div>
			<div class="card-body text-center">
				<h3>Thanks for finishing our tutorial!</h3>
				<p>
					We hope you're already impressed by the possibilities, but there is a lot more to
					discover, we've only shown you the basics for now.
				</p>
				<p class="mb-4">
					You can <a @click="close">close this dialog</a> and try out some features for yourself, or
					you can create an account now and start using <strong>Shieldmaiden</strong> to it's full
					potential.
				</p>
				<router-link to="/sign-up" class="btn btn-lg btn-block">Create account</router-link>
			</div>
			<div slot="footer" class="card-footer">
				<button class="btn bg-neutral-5" @click="resetTutorial">Reset tutorial</button>
			</div>
		</hk-card>
	</q-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "TutorialFinished",
	data() {
		return {
			showSetter: undefined,
		};
	},
	computed: {
		...mapGetters(["demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		tutorial_finished() {
			return this.demo && this.follow_tutorial && this.get_step("run", "finished");
		},
		show: {
			get() {
				return this.showSetter !== undefined ? this.showSetter : this.tutorial_finished;
			},
			set(newVal) {
				this.showSetter = newVal;
			},
		},
	},
	methods: {
		...mapActions("tutorial", ["resetTutorial", "toggleTutorial"]),
		close() {
			this.toggleTutorial();
			this.show = false;
		},
	},
};
</script>
