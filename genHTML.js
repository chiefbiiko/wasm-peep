module.exports = function genHTML (port = 41900) {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script>
        main()
        async function main () {
          renderUi(await loadWebAssembly('http://localhost:${port}'))
          async function loadWebAssembly (url) {
            var impo_res = await fetch(url + '/imports')
            var impo_raw = await impo_res.json()
            var imports = reassembleImports(impo_raw)
            var wasm_res = await fetch(url + '/wasm')
            var wasm_res2 = wasm_res.clone()
            var wasm = await WebAssembly.instantiateStreaming(wasm_res, imports)
            var mod = {
              buffer: new Uint8Array(await wasm_res2.arrayBuffer()),
              memory: null,
              exports: null,
              realloc: realloc
            }
            mod.exports = wasm.instance.exports
            mod.memory = mod.exports.memory && mod.exports.memory.buffer && new Uint8Array(mod.exports.memory.buffer)
            return mod
            function realloc (size) {
              mod.exports.memory.grow(Math.max(0, Math.ceil(Math.abs(size - mod.memory.length) / 65536)))
              mod.memory = new Uint8Array(mod.exports.memory.buffer)
            }
            function reassembleImports (impo_raw) {
              return Object.keys(impo_raw)
                .reduce(function (acc, cur) {
                  acc[cur] = eval('(' + impo_raw[cur] + ')')
                  return acc
                }, {})
            }
          }
          function renderUi (mod) {
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
            ta.style.width = '100%'
            ta.style.height = '100px'
            btn.innerText = 'run'
            btn.style.display = 'block'
            btn.onclick = function () {
              var func
              try {
                func = eval('(' + ta.value + ')')
              } catch (err) {
                console.error(err)
                return alert('invalid function definition')
              }
              if (typeof func !== 'function')
                return alert('invalid function definition')
              func(mod)
            }
            document.body.appendChild(ol)
            document.body.appendChild(ta)
            document.body.appendChild(btn)
          }
        }
      </script>
    </head>
    <body></body>
    </html>
    `.replace(/^ {4}/gm, '').trim()
}
