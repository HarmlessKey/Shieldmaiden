<template>
	<div>
		<ValidationObserver v-slot="{ valid }">
			<hk-card :min-width="300">
				<template v-slot:header>
					<div class="card-header">
						Add avatar
						<q-btn icon="close" no-caps flat dense @click="cancel" />
					</div>
				</template>
				<div v-if="current_avatar" class="current-avatar">
					<div class="d-flex justify-content-start items-center">
						<div
							class="img"
							:style="{
								backgroundImage: `url('${current_avatar}')`,
							}"
						/>
						Current avatar
					</div>
					<button class="btn btn-sm bg-neutral-5 my-2" @click="clear">
						<i class="fas fa-trash-alt" aria-hidden="true" />
					</button>
				</div>
				<div class="card-body">
					<q-form>
						<div v-if="tier && tier.price !== 'Free'">
							<div class="label">
								Crop and upload image
								<div v-if="using_crop">
									<hk-popover class="mr-2" header="Cropping">
										<i class="fas fa-info-circle" aria-hidden="true" />
										<template #content>
											You can use scroll to <em>zoom</em> and <em>position</em> <br />
											the image by dragging it.
										</template>
									</hk-popover>
									<q-btn no-caps flat dense icon="close" size="sm" @click="stopCrop" class="red" />
								</div>
							</div>
							<div class="cropper-container">
								<Cropper
									v-if="using_crop"
									ref="cropper"
									class="cropper"
									:src="crop_src"
									:stencil-props="{ aspectRatio: 1 }"
									image-restriction="stencil"
								/>
								<button v-else type="button" class="cropper-placeholder" @click="pickFile">
									Choose an image
								</button>
								<input
									ref="file"
									type="file"
									accept="image/*"
									class="hidden"
									aria-label="Choose an image"
									@change="loadFile"
								/>
							</div>
							<div v-if="using_crop" class="d-flex justify-content-center">
								<q-btn no-caps flat icon="fas fa-undo" @click="rotate" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Rotate </q-tooltip>
								</q-btn>
								<q-btn no-caps flat icon="fas fa-arrow-up" @click="flipY" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Flip Y </q-tooltip>
								</q-btn>
								<q-btn no-caps flat icon="fas fa-arrow-right" @click="flipX" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Flip X </q-tooltip>
								</q-btn>
							</div>
						</div>
						<div v-else-if="tier">
							<p>Do you want to <strong>crop</strong> and <strong>upload</strong> avatars?</p>

							<a
								class="btn btn-block bg-patreon-red"
								href="https://www.patreon.com/join/shieldmaidenapp"
								rel="noopener"
								target="_blank"
							>
								<i class="fab fa-patreon black" aria-hidden="true" />
								Support us on Patreon
							</a>
						</div>
						<template v-if="!using_crop">
							<hr />
							Enter an image url
							<ValidationProvider
								rules="url|max:2000"
								name="Avatar"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Image URL"
									autocomplete="off"
									type="text"
									v-model="url"
									maxLength="2000"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</template>
					</q-form>
				</div>
				<template v-slot:footer>
					<div class="card-footer">
						<q-btn flat class="bg-neutral-8 mr-1" no-caps @click="cancel">Cancel</q-btn>
						<q-btn
							color="green"
							no-caps
							@click="acceptAvatar(valid)"
							:disable="!valid || (!url && !using_crop)"
						>
							Accept
						</q-btn>
					</div>
				</template>
			</hk-card>
		</ValidationObserver>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import hkPopover from "./hk-popover.vue";

export default {
	components: { hkPopover, Cropper },
	name: "hk-image-uploader",
	props: {
		avatar: {
			type: String,
		},
		storage_avatar: {
			type: String,
		},
		preview_new_upload: {
			type: String,
		},
		width: {
			type: Number,
			default: 60,
		},
		height: {
			type: Number,
			default: 60,
		},
	},
	emits: ["crop", "url", "cancel", "clear"],
	data() {
		return {
			using_crop: false,
			url: this.avatar || undefined,
			crop_src: null,
		};
	},
	computed: {
		...mapGetters(["tier"]),
		current_avatar() {
			return this.preview_new_upload || this.storage_avatar || this.avatar;
		},
	},
	methods: {
		pickFile() {
			this.$refs.file.click();
		},
		loadFile(event) {
			const [file] = event.target.files || [];
			if (!file) return;

			if (this.crop_src) URL.revokeObjectURL(this.crop_src);
			this.crop_src = URL.createObjectURL(file);
			this.startCrop();
		},
		startCrop() {
			this.using_crop = true;
		},
		stopCrop() {
			if (this.crop_src) URL.revokeObjectURL(this.crop_src);
			this.crop_src = null;
			if (this.$refs.file) this.$refs.file.value = "";
			this.using_crop = false;
		},
		rotate() {
			this.$refs.cropper?.rotate(-90);
		},
		flipX() {
			this.$refs.cropper?.flip(true, false);
		},
		flipY() {
			this.$refs.cropper?.flip(false, true);
		},
		acceptAvatar(valid) {
			if (this.using_crop) {
				this.acceptCrop();
			} else {
				this.acceptUrl(valid);
			}
		},
		async acceptCrop() {
			const result = this.$refs.cropper?.getResult();
			if (!result?.canvas) return;

			const img = new Image(); // Create a new blank image

			// Set the cropped image as the src for the blank image
			img.src = result.canvas.toDataURL("image/webp");

			// Resize the image to given dimensions and emit the blob + dataUrl
			// The blob can be uploaded to firebase
			// The dataUrl can be used to show a preview
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = this.width;
				canvas.height = this.height;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, this.width, this.height);

				canvas.toBlob((blob) => {
					this.$emit("crop", { blob: blob, dataUrl: canvas.toDataURL() });
				}, "image/webp");
			};
		},
		acceptUrl(valid) {
			if (valid) {
				this.$emit("url", this.url);
			}
		},
		cancel() {
			this.$emit("cancel");
		},
		clear() {
			this.$emit("clear");
		},
	},
};
</script>

<style lang="scss" scoped>
.cropper-container {
	width: 250px;
	height: 250px;
	border: solid 1px $neutral-2;
	background-color: $neutral-8;

	.cropper,
	.cropper-placeholder {
		width: 100%;
		height: 100%;
	}

	.cropper-placeholder {
		border: none;
		background: none;
		color: $neutral-2;
		cursor: pointer;
	}

	.hidden {
		display: none;
	}
}
.label {
	display: flex;
	justify-content: space-between;
	margin-bottom: 5px;
	align-items: center;
	line-height: 25px;
	padding-right: 8px;

	.hk-popover i {
		vertical-align: -1px;
	}
}
.current-avatar {
	background-color: $neutral-7;
	border-bottom: solid 1px $neutral-5;
	display: flex;
	justify-content: space-between;
	padding-right: 0.5rem;

	.img {
		margin-right: 10px;
		border: solid 1px $neutral-3;
		background-size: cover;
		background-position: center top;
		color: $neutral-2;
		background-color: $neutral-9;
		border-radius: 0;
		width: 47px;
		height: 47px;
	}
}
</style>
