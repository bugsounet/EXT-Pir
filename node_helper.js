/********************************
* node_helper for EXT-Pir v1 *
* BuGsounet ©02/22              *
********************************/

const NodeHelper = require('node_helper')

logPIR = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({

  start: function() {
    this.lib = {}
  },

  initialize: async function() {
    console.log("[PIR] Initialize...")
    if (this.config.debug) logPIR = (...args) => { console.log("[PIR]", ...args) }
    /** check if update of npm Library needed **/
    let bugsounet = await this.loadBugsounetLibrary()
    if (bugsounet) {
      console.error("[PIR] Warning:", bugsounet, "needed @bugsounet library not loaded !")
      console.error("[PIR] Try to solve it with `npm run rebuild` in EXT-Pir directory")
      return
    } else {
      console.log("[PIR] All needed @bugsounet library loaded !")
    }
    this.PIR()
    console.log("[PIR] Initialize Complete Version:", require('./package.json').version, "rev:", require('./package.json').rev )
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
    }
  },

  PIR: function () {
    var callbacks= {
      "pir": (noti,params) => {
        this.sendSocketNotification(noti, params)
        logPIR("Callback Notification:", noti, params ? params.toString(): "")
      }
    }
    var pirConfig= {
      gpio: this.config.gpio,
      reverseValue: this.config.reverseValue
    }
    this.pir = new this.lib.Pir(pirConfig, callbacks.pir, this.config.debug)
    this.pir.start()
  },

  /** Load require @busgounet library **/
  /** It will not crash MM (black screen) **/
  loadBugsounetLibrary: function() {
    let libraries= [
      // { "library to load" : [ "store library name", "path to check"] }
      { "@bugsounet/pir": [ "Pir", "gpio" ] },
    ]
    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name,
              libraryName = configValues[0],
              libraryPath = configValues[1],
              index = (obj,i) => { return obj[i] },
              libraryActivate = libraryPath.split(".").reduce(index,this.config)

          // libraryActivate: verify if the needed path of config is activated (result of reading config value: true/false) **/
          if (libraryActivate) {
            try {
              if (!this.lib[libraryName]) {
                this.lib[libraryName] = require(libraryToLoad)
                logPIR("Loaded " + libraryToLoad)
              }
            } catch (e) {
              console.error("[PIR]", libraryToLoad, "Loading error!" , e)
              this.sendSocketNotification("WARNING" , {library: libraryToLoad })
              errors++
            }
          }
        }
      })
      resolve(errors)
    })
  }
});
