// wasm-peep file.wasm [importObject]

var packWebAssembly = require('./index.js')
var tapePuppetStream = require('tape-puppet')

var wasm_buf = require('fs').readFileSync(process.argv[2])

// TODO: check magic number for wasm

// TODO: serve wasm from a localhost server that sets content-type to application/wasm

// TODO: refactor, dont pass wasm_buf, it will be fetched, rename to genClientCode
var js = packWebAssembly(wasm_buf)

tapePuppetStream({ devtools: true })
  .on('data', function (chunk) {
    console.log(chunk.toString())
  })
  .end(js)

// TODO: allow passing imports, incorporate cli conventions
