const deepstream = require('deepstream.io-client-js')
const view = require('./view')

const client = deepstream('localhost:6020')

const STATE = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
}

const HAND_SIZE = 10
const INITIAL_TOKENS = 14
const BOARD_ROWS = 10
const TIMER_INITIAL = 60
const COLORS = ['red', 'blue', 'green', 'yellow']
const NUM_PLAYERS = 4

async function start (name) {
  await client.login({ username: name })

  const id = 0
  const { gameStateRecord, boardStateRecord } = await initialiseGameState(id)
  client.rpc.provide('add-player', addPlayer.bind(null, gameStateRecord))

  const playerStateRecord = initialisePlayer(id, name, true)
  await playerStateRecord.whenReady()
  await enterGameLoop({
    gameStateRecord,
    boardStateRecord,
    playerStateRecord
  })
}

async function join (name) {
  const id = await client.rpc.make('add-player', { name })
  if (id === null) {
    throw 'team already full'
  }
  const { gameStateRecord, boardStateRecord } = await fetchGameState(id)
  const playerStateRecord = client.record.getRecord(`playerState/${id}`)
  await playerStateRecord.whenReady()
  await enterGameLoop({
    gameStateRecord,
    boardStateRecord,
    playerStateRecord
  })
}

async function enterGameLoop(records) {
  while (true) {
    const state = records.gameStateRecord.get('state')
    switch (state) {
      case STATE.WAITING_FOR_PLAYERS:
        await waitingForPlayers(records)
        break
      case STATE.WAITING:
        await wait(records)
        break
      case STATE.PLAYING:
        await play(records)
        break
    }
  }
}

async function waitingForPlayers({ playerStateRecord }) {
  view.renderWaitingForPlayers(playerStateRecord.get())
}

async function waiting({ gameStateRecord, boardStateRecord, playerStateRecord }) {
  view.renderGameView({
    playing: false,
    gameState: gameStateRecord.get(),
    boardState: boardStateRecord.get(),
    playerState: playerStateRecord.get()
  })
}

async function playing({ gameStateRecord, boardStateRecord, playerStateRecord }) {
  view.renderGameView({
    playing: true,
    gameState: gameStateRecord.get(),
    boardState: boardStateRecord.get(),
    playerState: playerStateRecord.get()
  })
}

function addPlayer (gameStateRecord, { name }, response) {
  const players = gameStateRecord.get('players')
  if (players.length === NUM_PLAYERS) {
    response.send(null)
    return
  }
  const id = players.length
  players[id] = { name }
  gameStateRecord.set('players', players)

  const playerStateRecord = initialisePlayer(id, name, false)
  playerStateRecord.discard()
  response.send(id)
}

async function initialiseGameState (master) {
  const gameStateRecord = client.record.getRecord('gameState')
  const boardStateRecord = client.record.getRecord('boardState')
  await Promise.all([gameStateRecord.whenReady(), boardStateRecord.whenReady()])

  gameStateRecord.set({
    master,
    players: [],
    currentPlayer: null,
    state: STATE.WAITING_FOR_PLAYERS
  })
  boardStateRecord.set({
    groups: [],
    pile: []
  })

  return {
    gameStateRecord,
    boardStateRecord,
  }
}

async function fetchGameState () {
  const gameStateRecord = client.record.getRecord('gameState')
  const boardStateRecord = client.record.getRecord('boardState')
  await Promise.all([gameStateRecord.whenReady(), boardStateRecord.whenReady()])
  return {
    gameStateRecord,
    boardStateRecord
  }
}

function initialisePlayer (id, name, isMaster) {
  const playerStateRecord = client.record.getRecord(`playerState/${id}`)
  record.set({
    id,
    name,
    isMaster,
    hand: { upper: Array(HAND_SIZE).fill(null), lower: Array(HAND_SIZE).fill(null) },
    timeRemaining: 0
  })

  return playerStateRecord
}

function createPile () {
  const pile = []
  for (const color of COLORS) {
    for (const num = 1; num <= 13; num++) {
      pile.push({ color, num })
      pile.push({ color, num })
    }
  }
  return pile
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 * @see: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/*
 * Shuffle the pile and deal 14 tokens to each player
 */
function dealBoard (boardStateRecord) {
  const pile = createPile()
  shuffle(pile)
  for (const playerId of gameState.players) {
    for (let i = 0; i < INITIAL_TOKENS / 2; i++) {
      player.hand.upper[i] = pile.pop()
      player.hand.lower[i] = pile.pop()
    }
  }
  return {
    pile,
  }
}

function updateBoard (boardStateRecord, { token, fromGroupId, toGroupId }) {

  if (isValid()) {
    // enable DONE button
  } else {
    // disable DONE button
  }
}

function timerExpire (boardStateRecord) {

}

function update (boardStateRecord) {

}
