import createClient from '@holepunchto/keet-backend-rpc/client'
import { Worklet } from 'react-native-bare-kit'
import RPC from 'tiny-buffer-rpc'

const FileSystem = require('expo-file-system')

const documentDirectory = FileSystem.documentDirectory
console.log({ documentDirectory })
const storagePath = documentDirectory.substring(
  'file://'.length,
  documentDirectory.length
)

const source = require('./main.bundle')

let _backend = null

export const getKeetBackend = () => {
  return {
    api: _backend
  }
}

export async function loadWorklet() {
  const worklet = new Worklet()
  await worklet.start('keet:/main.bundle', source, [storagePath, 'keet'])
  const rpc = new RPC((data) => worklet.IPC.write(data))
  worklet.IPC.on('data', (data) => rpc.recv(data))

  const client = createClient(rpc)
  _backend = client
  console.log('worklet started')
  // client.core.subscribeRecentRooms().on('data', async (rooms) => {
  //   const stats = await client.core.getStats()
  //   console.log('stats', stats)
  // })
}
