import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import DB from '../config/db.js'
import { handleMessage, handlePersistence, getRandomColor } from './handlers.js'

const app = express()
const server = createServer(app)
const io = new Server(server, { connectionStateRecovery: { maxDisconnectionDuration: 120000 } })
const PORT = process.env.PORT ?? 8080
let usersConnected = 0

DB.authenticate()

io.on('connection', async socket => {
  const userObj = {
    user: socket.handshake.auth.userName ?? 'anonymous',
    userColor: getRandomColor(),
    lastRowId: socket.handshake.auth.serverOffset,
    messageTime: undefined,
    messageDate: undefined,
    message: undefined
  }

  usersConnected++
  io.emit('connection', userObj.user, usersConnected)

  socket.on('disconnect', () => {
    usersConnected--
    io.emit('disconnection', userObj.user, usersConnected)
  })

  socket.on('message', async message => {
    const newUserObj = await handleMessage(userObj, message)
    io.emit('message', newUserObj)
  })

  if (!socket.recovered) {
    const result = await handlePersistence(userObj.lastRowId)
    result.forEach(info => {
      const { id, content, user_name, content_time, content_date } = info.dataValues
      const newUserObj = {
        user: user_name,
        message: content,
        lastRowId: id,
        messageTime: content_time,
        messageDate: content_date,
        userColor: getRandomColor()
      }
      socket.emit('message', newUserObj)
    })
  }
})

app.disable('x-powered-by')

app.use(express.static('client'))

server.listen(PORT)
