<template>
	<q-banner class="bg-red mb-3 white" rounded inline-actions>
		<q-icon slot="avatar" name="fas fa-box-full" />
		<b>You're over encumbered!</b><br/>
		<small>
			You have more content than your current subscription allows.<br/>
			Some functionality is unavailable until you resolve this.
		</small>
		<template slot="action">
			<q-btn flat color="white" no-caps label="Resolve" to="/content/manage" />
		</template>
	</q-banner>
</template>