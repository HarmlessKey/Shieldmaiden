<template>
	<div class="container">
		<h1>Privacy Policy for D&D Character Sync</h1>

		<p>
			Thank you for using D&D Character Sync! Your privacy is important to us. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our Google Chrome extension.
		</p>

		<h2>1. Information We Collect</h2>

		<ul>
			<li><strong>Storage</strong>: We store the D&D character data in the local sync storage so your character data is synced over multiple devices.</li>
			<li><strong>ActiveTab</strong>: We check the url of the active tab to determine if a site contains d&d character data.</li>
			<li><strong>Scripting</strong>: We execute a script that extracts the D&D character data from the active site.</li>
			<li><strong>Tabs</strong>: We check if a tab is updated to provide real-time syncing of character data.</li>
			<li><strong>Host permissions</strong>: We use host permissions to limit on which sites we can execute our scripts.</li>
		</ul>
		
		<h2>2. How We Use Your Information</h2>

		<p>
			The data stored by D&D Character Sync is used solely to provide and improve the functionality of the extension. We do not collect or store any personally identifiable information about you.
			We do not sell, trade, or otherwise transfer your information to third parties.
		</p>

		<h2>3. Changes to This Privacy Policy</h2>

		<p>We reserve the right to update or change our Privacy Policy at any time. Any changes to this Privacy Policy will be effective immediately upon posting the updated policy on this page.</p>
		
		<h2>4. Contact Us</h2>

		<p>
			If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:contact@harmlesskey.com">contact@harmlesskey.com</a>.<br/>
			By using D&D Character Sync, you consent to the terms of this Privacy Policy.
		</p>
	</div>
</template>

<script>
export default {
	name: "PrivacyPolicy",
};
</script>

<style lang="scss" scoped>
.container {
	padding-top: 20px;
	padding-bottom: 50px;

	font-size: 15px;
	line-height: 25px;

	h3 {
		font-size: 20px !important;
	}
}
</style>
