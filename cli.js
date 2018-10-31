// wasm-peep file.wasm [importObject]

var packWebAssembly = require('./index.js')
var tapePuppetStream = require('tape-puppet')

var wasm_buf = require('fs').readFileSync(process.argv[2])

// TODO: check magic number for wasm

var js = packWebAssembly(wasm_buf)

// tapePuppetStream({ devtools: true }).end(js)
tapePuppetStream({ devtools: true }).end('alert("fraud")')

// incorporate cli conventions
