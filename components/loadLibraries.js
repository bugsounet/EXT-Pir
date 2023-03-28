/** Load sensible library without black screen **/
var log = (...args) => { /* do nothing */ }

function libraries(that) {
  if (that.config.debug) log = (...args) => { console.log("[PIR] [LIB]", ...args) }
  let libraries= [
    // { "library to load" : "store library name" }
    { "../components/pirLib.js": "Pir" },
    { "../components/pirCommander.js": "Commander" },
    { "onoff": "onoff" }
  ]
  let errors = 0
  return new Promise(resolve => {
    libraries.forEach(library => {
      for (const [name, configValues] of Object.entries(library)) {
        let libraryToLoad = name
        let libraryName = configValues

        try {
          if (!that.lib[libraryName]) {
            that.lib[libraryName] = require(libraryToLoad)
            log("Loaded:", libraryToLoad, "->", "this.lib."+libraryName)
          }
        } catch (e) {
          console.error("[PIR] [LIB]", libraryToLoad, "Loading error!" , e.toString(), e)
          that.sendSocketNotification("WARNING" , {library: libraryToLoad })
          errors++
          that.lib.error = errors
        }
      }
    })
    if (!errors) console.log("[PIR] [LIB] All libraries loaded!")
    resolve(errors)
  })
}

exports.libraries = libraries
