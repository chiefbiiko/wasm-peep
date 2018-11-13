var tape = require('tape')
var proc = require('child_process')
var get = require('http')

var got = function (url, cb) {
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

tape('grand test', function (t) {
  var child = proc.spawn('node ./cli.js ./example/example.wasm')
  child.on('error', t.end)
  // TODO: hit the server and assert responses...
  got('http://localhost:41900/wasm', function (err, data) {
    if (err) t.end(err)
    var magic = Buffer.from([ 0x00, 0x61, 0x73, 0x6d ])
    t.true(data)
  })
  child.kill() // kill the child node/server, let firefox orphan
  t.end()
})
