Vue.component('initial-screen', {
  template:
  `<div>
    <h1>rummikub</h1>
    <p>Enter your name</p>
    <input type="text" v-model='name'>
    <button v-on:click="addPlayer()">Go!</button>
  </div>
  `,
  data: function () {
    return {
      name: ''
    }
  },
  methods: {
    addPlayer: function () {
      console.log('add player', this.name)
    }
  }
})
