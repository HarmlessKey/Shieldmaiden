<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>Monster Creator for D&D 5e</h1>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${require(`src/assets/_img/solar.jpg`)})` }">
      D&D Monster Creator
    </div>
		<div class="card-body">
      <p>
        
      </p>

      <p class="mb-0">To save a monster, you need an account, but you can always download your creations.</p> 
    </div>
    <div slot="footer" class="card-footer">
      <q-btn color="green" class="full-width" no-caps push to="/tools/monster-creator/create-monster">Create custom monster</q-btn>
    </div>
	</hk-card>
</template>

<script>
	export default {
		name: 'ToolsMonsterCreator',
		data() {
			return {
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
  }
}
</style>