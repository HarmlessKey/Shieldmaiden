<template>
	<div>
		<div class="d-flex justify-content-between">
			<a 
			class="gray-hover text-capitalize add-cond" 
			v-b-tooltip.hover title="Add Condition" 
			@click="add_condition()">
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</div>
	</div>
</template>

<script>
export default {

  name: 'spell-action-conditions',

  data() {
    return {

    };
  },
  methods: {
  	add_condition() {
  		return true;
  	}
  }
};
</script>

<style lang="scss" scoped>
.add-cond {
	position: absolute;
	top: -25px;
	right: 20px;
	z-index: 1;
}

</style>
