import { random } from "../../alias"
import { Config } from "../../type"

export type BagContent = string[]

function initialContent(chrominoColorCount: number) {
  const content: BagContent = []

  // Starting at 1, since 0 is the empty square
  for (let i = 1; i <= chrominoColorCount; i++) {
    for (let j = 1; j <= chrominoColorCount; j++) {
      for (let k = i; k <= chrominoColorCount; k++) {
        content.push(`${i},${j},${k}`)
      }
    }
  }

  return content
}

export function createBag(config: Config) {
  const content = initialContent(config.chrominoColorCount)
  return {
    drawChromino: (count: number) => {
      if (content.length < count) {
        throw new Error("bag is empty")
      }
      const selection = random.sample(config.randomEngine, content, count)
      selection.forEach((chromino) => {
        content.splice(content.indexOf(chromino), 1)
      })
      return selection
    },
  }
}

export type Bag = ReturnType<typeof createBag>
