/* global Bare, BareKit */
/* eslint-disable no-bitwise */

const RPC = require('tiny-buffer-rpc')
const any = require('tiny-buffer-rpc/any')
const id = require('hypercore-id-encoding')
const { version: dhtVersion } = require('hyperdht/package')
const KeetBackend = require('@holepunchto/keet-backend')
const registerServer = require('@holepunchto/keet-backend-rpc/server')
const KeetInspector = require('./lib/inspector')

const storage = Bare.argv[0]
const experimental = Bare.argv[1] === 'experimental'

const backend = new KeetBackend(storage, { experimental, mobile: true })

const rpc = new RPC((data) => BareKit.IPC.write(data))

BareKit.IPC.on('data', (data) => rpc.recv(data))

registerServer(backend, rpc)

const inspector = new KeetInspector()

rpc.register(1 << 8, {
  request: any,
  response: any,
  onstream: async (stream) => {
    stream.on('error', noop)

    if (backend.opened === false) await backend.ready()

    if (stream.destroying) return

    backend._swarm
      .on('update', onupdate)
      .dht.on('nat-update', onupdate)
      .on('network-update', onupdate)

    stream.on('close', () => {
      backend._swarm
        .off('update', onupdate)
        .dht.off('nat-update', onupdate)
        .off('network-update', onupdate)
    })

    onupdate()

    function onupdate() {
      const {
        host,
        port,
        online,
        connections: { size: peerCount }
      } = backend._swarm

      stream.write({ host, port, online, peerCount, dhtVersion })
    }
  }
})

rpc.register(2 << 8, {
  request: any,
  response: any,
  onrequest: async () => {
    if (backend.opened === false) await backend.ready()

    return id.encode(backend._swarm.keyPair.publicKey)
  }
})

rpc.register(3 << 8, {
  request: any,
  response: any,
  onrequest: () => inspector.enable()
})

rpc.register(4 << 8, {
  request: any,
  response: any,
  onrequest: inspector.disable()
})

rpc.register(5 << 8, {
  request: any,
  response: any,
  onrequest: inspector.key
})

rpc.register(6 << 8, {
  request: any,
  response: any,
  onstream: (stream) => {
    stream.on('error', noop)

    Bare.on('uncaughtException', onerror).on('unhandledRejection', onerror)

    stream.on('close', () => {
      Bare.off('uncaughtException', onerror).off('unhandledRejection', onerror)
    })

    function onerror(err) {
      stream.write({ message: err.message, stack: err.stack.toString() })
    }
  }
})

function noop() {}

/**
 npx bare-pack --out app/main.bundle.js main.js --target ios-arm64 --target ios-arm64-simulator --target ios-x64-simulator --target android-arm --target android-arm64 --target android-ia32 --target android-x64 --linked
 */
