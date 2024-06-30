<template>
	<q-dialog v-model="tutorial_finished" persistent>
		<hk-card header="Thanks for trying our demo">
			<div class="card-body text-center">
				<h3>We hope you were impressed by the possibilities</h3>
				<p>
					This is exactly how you can run your custom created encounters in our app, with your own
					players, and monsters from the SRD or created by you.
				</p>
				<p>Create a free account to use our tools to their full extend</p>
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
		return {};
	},
	computed: {
		...mapGetters(["demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		tutorial_finished() {
			return this.demo && this.follow_tutorial && this.get_step("run", "finished");
		},
	},
	methods: {
		...mapActions("tutorial", ["resetTutorial"]),
	},
};
</script>
