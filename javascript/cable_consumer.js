let consumer

const BACKOFF = [25, 50, 75, 100, 200, 250, 500, 800, 1000, 2000]

const retryGetConsumer = (retry) => {
  if (consumer) return consumer

  if (retry >= BACKOFF.length) {
    throw new Error("Couldn't obtain a Action Cable consumer within 5s")
  }

  let result = null

  setTimeout(() => {
    result = retryGetConsumer(retry + 1)
  }, BACKOFF[retry])

  return result
}

export default {
  setConsumer (value) {
    consumer = value
  },

  getConsumer () {
    return retryGetConsumer(0)
  }
}
