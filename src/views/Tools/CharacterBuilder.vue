<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>Character builder</h1>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${require(`src/assets/_img/atmosphere/tool-header/characters-tool-header.jpg`)})` }">
      D&D Character builder
    </div>
		<div class="card-body">
			Our Character Builder is currently under development. Join our <a href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">Discord</a> to stay up to date on our progress.
		</div>
		<div slot="footer" class="card-footer">
      <a class="btn btn-block bg-discord-purple" href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">
				<i class="fab fa-discord mr-2" aria-hidden="true" /> Join Discord
			</a>
		</div>
	</hk-card>
</template>

<script>

	export default {
		name: 'ToolsCharacterBuilder',
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