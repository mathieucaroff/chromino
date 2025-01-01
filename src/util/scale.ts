export interface ScaleData<T> {
  content: Record<number, T>
}

export interface Scale<T> extends ScaleData<T> {
  isEmpty: () => boolean
  set: (index: number, value: T) => void
  setDefault: (index: number, valueGetter: () => T) => T
  remove: (index: number) => void
  range: () => number[]
  map: (callback: (value: T, index: number) => T) => Scale<T>
  forEach: (callback: (value: T, index: number) => void) => void
}

export function createScale<T>(data?: ScaleData<T>): Scale<T> {
  const me: Scale<T> = {
    content: data?.content ?? {},
    isEmpty: () => Object.keys(me.content).length === 0,
    set: (index: number, value: T) => {
      me.content[index] = value
    },
    setDefault: (index: number, valueGetter: () => T) => {
      if (me.content[index] === undefined) {
        me.content[index] = valueGetter()
      }
      return me.content[index]
    },
    remove: (index: number) => {
      delete me.content[index]
    },
    range: () => {
      return Object.keys(me.content)
        .map(Number)
        .sort((a, b) => a - b)
    },
    map: <U>(callback: (value: T, index: number) => U) => {
      const newMe = createScale<U>({
        content: {},
      })
      me.range().forEach((index) => {
        newMe.content[index] = callback(me.content[index], Number(index))
      })
      return newMe
    },
    forEach: (callback: (value: T, index: number) => void) => {
      me.range().forEach((index) => {
        callback(me.content[index], index)
      })
    },
  }

  return me
}
