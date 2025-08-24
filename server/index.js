import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import DB from '../config/db.js'
import { handleMessage, handlePersistence } from './event-handlers.js'

const app = express()
const server = createServer(app)
const io = new Server(server, { connectionStateRecovery: { maxDisconnectionDuration: 120000 } })
const PORT = process.env.PORT ?? 8080

DB.authenticate()

io.on('connection', async socket => {
  const userObj = {
    user: socket.handshake.auth.userName ?? 'anonymous',
    userColor: socket.handshake.auth.userColor,
    lastRowId: socket.handshake.auth.serverOffset,
    messageTime: undefined,
    message: undefined
  }

  io.emit('connection', userObj.user)

  socket.on('disconnect', () => io.emit('disconnection', userObj.user))

  socket.on('message', async message => {
    const newUserObj = await handleMessage(userObj, message)
    io.emit('message', newUserObj)
  })

  if (!socket.recovered) {
    const result = await handlePersistence(userObj.lastRowId)
    result.forEach(info => {
      const { id, content, user_name, content_time } = info.dataValues
      userObj.lastRowId = id
      userObj.message = content
      userObj.user = user_name
      userObj.messageTime = content_time
      socket.emit('message', userObj)
    })
  }
})

app.disable('x-powered-by')

app.use(express.static('client'))

server.listen(PORT)
