<template>
	<hk-card header="Generate NPCs">
		<div class="card-body">
			<q-file
				v-if="!file"
				v-model="file"
				:dark="$store.getters.theme === 'dark'"
				label="Drag an image here or click to upload"
				accept=".jpg, image/*"
				square
				filled
				@input="convertToBase64"
			>
				<template v-slot:prepend>
					<q-icon name="fas fa-image" />
				</template>
			</q-file>
			<template v-else>
				<img :src="image" class="preview" />
			</template>
		</div>
	</hk-card>
</template>

<script>
export default {
	name: "generate-npcs",
	data() {
		return {
			file: null,
			base64String: null,
		};
	},
	computed: {
		image() {
			return this.file ? URL.createObjectURL(this.file) : null;
		},
	},
	methods: {
		convertToBase64(file) {
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					this.base64String = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		},
		cancel() {
			this.file = null;
			this.base64String = null;
		},
	},
};
</script>

<style lang="scss" scoped>
.preview {
	width: 100%;
	object-fit: contain;
	max-height: 400px;
	padding: 15px;
	background-color: $neutral-9;
	border-radius: $border-radius;
}
</style>
