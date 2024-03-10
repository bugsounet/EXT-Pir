/**************************
* node_helper for EXT-Pir *
* bugsounet ©03/24        *
***************************/

"use strict";
var log = (...args) => { /* do nothing */ };
const NodeHelper = require("node_helper");
const LibPir = require("./components/pirLib.js");

module.exports = NodeHelper.create({
  start () {
    this.config = {};
    this.lib = { error: 0 };
    this.commander = null;
  },

  socketNotificationReceived (notification, payload) {
    switch (notification) {
      case "INIT":
        this.config = payload;
        this.initialize();
        break;
      case "START":
        this.pir.start();
        break;
      case "STOP":
        this.pir.stop();
        break;
    }
  },

  //[DATA]
  async initialize () {
    console.log("[PIR] EXT-Pir Version:", require("./package.json").version, "rev:", require("./package.json").rev);
    if (this.config.debug) log = (...args) => { console.log("[PIR]", ...args); };

    this.pirConfig = {
      debug: this.config.debug,
      gpio: this.config.gpio,
      mode: this.config.mode
    };
    let Tools = {
      sendSocketNotification: (...args) => this.sendSocketNotification(...args)
    };
    this.pir = new LibPir(this.pirConfig, Tools);
  }
});
