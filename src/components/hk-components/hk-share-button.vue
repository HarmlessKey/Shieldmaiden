<template>
	<q-no-ssr>
		<a
			v-if="share_available"
			class="btn bg-neutral-5"
			:class="size ? `btn-${size}` : ``"
			@click="share"
		>
			<i aria-hidden="true" class="fas fa-share" />
		</a>
		<span v-else>
			<a class="btn bg-neutral-5" :class="size ? `btn-${size}` : ``" @click="copy">
				<i aria-hidden="true" class="fas fa-share" />
			</a>
			<input :value="link" id="copy" type="hidden" />
		</span>
	</q-no-ssr>
</template>

<script>
import { notifySuccess, notifyError } from "src/utils/notify";
export default {
	name: "hk-share-button",
	props: {
		title: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			default: undefined,
			required: false,
		},
		size: {
			type: String,
			default: undefined,
		},
	},
	data() {
		return {
			link: this.url,
		};
	},
	computed: {
		share_available() {
			return typeof window !== "undefined" && navigator.share !== undefined;
		},
	},
	methods: {
		copy() {
			const toCopy = document.querySelector("#copy");
			toCopy.setAttribute("type", "text"); //hidden
			toCopy.select();

			try {
				const successful = document.execCommand("copy");
				const msg = successful ? "Successful" : "Unsuccessful";

				notifySuccess(msg, "Link copied");
			} catch (err) {
				notifyError("Unsuccessful", "Link not copied");
			}

			/* unselect the range */
			toCopy.setAttribute("type", "hidden");
			window.getSelection().removeAllRanges();
		},
		share() {
			if (navigator.share) {
				navigator
					.share({
						title: this.title,
						text: this.text,
						url: this.link,
					})
					.catch((error) => console.log("Error sharing", error));
			}
		},
	},
	mounted() {
		if (!this.url) {
			this.link = `${window.origin}${this.$route.path}`;
		}
	},
};
</script>
