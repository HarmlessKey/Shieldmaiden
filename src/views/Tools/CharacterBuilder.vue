<template>
  <ToolsPage
    title="Character Builder"
    bg_img="characters-tool-header.jpg"
  >

    <template v-slot:action_btn="{ btn_classes }">
      <a v-if="btn_classes" :class="`btn bg-discord-purple ${btn_classes}`" href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">
				<i class="fab fa-discord mr-2" aria-hidden="true" /> Join Discord
			</a>
    </template>

    <span>Our Character Builder is currently under development. Join our <a href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">Discord</a> to stay up to date on our progress.</span>
  </ToolsPage>
</template>

<script>
import ToolsPage from "src/components/ToolsPage.vue"

	export default {
		name: 'ToolsCharacterBuilder',
    components: {
      ToolsPage
    },
		data() {
			return {
        tools: {

        }
      }
		}
	}
</script>

<style lang="scss" scoped>
.hk-card {
  .card-image {
    font-size: 50px;
    line-height: 55px;
    text-shadow: 1px 1px 10px $black;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    background-size: auto;
  }
}
</style>
