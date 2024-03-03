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
      gpio: 21
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
    let options = {
      mode: "text",
      scriptPath: __dirname,
      pythonOptions: ["-u"],
      args: [ "-g", this.config.gpio ]
    };

    this.pir = new PythonShell("MotionSensor.py", options);
    this.callback("PIR_STARTED");

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
      if (err) console.error("[PIR] [CORE] [PYTHON]",err);
      console.warn(`[PIR] [CORE] [PYTHON] The exit code was: ${code}`);
      console.warn(`[PIR] [CORE] [PYTHON] The exit signal was: ${signal}`);
    });
  }

  stop () {
    if (!this.running) return;
    this.pir.kill();
    this.pir = null;
    this.running = false;
    this.callback("PIR_STOP");
    log("Stop");
  }
}

module.exports = PIR;
