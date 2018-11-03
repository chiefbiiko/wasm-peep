module.exports = function packWebAssembly (wasm_buf) {
  var base64_wasm = wasm_buf.toString('base64')
  return `
    (function () {
      function toUint8Array (s) {
        return new Uint8Array(atob(s).split('').map(charCode))
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
          WebAssembly.instantiateStreaming(new Response(wasm, { headers: { 'Content-Type': 'application/wasm' } }), imp)
            .then(function (w) {
              mod.exports = w.instance.exports
              mod.memory = mod.exports.memory && mod.exports.memory.buffer && new Uint8Array(mod.exports.memory.buffer)
              resolve(mod)
            })
            .catch(reject)
        })
      }
      // TODO: fetch from a localhost server that sets content-type to application/wasm
      loadWebAssembly('${base64_wasm}')
        .then(function (mod) {
          var ol = document.createElement('ol')
          var li1 = document.createElement('li')
          var li2 = document.createElement('li')
          var li3 = document.createElement('li')
          var ta = document.createElement('textarea')
          var btn = document.createElement('button')
          ol.appendChild(li1)
          ol.appendChild(li2)
          ol.appendChild(li3)
          li1.innerText = 'set breakpoints in yo wasm'
          li2.innerText = 'define a function in the textarea below'
          li3.innerText = 'click run'
          ta.placeholder = 'fill this with a function definition that has this signature: function (module) // with module.exports.exported_func'
          ta.style.width = '50%'
          ta.style.height = '100px'
          btn.innerText = 'run'
          btn.style.display = 'block'
          btn.onclick = function () {
            // BUG: throws something
            //new Function('return ' + ta.innerText)()(mod)
          }
          document.body.appendChild(ol)
          document.body.appendChild(ta)
          document.body.appendChild(btn)
        })
        .catch(console.error)
    })()
    `.replace(/^ {4}/gm, '')
}
