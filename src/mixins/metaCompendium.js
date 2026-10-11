export const metaCompendium = {
	methods: {
		/**
		 * Replaces the generic "D&D 5e and 5.5e" text with the edition of the page being viewed
		 *
		 * @param {string} text
		 * @returns {string}
		 */
		compendium_edition_text(text) {
			const edition = this.$route?.params?.edition === "5.5e" ? "D&D 5.5e" : "D&D 5e";
			return text?.replace("D&D 5e and 5.5e", edition);
		},
		generate_compendium_meta(data) {
			const title = this.compendium_edition_text(data.title);
			const description = this.compendium_edition_text(data.description);

			return {
				title: {
					name: "title",
					content: title,
				},
				description: {
					name: "description",
					content: description,
				},
				ogTitle: {
					property: "og:title",
					content: title,
				},
				ogDescription: {
					property: "og:description",
					content: description,
				},
				ogImage: {
					property: "og:image",
					content: data.image,
				},
				ogImageType: {
					property: "og:image:type",
					content: "image/png",
				},
				ogImageAlt: {
					property: "og:image:alt",
					content: data.image_alt,
				},
				twitterTitle: {
					name: "twitter:title",
					content: title,
				},
				twitterDescription: {
					name: "twitter:description",
					content: description,
				},
				twitterImage: {
					name: "twitter:image",
					content: data.image,
				},
			};
		},
	},
};
