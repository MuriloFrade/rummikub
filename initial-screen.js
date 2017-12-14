Vue.component('initial-screen', {
  template:
  `<div>
    <h1>rummikub</h1>
    <p>Enter your name</p>
    <input type="text" v-model='name'>
    <button v-on:click="addPlayer()">Join!</button>
    <button v-on:click="createGame()">Create!</button>
  </div>
  `,
  data: function () {
    return {
      name: ''
    }
  },

  methods: {
    addPlayer: async function () {
      console.log('add player', this.name)
      const client = await game.connect()
      await game.join(client, this.name)
      this.$emit('state', 'waiting-players')
    },
    createGame: async function () {
      console.log('createGame', this.name)
      const client = await game.connect()
      await game.start(client, this.name)
      this.$emit('state', 'waiting-players')
    },
  }
})
