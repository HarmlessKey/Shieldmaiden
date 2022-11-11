<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1><i aria-hidden="true" class="fas fa-dragon mr-2" /> Monster Creator for D&D 5e</h1>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${require(`src/assets/_img/atmosphere/banner/monster-banner.jpg`)})` }">
      D&D Monster Creator
    </div>
		<div class="card-body">
      <p>
        With our monster creator you can create stat blocks for custom monsters. 
        You can create actions for you monster that can be rolled from the stat block. 
        Results of rolled actions can directly be applied when used in our <router-link to="/tools/combat-tracker">combat tracker</router-link>.
      </p>

      <span>To save a monster, you need an account, but you can always download your creations.</span> 
    </div>
    <div slot="footer" class="card-footer">
      <q-btn color="primary" class="full-width" no-caps push to="/tools/monster-creator/create-monster">Create custom monster</q-btn>
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