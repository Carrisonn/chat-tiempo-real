import { Op } from 'sequelize'
import ChatModel from '../model/Chat.js'

async function handleMessage (userObj, message) {
  const messageTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  try {
    await ChatModel.create({ user_name: userObj.user, content: message, content_time: messageTime })
    userObj.lastRowId = await ChatModel.findOne({ attributes: ['id'], order: [['id', 'DESC']], raw: true })
    userObj.messageTime = messageTime
    userObj.message = message
    return userObj
  } catch (error) {
    console.log(error)
  }
}

async function handlePersistence (serverOffset) {
  try {
    const result = await ChatModel.findAll({ where: { id: { [Op.gt]: serverOffset } } })
    return result
  } catch (error) {
    console.log(error)
  }
}

export {
  handleMessage,
  handlePersistence
}
