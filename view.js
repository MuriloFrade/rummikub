const STATE = require('./state')

function renderWaitingForPlayers({ id, name, isMaster }) {

}

/*
 * gameState: {
 *  master: id
 *  players: { [id]: { name } }
 *  currentPlayer: id
 *  state: STATE
 * }
 * boardState: {
 *  groups: Array<Array<Token>>
 *  pile: Array<Token>
 * }
 * playerState: {
 *  id: id,
 *  name: string,
 *  isMaster: boolean,
 *  hand: Array<Token>,
 *  timeRemaining: int,
 *  canTakeFromPile: boolean
 * }
 */
function renderGameView({ gameState, boardState, playerState }) {

}

function addTileToHand(tile) {

}


/*
 * moveTokenOnBoard: ({ token, fromGroupId, toGroupId }) => void
 * moveTokenFromHand: ({ token, fromGroupId, toGroupId }) => void
 * takeTokenFromPile: () => void
 * endTurn: () => void
 */
function registerUpdateHooks({
  moveTokenOnBoard,
  moveTokenFromHand,
  takeTokenFromPile,
  endTurn
}) {

}

module.exports = {
  renderWaitingForPlayers,
  renderGameView,
  registerUpdateHooks
}
