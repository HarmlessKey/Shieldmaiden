<template>
	<div>
		<div class="label">
			Upload an image
			<div v-if="type === 'upload'">
				<q-btn no-caps flat icon="info" @click="info" size="sm" />
				<q-btn no-caps flat icon="close" @click="upload.remove()" size="sm" />
			</div>
		</div>
		<div class="d-flex">
			<croppa 
				v-model="upload"
				:width="240"
				:height="240"
				placeholder="Choose an image"
				:placeholder-font-size="0"
				:disabled="false"
				:prevent-white-space="true"
				:show-remove-button="false"
				@file-choose="type = 'upload'"
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
		<div class="d-flex justify-content-center" v-if="type === 'upload'">
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
		<img v-if="img" :src="img" alt="Preview" />
	</div>
</template>

<script>
	import { storage } from "src/firebase";

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
				type: "url",
				upload: {},
				blob: undefined,
				img: undefined,
				zoom: 0
			}
		},
		methods: {
			info() {
				const img = new Image();
				img.src = this.upload.generateDataUrl("image/webp");
				const canvas = document.createElement('canvas');

				canvas.width = this.width;
				canvas.height = this.height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, this.width, this.height);

				this.img = canvas.toDataURL();
				canvas.toBlob((blob) => {
					this.blob = blob;
				}, "image/webp");

				const storageRef = storage.ref();
				const imageRef = storageRef.child("npcs/test.webp");
				imageRef.put(this.blob).then((snapshot) => {
					console.log("uploaded blob");
				}); 
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