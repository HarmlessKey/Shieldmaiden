<template>
<div class="hk-admin-layout">
	<div class="content">
		<Crumble />
    <router-view />
	</div>
</div>
</template>

<script>
	import Crumble from "src/components/crumble";

	export default {
		name: "ContributeLayout",
		components: {
			Crumble,
		},
    preFetch({ store, redirect }) {
      if(!store.getters.userInfo || !store.getters.userInfo.contribute) {
				redirect('/');
			} 
    }
	}
</script>