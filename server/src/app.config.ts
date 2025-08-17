import { monitor } from '@colyseus/monitor'
import { playground } from '@colyseus/playground'
import config from '@colyseus/tools'
import basicAuth from 'express-basic-auth'
import { MyRoom } from './rooms/MyRoom'

export default config({
  initializeGameServer: gameServer => {
    // Define your room handlers:
    gameServer.define('my_room', MyRoom)
  },

  initializeExpress: app => {
    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground())
    }

    app.use(
      '/monitor',
      basicAuth({
        users: { admin: process.env.MONITOR_PASSWORD },
        challenge: true,
      }),
      monitor(),
    )
  },

  // Before before gameServer.listen() is called.
  beforeListen: () => {},
})
