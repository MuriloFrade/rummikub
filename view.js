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
 *  timeRemaining: int
 * }
 */
function renderGameView({ gameState, boardState, playerState }) {

}


/*
 * updateBoard: ({ token, fromGroupId, toGroupId }) => void
 * endTurn: () => void
 */
function registerUpdateHooks({ updateBoard, endTurn }) {

}

module.exports = {
  renderWaitingForPlayers,
  renderGameView,
  registerUpdateHooks
}
