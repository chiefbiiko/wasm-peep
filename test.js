var tape = require('tape')
var proc = require('child_process')

tape('grand test', function (t) {
  var child = proc.spawn('node ./cli.js ./example/example.wasm')
  child.on('error', t.end)
  // TODO: hit the server and assert responses...

  child.kill() // kill the child node/server, let firefox orphan
  t.end()
})
