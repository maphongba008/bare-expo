/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-bind */
import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import createClient from '@holepunchto/keet-backend-rpc/client'
import { Worklet } from 'react-native-bare-kit'
import RPC from 'tiny-buffer-rpc'

const FileSystem = require('expo-file-system')

const documentDirectory = FileSystem.documentDirectory
const storagePath = documentDirectory.substring(
  'file://'.length,
  documentDirectory.length
)
console.log({ storagePath });

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
  await new Promise(resolve => setTimeout(resolve, 100))
}

const getStats = async () => {
  console.log('[GET_STATS] start')
  const backend = getKeetBackend()
  const stats = await backend.api.core.getStats()
  console.log('[GET_STATS] response', stats) // no response
}

const TestApp = () => {

  const subscribeRecentRooms = async () => {
    console.log('[SUBSCRIBE_RECENT_ROOM] start')
    const backendApi = getKeetBackend()
    const sub = backendApi.api.core.subscribeRecentRooms({})
    sub.on('data', (res) => {
      console.log('[SUBSCRIBE_RECENT_ROOM] trigger', res.length)
    })
  }

  const getAllRooms = async () => {
    console.log('[GET_RECENT_ROOMS] start')
    const backendApi = getKeetBackend()
    const allRooms = await backendApi.api.core.getRecentRooms({})
    console.log('[GET_RECENT_ROOMS] response', allRooms.length)
  }

  React.useEffect(() => {
    async function load() {
      try {
        await loadWorklet()
        await subscribeRecentRooms()
        await getAllRooms()
        await getStats()
        await createTestRoom()
      } catch (e) {
        console.log(e)
      }
    }
    load()
  }, [])

  return null
}

const createTestRoom = async () => {
  try {
    const backendApi = getKeetBackend()
    const title = 'MyRoom' + Math.round(Math.random() * 100)
    console.log('[CREATE ROOM] start', title)
    const roomId = await backendApi.api.core.createRoom({
      config: {
        title,
        description: 'Room description',
        roomType: '0',
        canCall: 'true'
      }
    })
    console.log('[CREATE ROOM] response', roomId)
  } catch (e) {
    console.log(e)
  }
}


export default TestApp
