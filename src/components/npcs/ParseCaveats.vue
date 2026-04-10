<template>
	<hk-card class="parse-caveats">
		<div slot="header" class="card-header">
			<span>Before you proceed</span>
			<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat @click="$emit('close')" />
		</div>
		<div class="card-body">
			<p>Your statblock was imported! A few things to double-check before saving:</p>
			<ul class="parse-caveats__list">
				<li>
					<strong>Non-SRD spells</strong> — Spells not in the SRD may not have parsed correctly.
					Verify spell names and descriptions manually.
				</li>
				<li>
					<strong>Hit dice</strong> — The hit dice expression may be truncated or misformatted.
					Check the hit dice field.
				</li>
				<li>
					<strong>Image quality</strong> — Low-resolution or angled photos may have produced partial
					results. Review all fields before saving.
				</li>
			</ul>
		</div>
		<div slot="footer" class="card-footer">
			<q-btn color="primary" no-caps label="Got it" @click="$emit('close')" />
		</div>
	</hk-card>
</template>

<script>
export default {
	name: "ParseCaveats",
};
</script>

<style lang="scss" scoped>
.parse-caveats {
	min-width: 320px;
	max-width: 480px;

	&__list {
		padding-left: 1.2em;
		margin: 0;

		li {
			margin-bottom: 10px;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}
</style>
