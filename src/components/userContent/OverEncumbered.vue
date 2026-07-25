<template>
	<q-banner class="bg-red mb-3 white" rounded inline-actions>
		<template v-slot:avatar>
			<q-icon name="fas fa-box-full" />
		</template>
		<strong>You're over encumbered!</strong><br/>
		<small>
			You have more content than your current subscription allows.<br/>
			Some functionality is unavailable until you resolve this.
		</small>
		<template v-slot:action>
			<q-btn flat color="white" no-caps label="Resolve" to="/content/manage" />
		</template>
	</q-banner>
</template>