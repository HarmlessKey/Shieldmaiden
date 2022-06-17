<template>
	<q-no-ssr class="hk-layout">
		<div class="content">
			<Crumble />
			<router-view />
		</div>
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