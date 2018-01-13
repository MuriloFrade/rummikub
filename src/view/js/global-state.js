class GlobalState {
  constructor () {
    this.state = {
      currentScreen: 'initial'
    }
  }

  setCurrentScreen (screen) {
    this.state.currentScreen = screen
  }

  getCurrentScreen () {
    return this.state.currentScreen
  }
}

module.exports = new GlobalState()