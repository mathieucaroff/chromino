import { ChrominoPosition, Config } from "../../type"
import { Bag } from "../bag/bag"
import { Board } from "../board/board"

export type PlayOption = {
  firstMove?: { chrominoTriplet: string; position: ChrominoPosition }
}

export function createPlayer(config: Config, bag: Bag) {
  const chrominoArray = bag.drawChromino(config.initialChrominoCount)
  return {
    chrominoArray,
    play: (
      board: Board,
      bag: Bag,
      playOption: PlayOption,
    ): "win" | "continue" => {
      if (playOption.firstMove) {
        const { chrominoTriplet, position } = playOption.firstMove
        board.add(chrominoTriplet.split(",").map(Number), position)
        chrominoArray.splice(chrominoArray.indexOf(chrominoTriplet), 1)
        return "continue"
      }

      // Establish all the possible moves
      const fullPlacementArray = chrominoArray
        .map((chromino) => {
          const placementArray = board.listPlacement(chromino)
          return placementArray
        })
        .flat()

      // If no moves are possible, draw a chromino
      if (fullPlacementArray.length === 0) {
        const newChromino = bag.drawChromino(1)[0]
        chrominoArray.push(newChromino)
        // Check all the possible moves with the new chromino
        fullPlacementArray.push(...board.listPlacement(newChromino))
        // If there are still no moves possible, end the turn
        if (fullPlacementArray.length === 0) {
          return "continue"
        }
      }

      // Find the best move
      let best = fullPlacementArray[0]
      fullPlacementArray.forEach((result) => {
        if (result.nicenessScore > best.nicenessScore) {
          best = result
        }
      })
      let chromino = best.chromino.split(",").map(Number)
      if (best.reverse) {
        chromino.reverse()
      }
      board.add(chromino, best.position)
      chrominoArray.splice(chrominoArray.indexOf(best.chromino), 1)
      if (chrominoArray.length === 0) {
        return "win"
      }
      return "continue"
    },
  }
}

export type Player = ReturnType<typeof createPlayer>
