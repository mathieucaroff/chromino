import { random } from "../alias"
import { Config, RenderGrid, RenderSquare } from "../type"
import { createBag } from "./bag/bag"
import { createBoard } from "./board/board"
import { createPlayer, Player } from "./player/player"

export interface GetRenderGridParam {
  getRenderSquare: (index: number, color: number) => RenderSquare
}

export function createChrominoGame(config: Config) {
  const bag = createBag(config)
  const board = createBoard()
  const playerArray = Array.from({ length: config.playerCount }, () =>
    createPlayer(config, bag),
  )

  let { turn, chrominoOption } = initializeGame(playerArray)
  let rotation = random.integer(0, 1)(config.randomEngine) ? 0 : 90
  if (chrominoOption.length > 0) {
    const chrominoTriplet = random.picker(chrominoOption)(config.randomEngine)
    playerArray[turn].play(board, bag, {
      firstMove: { chrominoTriplet, position: { x: 0, y: 0, rotation } },
    })
    turn += 1
    turn %= playerArray.length
  } else {
    let [starterChromino] = bag.drawChromino(1)
    let chromino = starterChromino.split(",").map(Number)
    if (random.integer(0, 1)(config.randomEngine)) {
      chromino = chromino.reverse()
    }
    board.add(chromino, {
      x: 0,
      y: 0,
      rotation,
    })
  }

  return {
    getRenderGrid: (param: GetRenderGridParam) => {
      const { getRenderSquare } = param
      const range = board.scale.range()
      const yMin = range[0]
      const yLength = range[range.length - 1] - yMin + 1
      let xMin = 999999
      let xMax = -999999
      board.scale.forEach((row) => {
        const rowRange = row.range()
        const rowMin = rowRange[0]
        const rowMax = rowRange[rowRange.length - 1]
        if (rowMin < xMin) xMin = rowMin
        if (rowMax > xMax) xMax = rowMax
      })
      const xLength = xMax - xMin + 1
      const grid: RenderGrid = Array.from({ length: yLength }, (_, k) => {
        const index = k + yMin
        const row = board.scale.content[index] ?? { content: {} }
        return {
          index,
          content: Array.from({ length: xLength }, (_, j) =>
            getRenderSquare(j + xMin, row.content[j + xMin] ?? 0),
          ),
        }
      })
      return grid
    },
    step: () => {
      const player = playerArray[turn]
      const outcome = player.play(board, bag, {})
      if (outcome === "win") {
        if (config.victoryCondition === "onePlayer") {
          return "stop"
        } else {
          // Remove the player who won from the game, let the remaining players
          // continue
          playerArray.splice(turn, 1)
          turn %= playerArray.length
          if (playerArray.length === 0) {
            return "stop"
          }
        }
      } else {
        turn += 1
        turn %= playerArray.length
      }
      return "continue"
    },
    playerArray,
  }
}

export type ChrominoGame = ReturnType<typeof createChrominoGame>

export function initializeGame(playerArray: Player[]) {
  let turn = 0
  let chrominoOption: string[] = []
  playerArray.forEach((player, k) => {
    let tripletArray: string[] = []
    player.chrominoArray.forEach((chrominoString) => {
      const chromino = chrominoString.split(",").map(Number)
      if (chromino[0] === chromino[1] && chromino[1] === chromino[2]) {
        tripletArray.push(chrominoString)
      }
    })
    if (tripletArray.length > chrominoOption.length) {
      chrominoOption = tripletArray
      turn = k
    }
  })

  return { turn, chrominoOption }
}
