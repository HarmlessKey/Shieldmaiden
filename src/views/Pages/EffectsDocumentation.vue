<template>
	<div class="content effects-documentation">
		<hk-card>
			<div slot="header" class="card-header d-flex justify-content-between">
				<span>Contents</span>
				<router-link to="/content/effects" class="btn btn-sm bg-neutral-5">
					<i aria-hidden="true" class="fas fa-sparkles mr-1" />
					My effects
				</router-link>
			</div>
			<div class="card-body">
				<ul class="effects-documentation__contents mb-0">
					<li v-for="heading in contents" :key="heading.id">
						<a :href="`#${heading.id}`" @click.prevent="scrollTo(heading.id)">{{ heading.text }}</a>
					</li>
				</ul>
			</div>
		</hk-card>
		<hk-card>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<div class="card-body effects-documentation__text" @click="followAnchor" v-html="html" />
		</hk-card>
	</div>
</template>

<script>
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import documentation from "src/docs/effects.md";

const HEADINGS = ["h1", "h2", "h3", "h4"];

/**
 * Documentation of the custom effect form, rendered from src/docs/effects.md
 */
export default {
	name: "EffectsDocumentation",
	computed: {
		html() {
			return sanitizeHtml(marked.parse(documentation), {
				allowedTags: sanitizeHtml.defaults.allowedTags,
				allowedAttributes: {
					...sanitizeHtml.defaults.allowedAttributes,
					// Heading ids for the contents and links between sections
					...Object.fromEntries(HEADINGS.map((tag) => [tag, ["id"]])),
				},
			});
		},
		/**
		 * The level 2 headings, with the ids marked gives them
		 */
		contents() {
			const slugger = new marked.Slugger();
			const contents = [];
			for (const token of marked.lexer(documentation)) {
				if (token.type !== "heading") continue;
				// Every heading takes a slug, so duplicates get the same suffix as in the html
				const id = slugger.slug(token.text);
				if (token.depth === 2) contents.push({ id, text: token.text });
			}
			return contents;
		},
	},
	mounted() {
		if (this.$route.hash) this.$nextTick(() => this.scrollTo(this.$route.hash.slice(1)));
	},
	methods: {
		scrollTo(id) {
			const target = this.$el.querySelector(`[id="${id}"]`);
			if (!target) return;
			target.scrollIntoView({ behavior: "smooth", block: "start" });
			// Keep the section in the url without a route change (it would scroll to the top)
			window.history.replaceState(window.history.state, "", `#${id}`);
		},
		/**
		 * Links between sections in the text scroll to their heading
		 */
		followAnchor(event) {
			const link = event.target.closest && event.target.closest("a");
			const href = link && link.getAttribute("href");
			if (!href || !href.startsWith("#")) return;
			event.preventDefault();
			this.scrollTo(href.slice(1));
		},
	},
};
</script>

<style lang="scss" scoped>
.effects-documentation {
	&__contents {
		columns: 2;
		padding-left: 20px;
	}
	&__text {
		max-width: 900px;

		::v-deep {
			h1 {
				margin-top: 0;
			}
			h2 {
				margin-top: 35px;
				padding-bottom: 5px;
				border-bottom: solid 1px $neutral-4;
			}
			h3 {
				margin-top: 25px;
				font-size: 18px;
			}
			code {
				padding: 1px 5px;
				border-radius: $border-radius;
				background-color: $neutral-8;
			}
			table {
				width: 100%;
				margin-bottom: 20px;
				border-collapse: collapse;

				th,
				td {
					padding: 6px 8px;
					text-align: left;
					vertical-align: top;
					border-bottom: solid 1px $neutral-5;
				}
				th {
					color: $neutral-2;
				}
			}
			li {
				margin-bottom: 4px;
			}
		}
	}
}
@media only screen and (max-width: 576px) {
	.effects-documentation__contents {
		columns: 1;
	}
}
</style>
