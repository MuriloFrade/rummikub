const HAND_SIZE = 10
const INITIAL_TOKENS = 14
const BOARD_ROWS = 10
const TIMER_INITIAL = 60
const COLORS = ['red', 'blue', 'green', 'yellow']
const NUM_PLAYERS = 4

async function connect () {
  const client = deepstream.deepstream('localhost:6020')
  await client.login()
  return client
}

/*
 * create a new game
 */
async function start (client, name) {
  const gameStateRecord = client.record.getRecord('gameState')
  const boardStateRecord = client.record.getRecord('boardState')
  await gameStateRecord.whenReady()
  await boardStateRecord.whenReady()

  gameStateRecord.set(getInitialGameState())
  boardStateRecord.set(getInitialBoardState())

  const id = addPlayer(gameStateRecord, name, true)
  const playerStateRecord = client.record.getRecord(`playerState/${id}`)
  await playerStateRecord.whenReady()
  playerStateRecord.set(getInitialPlayerState(id, name, true))

  const records = { gameStateRecord, boardStateRecord, playerStateRecord }

  client.rpc.provide('add-player', addPlayerRPC.bind(null, client, records))

  genericGameInit(records)
}

/*
 * join a game in progress
 */
async function join (client, name) {
  const id = await client.rpc.make('add-player', { name })
  if (id === null) {
    throw 'team already full'
  }
  const gameStateRecord = client.record.getRecord('gameState')
  const boardStateRecord = client.record.getRecord('boardState')
  const playerStateRecord = client.record.getRecord(`playerState/${id}`)
  await gameStateRecord.whenReady()
  await boardStateRecord.whenReady()
  await playerStateRecord.whenReady()
  genericGameInit({ gameStateRecord, boardStateRecord, playerStateRecord })
}

function genericGameInit (records) {
  Object.values(records).forEach(record => {
    record.subscribe(onStateChanged.bind(null, records))
  })
  view.registerUpdateHooks({
    moveTokenOnBoard: moveTokenOnBoard.bind(null, records),
    moveTokenFromHand: moveTokenFromHand.bind(null, records),
    takeTokenFromPile: takeTokenFromPile.bind(null, records),
    endTurn: endTurn.bind(null, records),
    startGame: startGame.bind(null, records)
  })
  onStateChanged(records)
}

function onStateChanged (records) {
  const state = records.gameStateRecord.get('state')
  switch (state) {
    case STATE.WAITING_FOR_PLAYERS:
      waitingForPlayers(records)
      break
    case STATE.PLAYING:
      showBoard(records)
      break
    default:
      throw new Error(`unknown state ${state}`)
  }
}

function waitingForPlayers ({ playerStateRecord }) {
  view.renderWaitingForPlayers(playerStateRecord.get())
}

function showBoard ({ gameStateRecord, boardStateRecord, playerStateRecord }) {
  const changingPlayer = records.gameStateRecord.get('changingPlayer')
  if (changingPlayer) {
    const currentPlayer = records.gameStateRecord.get('currentPlayer')
    const myId = records.playerStateRecord.get('id')
    if (currentPlayer === myId) {
      records.gameStateRecord.set('changingPlayer', false)
      playerStateRecord.set('canTakeFromPile', true)
    }
  }
  view.renderGameView({
    playing: false,
    gameState: gameStateRecord.get(),
    boardState: boardStateRecord.get(),
    playerState: playerStateRecord.get()
  })
}

function addPlayerRPC (client, { gameStateRecord }, { name }, response) {
  const id = addPlayer(gameStateRecord, name, false)
  client.record.setData(`playerState/${id}`, getInitialPlayerState(id, name, false))
    .then(() => response.send(id))
}

function addPlayer (gameStateRecord, name, isMaster) {
  const players = gameStateRecord.get('players')
  let id = null
  for (let i = 0; i < NUM_PLAYERS; i++) {
    if (players.indexOf(i) < 0) {
      id = i
    }
  }
  if (id !== null) {
    players.push(id)
    gameStateRecord.set('players', players)
    gameStateRecord.set('playerInfo[id]', { name })
    if (isMaster) {
      gameStateRecord.set('master', id)
    }
  }
  return id
}

