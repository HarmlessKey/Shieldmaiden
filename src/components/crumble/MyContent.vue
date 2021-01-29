<template>
	<div>
		<q-breadcrumbs>
			<template v-slot:separator>
        <q-icon
          name="fas fa-chevron-right"
        />
      </template>
			<q-breadcrumbs-el icon="fas fa-home-alt" to="/home" />
			<q-breadcrumbs-el label="Content" to="/" />
			<q-breadcrumbs-el :label="$route.meta.title" :to="$route.meta.basePath" />
			<template v-if="campaignId">
				<q-breadcrumbs-el v-if="$route.name == 'EditEncounter' || $route.name == 'Encounters'" :to="'/encounters/' + campaignId" label="Encounters" />
				<q-breadcrumbs-el v-if="$route.name == 'Edit Campaign'" :label="$route.name.capitalize()" />
			</template>
			<q-breadcrumbs-el v-if="encounterId" label="Edit encounter" />
		</q-breadcrumbs>
		<hr>
	</div>
</template>

<script>
	export default {
		name: 'Crumble',
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		methods: {
			
		},
	}
</script>

<style lang="scss" scoped>
	
</style>