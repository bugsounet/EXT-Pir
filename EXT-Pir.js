/*!****************
* EXT_Pir
* bugsounet ©02/24
******************/

Module.register("EXT-Pir", {
  requiresVersion: "2.25.0",
  defaults: {
    debug: false,
    gpio: 21,
    reverseValue: false
  },

  start: function () {
    this.ready = false
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "PIR_INITIALIZED":
        this.ready = true
        this.sendNotification("EXT_HELLO", this.name)
        break
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
          message: `Error Detected: ${payload}`,
          timer: 10000
        })
        break
      case "WARNING":
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: `Error When Loading: ${payload.library}. Try to solve it with 'npm run rebuild' in EXT-Pir directory`,
          timer: 10000
        })
        break
    }
  },

  notificationReceived: function (notification, payload, sender) {
    switch(notification) {
      case "GA_READY":
        if (sender.name == "MMM-GoogleAssistant") this.sendSocketNotification("INIT", this.config)
        break
      case "EXT_PIR-START":
        if (this.ready) this.sendSocketNotification("START")
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
