<template>
	<div class="card-body parse-statblock" :class="{ generating: generating }">
		<div v-if="tier.price !== 'Free'" class="parse-statblock__content">
			<h2 class="text-shadow">
				Import statblock <span class="whitespace-nowrap">from image</span>
			</h2>
			<template v-if="error">
				<p class="red">Something went wrong parsing your statblock.</p>
				<p class="red">{{ error }}</p>
			</template>
			<p class="text-shadow mb-1">Select an image of a D&amp;D statblock</p>

			<div class="parse-statblock__upload mb-2">
				<label class="parse-statblock__upload-label" :class="{ disabled: ai.total <= 0 }">
					<input
						ref="fileInput"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						capture="environment"
						class="parse-statblock__file-input"
						:disabled="ai.total <= 0"
						@change="onFileSelected"
					/>
					<div v-if="!preview_url" class="parse-statblock__placeholder">
						<hk-icon icon="fas fa-camera" class="mr-2" />
						<span>Camera or file</span>
					</div>
					<img v-else :src="preview_url" class="parse-statblock__preview" alt="Statblock preview" />
				</label>
				<p v-if="size_error" class="red mt-1">{{ size_error }}</p>
			</div>

			<div class="d-flex justify-content-between items-center gap-2">
				<div class="d-flex gap-1 items-center">
					<div class="credits" :class="ai.total <= 0 ? 'red' : 'green'">{{ ai.total.min(0) }}</div>
					Credits
				</div>
				<div v-if="ai.total > 0" class="d-flex justify-content-end">
					<button
						class="btn bg-accent"
						:disabled="!selected_file || !!size_error"
						@click="parse"
					>
						Parse image
					</button>
				</div>
				<button v-else class="btn bg-neutral-5" disabled>Not enough credits</button>
			</div>
		</div>
		<div v-else class="text-center">
			<h2 class="text-shadow">Subscribe to import statblocks with Shieldmaiden</h2>
			<p class="mb-4 text-shadow">
				A subscription is required to use our smart import functionality.
			</p>
			<router-link to="/patreon" class="btn btn-block bg-patreon-red">Subscribe now</router-link>
		</div>
		<div v-if="generating" class="messages">
			<hk-loader>
				<transition name="slide" mode="out-in">
					<div :key="currentMessage" v-text="currentMessage" class="message" />
				</transition>
			</hk-loader>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { Cookies } from "quasar";
import axios from "axios";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default {
	name: "ParseStatblock",
	data() {
		return {
			generating: false,
			selected_file: null,
			preview_url: null,
			size_error: null,
			error: null,
			message_index: 0,
			messageInterval: null,
			messages: [
				"Scanning the statblock",
				"Deciphering ancient scripts",
				"Counting hit dice",
				"Looking up spell slots",
				"Converting to digital form",
				"Arguing with the parser",
				"Almost there...",
			],
		};
	},
	computed: {
		...mapGetters(["ai", "tier"]),
		currentMessage() {
			return this.messages[this.message_index];
		},
	},
	beforeDestroy() {
		this.stopMessageRotation();
		if (this.preview_url) {
			URL.revokeObjectURL(this.preview_url);
		}
	},
	methods: {
		onFileSelected(event) {
			const file = event.target.files[0];
			if (!file) return;

			this.size_error = null;
			if (file.size > MAX_FILE_SIZE) {
				this.size_error = `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`;
				this.selected_file = null;
				this.preview_url = null;
				return;
			}

			if (this.preview_url) {
				URL.revokeObjectURL(this.preview_url);
			}
			this.selected_file = file;
			this.preview_url = URL.createObjectURL(file);
		},
		async parse() {
			this.$emit("generating", true);
			this.generating = true;
			this.error = null;
			this.message_index = 0;
			this.startMessageRotation();

			try {
				const base64 = await this.toBase64(this.selected_file);
				const response = await axios.post(
					"api/ai/parse-statblock",
					{
						image_base64: base64,
						mime_type: this.selected_file.type,
					},
					{
						headers: {
							Authorization: `Bearer ${Cookies.get("access_token")}`,
						},
					}
				);
				const monster = response?.data?.output || {};
				monster.source = "Shieldmaiden";
				monster.hit_dice = monster?.hit_dice?.split("+")[0];
				["actions", "reactions", "legendary_actions"].forEach((action_type) => {
					monster[action_type]?.forEach((action) => {
						action.action_list?.forEach((sub_action) => {
							if (["melee_weapon", "ranged_weapon", "spell_attack"].includes(sub_action.type)) {
								sub_action.rolls?.forEach((roll) => {
									roll.miss_mod = roll.miss_mod || 0;
								});
							}
						});
					});
				});
				this.$emit("finished", monster);
			} catch (e) {
				console.error("Something went wrong parsing the statblock", e);
				this.error = e;
			} finally {
				this.$emit("generating", false);
				this.generating = false;
				this.stopMessageRotation();
			}
		},
		toBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					// Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
					const result = reader.result;
					resolve(result.split(",")[1]);
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});
		},
		startMessageRotation() {
			if (this.messageInterval) return;
			this.messageInterval = setInterval(() => {
				this.message_index = (this.message_index + 1) % this.messages.length;
			}, 3000);
		},
		stopMessageRotation() {
			clearInterval(this.messageInterval);
			this.messageInterval = null;
		},
	},
};
</script>

<style lang="scss" scoped>
.parse-statblock {
	position: relative;
	overflow: hidden;
	z-index: 0;

	&__content {
		transition: all 0.5s linear;
	}
	&:before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-image: url("~assets/_img/monster-creator-shieldmaiden.webp");
		background-size: cover;
		background-position: center;
		z-index: -1;
		opacity: 0.2;
	}
	&.generating {
		&:before {
			opacity: 1;
			animation: zoomRotate 30s ease-in-out infinite;
		}
		.parse-statblock__content {
			opacity: 0;
		}
	}

	&__upload {
		width: 100%;
	}
	&__file-input {
		display: none;
	}
	&__upload-label {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 120px;
		border: 2px dashed $neutral-4;
		border-radius: $border-radius;
		cursor: pointer;
		overflow: hidden;
		background-color: $neutral-8;
		transition: border-color 0.2s;

		&:hover:not(.disabled) {
			border-color: $accent;
		}
		&.disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
	&__placeholder {
		color: $neutral-3;
		font-size: 16px;
		display: flex;
		align-items: center;
	}
	&__preview {
		width: 100%;
		max-height: 200px;
		object-fit: contain;
		display: block;
	}

	.messages {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		font-size: 30px;
		font-weight: bold;
		text-shadow: 0 0 5px $black;
	}
	.credits {
		font-weight: bold;
		padding: 3px 8px;
		background-color: $neutral-5;
		display: inline-block;
		border-radius: $border-radius;
		box-shadow: 0px 0px 5px #00000042;
	}
}

.slide-enter-active,
.slide-leave-active {
	transition: all 0.5s ease;
}
.slide-enter {
	transform: translateX(100%);
	opacity: 0;
}
.slide-enter-to {
	transform: translateX(0);
	opacity: 1;
}
.slide-leave {
	transform: translateX(0);
	opacity: 1;
}
.slide-leave-to {
	transform: translateX(-100%);
	opacity: 0;
}

@keyframes zoomRotate {
	0% {
		transform: scale(1) rotate(0deg);
	}
	25% {
		transform: scale(1.05) rotate(1deg);
	}
	50% {
		transform: scale(1.1) rotate(-2deg);
	}
	75% {
		transform: scale(1.05) rotate(1deg);
	}
	100% {
		transform: scale(1) rotate(0deg);
	}
}
</style>
