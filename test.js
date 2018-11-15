var tape = require('tape')
var { spawn, execSync } = require('child_process')
var { get } = require('http')

function sleep (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

function got (url, cb) {
  get(url, function (res) {
    var chunks = []
    res.on('data', function (chunk) {
      chunks.push(chunk)
    })
    res.on('end', function () {
      cb(null, Buffer.concat(chunks))
    })
  }).on('error', cb)
}

function reassembleImports (impo_raw) {
  return Object.keys(impo_raw)
    .reduce(function (acc, cur) {
      acc[cur] = eval('(' + impo_raw[cur] + ')')
      return acc
    }, {})
}

tape('grand test', async function (t) {
  argv =  [
    './cli.js',
    '--imports',
    './example/imports.js',
    './example/example.wasm'
  ]
  var child = spawn('node', argv, { stdio: 'inherit' })
  // when spawning on unix, execution resumes too fast, server not live yet
  if (process.platform !== 'win32') sleep(1000)
  child.on('error', t.end)
  got('http://localhost:41900/wasm', function (err, data) {
    if (err) t.end(err)
    var magic = Buffer.from([ 0x00, 0x61, 0x73, 0x6d ])
    t.true(data.slice(0, 4).equals(magic), 'got back wasm')
    got('http://localhost:41900/imports', function (err, data) {
      if (err) t.end(err)
      imports = reassembleImports(JSON.parse(data))
      t.equal(imports.fraud(), 419, 'fully reassembled imports')
      got('http://localhost:41900/', function (err, data) {
        if (err) t.end(err)
        var doc_head = data.slice(0, 20).toString().trim().toLowerCase()
        t.true(doc_head.startsWith('<!doctype html>'), 'got back html')
        child.kill()
        execSync(process.platform === 'win32'
          ? 'taskkill /f /fi "cputime lt 00:00:03" /im firefox.exe'
          : 'pkill -n firefox')
        t.end()
      })
    })
  })
})
