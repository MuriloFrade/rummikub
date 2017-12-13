Vue.component('waiting-screen', {
  template:
  `<div class="waiting-screen">
    <h1>rummikub</h1>
    <p>Waiting for other players</p>
    <div class="players">
      <ul class="">
        <li v-for="player in players">
          {{  player }}
        </li>
      </ul>
    </div>
    <button class="start" v-on:click="start()">START GAME</button>
  </div>
  `,
  data: function () {
    return {
      players: []
    }
  },
  methods: {
    start: function () {
      console.log('starting game')
    }
  }
})
