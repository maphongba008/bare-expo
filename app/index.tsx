import { useEffect } from 'react'
import { Worklet } from 'react-native-bare-kit'
import RPC from 'tiny-buffer-rpc'
import createClient from '@holepunchto/keet-backend-rpc/client'

export default function () {
  useEffect(() => {
    const worklet = new Worklet()
    worklet.start('/main.bundle', require('./main.bundle')).then(() => {

      
      const rpc = new RPC((data) => worklet.IPC.write(data))
      worklet.IPC.on('data', (data) => rpc.recv(data))
      
      const client = createClient(rpc)
      client.core.subscribeRecentRooms().on('data', async (rooms) => {
        const recentRooms = await client.core.getRecentRooms({})
        console.log('length', recentRooms.length)
        const network = await client.network.query()
        console.log('network', network)
        const title = 'MyRoom' + Math.round(Math.random() * 100)
        console.log('attempt to create room', title)
        const r2 = await client.core.createRoom({
          config: {
            title,
            description: 'Room description',
            roomType: '0',
            canCall: 'true'
          }
        })
        console.log('new room id', r2)
      })
    })
  }, [])

  return null
}