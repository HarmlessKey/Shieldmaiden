<template>
	<q-banner class="bg-neutral-7 mb-3 white" rounded>
		<q-icon slot="avatar" name="fas fa-user-circle" />
		<strong>Thanks for creating an account!</strong><br />
		<small>Now that you're signed in you can use our tools from your custom content page.</small>
		<template slot="action">
			<q-btn color="green" no-caps label="Your content" to="/content" />
		</template>
	</q-banner>
</template>
