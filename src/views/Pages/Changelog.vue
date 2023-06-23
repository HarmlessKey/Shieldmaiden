<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>Changelog</h1>
			<a
				class="btn btn-sm bg-neutral-5"
				href="https://github.com/HarmlessKey/HarmlessKey/releases"
				target="_blank"
				rel="noopener"
			>
				<i class="fab fa-github mr-1" aria-hidden="true" />
				Show all
			</a>
		</div>
		<hk-loader name="releases" v-if="loading" />
		<div v-else class="card-body">
			<h3>Our 10 latest releases</h3>
			<q-list :dark="$store.getters.theme === 'dark'" class="accordion">
				<q-expansion-item
					v-for="release in releases"
					:key="release.id"
					:dark="$store.getters.theme === 'dark'"
					switch-toggle-side
					group="release"
				>
					<template v-slot:header>
						<q-item-section>
							<q-item-label>
								<strong>{{ release.name }}</strong>
							</q-item-label>
							<q-item-label caption class="neutral-3">{{
								release.created_at.split("T")[0]
							}}</q-item-label>
						</q-item-section>
						<q-item-section avatar>
							<q-chip color="primary" square :dark="$store.getters.theme !== 'light'" size="12px">
								<strong>
									{{ release.tag_name }}
								</strong>
							</q-chip>
						</q-item-section>
					</template>
					<div class="p-4 bg-neutral-8 accordion-body">
						<h3>{{ makeDate(new Date(release.created_at)) }}</h3>
						<div v-html="parsedMarkdown(release.body)"></div>
					</div>
				</q-expansion-item>
			</q-list>

			<a
				class="btn btn-block bg-neutral-5 mt-3"
				href="https://github.com/HarmlessKey/HarmlessKey/releases"
				target="_blank"
				rel="noopener"
			>
				<i class="fab fa-github mr-1" aria-hidden="true" />
				Show all releases
			</a>
		</div>
	</hk-card>
</template>

<script>
import { Octokit } from "@octokit/rest";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import { makeDate } from "src/utils/generalFunctions";

const octokit = new Octokit();

export default {
	name: "Changelog",
	data() {
		return {
			loading: true,
			releases: [],
		};
	},
	methods: {
		makeDate(date_input) {
			return makeDate(date_input);
		},
		parsedMarkdown(input) {
			return sanitizeHtml(marked.parse(input || ""));
		},
		async getReleasePage() {
			this.loading = true;
			const response = await octokit
				.request("GET /repos/{owner}/{repo}/releases", {
					owner: "HarmlessKey",
					repo: "HarmlessKey",
					page: 1,
					per_page: 10,
				})
				.catch((e) => {
					console.log(e);
				});
			this.loading = false;
			return response.data;
		},
	},
	async mounted() {
		this.releases = await this.getReleasePage();
	},
};
</script>
