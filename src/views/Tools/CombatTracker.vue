<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1><i aria-hidden="true" class="fas fa-swords mr-2" /> Combat Tracker D&D 5e</h1>
		</div>
		<div class="card-body">
      <p>
        Our combat Tracker is probably the most advanced <strong>D&D Combat Tracker</strong> you can find online.<br/>
        During combat it tracks almost anything you can think of, making running encounters so much easier and more fun to do.
      </p>

      <p class="mb-0">To fully use our Combat Tracker you need an account, but you can try out all it has to offer in our demo encounter.</p> 
    </div>
    <div slot="footer" class="card-footer">
      <q-btn color="green" class="full-width" no-caps push to="/demo">Try Demo Encounter</q-btn>
    </div>
	</hk-card>
</template>

<script>

	export default {
		name: 'ToolsCombatTracker',
		data() {
			return {
        tools: {
         
        }
      }
		}
	}
</script>

<style lang="scss" scoped>

</style>