<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1>D&D Monster Creator</h1>
		</div>
		<div class="card-body">
      <p>
        
      </p>

      <p class="mb-0">To save a monster, you need an account.</p> 
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
        tools: {
         
        }
      }
		}
	}
</script>