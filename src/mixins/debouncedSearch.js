const SEARCH_DELAY = 300;

/**
 * Debounced search for overview pages that query the content API.
 *
 * The component must have a `search` data property (bound to the search input)
 * and a `runSearch` method that performs the actual search.
 *
 * Don't put a `debounce` on the input itself, that only delays the model update,
 * which makes `searchNow` fire with a stale search value.
 */
export const debouncedSearch = {
	data() {
		return {
			searchTimeout: undefined,
		};
	},
	watch: {
		search() {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(this.runSearch, SEARCH_DELAY);
		},
	},
	methods: {
		/**
		 * Search immediately, cancelling any search that was still waiting for the debounce.
		 * Used for the search button and the enter key.
		 */
		searchNow() {
			clearTimeout(this.searchTimeout);
			this.runSearch();
		},
	},
	beforeDestroy() {
		clearTimeout(this.searchTimeout);
	},
};
