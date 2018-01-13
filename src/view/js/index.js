
require( './views/initial-screen' )
require( './views/board-screen' )
require( './views/waiting-screen' )

const globalState = require( './global-state' )

const app = new Vue({
  el: '#app',
  data: function() {
		return {
      state: globalState.state,
			status: globalState.getCurrentScreen(),
		}
  },
  watch: {
		'state.currentScreen': function (val) {
			this.status = globalState.getCurrentScreen()
		}
	},

})
