/** parse data from MagicMirror **/
var _load = require("../components/loadLibraries.js")

async function init(that) {
  that.lib = { error: 0 }
  that.commander = null
}

async function parse(that) {
  console.log("[PIR] EXT-Pir Version:", require('../package.json').version, "rev:", require('../package.json').rev )
  let bugsounet = await _load.libraries(that)
  if (bugsounet) {
    console.error("[PIR] [DATA] Warning:", bugsounet, "needed library not loaded !")
    console.error("[PIR] [DATA] Try to solve it with `npm run rebuild` in EXT-Pir directory")
    return
  }
  that.commander = new that.lib.Commander(that)
}

exports.init = init
exports.parse = parse
