<template>
	<q-banner class="bg-neutral-7 mb-3 white" rounded>
		<template v-slot:avatar>
			<q-icon name="fas fa-user-circle" />
		</template>
		<strong>Thanks for creating an account!</strong><br />
		<small>Now that you're signed in you can use our tools from your custom content page.</small>
		<template v-slot:action>
			<q-btn color="green" no-caps label="Your content" to="/content" />
		</template>
	</q-banner>
</template>
