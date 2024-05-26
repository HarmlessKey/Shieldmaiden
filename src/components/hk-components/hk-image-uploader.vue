<template>
	<div>
		<ValidationObserver v-slot="{ valid }">
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
							<croppa
								v-model="crop"
								:width="250"
								:height="250"
								placeholder="Choose an image"
								:placeholder-font-size="0"
								:disabled="false"
								:prevent-white-space="true"
								:show-remove-button="false"
								@file-choose="startCrop"
								@image-remove="stopCrop"
							/>
							<div v-if="using_crop" class="d-flex justify-content-center">
								<q-btn no-caps flat icon="fas fa-undo" @click="crop.rotate(-1)" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Rotate </q-tooltip>
								</q-btn>
								<q-btn no-caps flat icon="fas fa-arrow-up" @click="crop.flipY()" size="sm">
									<q-tooltip anchor="top middle" self="center middle"> Flip Y </q-tooltip>
								</q-btn>
								<q-btn no-caps flat icon="fas fa-arrow-right" @click="crop.flipX()" size="sm">
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
				<div slot="footer" class="card-footer">
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
			</hk-card>
		</ValidationObserver>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import hkPopover from "./hk-popover.vue";

export default {
	components: { hkPopover },
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
			crop: {},
		};
	},
	computed: {
		...mapGetters(["tier"]),
		current_avatar() {
			return this.preview_new_upload || this.storage_avatar || this.avatar;
		},
	},
	methods: {
		startCrop() {
			this.using_crop = true;
		},
		stopCrop() {
			this.crop.remove();
			this.using_crop = false;
		},
		acceptAvatar(valid) {
			if (this.using_crop) {
				this.acceptCrop();
			} else {
				this.acceptUrl(valid);
			}
		},
		async acceptCrop() {
			const img = new Image(); // Create a new blank image

			// Set the cropped image as the src for the blank image
			img.src = this.crop.generateDataUrl("image/webp");

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
