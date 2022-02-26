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

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        this.sendNotification("EXT_HELLO", this.name)
        break
    }
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = "none"
    return dom
  }
});
