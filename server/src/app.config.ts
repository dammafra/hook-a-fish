import { monitor } from '@colyseus/monitor'
import { playground } from '@colyseus/playground'
import config from '@colyseus/tools'
import { Request, Response } from 'express'

/**
 * Import your Room files
 */
import { MyRoom } from './rooms/MyRoom'

export default config({
  initializeGameServer: gameServer => {
    /**
     * Define your room handlers:
     */
    gameServer.define('my_room', MyRoom)
  },

  initializeExpress: app => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get('/hello_world', (req: Request, res: Response) => {
      res.send("It's time to kick ass and chew bubblegum!")
    })

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground())
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/monitor', monitor())
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
})
