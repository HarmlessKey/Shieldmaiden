<template>
	<div v-if="image || icon" class="hk-compendium-image" :class="`hk-compendium-image__${size}`">
		<img v-if="image" :src="src" :alt="alt" :class="`hk-compendium-image__${size}`" />
		<hk-icon v-else icon="hki-monster" />
	</div>
</template>

<script>
export default {
	name: "hk-compendium-image",
	props: {
		value: {
			type: String,
			default: undefined,
		},
		alt: {
			type: String,
		},
		type: {
			type: String,
			default: "monsters",
		},
		size: {
			type: String,
			default: "thumbnail",
		},
		icon: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			image: false,
			src: `https://firebasestorage.googleapis.com/v0/b/dndcombat-71e41.appspot.com/o/compendium%2F${this.type}%2F${this.size}%2F${this.value}.webp?alt=media`,
		};
	},
	methods: {
		checkImage(url) {
			const image = new Image();
			image.onload = () => {
				this.image = true;
			};
			image.onerror = () => {
				this.image = false;
			};
			image.src = url;
		},
	},
	mounted() {
		if (this.value) {
			this.checkImage(this.src);
		}
	},
};
</script>

<style lang="scss" scoped>
.hk-compendium-image {
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: inherit;

	&__thumbnail {
		aspect-ratio: 1 / 1;

		img {
			aspect-ratio: 1 / 1;
		}
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}
}
</style>