function getInitialPlayerState (id, name, isMaster) {
  return {
    id,
    name,
    isMaster,
    hand: [],
    timeRemaining: 0,
    canTakeFromPile: null
  }
}

function getInitialGameState () {
  return {
    master: null,
    players: [],
    playerInfo: {},
    currentPlayer: null,
    state: STATE.WAITING_FOR_PLAYERS,
    changingPlayer: null
  }
}

function getInitialBoardState () {
  return {
    groups: [],
    pile: [],
    isValid: true
  }
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

function moveTokenOnBoard (records, { token, fromGroupId, toGroupId }) {
  const { boardStateRecord } = records
  const fromGroup = boardStateRecord.get(`groups[${fromGroupId}]`) || []
  const toGroup = boardStateRecord.get(`groups[${toGroupId}]`) || []

  const fromGroupIndex = fromGroup
    .findIndex(tok => tok.color === token.color && tok.num === token.num)

  if (fromGroupIndex < 0) {
    console.log('warning: tried to move token not in group', token, fromGroupId, toGroupId)
    return
  }

  fromGroup.splice(fromGroupIndex, 1)
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

function moveTokenFromHand ({ boardStateRecord, playerStateRecord }, { token, toGroupId }) {
  const toGroup = boardStateRecord.get(`groups[${toGroupId}]`) || []
  const hand = playerStateRecord.get('hand')

  const handIndex = hand
    .findIndex(tok => tok.color === token.color && tok.num === token.num)

  if (fromGroupIndex < 0) {
    console.log('warning: tried to move token not in hand', token, hand, toGroupId)
    return
  }

  hand.splice(fromGroupIndex, 1)
  sortedInsert(groups[toGroupId], token)

  playerStateRecord.set('hand', hand)
  boardStateRecord.set(`groups[${toGroupId}]`, toGroup)
  playerStateRecord.set('canTakeFromPile', false)
}

function takeTokenFromPile ({ boardStateRecord, playerStateRecord }) {
  const pile = boardStateRecord.get('pile')
  const token = pile.pop()
  boardStateRecord.set('pile', pile)
  const hand = playerStateRecord.get('hand')
  hand.push(token)
  playerStateRecord.set('hand', hand)
  playerStateRecord.set('canTakeFromPile', false)
  view.addTokenToHand(token)
}

function groupIsValid (group) {
  return group.length >= 3 && (isRun(group) || isSet(group))
}

/*
 * check if a group is a run e.g.
 * [{color: 'red', num: 4}, {color: 'red', num: 5}, {color: 'red', num: 6}]
 */
function isRun (group) {
  let { num, color } = group[0]
  for (let i = 1; i < group.length; i++) {
    if (group[i].color !== color || group[i].num !== ++num) {
      return false
    }
  }
  return true
}

/*
 * check if a group is a set e.g.
 * [{color: 'red', num: 4}, {color: 'green', num: 4}, {color: 'blue', num: 4}]
 */
function isSet (group) {
  let { num, color } = group[0]
  for (let i = 1; i < group.length; i++) {
    if (group[i].num !== num || group.slice(i).some(({ color: c }) => c === color)) {
      return false
    }
  }
  return true
}

function getNextPlayer (players, currentPlayer) {
  return players[(players.indexOf(currentPlayer) + 1) % players.length]
}

function endTurn ({ gameStateRecord, playerStateRecord }) {
  const players = gameStateRecord.get('players')
  const currentPlayer = gameStateRecord.get('currentPlayer')
  const nextPlayer = getNextPlayer(players, currentPlayer)
  gameStateRecord.set('currentPlayer', nextPlayer)
  gameStateRecord.set('changingPlayer', true)
}

function timerExpire (boardStateRecord) {

}

function startGame (records) {
  dealBoard(records)
  const { gameStateRecord, playerStateRecord, boardStateRecord } = records
  const me = playerStateRecord.get('id')
  gameStateRecord.set('currentPlayer', getNextPlayer(me))
  gameStateRecord.set('changingPlayer', true)
}

game = {
  connect,
  start,
  join
}