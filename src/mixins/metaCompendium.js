export const metaCompendium = {
	methods: {
		generate_compendium_meta: (data) => {
			return {
				title: {
					name: "title",
					content: data.title
				},
				description: {
					name: "description",
					content: data.description
				},
				ogTitle: {
					property: "og:title",
					content: data.title
				},
				ogDescription: {
					property: "og:description",
					content: data.description
				},
				twitterTitle: {
					name: "twitter:title",
					content: data.title
				},
				twitterDescription: {
					name: "twitter:description",
					content: data.description
				}
			}
		}
	}
}