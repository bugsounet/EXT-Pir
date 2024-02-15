/**************************
* node_helper for EXT-Pir *
* bugsounet ©02/24        *
***************************/

"use strict"
var log = (...args) => { /* do nothing */ }
const NodeHelper = require('node_helper')

module.exports = NodeHelper.create({
  start: function() {
    this.config = {}
    this.lib = { error: 0 }
    this.commander = null
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
      case "START":
        this.pir.start()
        break
      case "STOP":
        this.pir.stop()
        break
    }
  },

  //[DATA]
  initialize: async function() {
    console.log("[PIR] EXT-Pir Version:", require('./package.json').version, "rev:", require('./package.json').rev )
    if (this.config.debug) log = (...args) => { console.log("[PIR]", ...args) }
    let bugsounet = await this.libraries()

    if (bugsounet) {
      console.error(`[PIR] [DATA] Warning: ${bugsounet} needed library not loaded !`)
      console.error("[PIR] [DATA] Try to solve it with `npm run rebuild` in EXT-Pir directory")
      return
    }
    this.pirConfig= {
      debug: this.config.debug,
      gpio: this.config.gpio,
      reverseValue: this.config.reverseValue
    }
    let Tools = {
      sendSocketNotification: (...args) => this.sendSocketNotification(...args)
    }
    this.pir = new this.lib.Pir(this.pirConfig, Tools)
  },

  //[LIBRARY]
  libraries: function() {
    let libraries= [
      // { "library to load" : "store library name" }
      { "./components/pirLib.js": "Pir" }
    ]
    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name
          let libraryName = configValues

          try {
            if (!this.lib[libraryName]) {
              this.lib[libraryName] = require(libraryToLoad)
              log(`[LIBRARY] Loaded: ${libraryToLoad} --> this.lib.${libraryName}`)
            }
          } catch (e) {
            console.error(`[PIR] [LIB] ${libraryToLoad} Loading error!`, e.toString())
            this.sendSocketNotification("WARNING" , {library: libraryToLoad })
            errors++
            this.lib.error = errors
          }
        }
      })
      if (!errors) console.log("[PIR] [LIBRARY] All libraries loaded!")
      resolve(errors)
    })
  }
});
