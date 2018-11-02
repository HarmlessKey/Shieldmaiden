<template>
  <div id="home" class="container">
    <h1>D&D 5e Combat Service</h1>
    <p>Use our app to run your encounters, so you can give your players the attention they deserve.</p>
    
    <router-link v-if="!user" to="/sign-up" class="btn mr-2">Sign Up</router-link>
    <router-link v-if="!user" to="/sign-in" class="btn">Sign In</router-link>
  </div>
</template>

<script>
export default {
  name: 'home',
  computed: {
    user() {
      return this.$store.getters.getUser;
    }
  }
}
</script>

<style lang="css">
.container {
  padding-top:20px;
}
</style>