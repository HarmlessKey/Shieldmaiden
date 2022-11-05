<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>Encounter builder</h1>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${require(`src/assets/_img/solar.jpg`)})` }">
      D&D Encounter builder
    </div>
		<div class="card-body">
      <p>
        
      </p>

      <p class="mb-0">To save encounters, you need an account.</p> 
    </div>
    <div slot="footer" class="card-footer">
      <q-btn color="primary" class="full-width" no-caps push to="/tools/encounter-builder/build-encounter">Create encounter</q-btn>
		</div>
	</hk-card>
</template>

<script>
	export default {
		name: 'ToolsEncounterBuilder',
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