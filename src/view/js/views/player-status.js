Vue.component( 'player-status', {
	template: `
  <div class="player-status">
    <div class="avatar">
      <i class="fa fa-user fa-2x"></i>
      <span>{{ name }}</span>
    </div>
    <p>Tokens left: {{ tokensLeft }}</p>
  </div>
	`,
	props: {
		name: String,
    tokensLeft: Number,
    isPlayerTurn: Boolean
  },
  data: function () {
    return {

    }
  },
	methods: {

	}
})