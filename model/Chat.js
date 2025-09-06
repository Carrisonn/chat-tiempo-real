import { DataTypes } from 'sequelize'
import DB from '../config/db.js'

const ChatModel = DB.define('messages', {
  content: { type: DataTypes.STRING },
  user_name: { type: DataTypes.STRING },
  content_time: { type: DataTypes.STRING },
  content_date: { type: DataTypes.STRING }
})

export default ChatModel
