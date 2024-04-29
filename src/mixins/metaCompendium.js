export const metaCompendium = {
	methods: {
		generate_compendium_meta: (data) => {
			return {
				title: {
					name: "title",
					content: data.title,
				},
				description: {
					name: "description",
					content: data.description,
				},
				ogTitle: {
					property: "og:title",
					content: data.title,
				},
				ogDescription: {
					property: "og:description",
					content: data.description,
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
					content: data.title,
				},
				twitterDescription: {
					name: "twitter:description",
					content: data.description,
				},
				twitterImage: {
					name: "twitter:image",
					content: data.image,
				},
			};
		},
	},
};
