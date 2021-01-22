export const audio = {
	data() {
		return {
			audio_icons: {
				spotify: { icon: "fab fa-spotify", color: "#20B954" },
				youtube: { icon: "fab fa-youtube", color: "#FF0000" },
				apple: { icon: "fab fa-apple", color: "#FFF" },
				none: { icon: "fas fa-music-alt", color: "#FFF" },
			},
		}
	},
	computed: {
		audio_link_type() {
			// This link type identification will fail sometimes
			// Example: https://geo.music.apple.com/us/album/spotify/1528894349?i=1528894351&itsct=music_box&itscg=30200&ct=songs_spotify&app=music&ls=1
			// Check for keyword in url root not in whole string
			if (this.encounter.audio !== undefined) {
				if (this.encounter.audio.includes("spotify"))
					return "spotify";
				else if (this.encounter.audio.includes("youtube"))
					return "youtube";
				else if (this.encounter.audio.includes("apple"))
					return "apple";
			}
			return "none"
		},
	}
}
