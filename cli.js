#!/usr/bin/env node

var { createReadStream, openSync, readSync } = require('fs')
var { createServer } = require('http')
var { execSync } = require('child_process')
var pump = require('pump')
var minimist = require('minimist')
var genHTML = require('./genHTML.js')

function stringify (pojo) {
  return JSON.stringify(
    Object.keys(pojo)
      .reduce(function (acc, cur) {
        var val = pojo[cur]
        acc[cur] = typeof val === 'function' ? val.toString() : val
        return acc
      }, {})
  )
}

var argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    version: 'v'
  }
})

var version = require('./package.json').version
if (argv.version) return console.log(version)
if (argv.help) return console.log(`
  wasm-peep v${version}

    bikeshed debugging for wasm

  Usage:

    wasm-peep|wasmpeep|wasmp [--options] file.wasm

  Options:

    -h, --help            print usage instructions
    -v, --version         print version
        --wasm            WebAssembly module filepath
        --port            server port, default: 41900
        --imports         path to a CommonJS module exporting an import object

  Examples:

    wasmpeep ./module.wasm
    wasmpeep --wasm ./module.wasm
`.replace(/^ {2}/gm, ''))

var port = argv.port || 41900
var wasm_file = argv.wasm || argv._[0]
var html = genHTML(port)
var imports = argv.imports ? stringify(require(argv.imports)) : '{}'

var numba = Buffer.alloc(4)
var magic = Buffer.from([ 0x00, 0x61, 0x73, 0x6d ])
readSync(openSync(wasm_file, 'r'), numba, 0, 4, 0)
if (!numba.equals(magic)) throw Error('not wasm')

var server = createServer(function (req, res) {
  if (req.url.endsWith('wasm')) {
    res.writeHead(200, { 'Content-Type': 'application/wasm' })
    pump(createReadStream(wasm_file), res)
  } else if (req.url.endsWith('imports')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(imports)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }
})

server.listen(port, function () {
  console.log(`wasm-peep server live @ localhost:${port}`)
  if (process.platform === 'win32') {
    execSync(`start firefox -devtools -url http://localhost:${port}`)
  } else if (process.platform === 'darwin') {
    execSync(`/Applications/Firefox.app/Contents/MacOS/firefox --devtools --url http://localhost:${port}`)
  } else {
    execSync(`open -a firefox --devtools --url http://localhost:${port}`)
  }
})
