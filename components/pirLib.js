/*******************
* PIR library
* bugsounet ©08/24
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
    this.pirChip = null;
    this.pirLine = null;
    this.pirChipNumber = -1;
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
      case 3:
        console.log("[PIR] [CORE] Mode 3 Selected (gpiod library)");
        this.gpiodDetect();
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
      console.log("[PIR] [CORE] Started!");
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
    console.log("[PIR] [CORE] Started!");
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
    console.log("[PIR] [CORE] Started!");

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

  /* experimental */

  async gpiodDetect () {
    try {
      const { version, Chip, Line } = require("node-libgpiod");
      const numbers = [0,1,2,3,4,5,6,7,8,9,10];
      numbers.forEach((number) => {
        try {
          const chip = new Chip(number);
          if (chip.getChipLabel().includes("pinctrl-")) {
            console.log(`[PIR] [CORE] [GPIOD] Found chip ${number}: ${chip.getChipLabel()}`);
            this.pirChipNumber = number;
          }
        } catch { /* out of chip */ }
      });

      if (this.pirChipNumber === -1) {
        console.error("[PIR] [CORE] [GPIOD] No Chip Found!");
        this.running = false;
        return;
      }

      this.pirChip = new Chip(this.pirChipNumber);
      this.pirLine = new Line(this.pirChip, this.config.gpio);
      this.pirLine.requestInputMode();
      this.callback("PIR_STARTED");
      console.log("[PIR] [CORE] Started!");
    } catch (err) {
      if (this.pirLine) {
        this.pirLine.release();
        this.pirLine = null;
      }

      console.error(`[PIR] [CORE] [GPIOD] ${err}`);
      this.running = false;
      return this.callback("PIR_ERROR", err.message);
    }

    this.running = true;

    this.pir = () => {
      var line = this.pirLine;
      if (this.running) {
        try {
          var value = line.getValue();
          if (value !== this.oldstate) {
            this.oldstate = value;
            log(`Sensor read value: ${value}`);
            if (value === 1) {
              this.callback("PIR_DETECTED");
              log("Detected presence");
            }
          }
        } catch (err) {
          console.error(`[PIR] [CORE] [GPIOD] ${err}`);
          this.callback("PIR_ERROR", err);
        };
      }
    };
    setInterval(() => this.pir(), 1000);
  }
}

module.exports = PIR;
