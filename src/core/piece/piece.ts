import {
  ChrominoPosition,
  ColorIndication,
  DeltaPosition,
  FacetLocation,
  FacetPosition,
  Position,
  RotationIndication,
} from "../../type"

// The eight relative positions of the chromino squares together with the
// location of the facet they are attached to
export const baseChrominoSurrounding: (DeltaPosition & FacetPosition)[] = [
  { dx: -2, dy: 0, location: "left" },
  { dx: -1, dy: -1, location: "left" },
  { dx: 0, dy: -1, location: "middle" },
  { dx: 1, dy: -1, location: "right" },
  { dx: 2, dy: 0, location: "right" },
  { dx: 1, dy: 1, location: "right" },
  { dx: 0, dy: 1, location: "middle" },
  { dx: -1, dy: 1, location: "left" },
]

// The twenty two relative positions of the chromino which are in contact
// with the chromino at the origin
export const baseChrominoContact: (DeltaPosition & RotationIndication)[] = [
  // Ten positions with rotation 0
  // left side
  { dx: -3, dy: 0, rotation: 0 },
  // above
  { dx: -2, dy: -1, rotation: 0 },
  { dx: -1, dy: -1, rotation: 0 },
  { dx: 1, dy: -1, rotation: 0 },
  { dx: 2, dy: -1, rotation: 0 },
  // right side
  { dx: 3, dy: 0, rotation: 0 },
  // below
  { dx: 2, dy: 1, rotation: 0 },
  { dx: 1, dy: 1, rotation: 0 },
  { dx: -1, dy: 1, rotation: 0 },
  { dx: -2, dy: 1, rotation: 0 },

  // Twelve positions with rotation 90
  // dy is -2
  { dx: -1, dy: -2, rotation: 90 },
  { dx: 0, dy: -2, rotation: 90 },
  { dx: 1, dy: -2, rotation: 90 },
  // dx is 2
  { dx: 2, dy: -1, rotation: 90 },
  { dx: 2, dy: 0, rotation: 90 },
  { dx: 2, dy: 1, rotation: 90 },
  // dy is 2
  { dx: -1, dy: 2, rotation: 90 },
  { dx: 0, dy: 2, rotation: 90 },
  { dx: 1, dy: 2, rotation: 90 },
  // dx is -2
  { dx: -2, dy: -1, rotation: 90 },
  { dx: -2, dy: 0, rotation: 90 },
  { dx: -2, dy: 1, rotation: 90 },
]

export const baseChrominoColliding: (DeltaPosition & RotationIndication)[] = [
  // Five positions with rotation 0
  { dx: -2, dy: 0, rotation: 0 },
  { dx: -1, dy: 0, rotation: 0 },
  { dx: 0, dy: 0, rotation: 0 },
  { dx: 1, dy: 0, rotation: 0 },
  { dx: 2, dy: 0, rotation: 0 },

  // Nine positions with rotation 90
  { dx: -1, dy: -1, rotation: 90 },
  { dx: 0, dy: -1, rotation: 90 },
  { dx: 1, dy: -1, rotation: 90 },
  { dx: -1, dy: 0, rotation: 90 },
  { dx: 0, dy: 0, rotation: 90 },
  { dx: 1, dy: 0, rotation: 90 },
  { dx: -1, dy: 1, rotation: 90 },
  { dx: 0, dy: 1, rotation: 90 },
  { dx: 1, dy: 1, rotation: 90 },
]

export const rotationMapping: Record<number, number> = {
  0: 0,
  90: 1,
  180: 0,
  270: -1,
  360: 0,
}

export function facetLocationToIndex(location: FacetLocation): number {
  return {
    left: 0,
    middle: 1,
    right: 2,
  }[location]
}

export function parseChrominoPosition(
  chrominoPositionString: string,
): ChrominoPosition {
  const [x, y, rotation] = chrominoPositionString.split(",")
  return { x: Number(x), y: Number(y), rotation: Number(rotation) }
}

export function stringifyChrominoPosition(pos: ChrominoPosition): string {
  return `${pos.x},${pos.y},${pos.rotation}`
}

/** Return the three positions of the chromino squares together with their color */
export function chrominoCore(
  chrominoString: string,
  position: ChrominoPosition,
): (Position & ColorIndication)[] {
  const cos = rotationMapping[position.rotation + 90]
  const sin = rotationMapping[position.rotation]
  // Note: index is dx
  // dy is 0
  return chrominoString.split(",").map((square, index) => ({
    x: position.x + (index - 1) * cos,
    y: position.y + (index - 1) * sin,
    color: Number(square),
  }))
}

/** Return the eight positions of the chromino squares together with their color */
export function chrominoSurrounding(
  position: ChrominoPosition,
): (Position & FacetPosition)[] {
  const cos = rotationMapping[position.rotation + 90]
  const sin = rotationMapping[position.rotation]
  return baseChrominoSurrounding.map((delta) => ({
    x: position.x + cos * delta.dx - sin * delta.dy,
    y: position.y + sin * delta.dx + cos * delta.dy,
    location: delta.location,
  }))
}

/** List all the chromino positions which attach to the chromino at a given position */
export function chrominoContact(
  position: ChrominoPosition,
): ChrominoPosition[] {
  let cos = rotationMapping[position.rotation + 90]
  let sin = rotationMapping[position.rotation]
  return baseChrominoContact.map((delta) => {
    return {
      x: position.x + cos * delta.dx - sin * delta.dy,
      y: position.y + sin * delta.dx + cos * delta.dy,
      rotation: (position.rotation + delta.rotation) % 180,
    }
  })
}

/** List all chromino positions which collide with the given position */
export function chrominoColliding(position: ChrominoPosition) {
  let cos = rotationMapping[position.rotation + 90]
  let sin = rotationMapping[position.rotation]
  return baseChrominoColliding.map((delta) => {
    return {
      x: position.x + cos * delta.dx - sin * delta.dy,
      y: position.y + sin * delta.dx + cos * delta.dy,
      rotation: (position.rotation + delta.rotation) % 180,
    }
  })
}
