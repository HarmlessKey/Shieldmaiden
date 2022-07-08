<template>
	<q-no-ssr>
		<div class="content">
			<Crumble />
			<router-view />
		</div>
	</q-no-ssr>
</template>

<script>
	import Crumble from "src/components/crumble";

	export default {
		name: "ContributeLayout",
		components: {
			Crumble,
		},
    preFetch({ store, redirect }) {
			if(store.getters.userInfo && store.getters.userInfo.admin) {
				return;
			}
      if(!store.getters.userInfo || !store.getters.userInfo.contribute) {
				redirect('/');
			} 
    }
	}
</script>