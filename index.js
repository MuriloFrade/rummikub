


const app = new Vue({
  el: '#app',
  data: function() {
		return {
			status: 'playing',
		}
	},
	methods: {
    stateChanged (value) {
      console.log('>>>',value) // someValue
    }
  }

})
