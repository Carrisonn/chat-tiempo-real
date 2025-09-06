import { Op } from 'sequelize'
import ChatModel from '../model/Chat.js'

async function handleMessage(userObj, message) {
  const { messageDate, messageTime } = getDate()
  try {
    await ChatModel.create({ user_name: userObj.user, content: message, content_time: messageTime, content_date: messageDate })
    userObj.lastRowId = await ChatModel.findOne({ attributes: ['id'], order: [['id', 'DESC']], raw: true })
    userObj.messageTime = messageTime
    userObj.messageDate = messageDate
    userObj.message = message
    return userObj
  } catch (error) {
    console.log(error)
  }
}

async function handlePersistence(lastRowId) {
  try {
    const result = await ChatModel.findAll({ where: { id: { [Op.gt]: lastRowId } } })
    return result
  } catch (error) {
    console.log(error)
  }
}

function getDate() {
  const date = new Date()
  const day = String(date.getDay()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const messageTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })

  return {
    messageDate: `${day}/${month}/${year}`,
    messageTime
  }
}

function getRandomColor() {
  const colors = ['#90c6f1ff', '#c7acf1ff', '#bfeeb4ff', '#ec9b9bff', '#e0a8ebff', '#f3e7a6ff']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  return randomColor
}

export {
  handleMessage,
  handlePersistence,
  getRandomColor
}

