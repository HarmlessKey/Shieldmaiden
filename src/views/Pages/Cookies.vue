<template>
	<hk-card header="Harmless Key Cookies">
		<div class="card-body">
			<p>
				Browser cookies, are small text files that are stored on a user's device when they visit a
				website. Cookies are used to store preferences and provide information to the website's
				owner.
			</p>
			<h3 id="cookies">Harmless Key's Cookies</h3>
			<table class="table" aria-describedby="cookies">
				<thead>
					<tr>
						<th>Name</th>
						<th>Provider</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>_ga</td>
						<td><a href="https://harmlesskey.com">harmlesskey.com</a></td>
						<td>Used to distinguish users for Google Analytics</td>
					</tr>
					<tr>
						<td>_ga_#</td>
						<td><a href="https://harmlesskey.com">harmlesskey.com</a></td>
						<td>Used to persist session state for Google Analytics</td>
					</tr>
				</tbody>
			</table>
			<small>No third party cookies are stored on Harmless Key</small>
		</div>
	</hk-card>
</template>

<script>
export default {
	name: "Cookies",
};
</script>

<style></style>
