const game = require('../../../game/game')
const globalState = require('../global-state')

Vue.component('waiting-screen', {
  template:
  `
  <div class="waiting-screen container">
    <h1 class="text-center">rummikub</h1>
    <p  class="text-center">Waiting for other players</p>
    <div class="players">
      <ul class="">
        <li v-for="player in players">
          {{  player }}
        </li>
      </ul>
    </div>
    <form class="form-signin" v-on:submit.prevent>
      <button class="btn btn-lg btn-primary btn-block" v-on:click="start()">START GAME</button>
    </form>
  </div>
  `,
  data: function () {
    return {
      players: []
    }
  },
  methods: {
    start: function () {
      console.log('start game')
      globalState.setCurrentScreen('playing')
    }
  }
})
