<template>
	<div>
		<iframe
			v-if="music"
			ref="music"
			:src="`${music_url}?autoplay=1&mute=0&playsinline=1&controls=0`"
			title="Music player"
			class="music-player"
			allow="autoplay"
		/>
		<iframe
			v-for="sound in ambience"
			:key="sound.url"
			:src="`${ambience_url(sound.url)}?autoplay=1&mute=0&playsinline=1&controls=0`"
			title="Music player"
			class="music-player"
			allow="autoplay"
		/>
	</div>
</template>

<script>
import { generateYoutubeEmbedUrl, urlType } from "src/utils/generalFunctions";
import { mapGetters } from "vuex";

export default {
	name: "MusicPlayer",
	computed: {
		...mapGetters(["music", "ambience"]),
		music_url() {
			return urlType(this.music?.url) === "youtube"
				? generateYoutubeEmbedUrl(this.music?.url)
				: this.music?.url;
		},
	},
	methods: {
		ambience_url(url) {
			return urlType(url) === "youtube" ? generateYoutubeEmbedUrl(url) : url;
		},
	},
};
</script>

<style lang="scss" scoped>
iframe {
	display: none;
}
</style>
