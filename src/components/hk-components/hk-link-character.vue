<template>
	<hk-card :min-width="300">
		<div slot="header" class="card-header">
			Link a character
			<q-btn icon="close" no-caps flat dense v-close-popup />
		</div>
		<div class="card-body">
			<q-list :dark="$store.getters.theme === 'dark'" class="bg-neutral-8">
				<q-item v-for="character in sync_characters" :key="character.url">
					<q-item-section avatar>
						<span class="avatar" :style="{ backgroundImage: character.avatar ? 'url(\'' + character.avatar + '\')' : '' }">
							<i aria-hidden="true" v-if="!character.avatar" class="hki-player" />
						</span>
					</q-item-section>
					
					<q-item-section>
						<q-item-label caption class="neutral-4">
							{{ character.source }}
						</q-item-label>
						<q-item-label>{{ character.name }}</q-item-label>
					</q-item-section>
					
					<q-item-section avatar>
						<a @click="linkCharacter(character.url)" class="btn btn-sm bg-neutral-5">
							<i aria-hidden="true" class="fas fa-link green"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Link character
							</q-tooltip>
						</a>
					</q-item-section>
				</q-item>
			</q-list>
		</div>
	</hk-card>
</template>

<script>
import { getCharacterSyncStorage } from "src/utils/generalFunctions";

export default {
	name: 'hk-link-character',
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			sync_characters: {}
		}
	},
	async mounted() {
		this.sync_characters = await getCharacterSyncStorage();
	},
	methods: {
		linkCharacter(url) {
			this.$emit("link", url);
		},
	}
}
</script>

<style lang="scss" scoped>
	.avatar {
		width: 40px;
		height: 40px;
		background-position: center top;
		background-size: cover;
	}
</style>