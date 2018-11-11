#!/usr/bin/env node

var { readFile, watch } = require('fs')
var { createServer } = require('http')
var { exec } = require('child_process')
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
        --watch           update wasm and imports on change? default: false
        --port            server port, default: 41900
        --imports         path to a CommonJS module exporting an import object

  Examples:

    wasmpeep ./module.wasm
    wasmp --watch ./module.wasm
`.replace(/^ {2}/gm, ''))

var port = argv.port || 41900
var wasm_file = argv._[0]
var html = genHTML(port)

var imports
var wasm_buf
var magic = Buffer.from([ 0x00, 0x61, 0x73, 0x6d ])

function stashWasm () {
  readFile(wasm_file, function (err, buf) {
    if (err) throw err
    if (!buf.slice(0, 4).equals(magic)) throw Error('not wasm')
    console.log('updatin to the latest state of yo wasm')
    wasm_buf = buf
  })
}

function stashImports () {
  imports = argv.imports ? stringify(require(argv.imports)) : '{}'
}

stashWasm()
stashImports()

var watchers = []
if (argv.watch) {
  watchers.push(watch(wasm_file, { persistent: false }, stashWasm))
  if (argv.imports)
    watchers.push(watch(argv.imports, { persistent: false }, stashImports))
}

var server = createServer(function (req, res) {
  if (req.url.endsWith('wasm')) {
    res.writeHead(200, { 'Content-Type': 'application/wasm' })
    res.end(wasm_buf)
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
  var cmd
  if (process.platform === 'win32') {
    cmd = `start firefox -devtools -url http://localhost:${port}`
  } else if (process.platform === 'darwin') {
    cmd = `/Applications/Firefox.app/Contents/MacOS/firefox --devtools --url http://localhost:${port}`
  } else {
    cmd = `open -a firefox --devtools --url http://localhost:${port}`
  }
  exec(cmd, function (err, stdout, stderr) {
    if (err || stderr) console.error(`could not start firefox. please navigate firefox to http://localhost:${port} manually`)
  })
})

process.on('exit', function () {
  watchers.forEach(function (watcher) {
    watcher.close()
  })
  server.close()
})
