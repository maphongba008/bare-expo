/* eslint-disable react-native/no-inline-styles */

import createClient from '@holepunchto/keet-backend-rpc/client';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import { Text, TouchableOpacity, View} from 'react-native';
import {Worklet} from 'react-native-bare-kit';
import RPC from 'tiny-buffer-rpc';

const documentDirectory = FileSystem.documentDirectory!;
console.log({ documentDirectory });
const storagePath = documentDirectory.replace('file://', '');

const source = require('./main.bundle');

let _backend: any = null;


const RUN_AUTO = true

export async function startWorklet() {
  const worklet = new Worklet();
  await worklet.start('keet:/main.bundle', source, [storagePath, 'keet']);
  const rpc = new RPC(data => worklet.IPC.write(data));
  worklet.IPC.on('data', data => rpc.recv(data));

  const client = createClient(rpc);
  _backend = client;
  console.log('worklet started');
}

console.log({ RUN_AUTO })

const Button = ({text, onPress}: any) => {
  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
      }}
      onPress={onPress}>
      <Text style={{color: '#FFF'}}>{text}</Text>
    </TouchableOpacity>
  );
};

const getStats = async () => {
  console.log('[GET_STATS] start')
  const stats = await _backend.core.getStats()
  console.log('[GET_STATS] response', stats) // no response
}


const createTestRoom = async () => {
  try {
    const title = 'MyRoom' + Math.round(Math.random() * 100)
    console.log('[CREATE ROOM] start', title)
    const roomId = await _backend.core.createRoom({
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


const getIdentity = async () => {
  try {
    const identity = await _backend.core.getIdentity();
    console.log('identity', identity);
  } catch (e) {
    console.log('identity error', e);
  }
};

const subscribeAllRooms = async () => {
  console.log('[SUBSCRIBE_RECENT_ROOM] start')
  const sub = _backend.core.subscribeRecentRooms({});
  sub.on('data', res => {
    console.log('[SUBSCRIBE_RECENT_ROOM] trigger', res.length)
  });
};


const loadAllRooms = async () => {
  console.log('[GET_RECENT_ROOMS] start')
  const allRooms = await _backend.core.getRecentRooms({})
  console.log('[GET_RECENT_ROOMS] response', allRooms.length)
}

const TestApp = () => {

  React.useEffect(() => {

    const runAuto = async () => {
      try {
        await startWorklet()
        await new Promise(resolve => setTimeout(resolve, 1600))
        await subscribeAllRooms()
        await loadAllRooms()
        await getStats()
      } catch (e) {
        console.log(e)
      }
    }

    if (RUN_AUTO) {
      runAuto()
    } else {
      startWorklet();
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 16,
      }}>
      <Button
        onPress={getStats}
        text="Get stats"
      />
      <Button
        text="Create room"
        onPress={createTestRoom}
      />

      <Button
        text="Get network"
        onPress={async () => {
          console.log('get network');
          const network = await _backend.network.query();
          console.log('network is', network);
        }}
      />

      <Button
        text="Get identity"
        onPress={getIdentity}
      />
      <Button
        onPress={loadAllRooms}
        text="Get all rooms"
      />
      <Button
        text="Subscribe all rooms"
        onPress={subscribeAllRooms}
      />
    </View>
  );
};

export default TestApp;
