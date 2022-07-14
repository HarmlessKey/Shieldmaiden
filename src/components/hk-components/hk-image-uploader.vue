<template>
	<div>
		<div class="label">
			Upload an image
			<div v-if="using_upload">
				<q-btn no-caps flat dense icon="close" size="sm" @click="stopUpload" class="red" />
			</div>
		</div>
		<div>
			<croppa 
				v-model="upload"
				:width="250"
				:height="250"
				placeholder="Choose an image"
				:placeholder-font-size="0"
				:disabled="false"
				:prevent-white-space="true"
				:show-remove-button="false"
				@file-choose="startUpload"
				@image-remove="type = 'url'"
			/>
			<!-- <q-slider
        v-model="zoom"
        :min="0"
        :max="100"
        color="blue"
        vertical
        reverse
      /> -->
		</div>
		<div class="d-flex justify-content-center" v-if="using_upload">
			<q-btn no-caps flat icon="fas fa-undo" @click="upload.rotate(-1)" size="sm">
				<q-tooltip anchor="top middle" self="center middle">
					Rotate
				</q-tooltip>
			</q-btn>
			<q-btn no-caps flat icon="fas fa-arrow-up" @click="upload.flipY()" size="sm">
				<q-tooltip anchor="top middle" self="center middle">
					Flip Y
				</q-tooltip>
			</q-btn>
			<q-btn no-caps flat icon="fas fa-arrow-right" @click="upload.flipX()" size="sm">
				<q-tooltip anchor="top middle" self="center middle">
					Flip X
				</q-tooltip>
			</q-btn>
		</div>
	</div>
</template>

<script>
	export default {
		name: "hk-image-uploader",
		props: {
			width: {
				type: Number,
				default: 60
			},
			height: {
				type: Number,
				default: 60
			},
		},
		data() {
			return {
				using_upload: false,
				upload: {},
				img: undefined,
				zoom: 0
			}
		},
		methods: {
			startUpload() {
				this.using_upload = true;
				this.$emit("using-upload", true);
			},
			stopUpload() {
				this.upload.remove();
				this.using_upload = false;
				this.$emit("using-upload", false);
			},
			async accept() {
				console.log("accept")
				const img = new Image(); // Create a new blank image

				// Set the cropped image as the src for the blank image
				img.src = this.upload.generateDataUrl("image/webp");

				// Resize the image to given dimensions and emit the blob + dataUrl
				// The blob can be uploaded to firebase
				// The dataUrl can be used to show a preview
				img.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = this.width;
					canvas.height = this.height;
					const ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, this.width, this.height);
	
					canvas.toBlob((blob) => {
						this.$emit("accept", { blob: blob, dataUrl: canvas.toDataURL() });
					}, "image/webp");
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.label {
		display: flex;
		justify-content: space-between;
		margin-bottom: 5px;
	}
</style>