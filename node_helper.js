/**************************
* node_helper for EXT-Pir *
* BuGsounet ©03/23        *
***************************/

const NodeHelper = require('node_helper')

logPIR = (...args) => { /* do nothing */ }
var parseData = require("./components/parseData.js")

module.exports = NodeHelper.create({

  start: function() {
    parseData.init(this)
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        parseData.parse(this)
        break
      case "START":
        this.commander.start()
        break
      case "STOP":
        this.commander.stop()
        break
    }
  }
});
