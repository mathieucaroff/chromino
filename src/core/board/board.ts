import { ChrominoPlacement, ChrominoPosition, Position } from "../../type"
import { createScale, Scale } from "../../util/scale"
import {
  chrominoColliding,
  chrominoContact,
  chrominoSurrounding,
  facetLocationToIndex,
  parseChrominoPosition,
  stringifyChrominoPosition,
} from "../piece/piece"

function getRotation(rotation: number) {
  return {
    0: { dx: 1, dy: 0 },
    90: { dx: 0, dy: 1 },
    180: { dx: -1, dy: 0 },
    270: { dx: 0, dy: -1 },
  }[rotation]!
}

function getPositionList(chrominoPosition: ChrominoPosition): Position[] {
  const { dx, dy } = getRotation(chrominoPosition.rotation)
  return Array.from({ length: 3 }, (_, k) => {
    return {
      x: chrominoPosition.x + dx * (k - 1),
      y: chrominoPosition.y + dy * (k - 1),
    }
  })
}

export function createBoard() {
  let playablePositionSet: Set<string> = new Set()

  const me = {
    scale: createScale<Scale<number>>(),
    get: (position: Position) => {
      return (
        (me.scale.content[position.y] ?? createScale()).content[position.x] ?? 0
      )
    },
    add: (splitChromino: number[], position: ChrominoPosition) => {
      // Remove all the chrominos positions which collide with the
      // new chromino (N.B: this does include the current position)
      const positionList = getPositionList(position)
      playablePositionSet = new Set(
        [...playablePositionSet].filter((chrominoPositionString) => {
          const collision = getPositionList(
            parseChrominoPosition(chrominoPositionString),
          ).some((pos) =>
            positionList.some(
              (newPos) => pos.x === newPos.x && pos.y === newPos.y,
            ),
          )
          return !collision
        }),
      )

      // Add the chromino to the board
      splitChromino.forEach((square, index) => {
        const { dx, dy } = getRotation(position.rotation)
        const x = position.x + (index - 1) * dx
        const y = position.y + (index - 1) * dy
        me.scale.setDefault(y, () => createScale()).set(x, square)
      })

      // Add the chromino positions which are supported by the new chromino
      chrominoContact(position).forEach((contact) => {
        if (me.checkChrominoPosition(contact)) {
          playablePositionSet.add(stringifyChrominoPosition(contact))
        }
      })
    },
    remove: (position: ChrominoPosition) => {
      // Remove the chromino from the board
      Array.from({ length: 3 }).forEach((_, index) => {
        const { dx, dy } = getRotation(position.rotation)
        const x = position.x + (index - 1) * dx
        const y = position.y + (index - 1) * dy
        me.scale.content[y].remove(x)
        if (me.scale.content[y].isEmpty()) {
          delete me.scale.content[y]
        }
      })

      // Remove the chromino positions which attached to the removed chromino
      // and are now unsufficiently supported
      chrominoContact(position).forEach((contact) => {
        if (!me.checkChrominoPosition(contact)) {
          playablePositionSet.delete(stringifyChrominoPosition(contact))
        }
      })

      // Check all positions which used to collide with the chromino
      // to see if they are now not colliding and sufficiently supported
      // Note: this includes the position itself
      chrominoColliding(position).forEach((pos) => {
        if (me.checkChrominoPosition(pos)) {
          playablePositionSet.add(stringifyChrominoPosition(pos))
        }
      })
    },
    /** Check that a chromino can be placed at a given position */
    checkChrominoPosition: (position: ChrominoPosition) => {
      // Check for collisions
      let ok = getPositionList(position).every((pos) => {
        return me.get(pos) === 0
      })
      if (!ok) return false

      // Check that the chromino surrounding has at least two occupied squares
      // to which the chromino can be attached
      let count = 0
      ok &&= chrominoSurrounding(position).some((facet) => {
        if (me.get(facet)) {
          count += 1
        }
        return count >= 2
      })
      return ok
    },
    /**
     * Find all the positions the given chromino can be placed at
     * @param chromino - The chromino to check
     * @returns The positions where the chromino can be placed along with
     *          the niceness of the placement
     */
    listPlacement: (chromino: string): ChrominoPlacement[] => {
      const splitChromino = chromino.split(",").map(Number)
      const placementArray: ChrominoPlacement[] = []
      playablePositionSet.forEach((positionString) => {
        const position = parseChrominoPosition(positionString)
        let { outcome, nicenessScore } = me.tryPosition(splitChromino, position)
        if (outcome === "success") {
          placementArray.push({
            position,
            reverse: false,
            chromino,
            nicenessScore,
          })
        }
        ;({ outcome, nicenessScore } = me.tryPosition(
          [...splitChromino].reverse(),
          position,
        ))
        if (outcome === "success") {
          placementArray.push({
            position,
            reverse: true,
            chromino,
            nicenessScore,
          })
        }
      })
      return placementArray
    },
    /**
     * Given a chromino and a position, check if the chromino can be placed at
     * the position and if it can, then compute the niceness score of the board
     * while the chromino is placed there
     */
    tryPosition: (
      splitChromino: number[],
      position: ChrominoPosition,
    ): { outcome: "success" | "failure"; nicenessScore: string } => {
      if (!me.checkChrominoPlacement(splitChromino, position)) {
        return { outcome: "failure", nicenessScore: "000" }
      }
      me.add(splitChromino, position)
      const nicenessScore = me.computeNicenessScore()
      me.remove(position)
      return { outcome: "success", nicenessScore }
    },
    /**
     * Check that all eight facets of the chromino match the color of the
     * occupied surrounding squares and make sure there are at least two
     * occupied squares around the chromino.
     */
    checkChrominoPlacement: (
      splitChromino: number[],
      position: ChrominoPosition,
    ) => {
      let count = 0
      let ok = chrominoSurrounding(position).every((facet) => {
        const square = me.get(facet)
        if (square) {
          count += 1
        }
        return (
          !square ||
          splitChromino[facetLocationToIndex(facet.location)] === square
        )
      })
      return ok && count >= 2
    },
    /**
     * Compute the niceness score of the board.
     * The niceness is composed of three numbers, each in the range [0, 35].
     * The first number is the number of single-constrainst positions ("corners").
     * The second number is the number of two-constrainst positions.
     * The third number is the number of three-constrainst positions.
     * @returns The niceness score as a string
     */
    computeNicenessScore: () => {
      const niceness: [number, number, number] = [0, 0, 0]
      playablePositionSet.forEach((positionString) => {
        const position = parseChrominoPosition(positionString)
        let surroundingFacetCount = 0
        const constraint: Record<string, number> = {}
        let ok = true
        chrominoSurrounding(position).every((facet) => {
          const color = me.get(facet)
          if (color) {
            surroundingFacetCount += 1
            if (
              constraint[facet.location] &&
              color !== constraint[facet.location]
            ) {
              ok = false
              return false // break
            }
            constraint[facet.location] = color
          }
        })
        if (ok && surroundingFacetCount >= 2) {
          niceness[Object.keys(constraint).length] += 1
        }
      })
      return niceness.map((score) => score.toString(36)).join(",")
    },
  }
  return me
}

export type Board = ReturnType<typeof createBoard>
