const RPC = require('tiny-buffer-rpc')
const RAM = require('random-access-memory')
const KeetBackend = require('@holepunchto/keet-backend')
const registerServer = require('@holepunchto/keet-backend-rpc/server')

const rpc = new RPC((data) => BareKit.IPC.write(data))
BareKit.IPC.on('data', (data) => rpc.recv(data))

const backend = new KeetBackend(RAM, { mobile: true })
registerServer(backend, rpc)