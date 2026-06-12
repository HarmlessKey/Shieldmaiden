<template>
	<div class="build-type">
		<h3>How do you want to do this?</h3>
		<div class="types">
			<hk-card
				class="pointer"
				header="Advanced"
				@click="build = 'advanced'"
				:class="{ active: build === 'advanced' }"
			>
				<div class="card-body">
					Create a complete character sheet that you can use as a player in your games.
				</div>
				<div slot="footer">
					<button class="btn btn-block">Select</button>
				</div>
			</hk-card>
			<hk-card class="disabled" header="Simple" :class="{ active: build === 'simple' }">
				<div class="card-body">
					Create a character with only basic stats needed for use in Shieldmaiden. This can't be
					used as a full character reference in your games, but just works for our combat tracker.
				</div>
				<div slot="footer">
					<button class="btn btn-block disabled">Select</button>
				</div>
			</hk-card>
			<hk-card class="disabled" header="Import">
				<div class="card-body">
					<p>(Coming soon)</p>
					Import a character from DnDBeyond. Copy your character sheet over, so it can be used in
					our combat tracker.
				</div>
				<div slot="footer">
					<button class="btn btn-block disabled">Select</button>
				</div>
			</hk-card>
		</div>
		<div class="d-flex justify-content-center mt-5">
			<a class="btn btn-lg" @click="setBuildType()">Create {{ build }} character</a>
		</div>
	</div>
</template>

<script>
export default {
	name: "BuildTypeSelect",
	props: {
		userId: {
			type: String,
			required: true,
		},
		characterId: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			build: "advanced",
		};
	},
	inject: ["characterState"],
	computed: {
		character() {
			return this.characterState.character;
		},
	},
	methods: {
		setBuildType() {
			this.character.build = this.build;
			this.$emit("save", "build_type");
		},
	},
};
</script>

<style lang="scss" scoped>
.build-type {
	> h3 {
		text-align: center;
		font-size: 25px !important;
		margin: 40px 0 30px 0 !important;
	}

	.types {
		display: flex;
		justify-content: center;
		margin: -10px;

		.hk-card {
			max-width: 200px;
			margin: 10px;
			user-select: none;

			&.active {
				border-color: #2c97de !important;
			}
		}
	}
}
</style>
