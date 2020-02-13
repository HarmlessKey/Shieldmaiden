<template>
	<div>
		<div class="d-flex justify-content-between">
			<a 
			class="gray-hover text-capitalize add-not" 
			v-b-tooltip.hover title="Add Notification" 
			@click="add_notification()">
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</div>
	</div>
</template>

<script>
export default {

  name: 'spell-action-notifications',

  data() {
    return {

    };
  },
  methods: {
  	add_notification() {
  		return true;
  	}
  }
};
</script>

<style lang="scss" scoped>
.add-not {
	position: absolute;
	top: -25px;
	right: 20px;
	z-index: 1;
}
</style>
