<template>
	<div>
		<ValidationObserver v-slot="{ meta }" as="div">
			<hk-card :min-width="300">
				<div slot="header" class="card-header">
					Add avatar
					<q-btn icon="close" no-caps flat dense @click="cancel" />
				</div>
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
							<div v-if="!imageSrc" class="crop-placeholder" @click="openFileInput">
								<span>Choose an image</span>
								<input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelect" />
							</div>
							<Cropper
								v-if="imageSrc"
								ref="cropper"
								:src="imageSrc"
								:stencil-props="{ aspectRatio: 1 }"
								:canvas="{ width: 250, height: 250 }"
								class="cropper"
							/>
							<div v-if="using_crop" class="d-flex justify-content-center">
								<q-btn no-caps flat icon="fas fa-undo" @click="rotate()" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Rotate </q-tooltip>
								</q-btn>
								<q-btn no-caps flat icon="fas fa-arrow-up" @click="flipY()" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Flip Y </q-tooltip>
								</q-btn>
								<q-btn no-caps flat icon="fas fa-arrow-right" @click="flipX()" size="sm">
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
								v-slot="{ errorMessage }" :modelValue="url" as="div"
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
									:error="!!errorMessage"
									:error-message="errorMessage"
								/>
							</ValidationProvider>
						</template>
					</q-form>
				</div>
				<div slot="footer" class="card-footer">
					<q-btn flat class="bg-neutral-8 mr-1" no-caps @click="cancel">Cancel</q-btn>
					<q-btn
						color="green"
						no-caps
						@click="acceptAvatar(meta.valid)"
						:disable="!meta.valid || (!url && !using_crop)"
					>
						Accept
					</q-btn>
				</div>
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
	data() {
		return {
			using_crop: false,
			url: this.avatar || undefined,
			imageSrc: null,
		};
	},
	computed: {
		...mapGetters(["tier"]),
		current_avatar() {
			return this.preview_new_upload || this.storage_avatar || this.avatar;
		},
	},
	methods: {
		openFileInput() {
			this.$refs.fileInput.click();
		},
		onFileSelect(event) {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					this.imageSrc = e.target.result;
					this.using_crop = true;
				};
				reader.readAsDataURL(file);
			}
		},
		stopCrop() {
			this.imageSrc = null;
			this.using_crop = false;
		},
		rotate() {
			this.$refs.cropper.rotate(-90);
		},
		flipY() {
			this.$refs.cropper.flip(false, true);
		},
		flipX() {
			this.$refs.cropper.flip(true, false);
		},
		acceptAvatar(valid) {
			if (this.using_crop) {
				this.acceptCrop();
			} else {
				this.acceptUrl(valid);
			}
		},
		async acceptCrop() {
			const { canvas } = this.$refs.cropper.getResult();
			if (!canvas) return;

			// Resize to target dimensions
			const resized = document.createElement("canvas");
			resized.width = this.width;
			resized.height = this.height;
			const ctx = resized.getContext("2d");
			ctx.drawImage(canvas, 0, 0, this.width, this.height);

			resized.toBlob((blob) => {
				this.$emit("crop", { blob: blob, dataUrl: resized.toDataURL() });
			}, "image/webp");
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
.crop-placeholder {
	width: 250px;
	height: 250px;
	border: 2px dashed $neutral-4;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: $neutral-3;
	margin: 0 auto;
	&:hover {
		border-color: $neutral-2;
		color: $neutral-2;
	}
}
.cropper {
	width: 250px;
	height: 250px;
	margin: 0 auto;
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
