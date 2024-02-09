class pirCommander {
  constructor(config,lib,Tools) {
    this.lib= lib
    this.callback= (...args) => tools.sendSocketNotification(...args)
    this.pirConfig= {
      libGpio: that.lib.onoff.Gpio,
      debug: that.config.debug,
      gpio: that.config.gpio,
      reverseValue: that.config.reverseValue
    }
    this.pir = new that.lib.Pir(this.pirConfig, this.callback)
  }

  start() {
    this.pir.start()
  }

  stop() {
    this.pir.stop()
  }
}

module.exports = pirCommander;
