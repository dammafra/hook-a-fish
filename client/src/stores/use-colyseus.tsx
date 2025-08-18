import { Client } from 'colyseus.js'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const colyseusSDK = new Client(import.meta.env.VITE_COLYSEUS_URL)

type ColyseusStore = object

const useColyseus = create<ColyseusStore>()(
  subscribeWithSelector(() => {
    colyseusSDK.joinOrCreate('my_room')
    return {}
  }),
)

export default useColyseus
