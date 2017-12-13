Vue.component('board', {
  template:
  `<div class="board-screen">
    <div class="top">
      <div class="player-status">

      </div>
    </div>
    <div class="left">
      <div class="player-status"></div>

    </div>
    <div class="middle" v-bind:style="{ borderColor: isStateValid ? 'lightgreen' : 'lightcoral' }">
      <div class="board-tokens">
        <ul class="tokens " v-for="(group, index) in groups" v-bind:id="'group-' + index">
          <li class="token" v-for="token in group"
            v-bind:style="{ color: token.color, borderColor: token.color }"
            v-bind:token-json="JSON.stringify(token)">
            {{token.num}}</li>
        </ul>
      </div>

    </div>

    <div class="right">
      <div class="player-status"></div>

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

    </div>
  </div>
  `,
  data: function () {
    return {
      tokens: [],
      tokensTop: [],
      tokensBottom: [],
      takeTokenEnabled: true,
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
      for (let groupdId = 0; groupdId < groups.length; groupdId++) {
        Vue.nextTick(() => {
          // DOM updated:
          const group = groups[groupdId]
          const container = document.getElementById(`group-${groupdId}`)
          const sort = Sortable.create(container, {
            group: "board-tokens",
            animation: 150,
            handle: ".token", // Restricts sort start click/touch to the specified element
            draggable: ".token", // Specifies which items inside the element should be sortable
            onEnd: (evt) => {
               console.log(evt)
              const from = evt.from.id.split('-')[1]
              const to = evt.to.id.split('-')[1]
              const token = JSON.parse(evt.item.attributes['token-json'].value)
              console.log('moving', token, 'from', from,'to', to,)
            }
          })
          this.sortableGroups.push(sort)
        })
      }
    }
  }
})
