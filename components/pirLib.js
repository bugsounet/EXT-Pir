/*******************
* PIR library
* bugsounet ©02/24
*******************/

var log = (...args) => { /* do nothing */ };
const Gpio = require("onoff").Gpio;

class PIR {
  constructor (config, Tools) {
    this.config = config;
    this.callback = (...args) => Tools.sendSocketNotification(...args);
    this.default = {
      debug: this.config.debug,
      gpio: 21,
      reverseValue: false
    };
    this.config = Object.assign({}, this.default, this.config);
    if (this.config.debug) log = (...args) => { console.log("[PIR] [CORE]", ...args); };
    this.pir = null;
    this.running = false;
    this.callback("PIR_INITIALIZED");
  }

  start () {
    if (this.running) return;
    log("Start");
    try {
      this.pir = new Gpio(this.config.gpio, "in", "both");
      this.callback("PIR_STARTED");
    } catch (err) {
      console.error(`[PIR] [CORE] ${err}`);
      this.running = false;
      return this.callback("PIR_ERROR", err.message);
    }
    this.running = true;
    this.pir.watch((err, value) => {
      if (err) {
        console.error(`[PIR] [CORE] ${err}`);
        return this.callback("PIR_ERROR", err.message);
      }
      log(`Sensor read value: ${value}`);
      if ((value === 1 && !this.config.reverseValue) || (value === 0 && this.config.reverseValue)) {
        this.callback("PIR_DETECTED");
        log(`Detected presence (value: ${value})`);
      }
    });
  }

  stop () {
    if (!this.running) return;
    this.pir.unwatch();
    this.pir = null;
    this.running = false;
    this.callback("PIR_STOP");
    log("Stop");
  }
}

module.exports = PIR;
