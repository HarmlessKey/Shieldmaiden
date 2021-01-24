<template>
	<!-- <div class="d-none d-md-block">
		<ul class="crumble d-flex justify-content-left">
			<li>
				<router-link to="/">Home</router-link>
			</li>
			<li>
				<i class="fas fa-chevron-right mr-2"></i>
				<router-link :to="$route.meta.basePath">{{ $route.meta.title }}</router-link>
			</li>
			<li v-if="campaignId">
				<i class="fas fa-chevron-right mr-2"></i>
				<router-link v-if="$route.name == 'EditEncounter' || $route.name == 'Encounters'" :to="'/encounters/' + campaignId">Encounters</router-link>
				<span v-if="$route.name == 'Edit Campaign'">{{ $route.name }}</span>
			</li>
			<li v-if="encounterId">
				<i class="fas fa-chevron-right mr-2"></i>
				Edit encounter
			</li>
		</ul>
	</div> -->
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
			<templat v-if="campaignId">
				<q-breadcrumbs-el v-if="$route.name == 'EditEncounter' || $route.name == 'Encounters'" :to="'/encounters/' + campaignId" label="Encounters" />
				<q-breadcrumbs-el v-if="$route.name == 'Edit Campaign'" :label="$route.name.capitalize()" />
			</templat>
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