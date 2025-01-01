import { Player } from "../core/player/player"
import { RenderGrid } from "../type"

interface RenderGameProps {
  grid?: RenderGrid
  error?: string
  playerArray: Player[]
}

export function RenderGame(prop: RenderGameProps) {
  const { grid, error = "", playerArray } = prop

  if (grid) {
    return (
      <div>
        <ul className="text-center">
          {playerArray.map((player, k) => (
            <li key={k}>{player.chrominoArray.length}</li>
          ))}
        </ul>
        <table className="grid">
          <tbody>
            {grid.map((row) => (
              <tr key={row.index}>
                {row.content.map((square) => (
                  <td
                    key={square.index}
                    className={square.className || "nocolor"}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } else {
    return <div className="error">{error}</div>
  }
}
