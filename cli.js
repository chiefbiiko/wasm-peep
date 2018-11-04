#!/usr/bin/env node

// wasm-peep file.wasm [importObject]

var { createReadStream } = require('fs')
var { createServer } = require('http')
var pump = require('pump')
var minimist = require('minimist')

// TODO: allow passing imports from a js file
var argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    version: 'v',
    wasm: 'w',
    port: 'p'
  }
})

var wasm_file = argv.wasm
var html_file = './index.html'
var port = argv.port || 41900

var server = createServer(function (req, res) {
  if (req.url.endsWith('wasm')) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'localhost',
      'Content-Type': 'application/wasm'
    })
    pump(createReadStream(wasm_file), res)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    pump(createReadStream(html_file), res)
  }
})

server.listen(port, function () {
  console.log(`wasm-peep server live @ localhost:${port}`)
  // TODO: open firefox with devtools opened
})
