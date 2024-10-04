<template>
	<hk-card header="Generate NPCs">
		<div class="card-body">
			<q-file
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				accept=".jpg, image/*"
				v-model="image"
				label="Drag an image here or click to upload"
			>
				<template v-slot:prepend>
					<q-icon name="attach_file" />
				</template>
			</q-file>
		</div>
	</hk-card>
</template>

<script>
export default {
	name: "generate-npcs",
	data() {
		return {
			image: null,
		};
	},
};
</script>
