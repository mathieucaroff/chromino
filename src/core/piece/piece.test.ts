import { chrominoContact } from "./piece"

describe("chrominoContact", () => {
  test("returns correct contact positions for rotation 0", () => {
    const contact = chrominoContact({ x: 0, y: 0, rotation: 0 })

    // Should contain 22 total contact positions
    expect(contact).toHaveLength(22)

    // Check a few key positions for rotation 0
    expect(contact).toContainEqual({ x: -3, y: 0, rotation: 0 }) // Left side
    expect(contact).toContainEqual({ x: 3, y: 0, rotation: 0 }) // Right side
    expect(contact).toContainEqual({ x: -2, y: -1, rotation: 0 }) // Above
    expect(contact).toContainEqual({ x: -2, y: 1, rotation: 0 }) // Below
  })

  test("returns correct contact positions for rotation 90", () => {
    const contact = chrominoContact({ x: 0, y: 0, rotation: 90 })

    // Should still contain 22 total positions
    expect(contact).toHaveLength(22)

    // Check a few key positions for rotation 90
    expect(contact).toContainEqual({ x: 0, y: -3, rotation: 90 }) // Above (was left)
    expect(contact).toContainEqual({ x: 0, y: 3, rotation: 90 }) // Below (was right)
    expect(contact).toContainEqual({ x: -1, y: -2, rotation: 0 }) // Above-left
    expect(contact).toContainEqual({ x: 1, y: -2, rotation: 0 }) // Above-right
  })

  test("handles non-zero starting position", () => {
    const contact = chrominoContact({ x: 2, y: 3, rotation: 0 })

    // Check positions are offset correctly
    expect(contact).toContainEqual({ x: -1, y: 3, rotation: 0 }) // Left side
    expect(contact).toContainEqual({ x: 5, y: 3, rotation: 0 }) // Right side
    expect(contact).toContainEqual({ x: 0, y: 2, rotation: 0 }) // Above
    expect(contact).toContainEqual({ x: 0, y: 4, rotation: 0 }) // Below
  })
})
