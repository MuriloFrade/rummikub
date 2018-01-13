/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


__webpack_require__( 1 )
__webpack_require__( 2 )
__webpack_require__( 4 )

const app = new Vue({
  el: '#app',
  data: function() {
		return {
			status: 'initial',
		}
	},
	methods: {
    stateChanged (value) {
      console.log('>>',value) // someValue
    }
  }

})


/***/ }),
/* 1 */
/***/ (function(module, exports) {

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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__( 3 )

Vue.component('board', {
  template:
  `<div class="board-screen">
    <div class="top">
      <player-status :name="'Murilo'" :tokensLeft="7"></player-status>

    </div>
    <div class="left">
      <player-status :name="'Murilo'" :tokensLeft="7"></player-status>
    </div>
    <div class="middle" v-bind:style="{ borderColor: isStateValid ? 'lightgreen' : 'lightcoral' }">
      <div class="board-tokens">
        <ul class="tokens "
          v-for="(group, index) in groups" v-bind:id="'group-' + index">
          <li class="token" v-for="token in group"
            v-bind:style="{ color: token.color, borderColor: token.color }"
            v-bind:token-json="JSON.stringify(token)">
            {{token.num}}</li>
        </ul>
        <div v-bind:id="'group-' + groups.length"  class="empty-group"></div>
      </div>

    </div>

    <div class="right">
      <player-status :name="'Murilo'" :tokensLeft="7"></player-status>
    </div>
    <div class="bottom">
      <div class="pile">
        <button class="btn btn-primary"
          v-bind:class="{ disabled: !takeTokenEnabled }"
          v-on:click="takeToken"> Get token </button>
      </div>
      <div class="player-numbers">
        <ul class="tokens" id='player-cards-top'>
          <li class="token"
            v-for="token in this.tokensTop"
            v-bind:style="{ color: token.color, borderColor: token.color }">{{token.num}}</li>
        </ul>
        <ul class="tokens" id='player-cards-bottom'>
          <li class="token"
             v-for="token in this.tokensBottom"
            v-bind:style="{ color: token.color, borderColor: token.color }">{{token.num}}</li>
        </ul>
      </div>

      <div class="timer">
        35
      </div>

    </div>
  </div>
  `,
  data: function () {
    return {
      tokens: [],
      tokensTop: [],
      tokensBottom: [],
      takeTokenEnabled: true,
      isPlayerTurn: true,
      isStateValid: true,
      groups: [],
      sortableGroups: [],
    }
  },
  created: function () {
    const tokens = [{ color: 'red', num: 1 },{ color: 'green', num: 1 },{ color: 'red', num: 13 },{ color: 'blue', num: 13 },{ color: 'green', num: 13 },{ color: 'red', num: 13 }]
    this.onPlayerTokens(tokens)
    this.onGroupsChanged([tokens,tokens,tokens])
  },
  computed: {

  },
  mounted: function () {
    const top = document.getElementById("player-cards-top");
    Sortable.create(top, { group: "player-cards" });

    var bottom = document.getElementById("player-cards-bottom");
    Sortable.create(bottom, { group: "player-cards" })
  },
  methods: {
    onPlayerTokens: function (tokens) {
      this.tokens = tokens
      const halfLength = Math.ceil(this.tokens.length / 2)
      this.tokensTop = this.tokens.slice(0, halfLength)
      this.tokensBottom = this.tokens.slice(halfLength, this.tokens.length)
    },
    takeToken: function () {
      if (this.takeTokenEnabled) {
        console.log('taking token')
        this.tokensBottom.push({ color: 'red', num: 7 })
      }
    },
    onGroupsChanged: function (groups) {
      this.sortableGroups.forEach((sortable) => {
        sortable.destroy()
      })
      this.sortableGroups = []
      this.groups = groups

      Vue.nextTick(() => {
        for (let groupdId = 0; groupdId < groups.length; groupdId++) {
          // DOM updated:
          const group = groups[groupdId]
          const container = document.getElementById(`group-${groupdId}`)
          const sort = Sortable.create(container, {
            group: "board-tokens",
            disabled: !this.isPlayerTurn,
            animation: 150,
            handle: ".token", // Restricts sort start click/touch to the specified element
            draggable: ".token", // Specifies which items inside the element should be sortable
            onEnd: (evt) => {
              const from = evt.from.id.split('-')[1]
              const to = evt.to.id.split('-')[1]
              const token = JSON.parse(evt.item.attributes['token-json'].value)
              console.log('moving', token, 'from', from,'to', to,)
            }
          })
          this.sortableGroups.push(sort)
        }
          const empty = document.getElementById(`group-${groups.length}`);
          Sortable.create(empty, { group: "board-tokens", onAdd: (evt) => {
            console.log('>>>>>>>>')
          } });
      })
    },
    onNewGroup: function name(evt) {
      const token = JSON.parse(evt.item.attributes['token-json'].value)
      console.log('creating new group', token)
    }

  }
})


/***/ }),
/* 3 */
/***/ (function(module, exports) {

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

/***/ }),
/* 4 */
/***/ (function(module, exports) {

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


/***/ })
/******/ ]);