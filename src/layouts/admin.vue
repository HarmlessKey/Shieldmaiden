<template>
	<q-no-ssr class="content">
		<Crumble />
		<router-view />
	</q-no-ssr>
</template>

<script>
	import Crumble from "src/components/crumble";

	export default {
		name: "AdminLayout",
		components: {
			Crumble,
		},
    preFetch({ store, redirect }) {
      if(!store.getters.userInfo || !store.getters.userInfo.admin) {
				redirect('/');
			} 
    }
	}
</script>