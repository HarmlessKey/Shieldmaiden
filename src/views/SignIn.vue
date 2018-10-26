<template>
  <div id="login">
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'

export default {
  name: 'login',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login: function() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
        (user) => {
          this.$router.replace('my-content')
        },
        (err) => {
          console.log('Something went wrong: ' + err.message)
        }
      );
    }
  },
  mounted() {
    var uiConfig = {
      signInSuccessUrl: '/my-content',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
        ]
      };
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
    }
}
</script>

<style lang="css" scoped>
#login {
    padding-top:50px;
    width: 300px;
    margin:auto;
}
input {
    margin-bottom:15px;
}
</style>