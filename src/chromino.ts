import React from "react"
import ReactDOM from "react-dom/client"
import { random } from "./alias"
import { ChrominoGame, createChrominoGame } from "./core/game"
import { RenderGame } from "./display/RenderGame"
import { createStyleSheet } from "./lib/styleSheet"
import { resolveSearch } from "./lib/urlParameter"
import "./style.css"
import { Config, RenderGrid } from "./type"

const BASE_THEME = {
  empty: "",
  red: "8D2622",
  blue: "113065",
  green: "3F752F",
  yellow: "CAAD3B",
  purple: "4A1D53",
}

function getConfig() {
  return resolveSearch<Config>(location, {
    playerCount: [() => 2],
    initialChrominoCount: [() => 7],
    playingPeriodMs: [({ slow }) => (slow() ? 1000 : 1)],
    chrominoColorCount: [() => 5],
    seed: [() => Math.floor(Math.random() * 1_000_000)],
    randomEngine: [({ seed }) => random.MersenneTwister19937.seed(seed())],
    victoryCondition: [() => "allPlayers"],
    slow: [() => false, Boolean],
    theme: [() => Object.values(BASE_THEME).join(';'), (text: string) => String(text).split(';').map(word => `#${word}`)],
    squareSize: [() => 30],
    borderStyle: [() => "2px solid white", (text) => text.replace(/,/g, ' ')],
  })
}

function main() {
  const config = getConfig()
  console.log("config", config)

  const colorClassNameArray = [
    "empty",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
  ]
  const extraColorClassNameArray = ["orange", "pink", "black", "white"]
  colorClassNameArray.push(...extraColorClassNameArray)
  if (config.chrominoColorCount > colorClassNameArray.length) {
    throw new Error("chrominoColorCount is too large")
  }

  let game: ChrominoGame
  let error: string | undefined = undefined
  try {
    game = createChrominoGame(config)
  } catch (e) {
    error = String(e)
  }

  const styleSheet = createStyleSheet(document)
  for (let k = 1; k <= 9; k++) {
    const name = colorClassNameArray[k]
    styleSheet.insertRule(`
      .${name} {
        background-color: ${config.theme[k] ?? name};
      }`
    )
  }

  styleSheet.insertRule(`
    table.grid td {
      width: ${config.squareSize}px;
      height: ${config.squareSize}px;
      border: ${config.borderStyle};
    }
  `)

  const reactRoot = ReactDOM.createRoot(document.getElementById("root")!)

  let grid: RenderGrid = []
  const render = () => {
    grid = []
    error = undefined
    // extract grid from the chrominoGame
    try {
      grid = game.getRenderGrid({
        getRenderSquare: (index, color: number) => ({
          index,
          className: colorClassNameArray[color],
        }),
      })
    } catch (e) {
      error = String(e)
    }

    reactRoot.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(RenderGame, {
          grid,
          error,
          playerArray: game.playerArray,
        }),
      ),
    )
  }

  let outcome: "stop" | "continue" = "continue"

  const run = () => {
    if (outcome === "stop") {
      console.log("game over!")
      return
    }
    outcome = game.step()
    render()
    setTimeout(run, config.playingPeriodMs)
  }

  setTimeout(run, config.playingPeriodMs)
}

main()
