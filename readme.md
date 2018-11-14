# wasm-peep

[![build status](http://img.shields.io/travis/chiefbiiko/wasm-peep.svg?style=flat)](http://travis-ci.org/chiefbiiko/wasm-peep) [![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/chiefbiiko/wasm-peep?branch=master&svg=true)](https://ci.appveyor.com/project/chiefbiiko/wasm-peep) [![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](./security.md)

***

Bikeshed debugging of WebAssembly modules using Firefox devtools straight outta `node`.

***

```
npm install --global chiefbiiko/wasm-peep
```

The command line program is available as `wasm-peep`, `wasmpeep`, and `wasmp`.

***

## CLI Usage

```
wasm-peep|wasmpeep|wasmp [--options] file.wasm
```

### Options

```
Options:

  -h, --help            print usage instructions
  -v, --version         print version
      --watch           update wasm and imports on change? default: false
      --port            server port, default: 41900
      --imports         path to a CommonJS module exporting an import object
```

When `--watch`in, the server watches the WebAssembly module and imports file for changes and updates its response payloads accordingly.

***

## License

[MIT](./license.md)
