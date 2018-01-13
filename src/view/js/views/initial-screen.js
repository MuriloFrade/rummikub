const game = require('../../../game/game')
const globalState = require('../global-state')

Vue.component('initial-screen', {
  template:
  `
  <div class="initial-screen container">
    <h1 class="text-center">rummikub</h1>
    <form class="form-signin">
      <label for="name" class="sr-only">Your name</label>
      <input type="text" id="name" class="form-control" placeholder="Enter your name" required="" autofocus="">
      <br />
      <button v-on:click="addPlayer()" class="btn btn-lg btn-primary btn-block" type="button">JOIN GAME</button>
      <p class="text-center">or</p>
      <button v-on:click="createGame()" class="btn btn-lg btn-primary btn-block" type="button">CREATE GAME</button>
    </form>
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
      // const client = await game.connect()
      // await game.join(client, this.name)
      globalState.setCurrentScreen('waiting-players')
    },
    createGame: async function () {
      console.log('createGame', this.name)
      // const client = await game.connect()
      // await game.start(client, this.name)
      globalState.setCurrentScreen('waiting-players')
    },
  }
})
