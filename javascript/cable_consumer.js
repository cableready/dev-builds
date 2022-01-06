let consumer

const retryGetConsumer = () => {
  if (!consumer) {
    setTimeout(() => {
      return retryGetConsumer()
    })
  } else {
    return consumer
  }
}

export default {
  setConsumer (value) {
    consumer = value
  },

  async getConsumer () {
    return retryGetConsumer()
  }
}
