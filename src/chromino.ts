import React from "react"
import ReactDOM from "react-dom/client"
import { random } from "./alias"
import "./color.css"
import { ChrominoGame, createChrominoGame } from "./core/game"
import { RenderGame } from "./display/RenderGame"
import { resolveSearch } from "./lib/urlParameter"
import "./style.css"
import { Config, RenderGrid } from "./type"

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
  })
}

function main() {
  const config = getConfig()
  console.log("config", config)

  const colorClassNameArray = [
    "empty",
    "purple",
    "blue",
    "green",
    "yellow",
    "red",
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
