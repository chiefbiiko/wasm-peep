function toUint8Array (s) {
  if (typeof atob === 'function') return new Uint8Array(atob(s).split('').map(charCode))
  return Buffer.from(s, 'base64')
}

function charCode (c) {
  return c.charCodeAt(0)
}

function loadWebAssembly (base64_wasm, imp) {
  return new Promise(function (resolve, reject) {
    var wasm = toUint8Array(base64_wasm)
    var mod = {
      buffer: wasm,
      memory: null,
      exports: null,
      realloc: realloc
    }
    function realloc (size) {
      mod.exports.memory.grow(Math.max(0, Math.ceil(Math.abs(size - mod.memory.length) / 65536)))
      mod.memory = new Uint8Array(mod.exports.memory.buffer)
    }
    WebAssembly.instantiateStreaming(new Response(wasm), imp)
      .then(function (w) {
        mod.exports = w.instance.exports
        mod.memory = mod.exports.memory && mod.exports.memory.buffer && new Uint8Array(mod.exports.memory.buffer)
        resolve(mod)
      })
      .catch(reject)
  })
}

function peepWebAssembly (wasm_buf) {
  var base64_wasm = wasm_buf.toString('base64')
  // pack all funcs from above into this iife string, then, in there...
  // call loadWebAssembly, save the module instance
  // on btn click execute code from a textarea with module instance
  return ``

}
