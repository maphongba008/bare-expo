const fs = require('fs')

const src = JSON.parse(fs.readFileSync('./package-lock.json'))
const dst = JSON.parse(fs.readFileSync('./package-lock2.json')).packages

const ignorePkgs = [
  '@0no-co/graphql.web',
  '@babel',
  '@expo',
  '@jest',
  '@jridgewell/gen-mapping',
  '@radix-ui',
  'codegen',
  'community-cli-plugin',
  'dev-middleware',
  '@react-navigation',
  '@remix-run',
  '@types',
  '@web3-storage',
  '@zxing',
  'ajv',
  'ansi-regex',
  'anymatch',
  'babel',
  'zustand',
  'available-typed-arrays',
  'call-bind',
  'call-bound',
  'cli-',
  'client-only',
  'emoji-regex',
  'string-width',
  'node_modules/compression/node_modules/negotiator'
]

Object.entries(src.packages).forEach(([key, value]) => {
  // console.log('checking', key)
  if (!key || ignorePkgs.some((pkg) => key.includes(pkg))) {
    // console.log('===', 'skip')
    return
  }
  if (!dst[key]) {
    console.log('===', {
      pkg: key,
      src: value.version,
      dst: 'none'
    })
    return
  }
  if (dst[key].version !== value.version) {
    console.log('===', {
      pkg: key,
      src: value.version,
      dst: dst[key].version
    })
  }
})
