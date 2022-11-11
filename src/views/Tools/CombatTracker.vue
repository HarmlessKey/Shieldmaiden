<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1><i aria-hidden="true" class="fas fa-swords mr-2" /> Combat Tracker for D&D 5e</h1>
		</div>
    <div slot="image" class="card-image written" :style="{ backgroundImage: `url(${require('assets/_img/atmosphere/tool-header/dragon-encounter-tool-header.jpg')})` }">
      D&D Combat Tracker
    </div>
		<div class="card-body">
      <p>
        Our initiative Tracker is probably the most advanced <strong>D&D Combat Tracker</strong> you can find online.<br/>
        During combat it tracks almost anything you can think of, making running encounters so much easier and more fun to do.
      </p>

      <p class="mb-0">To fully use our Combat Tracker you need an account, but you can try out all it has to offer in our demo encounter.</p> 
    </div>
    <div slot="footer" class="card-footer">
      <q-btn color="primary" class="full-width" no-caps push to="/demo">Try Demo Encounter</q-btn>
    </div>
	</hk-card>
</template>

<script>

	export default {
		name: 'ToolsCombatTracker',
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
    background-size: auto;
  }
}
</style>