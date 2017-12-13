const deepstream = require('deepstream.io-client-js')
const view = require('./view')
const STATE = require('./state')

const client = deepstream('localhost:6020')

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
  await onStateChanged({
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
  await onStateChanged({
    gameStateRecord,
    boardStateRecord,
    playerStateRecord
  })
}

async function onStateChanged(records) {
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
    pile: [],
    isValid: true
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
    hand: [],
    timeRemaining: 0,
    canTakeFromPile: true
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
function dealBoard ({ gameStateRecord, boardStateRecord }) {
  const pile = createPile()
  shuffle(pile)
  const players = gameStateRecord.get('players')
  const pile = boardStateRecord.get('pile')
  for (const playerId of players) {
    for (let i = 0; i < INITIAL_TOKENS; i++) {
      player.hand[i] = pile.pop()
    }
  }
  boardStateRecord.set('pile', pile)
}

function moveTokenOnBoard ({ boardStateRecord }, { token, fromGroupId, toGroupId }) {
  const fromGroup = boardStateRecord.get(`groups[${fromGroupId}]`) || []
  const toGroup = boardStateRecord.get(`groups[${toGroupId}]`) || []

  const fromGroupIndex = fromGroup
    .findIndex(tok => tok.color === token.color && tok.num === token.num)

  if (fromGroupIndex < 0) {
    console.log('warning: tried to move token from group where it was not found',
      token, fromGroupId, toGroupId)
    return
  }

  fromGroup.slice(fromGroupIndex, fromGroupIndex + 1)
  sortedInsert(groups[toGroupId], token)

  boardStateRecord.set(`groups[${fromGroupId}]`, fromGroup)
  boardStateRecord.set(`groups[${toGroupId}]`, toGroup)
  if (groupState.every(groupIsValid)) {
    // enable DONE button
  } else {
    // disable DONE button
  }
}

function sortedInsert (group, token) {
  const idx = group.findIndex(
    tok => tok.color === token.color && tok.num > token.num || tok.color > token.color
  )
  if (idx < 0) {
    group.push(token)
  } else {
    group.splice(idx, 0, token)
  }
  return group
}

function moveTokenFromHand (records, { token, toGroupId }) {
  const { boardStateRecord, playerStateRecord } = records

  onStateChanged(records)
}

function takeTokenFromPile (records) {
  const { boardStateRecord, playerStateRecord } = records
  const pile = boardStateRecord.get('pile')
  const token = pile.pop()
  boardStateRecord.set('pile', pile)
  const hand = playerStateRecord.get('hand')
  hand.push(token)
  playerStateRecord.set('hand', hand)
  view.addTokenToHand(token)
  onStateChanged(records)
}

function groupIsValid (group) {
  return group.length >= 3 && (isRun(group) || isSet(group))
}

function isRun (group) {
  let { num, color } = group[0]
  for (let i = 1; i < group.length; i++) {
    if (group[i].color !== color || group[i].num !== ++num) {
      return false
    }
  }
  return true
}

function isSet (group) {
  let { num, color } = group[0]
  for (let i = 1; i < group.length; i++) {
    if (group[i].num !== num || group.slice(i).some(({ color: c }) => c === color)) {
      return false
    }
  }
  return true
}

function endTurn () {

}

function timerExpire (boardStateRecord) {

}

function update (boardStateRecord) {

}

module.exports = {
  isSet, isRun, sortedInsert
}
