import { random } from "./alias"

export interface Config {
  playerCount: number
  initialChrominoCount: number
  playingPeriodMs: number
  chrominoColorCount: number
  seed: number
  randomEngine: random.Engine
  victoryCondition: "onePlayer" | "allPlayers"
  slow: boolean
  theme: string[]
  squareSize: number
  borderStyle: string
}

export type RenderGrid = RenderRow[]

export interface RenderRow {
  index: number
  content: RenderSquare[]
}

export interface RenderSquare {
  index: number
  className: string
}

export interface Position {
  x: number
  y: number
}

export interface DeltaPosition {
  dx: number
  dy: number
}

export interface ColorIndication {
  color: number
}

export interface RotationIndication {
  rotation: number // 0 or 90 degrees, 0 pointing to the right, 90 pointing up
}

export type FacetLocation = "left" | "middle" | "right"

export interface FacetPosition {
  location: FacetLocation
}

// ChrominoPosition is the position of the chromino on the board
// It also exists as the following string representation: `x,y,rotation`
export type ChrominoPosition = Position & RotationIndication

export interface ChrominoPlacement {
  position: ChrominoPosition
  reverse: boolean
  chromino: string
  nicenessScore: string
}
