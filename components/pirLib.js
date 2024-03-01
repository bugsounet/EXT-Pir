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
        //this.callback("PIR_ERROR", "Error Detected");
        console.warn("[PIR] [CORE]", message);
	  }
    });
    this.pir.on("stderr", (stderr) => {
      // handle stderr (a line of text from stderr)
      console.error("[PIR] [CORE]", stderr);
      this.running = false;
    });

    this.pir.end((err,code,signal) => {
	  if (err) console.error("[PIR] [CORE]",err);
	  console.warn(`[PIR] [CORE] The exit code was: ${  code}`);
	  console.warn(`[PIR] [CORE] The exit signal was: ${  signal}`);
	  console.warn("[PIR] [CORE] finished");
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
