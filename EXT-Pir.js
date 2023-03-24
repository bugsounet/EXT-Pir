/******************
*  EXT_Pir v1
*  ©Bugsounet
*  02/2022
******************/

Module.register("EXT-Pir", {
  requiresVersion: "2.18.0",
  defaults: {
    debug: false,
    gpio: 21,
    reverseValue: false
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "PIR_STARTED":
        this.sendNotification("EXT_PIR-STARTED")
        break
      case "PIR_STOP":
        this.sendNotification("EXT_PIR-STOPPED")
        break
      case "PIR_DETECTED":
        this.sendNotification("EXT_SCREEN-WAKEUP")
        break
      case "PIR_ERROR":
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: "Error Detected. Try to solve it with `npm run rebuild` in EXT-Pir directory",
          timer: 10000
        })
        break
      case "WARNING":
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: "Error When Loading: " + payload.library + ". Try to solve it with `npm run rebuild` in EXT-Pir directory",
          timer: 10000
        })
        break
    }
  },

  notificationReceived: function (notification, payload, sender) {
    switch(notification) {
      case "GW_READY":
        if (sender.name == "Gateway") {
          this.sendSocketNotification("INIT", this.config)
          this.sendNotification("EXT_HELLO", this.name)
          this.ready = true
        }
        break
      case "EXT_PIR-RESTART":
        if (this.ready) this.sendSocketNotification("RESTART")
        break
      case "EXT_PIR-STOP":
        if (this.ready) this.sendSocketNotification("STOP")
        break
    }
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = "none"
    return dom
  }
});
