/*******************
* PIR library
* bugsounet ©03/24
*******************/

var log = (...args) => { /* do nothing */ };
const { PythonShell } = require("python-shell");

class PIR {
  constructor (config, Tools) {
    this.config = config;
    this.callback = (...args) => Tools.sendSocketNotification(...args);
    this.default = {
      debug: this.config.debug,
      gpio: 21,
      mode: 0
    };
    this.config = Object.assign({}, this.default, this.config);
    if (this.config.debug) log = (...args) => { console.log("[PIR] [CORE]", ...args); };
    this.pir = null;
    this.running = false;
    this.callback("PIR_INITIALIZED");
  }

  start () {
    if (this.running) return;
    switch (this.config.mode) {
      case 0:
        console.log("[PIR] [CORE] Mode 0 Selected (onoff library)");
        this.onoffDetect();
        break;
      case 1:
        console.log("[PIR] [CORE] Mode 1 Selected (rpi.gpio)");
        this.gpioDetect();
        break;
      case 2:
        console.log("[PIR] [CORE] Mode 2 Selected (gpiozero)");
        this.gpiozeroDetect();
        break;
      default:
        console.warn(`[PIR] [CORE] mode: ${this.config.mode} is not a valid value`);
        console.warn("[PIR] [CORE] set mode 0");
        this.config.mode = 0;
        this.onoffDetect();
        break;
    }
  }

  stop () {
    if (!this.running) return;
    if (this.config.mode === 0) this.pir.unexport();
    else this.pir.kill();
    this.pir = null;
    this.running = false;
    this.callback("PIR_STOP");
    log("Stop");
  }

  onoffDetect () {
    try {
      const Gpio = require("onoff").Gpio;
      this.pir = new Gpio(this.config.gpio, "in", "both");
      this.callback("PIR_STARTED");
      console.log("[PIR] [CORE] Started in MODE 0!");
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
      if (value === 1) {
        this.callback("PIR_DETECTED");
        log(`Detected presence (value: ${value})`);
      }
    });
  }

  gpioDetect () {
    const { PythonShell } = require("python-shell");
    let options = {
      mode: "text",
      scriptPath: __dirname,
      pythonOptions: ["-u"],
      args: [ "-g", this.config.gpio ]
    };

    this.pir = new PythonShell("gpioSensor.py", options);
    this.callback("PIR_STARTED");
    console.log("[PIR] [CORE] Started in MODE 1!");
    this.running = true;

    this.pir.on("message", (message) => {
      // detect pir
      if (message === "Detected") {
        log("Detected presence");
        this.callback("PIR_DETECTED");
      } else {
        console.error("[PIR] [CORE]", message);
        this.callback("PIR_ERROR", message);
        this.running = false;
      }
    });

    this.pir.on("stderr", (stderr) => {
      // handle stderr (a line of text from stderr)
      if (this.config.debug) console.error("[PIR] [CORE]", stderr);
      this.running = false;
    });

    this.pir.end((err,code,signal) => {
      if (err) {
        console.error("[PIR] [CORE] [PYTHON]",err);
        this.callback("PIR_ERROR", err.message);
      }
      console.warn(`[PIR] [CORE] [PYTHON] The exit code was: ${code}`);
      console.warn(`[PIR] [CORE] [PYTHON] The exit signal was: ${signal}`);
    });
  }

  gpiozeroDetect () {
    const { PythonShell } = require("python-shell");
    let options = {
      mode: "text",
      scriptPath: __dirname,
      pythonOptions: ["-u"],
      args: [ "-g", this.config.gpio ]
    };

    this.pir = new PythonShell("MotionSensor.py", options);
    this.callback("PIR_STARTED");
    console.log("[PIR] [CORE] Started in MODE 2!");

    this.running = true;
    this.pir.on("message", (message) => {
      // detect pir
      if (message === "Detected") {
        log("Detected presence");
        this.callback("PIR_DETECTED");
      } else {
        console.error("[PIR] [CORE]", message);
        this.callback("PIR_ERROR", message);
        this.running = false;
      }
    });
    this.pir.on("stderr", (stderr) => {
      // handle stderr (a line of text from stderr)
      if (this.config.debug) console.error("[PIR] [CORE]", stderr);
      this.running = false;
    });

    this.pir.end((err,code,signal) => {
      if (err) {
        console.error("[PIR] [CORE] [PYTHON]",err);
        this.callback("PIR_ERROR", err.message);
      }
      console.warn(`[PIR] [CORE] [PYTHON] The exit code was: ${code}`);
      console.warn(`[PIR] [CORE] [PYTHON] The exit signal was: ${signal}`);
    });
  } 
}

module.exports = PIR;
